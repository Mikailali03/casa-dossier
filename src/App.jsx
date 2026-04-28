import { Analytics } from "@vercel/analytics/react"
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react';

// Technician "Second Brain"
import TechApp from './TechApp'; 

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
  const [userProfile, setUserProfile] = useState(null); // Added to track role (homeowner/tech)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); 
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
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Reset all states on logout
        setProperties([]); 
        setActiveProperty(null); 
        setAssets([]); 
        setSelectedAsset(null);
        setUserProfile(null);
        setLoading(false);
      } else {
        fetchUserData(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Only fetch property context if the user is a homeowner and has an active property
  useEffect(() => {
    if (activeProperty && session && userProfile?.role === 'homeowner') {
      fetchPropertyContext(activeProperty.id);
    }
  }, [activeProperty, session, userProfile]);

  async function fetchUserData(userId) {
    setLoading(true);
    
    // 1. Fetch Profile and Role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profile) {
      setUserProfile(profile);
      setHasSeenOnboarding(profile.has_seen_onboarding);
    }

    // 2. Branching Logic: Only fetch properties if the user is a homeowner
    if (profile?.role === 'homeowner') {
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true });
      
      setProperties(props || []);
      if (props?.length > 0 && !activeProperty) setActiveProperty(props[0]);
    }

    setLoading(false);
  }

  async function fetchPropertyContext(propertyId) {
    const [assetsRes, prosRes, propTasksRes, serviceRes] = await Promise.all([
      supabase.from('assets').select('*, maintenance_tasks (*), service_records (*)').eq('property_id', propertyId),
      supabase.from('service_providers').select('*').eq('property_id', propertyId),
      supabase.from('maintenance_tasks').select('*').eq('property_id', propertyId).is('asset_id', null),
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

  // --- RENDERING LOGIC ---

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-500 font-mono text-center p-10">
      <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
      <p className="text-[10px] tracking-widest uppercase">Initializing_Dossier...</p>
    </div>
  );

  // 1. Auth Gate
  if (!session) return <AuthView />;

  // 2. Technician Portal Switch
  if (userProfile?.role === 'technician') {
    return <TechApp profile={userProfile} onLogout={() => supabase.auth.signOut()} />;
  }

  // 3. Homeowner Onboarding Gate
  if (properties.length === 0) {
    return <OnboardingView onCreated={() => fetchUserData(session.user.id)} userId={session.user.id} />;
  }
  
  // 4. Homeowner View States
  if (showReport) return <ReportView property={activeProperty} assets={assets} onClose={() => setShowReport(false)} />;
  if (showOutlook) return <CapitalOutlookView assets={assets} onClose={() => setShowOutlook(false)} />;
  if (showLedger) return <InvestmentLedgerView assets={assets} serviceRecords={allServiceRecords} property={activeProperty} onClose={() => setShowLedger(false)} />;

  // 5. Main Homeowner Dashboard
   return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      <Header 
        properties={properties} 
        activeProperty={activeProperty} 
        setActiveProperty={setActiveProperty} 
        setSelectedAsset={setSelectedAsset}
        setShowReport={setShowReport}
        onRefresh={() => fetchUserData(session.user.id)}
      />

      {/* NEW WRAPPER: This div handles all the scrolling for the app */}
      <div className="app-scroller">
        <main className="max-w-7xl mx-auto p-6 lg:p-10">
          {selectedAsset ? (
            <AssetDetailView 
              asset={selectedAsset} 
              activeProperty={activeProperty}
              setSelectedAsset={setSelectedAsset} 
              providers={providers}
              onUpdate={() => fetchPropertyContext(activeProperty.id)}
            />
          ) : (
            <DashboardView 
              activeProperty={activeProperty} 
              assets={assets} 
              dueTasks={dueTasks} 
              healthScore={healthScore}
              providers={providers}
              setSelectedAsset={setSelectedAsset}
              setShowOutlook={setShowOutlook}
              setShowLedger={setShowLedger}
              hasSeenOnboarding={hasSeenOnboarding}
              onRefresh={() => fetchPropertyContext(activeProperty.id)}
            />
          )}
        </main>
      </div>
      <Analytics />
    </div>
  );
}