import React, { useState, useEffect } from 'react';
import { 
  Bell, ArrowUpRight, Archive, Plus, ChevronLeft, ChevronRight, 
  Calendar, AlertCircle, ShieldCheck, TrendingUp, Activity, 
  Users, Layers 
} from 'lucide-react';
import AssetCard from '../components/AssetCard';
import StatsStrip from '../components/StatsStrip';
import AssetModal from '../modals/AssetModal';
import ProDirectoryModal from '../modals/ProDirectoryModal';
import WelcomeModal from '../modals/WelcomeModal';
import AuditModal from '../modals/AuditModal';

export default function DashboardView({ 
  activeProperty, assets, dueTasks, healthScore, providers, 
  setSelectedAsset, setShowOutlook, setShowLedger, 
  hasSeenOnboarding, onRefresh 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProsModal, setShowProsModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Trigger welcome message if user profile flag is false
  useEffect(() => {
    if (hasSeenOnboarding === false) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [hasSeenOnboarding]);

  const activeAssets = [...assets]
    .filter(a => a.status === 'active')
    .sort((a, b) => {
      if (a.sub_category === 'Home Stewardship') return -1;
      if (b.sub_category === 'Home Stewardship') return 1;
      return 0;
    });

  const retiredAssets = assets.filter(a => a.status === 'retired');

  const nextTask = () => setCarouselIndex((prev) => (prev + 1) % dueTasks.length);
  const prevTask = () => setCarouselIndex((prev) => (prev - 1 + dueTasks.length) % dueTasks.length);

  return (
    <div className="animate-in fade-in duration-500 font-sans">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
          <div className="flex items-center gap-2 mb-2"><div className="h-[2px] w-8 bg-amber-500"></div><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Active Dossier</span></div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">{activeProperty?.address}</h2>
          <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-tighter">
            {activeProperty?.city}, {activeProperty?.state} • 
            {activeProperty?.year_built && ` BUILT ${activeProperty.year_built} • `}
            {activeProperty?.sq_ft && ` ${activeProperty.sq_ft.toLocaleString()} SQ FT`}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-white px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all"><Plus className="w-4 h-4 text-amber-500" /> Add Asset</button>
      </div>

      <StatsStrip 
        activeAssetsCount={activeAssets.length} dueTasksCount={dueTasks.length} providersCount={providers.length} 
        healthScore={healthScore} onProsClick={() => setShowProsModal(true)} onCapExClick={() => setShowOutlook(true)} 
        onLedgerClick={() => setShowLedger(true)} onHealthClick={() => setShowAudit(true)}
      />

      {dueTasks.length > 0 && (
        <section className="mb-12">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 flex items-center gap-2 font-mono text-left"><Bell className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Maintenance Inbox ({carouselIndex + 1}/{dueTasks.length})</h3>
          <div className="relative bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2 font-mono"><AlertCircle className="w-3 h-3 text-amber-500" /><p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{dueTasks[carouselIndex].asset_name}</p></div>
              <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">{dueTasks[carouselIndex].task_name}</h4>
              <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest"><Calendar className="w-3 h-3" /> Due: {dueTasks[carouselIndex].next_due_date}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-800 rounded-sm overflow-hidden bg-slate-950 shadow-inner">
                <button onClick={prevTask} className="p-3 hover:bg-slate-800 text-slate-400 border-r border-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={nextTask} className="p-3 hover:bg-slate-800 text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <button onClick={() => setSelectedAsset(activeAssets.find(a => a.id === dueTasks[carouselIndex].asset_id))} className="bg-amber-500 text-slate-950 p-4 hover:bg-amber-400 transition-all shadow-lg active:scale-95"><ArrowUpRight className="w-5 h-5" /></button>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">{activeAssets.map((asset) => (<AssetCard key={asset.id} asset={asset} onSelect={setSelectedAsset} />))}</div>

      {retiredAssets.length > 0 && (
        <section className="pt-12 border-t border-slate-900"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 flex items-center gap-2 font-mono text-left"><Archive className="w-4 h-4" /> Property Archives</h3><div className="grid grid-cols-2 md:grid-cols-6 gap-4">{retiredAssets.map(a => (<div key={a.id} onClick={() => setSelectedAsset(a)} className="bg-slate-900/50 border border-slate-800 p-4 opacity-50 hover:opacity-100 cursor-pointer transition-all grayscale hover:grayscale-0 rounded-sm shadow-sm"><p className="text-[9px] font-mono text-slate-500 uppercase truncate text-left">{a.brand !== 'N/A' ? a.brand : 'Historical'}</p><h4 className="text-white font-bold uppercase text-[10px] truncate text-left">{a.sub_category}</h4></div>))}</div></section>
      )}

      {showAudit && <AuditModal assets={assets} dueTasks={dueTasks} healthScore={healthScore} onClose={() => setShowAudit(false)} onSelectAsset={setSelectedAsset} />}
      
      {/* THE WELCOME TRIGGER USES USER ID NOW */}
      {showWelcome && <WelcomeModal userId={activeProperty.owner_id} onClose={() => { setShowWelcome(false); onRefresh(); }} />}
      
      {showAddModal && <AssetModal activeProperty={activeProperty} propertyId={activeProperty.id} onClose={() => setShowAddModal(false)} onRefresh={onRefresh} />}
      {showProsModal && <ProDirectoryModal activeProperty={activeProperty} onClose={() => setShowProsModal(false)} />}
    </div>
  );
}