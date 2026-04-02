import React from 'react';
import { Wrench, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function AssetCard({ asset, onSelect }) {
  // Hide brand/model display if set to N/A
  const showBrand = asset.brand && asset.brand !== 'N/A' && asset.brand !== 'PROPERTY';
  const showModel = asset.model && asset.model !== 'N/A' && asset.model !== 'GENERAL';

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-sm overflow-hidden flex flex-col shadow-xl transition-all">
      {asset.image_url ? (
        <img src={asset.image_url} alt="" className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
      ) : (
        <div className="w-full h-32 bg-slate-950 flex items-center justify-center border-b border-slate-900">
          <ImageIcon className="w-8 h-8 text-slate-800" />
        </div>
      )}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <Wrench className="w-5 h-5 text-amber-500" />
          {asset.is_verified && <div className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 border border-amber-500/20 uppercase tracking-widest">Verified</div>}
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{asset.sub_category}</h3>
        
        {/* Only show if not N/A */}
        {(showBrand || showModel) ? (
          <p className="text-xs text-slate-500 font-mono uppercase tracking-tighter mb-6">
            {showBrand && asset.brand} {showModel && asset.model}
          </p>
        ) : <div className="mb-6"></div>}

        <button 
          onClick={() => onSelect(asset)} 
          className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-amber-500 transition-colors w-full"
        >
          View History <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}