import React from 'react';
import { CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export default function TechSuccessOverlay({ profile }) {
  const firstName = profile?.first_name || "Authorized";
  const lastName = profile?.last_name || "Tech";
  const techID = profile?.tech_id || "000-0000";

  return (
    <div className="fixed inset-0 z-[200] bg-emerald-600 flex flex-col items-center justify-center text-white text-center animate-in zoom-in p-8 backdrop-blur-md">
      {/* Animated Success Icon */}
      <div className="relative mb-8">
        <CheckCircle2 size={140} className="text-white animate-bounce" strokeWidth={1.5} />
        <div className="absolute -bottom-2 -right-2 bg-slate-950 p-2 rounded-full border-4 border-emerald-600">
           <ShieldCheck size={32} className="text-emerald-500" />
        </div>
      </div>

      <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-4 drop-shadow-lg">
        Sync_Complete
      </h1>

      <div className="space-y-6 max-w-md w-full">
        <div className="h-px bg-white/20 w-full" />
        
        <div className="flex flex-col items-center gap-2">
            <p className="font-mono tracking-[0.3em] uppercase font-black text-xl text-emerald-100">
              Service_Verified
            </p>
            <div className="flex items-center gap-3 bg-slate-950/20 px-6 py-3 border border-white/10 rounded-sm">
                <Activity size={18} className="text-emerald-300" />
                <p className="font-mono text-sm uppercase tracking-widest text-white font-bold">
                  Operator: {firstName} {lastName} // ID: {techID}
                </p>
            </div>
        </div>

        <p className="font-mono text-[10px] uppercase text-emerald-200 tracking-widest opacity-60">
          Cryptographic Signature Applied to Asset Registry
        </p>
      </div>
    </div>
  );
}