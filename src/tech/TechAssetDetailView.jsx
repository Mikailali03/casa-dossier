import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

export default function TechAssetDetailView({ asset, tasks, onBack, onOpenModal }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      <button onClick={onBack} className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase hover:text-white"><ArrowLeft size={14} /> Back_To_Property</button>
      <div className="bg-slate-900 p-6 border-l-8 border-emerald-500 shadow-xl text-white">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-1">{asset.brand}</h2>
        <p className="text-xl font-bold text-slate-400 uppercase leading-none">{asset.sub_category}</p>
      </div>
      <div className="grid gap-3 text-white">
        <button 
          onClick={() => onOpenModal({ task_id: null, task_name: '', asset_id: asset.id, asset_name: `${asset.brand} ${asset.sub_category}` })}
          className="bg-emerald-600 hover:bg-emerald-500 p-5 font-black uppercase italic text-slate-950 flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all"
        >
          <Plus size={24} strokeWidth={3} /> Add_Custom_Service
        </button>

        {tasks.map(t => (
          <button key={t.id} onClick={() => onOpenModal({ task_id: t.id, task_name: t.task_name, asset_id: asset.id, asset_name: `${asset.brand} ${asset.sub_category}` })} className="bg-slate-900 border border-slate-800 p-5 flex justify-between items-center hover:border-amber-500 transition-all text-left">
            <div><p className="text-sm font-bold uppercase leading-none mb-1 group-hover:text-white">{t.task_name}</p><p className="text-[10px] font-mono text-slate-500 uppercase">Interval: {new Date(t.next_due_date).toLocaleDateString()}</p></div>
            <Plus size={20} className="text-slate-700" />
          </button>
        ))}
      </div>
    </div>
  );
}