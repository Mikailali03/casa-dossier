import React from 'react';
import { Search, MapPin, ChevronRight, QrCode, Plus } from 'lucide-react';

export default function TechPropertySearchView({ 
  query, 
  setQuery, 
  results, 
  onSelect, 
  onOpenScanner, 
  onOpenOnboarding, // NEW PROP
  loading 
}) {
  return (
    <div className="space-y-10 animate-in fade-in max-w-2xl mx-auto text-left">
      <header className="border-l-4 border-amber-500 pl-6">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Property_Lookup</h1>
        <p className="font-mono text-[11px] text-slate-500 tracking-[0.4em] uppercase mt-2">Dispatch Command Center</p>
      </header>

      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative group">
          <Search className={`absolute left-5 top-6 transition-colors ${loading ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} size={24} />
          <input 
            autoFocus
            className="w-full bg-slate-900 border-2 border-slate-800 p-6 pl-14 font-mono text-amber-500 outline-none uppercase text-xl focus:border-amber-500 transition-all" 
            placeholder="SEARCH_BY_ADDRESS..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </div>

        {/* Scanner Button */}
        <button 
          onClick={onOpenScanner}
          className="w-full bg-slate-900 border-2 border-slate-800 p-5 font-black uppercase italic text-xl flex items-center justify-center gap-4 hover:border-amber-500 transition-all text-white"
        >
          <QrCode size={28} className="text-amber-500" />
          Initiate_Optical_Scan
        </button>
      </div>

      {/* Results List */}
      <div className="grid gap-3">
        {results.map(p => (
          <button key={p.id} onClick={() => onSelect(p)} className="w-full bg-slate-900/50 p-8 border border-slate-800 flex justify-between items-center hover:border-amber-500 hover:bg-slate-900 group transition-all text-left text-white">
            <div>
              <p className="font-black uppercase italic text-2xl group-hover:text-white leading-none mb-1">{p.address}</p>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">{p.city}, {p.state}</p>
            </div>
            <ChevronRight className="text-slate-800 group-hover:text-amber-500 transition-all" size={28} />
          </button>
        ))}

        {/* NEW: CREATE PROPERTY BUTTON (Appears at the bottom of search or alone) */}
        <button 
          onClick={onOpenOnboarding}
          className="w-full mt-6 border-2 border-dashed border-slate-800 p-10 flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-500/5 group transition-all"
        >
          <div className="bg-slate-800 p-3 rounded-full mb-3 group-hover:bg-amber-500 transition-colors">
            <Plus className="text-slate-500 group-hover:text-slate-950" size={32} strokeWidth={3} />
          </div>
          <span className="font-black uppercase italic text-xl text-slate-500 group-hover:text-amber-500 tracking-tighter">
            Create_New_Property_Dossier
          </span>
          <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mt-2 group-hover:text-amber-500/60">
            Establish new site registry for client
          </p>
        </button>
      </div>
    </div>
  );
}