import React from 'react';
import { Wrench, LogOut, PanelRightClose, PanelRightOpen, ShieldCheck } from 'lucide-react';

export default function TechHeader({ profile, onLogout, cartTotal, cartCount, isCollapsed, onToggleCart }) {
  // Ensure we have fallback values if profile isn't fully populated yet
  const firstName = profile?.first_name || "AUTHORIZED";
  const lastName = profile?.last_name || "OPERATOR";
  const techID = profile?.tech_id || "000-0000";

  return (
    <nav className="border-b-4 border-amber-500 bg-slate-900 p-4 flex justify-between items-center sticky top-0 z-[100] h-20 shrink-0 shadow-2xl">
      {/* Left Section: Technician Identity */}
      <div className="flex items-center gap-4">
        <div className="bg-amber-500 p-2 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          <Wrench className="text-slate-950" size={24} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase italic tracking-tighter leading-none text-white">
            Service_Console_v2
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest leading-none font-bold">
              {firstName} {lastName}
            </p>
            <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30 rounded-sm">
              <ShieldCheck size={10} className="text-amber-500" />
              <span className="text-[9px] font-mono text-amber-500 font-bold">
                ID: {techID}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Session Stats & Logout */}
      <div className="flex items-center gap-4">
        {cartCount > 0 && (
          <button 
            onClick={onToggleCart} 
            className="bg-slate-950 border border-slate-800 px-4 py-2 flex items-center gap-3 hover:border-amber-500 transition-all group shadow-inner"
          >
            <div className="text-right">
              <p className="text-[8px] font-mono text-slate-500 uppercase font-black mb-0.5">Session_Total</p>
              <p className="font-mono text-md font-black text-amber-500 tracking-tighter leading-none">
                ${cartTotal.toFixed(2)}
              </p>
            </div>
            <div className="relative">
              {isCollapsed ? (
                <PanelRightOpen size={20} className="text-amber-500 animate-pulse" />
              ) : (
                <PanelRightClose size={20} className="text-slate-500 group-hover:text-white" />
              )}
            </div>
          </button>
        )}
        
        <button 
          onClick={onLogout} 
          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-md"
          title="Terminte Session"
        >
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  );
}