import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Home, Building, Plus, Users, LogOut, FileText, Settings, Menu, X, Crown, Zap } from 'lucide-react';
import PropertyModal from '../modals/PropertyModal';
import ProDirectoryModal from '../modals/ProDirectoryModal';
import SettingsModal from '../modals/SettingsModal';

export default function Header({ properties, activeProperty, setActiveProperty, setSelectedAsset, setShowReport, userTier, onUpgradeClick, onRefresh }) {
  const [showPropModal, setShowPropModal] = useState(false);
  const [showProsModal, setShowProsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 sticky top-0 z-[100] flex justify-between items-center shadow-2xl">
      <div className="flex items-center gap-4 md:gap-8">
        <div onClick={() => { setSelectedAsset(null); setShowReport(false); closeMenu(); }} className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-amber-500 p-1.5 rounded-sm transition-transform group-hover:scale-105"><Home className="text-slate-950 w-5 h-5" /></div>
          <span className="font-black uppercase tracking-tighter text-xl text-white">CASA <span className="text-amber-500">DOSSIER</span></span>
        </div>

        <div className="hidden md:flex items-center gap-4 border-l border-slate-800 pl-6">
          <select 
            value={activeProperty?.id || ''} 
            onChange={(e) => { setActiveProperty(properties.find(p => p.id === e.target.value)); setSelectedAsset(null); setShowReport(false); }}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer hover:text-white transition-colors max-w-[150px] truncate font-mono"
          >
            {properties.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.address}</option>)}
          </select>
          <button onClick={() => setShowProsModal(true)} className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-sm border border-slate-700 transition-all font-black uppercase text-[9px] tracking-widest"><Users className="w-3 h-3" /> Pros</button>
          <button onClick={() => setShowPropModal(true)} className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-sm border border-slate-700 transition-all font-black uppercase text-[9px] tracking-widest"><Plus className="w-3 h-3" /> Add Property</button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* TIER BADGE - CLICKABLE */}
        <button 
          onClick={onUpgradeClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full hover:border-amber-500 transition-all group"
        >
          {userTier === 'essential' ? <Zap className="w-3 h-3 text-slate-500 group-hover:text-amber-500" /> : <Crown className="w-3 h-3 text-amber-500 animate-pulse" />}
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">{userTier}</span>
        </button>

        {userTier === 'essential' && (
          <button onClick={onUpgradeClick} className="hidden lg:block bg-amber-500 text-slate-950 px-4 py-1.5 rounded-sm font-black uppercase text-[9px] tracking-[0.2em] shadow-lg hover:bg-white transition-all">Upgrade</button>
        )}

        <button onClick={() => setShowReport(true)} className="hidden sm:flex items-center gap-2 px-3 py-2 text-white hover:text-amber-500 transition-all font-black uppercase text-[9px] tracking-widest"><FileText className="w-4 h-4" /> Report</button>
        <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
        <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
        
        {/* MOBILE MENU TOGGLE */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-amber-500"><Menu className="w-6 h-6" /></button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-[200] lg:hidden animate-in slide-in-from-right duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeMenu}></div>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col uppercase font-black text-[10px] tracking-widest">
            <button onClick={() => { setShowProsModal(true); closeMenu(); }} className="p-5 border-b border-slate-800 text-left flex items-center gap-3"><Users className="w-5 h-5" /> Service Directory</button>
            <button onClick={() => { setShowPropModal(true); closeMenu(); }} className="p-5 border-b border-slate-800 text-left flex items-center gap-3 text-amber-500"><Plus className="w-5 h-5" /> Add Property</button>
            <button onClick={onUpgradeClick} className="p-5 border-b border-slate-800 text-left flex items-center gap-3 text-emerald-500"><Crown className="w-5 h-5" /> Membership Plan</button>
            <button onClick={() => { setShowReport(true); closeMenu(); }} className="p-5 border-b border-slate-800 text-left flex items-center gap-3"><FileText className="w-5 h-5" /> Generate Report</button>
            <button onClick={() => { setShowSettings(true); closeMenu(); }} className="p-5 border-b border-slate-800 text-left flex items-center gap-3"><Settings className="w-5 h-5" /> Settings</button>
          </div>
        </div>
      )}

      {showPropModal && <PropertyModal userTier={userTier} propertyCount={properties.length} onUpgradeClick={onUpgradeClick} onClose={() => setShowPropModal(false)} onRefresh={onRefresh} />}
      {showProsModal && <ProDirectoryModal activeProperty={activeProperty} onClose={() => setShowProsModal(false)} />}
      {showSettings && <SettingsModal property={activeProperty} onClose={() => setShowSettings(false)} onRefresh={onRefresh} />}
    </header>
  );
}