import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react';

// Views
import AuthView from './views/AuthView';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import AssetDetailView from './views/AssetDetailView';
import ReportView from './views/ReportView';
import CapitalOutlookView from './views/CapitalOutlookView';
import InvestmentLedgerView from './views/InvestmentLedgerView';

// Components
import Header from './components/Header';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [properties, setProperties] = useState([]); 
  const [activeProperty, setActiveProperty] = useState(null); 
  const [assets, setAssets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [allServiceRecords, setAllServiceRecords] = useState([]); 
  const [dueTasks, setDueTasks] = useState([]);
  const [healthScore, setHealthScore] = useState(100);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showOutlook, setShowOutlook] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllProperties(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProperties([]); setActiveProperty(null); setAssets([]); setSelectedAsset(null);
        setShowReport(false); setShowOutlook(false); setShowLedger(false);
        setLoading(false);
      } else {
        fetchAllProperties(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (activeProperty && session) fetchPropertyContext(activeProperty.id);
  }, [activeProperty, session]);

  async function fetchAllProperties(userId) {
    setLoading(true);
    const { data } = await supabase.from('properties').select('*').eq('owner_id', userId).order('created_at', { ascending: true });
    setProperties(data || []);
    if (data?.length > 0 && !activeProperty) setActiveProperty(data[0]);
    setLoading(false);
  }

  async function fetchPropertyContext(propertyId) {
    const [assetsRes, prosRes, propTasksRes, serviceRes] = await Promise.all([
      supabase.from('assets').select('*, maintenance_tasks (*)').eq('property_id', propertyId),
      supabase.from('service_providers').select('*').eq('property_id', propertyId),
      supabase.from('maintenance_tasks').select('*').eq('property_id', propertyId).is('asset_id', null),
      // Join assets to get category for the ledger breakdown
      supabase.from('service_records').select('*, assets!inner(category, sub_category, property_id)').eq('assets.property_id', propertyId)
    ]);
    
    const freshAssets = assetsRes.data || [];
    setAssets(freshAssets);
    setProviders(prosRes.data || []);
    setAllServiceRecords(serviceRes.data || []);
    
    if (selectedAsset) {
      const updated = freshAssets.find(a => a.id === selectedAsset.id);
      if (updated) setSelectedAsset(updated);
    }
    calculateHealth(freshAssets, propTasksRes.data || []);
  }

  function calculateHealth(assetList, generalTasks) {
    const now = new Date();
    const lookahead = new Date(); lookahead.setDate(now.getDate() + 30);
    const activeAlerts = [];
    let overdueCount = 0;
    assetList.forEach(a => {
      if (a.status === 'active') {
        a.maintenance_tasks?.forEach(t => {
          if (new Date(t.next_due_date) < now) overdueCount++;
          if (new Date(t.next_due_date) <= lookahead) activeAlerts.push({ ...t, asset_name: a.sub_category });
        });
      }
    });
    generalTasks.forEach(t => {
      if (new Date(t.next_due_date) < now) overdueCount++;
      if (new Date(t.next_due_date) <= lookahead) activeAlerts.push({ ...t, asset_name: 'Property Stewardship' });
    });
    setDueTasks(activeAlerts.sort((a,b) => new Date(a.next_due_date) - new Date(b.next_due_date)));
    setHealthScore(Math.max(0, 100 - (overdueCount * 10)));
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-500 font-mono text-center"><Loader2 className="w-8 h-8 animate-spin mb-4" /><p className="text-[10px] tracking-widest uppercase font-bold">Initializing_Dossier...</p></div>;

  if (!session) return <AuthView />;
  if (properties.length === 0) return <OnboardingView onCreated={() => fetchAllProperties(session.user.id)} userId={session.user.id} />;
  
  if (showReport) return <ReportView property={activeProperty} assets={assets} onClose={() => setShowReport(false)} />;
  if (showOutlook) return <CapitalOutlookView assets={assets} onClose={() => setShowOutlook(false)} />;
  if (showLedger) return <InvestmentLedgerView assets={assets} serviceRecords={allServiceRecords} property={activeProperty} onClose={() => setShowLedger(false)} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      <Header properties={properties} activeProperty={activeProperty} setActiveProperty={setActiveProperty} setSelectedAsset={setSelectedAsset} setShowReport={setShowReport} onRefresh={() => fetchAllProperties(session.user.id)} />
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {selectedAsset ? (
          <AssetDetailView asset={selectedAsset} setSelectedAsset={setSelectedAsset} providers={providers} onUpdate={() => fetchPropertyContext(activeProperty.id)} />
        ) : (
          <DashboardView activeProperty={activeProperty} assets={assets} dueTasks={dueTasks} healthScore={healthScore} providers={providers} setSelectedAsset={setSelectedAsset} setShowOutlook={setShowOutlook} setShowLedger={setShowLedger} onRefresh={() => fetchPropertyContext(activeProperty.id)} />
        )}
      </main>
    </div>
  );
}