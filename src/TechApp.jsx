import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import { ShoppingCart } from 'lucide-react';

// Tech-Specific Views
import TechPropertySearchView from './tech/TechPropertySearchView';
import TechPropertyDetailView from './tech/TechPropertyDetailView';
import TechAssetDetailView from './tech/TechAssetDetailView';
import TechOnboardingView from './tech/TechOnboardingView';

// Tech-Specific Components
import TechHeader from './tech/TechHeader';
import TechCartSidebar from './tech/TechCartSidebar';
import TechServiceModal from './tech/TechServiceModal';
import TechAssetModal from './tech/TechAssetModal';
import TechSuccessOverlay from './tech/TechSuccessOverlay';
import TechScannerModal from './tech/TechScannerModal';

export default function TechApp({ profile, onLogout }) {
  // --- NAVIGATION & DATA STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeAsset, setActiveAsset] = useState(null);
  
  // --- UI FLOW STATE ---
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCartCollapsed, setIsCartCollapsed] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [serviceModal, setServiceModal] = useState(null);
  
  // --- SUB-DATA STATE ---
  const [propertyAssets, setPropertyAssets] = useState([]);
  const [upsells, setUpsells] = useState([]);
  const [assetTasks, setAssetTasks] = useState([]);

  // --- LOGIC STATE ---
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- BILLING STATE (Persistent) ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('tech_active_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.total || 0), 0), [cart]);

  // --- SESSION REHYDRATION ---
  useEffect(() => {
    const restoreSession = async () => {
      const savedPropId = localStorage.getItem('tech_active_property_id');
      const savedAssetId = localStorage.getItem('tech_active_asset_id');

      if (savedPropId) {
        setLoading(true);
        const { data: prop } = await supabase.from('properties').select('*').eq('id', savedPropId).single();
        if (prop) {
          await handleSelectProperty(prop);
          if (savedAssetId) {
            const { data: asset } = await supabase.from('assets').select('*').eq('id', savedAssetId).single();
            if (asset) handleSelectAsset(asset);
          }
        }
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('tech_active_cart', JSON.stringify(cart));
  }, [cart]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (searchQuery.trim().length < 3) { setSearchResults([]); return; }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.from('properties').select('*').ilike('address', `%${searchQuery}%`).limit(5);
      if (data) setSearchResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- HANDLERS: NAVIGATION ---

  const handleSelectProperty = async (property) => {
    setLoading(true);
    setSelectedProperty(property);
    localStorage.setItem('tech_active_property_id', property.id);
    
    const [assetsRes, tasksRes] = await Promise.all([
      supabase.from('assets').select('*').eq('property_id', property.id).order('created_at', { ascending: false }),
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
    localStorage.setItem('tech_active_asset_id', asset.id);
    setLoading(true);
    const { data } = await supabase.from('maintenance_tasks').select('*').eq('asset_id', asset.id);
    setAssetTasks(data || []);
    setLoading(false);
  };

  const clearNavSession = () => {
    localStorage.removeItem('tech_active_property_id');
    localStorage.removeItem('tech_active_asset_id');
    setSelectedProperty(null);
    setActiveAsset(null);
    setPropertyAssets([]);
    setUpsells([]);
  };

  // --- HANDLER: DIGITAL DEED TRANSFER ---
  const handleTransferHandshake = async (property) => {
  const confirmed = window.confirm(
    `This will generate a formal digital deed for ${property.homeowner_email}. \n\nYou will no longer be able to edit this property once they claim it. Proceed?`
  );
  
  if (!confirmed) return;

  setLoading(true);
  try {
    // 1. Create the Transfer Invite (The Escrow Record)
    // This allows OnboardingView.jsx to detect the house for the user
    const { error: inviteError } = await supabase
      .from('transfer_invites')
      .insert([{
        property_id: property.id,
        sender_id: profile.id, // The Technician's ID
        recipient_email: property.homeowner_email.toLowerCase().trim(),
        property_address: property.address,
        status: 'pending'
      }]);

    if (inviteError) throw inviteError;

    // 2. Mark property as ready for the homeowner
    const { error: propError } = await supabase
      .from('properties')
      .update({ has_seen_onboarding: true }) 
      .eq('id', property.id);

    if (propError) throw propError;

    alert("DEED_ESCROWED: The homeowner can now claim this dossier upon login.");
    
    // 3. Clear tech session and return to search
    clearNavSession();

  } catch (err) {
    console.error("Transfer Error:", err);
    alert("System Error: Could not generate transfer deed.");
  } finally {
    setLoading(false);
  }
};

  const handleScanResult = async (assetId) => {
    setLoading(true);
    setIsScannerOpen(false);
    const { data: asset } = await supabase.from('assets').select('*, properties(*)').eq('id', assetId).single();
    if (asset) {
      await handleSelectProperty(asset.properties);
      handleSelectAsset(asset);
    } else {
      alert("UNRECOGNIZED_CODE: Asset not found in registry.");
    }
    setLoading(false);
  };

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

    const { error } = await supabase.from('service_records').insert(entries);

    // Update maintenance tasks to complete
    for (const item of cart) {
      if (item.task_id) {
         const { data: task } = await supabase.from('maintenance_tasks').select('frequency_months').eq('id', item.task_id).single();
         const nextDate = new Date();
         nextDate.setMonth(nextDate.getMonth() + (task?.frequency_months || 12));
         await supabase.from('maintenance_tasks').update({ last_completed_date: new Date(), next_due_date: nextDate }).eq('id', item.task_id);
      }
    }

    if (!error) {
      await supabase.rpc('award_xp_to_owner', { property_id_input: selectedProperty.id, xp_amount: cart.length * 50 });
      setSuccess(true);
      
      localStorage.removeItem('tech_active_property_id');
      localStorage.removeItem('tech_active_asset_id');
      localStorage.removeItem('tech_active_cart');
      
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
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden selection:bg-amber-500/30">
      
      <TechHeader 
        profile={profile} 
        onLogout={() => { localStorage.clear(); onLogout(); }} 
        cartTotal={cartTotal} 
        cartCount={cart.length} 
        isCollapsed={isCartCollapsed}
        onToggleCart={() => setIsCartCollapsed(!isCartCollapsed)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        
        <main className={`
          flex-1 overflow-y-auto py-12 px-8 lg:px-16 
          transition-all duration-500 ease-in-out
          ${(!isCartCollapsed && cart.length > 0) ? 'lg:mr-[400px]' : 'lg:mr-0'}
        `}>
          <div className="max-w-3xl mx-auto pb-64">
            
            {isOnboarding ? (
              <TechOnboardingView 
                techProfile={profile}
                onBack={() => setIsOnboarding(false)}
                onComplete={(newProperty) => {
                  setIsOnboarding(false);
                  handleSelectProperty(newProperty);
                }}
              />
            ) : (
              <>
                {/* STEP 1: SEARCH */}
                {!selectedProperty && (
                  <TechPropertySearchView 
                    query={searchQuery} 
                    setQuery={setSearchQuery} 
                    results={searchResults} 
                    onSelect={handleSelectProperty} 
                    onOpenScanner={() => setIsScannerOpen(true)}
                    onOpenOnboarding={() => setIsOnboarding(true)}
                    loading={loading}
                  />
                )}

                {/* STEP 2: DOSSIER DETAIL */}
                {selectedProperty && !activeAsset && (
                  <TechPropertyDetailView 
                    property={selectedProperty} 
                    assets={propertyAssets} 
                    upsells={upsells} 
                    onSelectAsset={handleSelectAsset} 
                    onOpenScanner={() => setIsScannerOpen(true)}
                    onOpenAssetModal={() => setIsAssetModalOpen(true)}
                    onTransfer={handleTransferHandshake} // Handshake Logic
                    onBack={clearNavSession} 
                    onOpenModal={setServiceModal}
                  />
                )}

                {/* STEP 3: UNIT DETAIL */}
                {activeAsset && (
                  <TechAssetDetailView 
                    asset={activeAsset} 
                    tasks={assetTasks} 
                    onBack={() => {
                        localStorage.removeItem('tech_active_asset_id');
                        setActiveAsset(null);
                    }} 
                    onOpenModal={setServiceModal}
                  />
                )}
              </>
            )}
          </div>
        </main>

        {/* PERSISTENT SIDEBAR */}
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

      {/* MODAL LAYER */}
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

      {isAssetModalOpen && selectedProperty && (
        <TechAssetModal 
            propertyId={selectedProperty.id}
            activeProperty={selectedProperty}
            onClose={() => setIsAssetModalOpen(false)}
            onRefresh={() => handleSelectProperty(selectedProperty)} 
        />
      )}

      {isScannerOpen && (
        <TechScannerModal onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanResult} />
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
                  <p className="text-[10px] font-mono leading-none mb-1 opacity-70 tracking-widest font-bold uppercase text-xs">Resume_Order</p>
                  <p className="text-2xl leading-none font-mono tracking-tighter">${cartTotal.toFixed(2)}</p>
              </div>
          </button>
      )}
    </div>
  );
}