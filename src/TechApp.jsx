import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import { ShoppingCart } from 'lucide-react';

// Tech-Specific Views
import TechPropertySearchView from './tech/TechPropertySearchView';
import TechPropertyDetailView from './tech/TechPropertyDetailView';
import TechAssetDetailView from './tech/TechAssetDetailView';

// Tech-Specific Components
import TechHeader from './tech/TechHeader';
import TechCartSidebar from './tech/TechCartSidebar';
import TechServiceModal from './tech/TechServiceModal';
import TechSuccessOverlay from './tech/TechSuccessOverlay';
import TechScannerModal from './tech/TechScannerModal'; // NEW: Optical Scanner

export default function TechApp({ profile, onLogout }) {
  // --- NAVIGATION STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeAsset, setActiveAsset] = useState(null);
  
  // --- DATA STATE ---
  const [propertyAssets, setPropertyAssets] = useState([]);
  const [upsells, setUpsells] = useState([]);
  const [assetTasks, setAssetTasks] = useState([]);

  // --- BILLING & UI STATE ---
  const [cart, setCart] = useState([]);
  const [isCartCollapsed, setIsCartCollapsed] = useState(false);
  const [serviceModal, setServiceModal] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false); // NEW: Scanner Toggle
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- DERIVED STATE ---
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);

  // --- SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .ilike('address', `%${searchQuery}%`)
        .limit(5);

      if (!error) setSearchResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- HANDLERS: NAVIGATION ---

  const handleSelectProperty = async (property) => {
    setLoading(true);
    setSelectedProperty(property);
    
    const [assetsRes, tasksRes] = await Promise.all([
      supabase.from('assets').select('*').eq('property_id', property.id),
      supabase.from('maintenance_tasks')
        .select('*, assets(sub_category, brand)')
        .eq('property_id', property.id)
        .lte('next_due_date', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    setPropertyAssets(assetsRes.data || []);
    setUpsells(tasksRes.data || []);
    setLoading(false);
  };

  const handleSelectAsset = async (asset) => {
    setActiveAsset(asset);
    setLoading(true);
    const { data } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('asset_id', asset.id);
    setAssetTasks(data || []);
    setLoading(false);
  };

  // --- NEW: OPTICAL SCAN HANDLER ---
  const handleScanResult = async (scannedValue) => {
    setLoading(true);
    setIsScannerOpen(false);

    let assetId = scannedValue;

    // --- 1. PROTOCOL PARSING ---
    // Check if the QR code follows the Casa Dossier Protocol (CDA|UUID|REG_ID)
    if (scannedValue.includes('|')) {
      const parts = scannedValue.split('|');
      const prefix = parts[0];
      
      if (prefix === 'CDA' || prefix === 'CD') {
        assetId = parts[1]; // Extract the UUID from the middle of the string
        console.log("Protocol Detected: Extracting Asset UUID:", assetId);
      }
    }

    // --- 2. FETCH ASSET + PROPERTY DATA ---
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*, properties(*)')
      .eq('id', assetId) 
      .single();

    if (asset && !error) {
      // 3. SET CONTEXT (Fetch house-wide assets and upsell opportunities)
      // This allows the tech to see the "Whole Home" context from a single scan
      const [assetsRes, tasksRes] = await Promise.all([
        supabase.from('assets')
          .select('*')
          .eq('property_id', asset.property_id),
        supabase.from('maintenance_tasks')
          .select('*, assets(sub_category, brand)')
          .eq('property_id', asset.property_id)
          .is('last_completed_date', null) // Focus on tasks never done or overdue
          .lte('next_due_date', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      setPropertyAssets(assetsRes.data || []);
      setUpsells(tasksRes.data || []);
      
      // 4. NAVIGATION JUMP
      // Directly populate the tech's active workspace with the scanned unit
      setSelectedProperty(asset.properties);
      handleSelectAsset(asset); 
      
      console.log("Registry Match: Hardware Intake Successful.");
    } else {
      // Fallback for unrecognized codes
      alert("UNRECOGNIZED_QR: This code is not linked to an active Casa Dossier registry asset.");
      console.error("Scan Error:", error);
    }
    setLoading(false);
  };

  // --- HANDLER: BILLING FINALIZE ---
  const handleFinalize = async () => {
    setLoading(true);
    const firstName = profile.first_name || "Authorized";
    const lastName = profile.last_name || "Tech";
    const techID = profile.tech_id || "000-0000";

    const entries = cart.map(item => ({
      asset_id: item.asset_id,
      provider_name: `${firstName} ${lastName}`,
      tech_id_stamp: techID,
      description_of_work: item.task_name,
      cost: item.total,
      receipt_data: { labor: item.labor, materials: item.materials, notes: item.notes },
      type: 'PRO',
      service_date: new Date()
    }));

    const { error: serviceError } = await supabase.from('service_records').insert(entries);

    // Update Tasks logic
    for (const item of cart) {
      if (item.task_id) {
         const { data: task } = await supabase.from('maintenance_tasks').select('frequency_months').eq('id', item.task_id).single();
         const nextDate = new Date();
         nextDate.setMonth(nextDate.getMonth() + (task?.frequency_months || 12));
         await supabase.from('maintenance_tasks').update({ last_completed_date: new Date(), next_due_date: nextDate }).eq('id', item.task_id);
      }
    }

    if (!serviceError) {
      await supabase.rpc('award_xp_to_owner', { property_id_input: selectedProperty.id, xp_amount: cart.length * 50 });
      setSuccess(true);
      setTimeout(() => { 
        setSuccess(false); 
        setSelectedProperty(null); 
        setActiveAsset(null); 
        setCart([]); 
        setIsCartCollapsed(false);
        setSearchQuery('');
      }, 3000);
    }
    setLoading(false);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      
      <TechHeader 
        profile={profile} 
        onLogout={onLogout} 
        cartTotal={cartTotal} 
        cartCount={cart.length} 
        isCollapsed={isCartCollapsed}
        onToggleCart={() => setIsCartCollapsed(!isCartCollapsed)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* CENTERED WORKSPACE */}
        <main className={`
          flex-1 overflow-y-auto py-12 px-8 lg:px-16 
          transition-all duration-500 ease-in-out
          ${(!isCartCollapsed && cart.length > 0) ? 'lg:mr-[400px]' : 'lg:mr-0'}
        `}>
          <div className="max-w-3xl mx-auto pb-40">
            {!selectedProperty && (
              <TechPropertySearchView 
                query={searchQuery} 
                setQuery={setSearchQuery} 
                results={searchResults} 
                onSelect={handleSelectProperty} 
                onOpenScanner={() => setIsScannerOpen(true)} // NEW
                loading={loading}
              />
            )}

            {selectedProperty && !activeAsset && (
              <TechPropertyDetailView 
                property={selectedProperty} 
                assets={propertyAssets} 
                upsells={upsells} 
                onSelectAsset={handleSelectAsset} 
                onOpenScanner={() => setIsScannerOpen(true)} // NEW
                onBack={() => setSelectedProperty(null)}
                onOpenModal={setServiceModal}
              />
            )}

            {activeAsset && (
              <TechAssetDetailView 
                asset={activeAsset} 
                tasks={assetTasks} 
                onBack={() => setActiveAsset(null)} 
                onOpenModal={setServiceModal}
              />
            )}
          </div>
        </main>

        {/* SIDEBAR CART */}
        <TechCartSidebar 
          cart={cart} 
          total={cartTotal} 
          isCollapsed={isCartCollapsed} 
          onCollapse={() => setIsCartCollapsed(true)} 
          onRemove={(idx) => setCart(cart.filter((_, i) => i !== idx))}
          onFinalize={handleFinalize}
          loading={loading}
          isVisible={cart.length > 0 && selectedProperty}
          address={selectedProperty?.address}
        />
      </div>

      {/* OVERLAYS & MODALS */}
      {serviceModal && (
        <TechServiceModal 
          data={serviceModal} 
          onClose={() => setServiceModal(null)} 
          onAdd={(item) => {
            setCart([...cart, item]);
            setServiceModal(null);
            setIsCartCollapsed(false);
          }} 
        />
      )}

      {isScannerOpen && (
        <TechScannerModal 
          onClose={() => setIsScannerOpen(false)} 
          onScanSuccess={handleScanResult} 
        />
      )}

      {success && <TechSuccessOverlay profile={profile} />}

      {/* FLOATING ACTION TAB */}
      {isCartCollapsed && cart.length > 0 && (
          <button 
              onClick={() => setIsCartCollapsed(false)}
              className="fixed bottom-10 right-10 z-[100] bg-amber-500 text-slate-950 p-6 font-black uppercase italic shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-4 animate-in slide-in-from-right-10 hover:bg-amber-400 transition-all active:scale-95"
          >
              <ShoppingCart size={28} />
              <div className="text-left border-l border-slate-950/20 pl-4">
                  <p className="text-[10px] font-mono leading-none mb-1 opacity-70 tracking-widest font-bold uppercase">Resume_Order</p>
                  <p className="text-2xl leading-none font-mono tracking-tighter">${cartTotal.toFixed(2)}</p>
              </div>
          </button>
      )}
    </div>
  );
}