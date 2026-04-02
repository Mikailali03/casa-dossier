import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Home, Building, Plus, Users, LogOut, FileText, Settings } from 'lucide-react';
import PropertyModal from '../modals/PropertyModal';
import ProDirectoryModal from '../modals/ProDirectoryModal';
import SettingsModal from '../modals/SettingsModal';

export default function Header({ properties, activeProperty, setActiveProperty, setSelectedAsset, setShowReport, onRefresh }) {
  const [showPropModal, setShowPropModal] = useState(false);
  const [showProsModal, setShowProsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    /* Header lowered slightly to z-40 */
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 flex justify-between items-center">
      <div className="flex items-center gap-4 md:gap-8">
        <div onClick={() => { setSelectedAsset(null); setShowReport(false); }} className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-amber-500 p-1.5 rounded-sm transition-transform group-hover:scale-105"><Home className="text-slate-950 w-5 h-5" /></div>
          <span className="font-black uppercase tracking-tighter text-xl text-white group-hover:text-amber-500 transition-colors font-sans">CASA <span className="text-amber-500 group-hover:text-white transition-colors">DOSSIER</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-4 border-l border-slate-800 pl-6">
          <Building className="w-4 h-4 text-slate-600" />
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

      <div className="flex items-center gap-3">
        <button onClick={() => setShowReport(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-sm font-black uppercase text-[10px] tracking-widest transition-all shadow-lg"><FileText className="w-3.5 h-3.5" /> Generate Report</button>
        <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
        <button onClick={() => supabase.auth.signOut()} className="bg-slate-800 p-2 text-slate-500 hover:text-red-500 rounded-sm transition-all"><LogOut className="w-4 h-4" /></button>
      </div>

      {/* MODALS RENDERED HERE */}
      {showPropModal && <PropertyModal onClose={() => setShowPropModal(false)} onRefresh={onRefresh} />}
      {showProsModal && <ProDirectoryModal activeProperty={activeProperty} onClose={() => setShowProsModal(false)} />}
      {showSettings && <SettingsModal property={activeProperty} onClose={() => setShowSettings(false)} onRefresh={onRefresh} />}
    </header>
  );
}