import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Home, Building, Plus, Users, LogOut, 
  FileText, Settings, Menu, X 
} from 'lucide-react';
import PropertyModal from '../modals/PropertyModal';
import ProDirectoryModal from '../modals/ProDirectoryModal';
import SettingsModal from '../modals/SettingsModal';

export default function Header({ properties, activeProperty, setActiveProperty, setSelectedAsset, setShowReport, onRefresh }) {
  const [showPropModal, setShowPropModal] = useState(false);
  const [showProsModal, setShowProsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const NavButton = ({ onClick, icon: Icon, label, variant = "default" }) => (
    <button 
      onClick={() => { onClick(); closeMenu(); }}
      className={`flex items-center gap-3 w-full p-4 border-b border-slate-800 transition-all active:bg-slate-800 ${variant === 'amber' ? 'text-amber-500' : 'text-slate-300'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-black uppercase tracking-widest text-xs">{label}</span>
    </button>
  );

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 sticky top-0 z-[100] flex justify-between items-center">
      
      {/* LEFT: LOGO & PROPERTY SWITCHER */}
      <div className="flex items-center gap-4 md:gap-8">
        <div onClick={() => { setSelectedAsset(null); setShowReport(false); closeMenu(); }} className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-amber-500 p-1.5 rounded-sm"><Home className="text-slate-950 w-5 h-5" /></div>
          <span className="font-black uppercase tracking-tighter text-xl text-white">CASA <span className="text-amber-500">DOSSIER</span></span>
        </div>

        {/* PROPERTY SWITCHER (Visible everywhere) */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4 md:pl-8">
          <Building className="w-4 h-4 text-slate-600 hidden sm:block" />
          <select 
            value={activeProperty?.id || ''} 
            onChange={(e) => { setActiveProperty(properties.find(p => p.id === e.target.value)); setSelectedAsset(null); setShowReport(false); }}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer hover:text-white transition-colors max-w-[100px] md:max-w-[200px] truncate font-mono"
          >
            {properties.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.address}</option>)}
          </select>
        </div>
      </div>

      {/* RIGHT: DESKTOP NAV (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center gap-3">
        <button onClick={() => setShowProsModal(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-sm border border-slate-700 transition-all font-black uppercase text-[9px] tracking-widest"><Users className="w-3.5 h-3.5" /> Pros</button>
        <button onClick={() => setShowPropModal(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-sm border border-slate-700 transition-all font-black uppercase text-[9px] tracking-widest"><Plus className="w-3.5 h-3.5" /> Add Property</button>
        <button onClick={() => setShowReport(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-sm font-black uppercase text-[10px] tracking-widest transition-all shadow-lg"><FileText className="w-3.5 h-3.5" /> Generate Report</button>
        <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
        <button onClick={() => supabase.auth.signOut()} className="bg-slate-800 p-2 text-slate-500 hover:text-red-500 rounded-sm transition-all"><LogOut className="w-4 h-4" /></button>
      </div>

      {/* RIGHT: MOBILE MENU TOGGLE */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className="lg:hidden p-2 text-amber-500 active:scale-90 transition-all"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* MOBILE SIDE-MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-[200] lg:hidden animate-in slide-in-from-right duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeMenu}></div>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
            <NavButton onClick={() => setShowProsModal(true)} icon={Users} label="Service Directory" />
            <NavButton onClick={() => setShowPropModal(true)} icon={Plus} label="Add Property" variant="amber" />
            <NavButton onClick={() => setShowReport(true)} icon={FileText} label="Generate Report" />
            <NavButton onClick={() => setShowSettings(true)} icon={Settings} label="Global Settings" />
            
            <div className="mt-auto p-4 bg-slate-950/50">
              <button 
                onClick={() => supabase.auth.signOut()}
                className="flex items-center justify-center gap-3 w-full p-4 bg-red-900/20 border border-red-900/50 text-red-500 font-black uppercase tracking-widest text-[10px]"
              >
                <LogOut className="w-4 h-4" /> Sign Out Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showPropModal && <PropertyModal onClose={() => setShowPropModal(false)} onRefresh={onRefresh} />}
      {showProsModal && <ProDirectoryModal activeProperty={activeProperty} onClose={() => setShowProsModal(false)} />}
      {showSettings && <SettingsModal property={activeProperty} onClose={() => setShowSettings(false)} onRefresh={onRefresh} />}
    </header>
  );
}