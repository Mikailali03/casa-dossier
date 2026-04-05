import React from 'react';
import { Search, MapPin, ChevronRight, QrCode } from 'lucide-react'; // Added QrCode

export default function TechPropertySearchView({ query, setQuery, results, onSelect, onOpenScanner, loading }) {
  return (
    <div className="space-y-10 animate-in fade-in max-w-2xl mx-auto text-left">
      <header className="border-l-4 border-amber-500 pl-6">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none font-black uppercase tracking-tighter italic">Property_Lookup</h1>
        <p className="font-mono text-[11px] text-slate-500 tracking-[0.4em] uppercase mt-2">Dispatch Command Center</p>
      </header>

      <div className="space-y-4">
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

        {/* NEW: SCANNER BUTTON */}
        <button 
          onClick={onOpenScanner}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 p-5 font-black uppercase italic text-xl flex items-center justify-center gap-4 shadow-[6px_6px_0px_0px_rgba(245,158,11,0.2)] active:translate-y-1 active:shadow-none transition-all"
        >
          <QrCode size={28} strokeWidth={2.5} />
          Initiate_Optical_Scan
        </button>
      </div>

      <div className="grid gap-3">
        {results.map(p => (
          <button key={p.id} onClick={() => onSelect(p)} className="w-full bg-slate-900/50 p-8 border border-slate-800 flex justify-between items-center hover:border-amber-500 hover:bg-slate-900 group transition-all text-left">
            <div>
              <p className="font-black uppercase italic text-2xl group-hover:text-white leading-none mb-1">{p.address}</p>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">{p.city}, {p.state}</p>
            </div>
            <ChevronRight className="text-slate-800 group-hover:text-amber-500 transition-all" size={28} />
          </button>
        ))}
      </div>
    </div>
  );
}