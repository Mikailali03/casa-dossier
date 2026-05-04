import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react';

// --- VIEWS ---
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import AssetDetailView from './views/AssetDetailView';
import ReportView from './views/ReportView';
import CapitalOutlookView from './views/CapitalOutlookView';
import InvestmentLedgerView from './views/InvestmentLedgerView';

// --- COMPONENTS ---
import Header from './components/Header';
import SubscriptionModal from './modals/SubscriptionModal';

export default function App() {
  // --- SESSION & USER STATE ---
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userTier, setUserTier] = useState('essential');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // --- DATA STATE ---
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [assets, setAssets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [allServiceRecords, setAllServiceRecords] = useState([]);
  const [dueTasks, setDueTasks] = useState([]);
  const [healthScore, setHealthScore] = useState(100);

  // --- NAVIGATION STATE ---
  const [showAuth, setShowAuth] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showOutlook, setShowOutlook] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  // --- AUTH LIFECYCLE ---
  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // NUCLEAR RESET: Wipes all data from memory on logout
        setProperties([]);
        setActiveProperty(null);
        setAssets([]);
        setAllServiceRecords([]);
        setSelectedAsset(null);
        setShowAuth(false);
        setShowReport(false);
        setShowOutlook(false);
        setShowLedger(false);
        setLoading(false);
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Sync Context when Property changes
  useEffect(() => {
    if (activeProperty && session) {
      fetchPropertyContext(activeProperty.id);
    }
  }, [activeProperty?.id, session]);

  // --- DATABASE ACTIONS ---
  async function fetchUserData(userId) {
    setLoading(true);
    try {
      // 1. Fetch Profile (Check Tier and Welcome Modal Flag)
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_seen_onboarding, subscription_tier')
        .eq('id', userId)
        .single();
      
      if (profile) {
        setHasSeenOnboarding(profile.has_seen_onboarding);
        setUserTier(profile.subscription_tier || 'essential');
      }

      // 2. Fetch All Properties owned by user
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true });

      setProperties(props || []);
      
      // If we have properties but no active one selected, pick the first
      if (props?.length > 0) {
        const current = activeProperty ? props.find(p => p.id === activeProperty.id) : props[0];
        setActiveProperty(current || props[0]);
      }
    } catch (err) {
      console.error("Fetch User Data Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPropertyContext(propertyId) {
    try {
      // Parallel fetch for speed
      const [assetsRes, prosRes, propTasksRes, serviceRes] = await Promise.all([
        supabase.from('assets').select('*, maintenance_tasks (*)').eq('property_id', propertyId),
        supabase.from('service_providers').select('*').eq('property_id', propertyId),
        supabase.from('maintenance_tasks').select('*').eq('property_id', propertyId).is('asset_id', null),
        supabase.from('service_records').select('*, assets!inner(category, sub_category, property_id)').eq('assets.property_id', propertyId)
      ]);
      
      const freshAssets = assetsRes.data || [];
      setAssets(freshAssets);
      setProviders(prosRes.data || []);
      setAllServiceRecords(serviceRes.data || []);
      
      // If currently viewing an asset, refresh its local state object
      if (selectedAsset) {
        const updated = freshAssets.find(a => a.id === selectedAsset.id);
        if (updated) setSelectedAsset(updated);
      }

      calculateHealth(freshAssets, propTasksRes.data || []);
    } catch (err) {
      console.error("Context Sync Error:", err);
    }
  }

  function calculateHealth(assetList, generalTasks) {
    const now = new Date();
    const lookahead = new Date(); 
    lookahead.setDate(now.getDate() + 30); // 30-day "Urgent" window

    const activeAlerts = [];
    let overdueCount = 0;

    // Process hardware alerts
    assetList.forEach(a => {
      if (a.status === 'active') {
        a.maintenance_tasks?.forEach(t => {
          const d = new Date(t.next_due_date);
          if (d < now) overdueCount++;
          if (d <= lookahead) activeAlerts.push({ ...t, asset_name: a.sub_category });
        });
      }
    });

    // Process stewardship alerts
    generalTasks.forEach(t => {
      const d = new Date(t.next_due_date);
      if (d < now) overdueCount++;
      if (d <= lookahead) activeAlerts.push({ ...t, asset_name: 'Property Stewardship' });
    });

    // Sort Chronologically
    const sorted = activeAlerts.sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));
    
    setDueTasks(sorted);
    setHealthScore(Math.max(0, 100 - (overdueCount * 10)));
  }

  // --- RENDER LOGIC ---

  // 1. Global Loading State
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-500 font-mono text-center p-10">
      <Loader2 className="w-8 h-8 animate-spin mb-4 mx-auto" />
      <p className="text-[10px] tracking-[0.3em] uppercase font-bold">Initializing_Secure_Dossier...</p>
    </div>
  );

  // 2. Logged Out: Branch between Landing and Login
  if (!session) {
    if (showAuth) {
      return <AuthView onBackClick={() => setShowAuth(false)} />;
    }
    return <LandingView onLoginClick={() => setShowAuth(true)} />;
  }

  // 3. Logged In: Check if user has initialized their first home
  if (properties.length === 0) {
    return <OnboardingView onCreated={() => fetchUserData(session.user.id)} userId={session.user.id} />;
  }

  // 4. Special Full-Screen Modes
  if (showReport) return <ReportView property={activeProperty} assets={assets} onClose={() => setShowReport(false)} />;
  if (showOutlook) return <CapitalOutlookView assets={assets} onClose={() => setShowOutlook(false)} />;
  if (showLedger) return <InvestmentLedgerView assets={assets} serviceRecords={allServiceRecords} property={activeProperty} onClose={() => setShowLedger(false)} />;

  // 5. Main Dashboard / Detail Interface
  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Header 
        properties={properties} 
        activeProperty={activeProperty} 
        setActiveProperty={setActiveProperty} 
        setSelectedAsset={setSelectedAsset}
        setShowReport={setShowReport}
        userTier={userTier}
        onUpgradeClick={() => setShowSubscription(true)}
        onRefresh={() => fetchUserData(session.user.id)}
      />

      {/* MOBILE-FIRST SCROLL CONTAINER */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden" id="app-scroller">
        <main className="max-w-7xl mx-auto p-4 md:p-10">
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
              userTier={userTier}
              propertyCount={properties.length}
              onRefresh={() => fetchPropertyContext(activeProperty.id)}
            />
          )}
        </main>
      </div>

      {/* SUBSCRIPTION PAYWALL */}
      {showSubscription && (
        <SubscriptionModal 
          userId={session.user.id} 
          currentTier={userTier} 
          onClose={() => setShowSubscription(false)} 
        />
      )}
    </div>
  );
}