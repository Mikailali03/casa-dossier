import React from 'react';
import { X, Edit3, ChevronRight } from 'lucide-react';

export default function TechServiceModal({ data, onClose, onAdd }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const labor = Number(formData.get('labor') || 0);
    const materials = Number(formData.get('materials') || 0);
    const title = data.task_id ? data.task_name : formData.get('custom_title');
    
    onAdd({
      ...data,
      task_name: title,
      labor,
      materials,
      notes: formData.get('notes'),
      total: labor + materials
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-amber-500 w-full max-w-lg shadow-2xl">
        <div className="bg-amber-500 p-4 flex justify-between items-center font-black uppercase italic text-slate-950 tracking-tighter">
          Line_Item_Configure
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1 leading-none">Target_Unit</p>
            <p className="font-black uppercase italic text-2xl leading-none text-white">{data.asset_name}</p>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-amber-500 uppercase mb-2 tracking-widest font-black leading-none">Service_Action_Title</label>
            {data.task_id ? (
              <div className="bg-slate-950 border border-slate-800 p-4 text-white font-bold uppercase italic text-xl border-l-4 border-amber-500">{data.task_name}</div>
            ) : (
              <input autoFocus required name="custom_title" className="w-full bg-slate-950 border-2 border-slate-800 p-4 font-black uppercase italic text-xl text-white outline-none focus:border-emerald-500" placeholder="E.G. REPLACED_PUMP..." />
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-mono text-[10px] text-slate-500 uppercase mb-2 tracking-widest font-black">Labor_USD</label>
              <input required name="labor" type="number" className="w-full bg-slate-950 border-2 border-slate-800 p-4 font-mono text-white text-2xl outline-none focus:border-amber-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-slate-500 uppercase mb-2 tracking-widest font-black">Materials_USD</label>
              <input required name="materials" type="number" className="w-full bg-slate-950 border-2 border-slate-800 p-4 font-mono text-emerald-500 text-2xl outline-none focus:border-emerald-500" placeholder="0.00" />
            </div>
          </div>
          <button type="submit" className="w-full bg-amber-500 p-5 font-black uppercase italic text-slate-950 text-xl hover:bg-amber-400 shadow-[8px_8px_0px_0px_#92400e] active:translate-y-1 transition-all">Add_To_Work_Order</button>
        </form>
      </div>
    </div>
  );
}
