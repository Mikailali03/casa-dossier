import React from 'react';
import { ArrowLeft, TrendingUp, Plus, Box, QrCode } from 'lucide-react';

export default function TechPropertyDetailView({ property, assets, upsells, onSelectAsset, onBack, onOpenModal, onOpenScanner }) {
  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase hover:text-white transition-colors">
        <ArrowLeft size={14} /> Back_To_Lookup
      </button>

      <div className="bg-slate-900 p-8 border-l-8 border-amber-500 shadow-2xl">
        <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest font-black mb-1">Active_Dispatch</p>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">{property.address}</h1>
      </div>
      <div>
        <button 
        onClick={onOpenScanner}
        className="w-full bg-slate-900 border-2 border-dashed border-amber-500/50 p-8 flex items-center justify-between hover:bg-amber-500 group transition-all"
      >
        <div className="flex items-center gap-6">
          <QrCode size={40} className="text-amber-500 group-hover:text-slate-950 transition-colors" />
          <div className="text-left">
            <p className="font-black uppercase italic text-2xl leading-none group-hover:text-slate-950 transition-colors">Scan_Unit_Plate</p>
            <p className="font-mono text-[10px] text-slate-500 group-hover:text-slate-900 uppercase tracking-widest mt-1 transition-colors">Optical Recognition Bypass</p>
          </div>
        </div>
        <Plus size={24} className="text-slate-700 group-hover:text-slate-950" />
      </button>
      </div>

      {upsells.length > 0 && (
        <div className="bg-amber-500/5 border-2 border-amber-500/20 p-6 rounded-sm">
          <h3 className="font-black uppercase italic text-amber-500 flex items-center gap-2 mb-6 tracking-tighter text-xl">
            <TrendingUp size={20} /> Field_Intelligence_Add-ons
          </h3>
          <div className="grid gap-3">
            {upsells.map(u => (
              <button 
                key={u.id} 
                onClick={() => onOpenModal({ task_id: u.id, task_name: u.task_name, asset_id: u.asset_id, asset_name: `${u.assets.brand} ${u.assets.sub_category}` })} 
                className="bg-slate-950 p-5 border border-amber-500/10 flex justify-between items-center hover:bg-amber-500 hover:text-slate-950 transition-all group"
              >
                <div className="text-left">
                  <p className="text-md font-bold uppercase leading-none mb-1">{u.task_name}</p>
                  <p className="text-[10px] font-mono opacity-70 uppercase">Unit: {u.assets.brand} {u.assets.sub_category}</p>
                </div>
                <Plus size={20} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.5em] mb-6 font-bold">Equipment_Registry</h3>
        <div className="grid gap-4">
          {assets.map(a => (
            <button key={a.id} onClick={() => onSelectAsset(a)} className="bg-slate-900 p-7 border border-slate-800 flex items-center gap-6 hover:border-emerald-500 hover:bg-slate-900 group transition-all text-left shadow-lg">
              <Box className="text-slate-700 group-hover:text-emerald-500 transition-colors" size={32} />
              <div>
                <p className="font-black uppercase italic text-2xl leading-none group-hover:text-white transition-colors">{a.brand} {a.sub_category}</p>
                <p className="font-mono text-[11px] text-slate-500 uppercase mt-2 tracking-widest">Serial_No: {a.serial_number || 'UNVERIFIED'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}