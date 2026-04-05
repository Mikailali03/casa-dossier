import React from 'react';
import { ShoppingCart, PanelRightClose, Trash2, CreditCard } from 'lucide-react';

export default function TechCartSidebar({ cart, total, isCollapsed, onCollapse, onRemove, onFinalize, loading, isVisible }) {
  if (!isVisible) return null;

  return (
    <aside 
      className={`
        fixed top-20 right-0 bottom-0 z-[90] 
        w-full lg:w-[400px] bg-slate-900 border-l-4 border-amber-500 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] 
        transition-all duration-500 ease-in-out flex flex-col
        ${isCollapsed ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center text-white">
        <div>
          <h3 className="font-black italic uppercase tracking-tighter text-2xl flex items-center gap-2">
            <ShoppingCart className="text-amber-500" size={24} /> Work_Order
          </h3>
          <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest leading-none">Billing Terminal Active</p>
        </div>
        <button onClick={onCollapse} className="bg-slate-900 p-2 text-slate-500 border border-slate-800"><PanelRightClose size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-white">
        {cart.map((item, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 p-4 border-l-4 border-amber-500 animate-in fade-in slide-in-from-right-4 shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest leading-none mb-1">{item.asset_name}</p>
                <p className="text-sm font-black uppercase italic text-white leading-tight">{item.task_name}</p>
              </div>
              <button onClick={() => onRemove(idx)} className="text-slate-800 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-2 mt-2 font-mono italic">
               <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">L:${item.labor} | M:${item.materials}</div>
               <div className="text-md font-black text-amber-500 tracking-tighter leading-none">${item.total.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950 p-8 border-t border-slate-800 space-y-6 text-white">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black leading-none mb-1">Property_Total</p>
            <p className="text-5xl font-black font-mono text-white italic tracking-tighter leading-none">${total.toFixed(2)}</p>
          </div>
        </div>
        <button 
          onClick={onFinalize} 
          disabled={loading || cart.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-black uppercase italic text-2xl py-6 shadow-[8px_8px_0px_0px_#064e3b] active:translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <CreditCard size={28} /> {loading ? 'SYNCING...' : 'Finalize_&_Sync'}
        </button>
      </div>
    </aside>
  );
}