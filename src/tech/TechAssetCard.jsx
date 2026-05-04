import React from 'react';
import { Box, Printer, ChevronRight } from 'lucide-react';

export default function TechAssetCard({ asset, onSelect, onPrint }) {
  return (
    <div className="bg-slate-900 border border-slate-800 flex items-stretch group hover:border-amber-500 transition-all">
      <button 
        onClick={onSelect} 
        className="flex-1 p-6 flex items-center gap-6 text-left"
      >
        <div className="bg-slate-950 p-4 border border-slate-800 group-hover:bg-emerald-500/10 transition-colors">
            <Box className="text-slate-700 group-hover:text-emerald-500 transition-colors" size={32} />
        </div>
        <div>
          <p className="font-black uppercase italic text-2xl leading-none text-white group-hover:text-white transition-colors">
            {asset.brand} {asset.sub_category}
          </p>
          <div className="flex gap-4 mt-2 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            <span>SN: {asset.serial_number || 'UNVERIFIED'}</span>
            <span className="text-slate-700">|</span>
            <span>CAT: {asset.category}</span>
          </div>
        </div>
      </button>
      
      {/* Print Side-Action */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPrint(asset); }}
        className="px-8 border-l border-slate-800 bg-slate-950/30 hover:bg-amber-500 hover:text-slate-950 transition-all text-slate-500"
        title="Print QR Label"
      >
        <Printer size={24} />
      </button>
    </div>
  );
}