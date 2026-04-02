import React from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle, Activity, ArrowRight, Wrench, Calendar, Gauge } from 'lucide-react';

export default function AuditModal({ assets, dueTasks, healthScore, onClose, onSelectAsset }) {
  const overdueTasks = dueTasks.filter(t => new Date(t.next_due_date) < new Date());
  const upcomingTasks = dueTasks.filter(t => new Date(t.next_due_date) >= new Date());
  
  const systemsHealthy = assets.length - [...new Set(overdueTasks.map(t => t.asset_id))].length;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-sm overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter text-left">Property Health Audit</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8">
          {/* TOP STATS */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-950 p-4 border border-slate-800 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Dossier Score</p>
              <p className={`text-2xl font-mono font-bold ${healthScore < 80 ? 'text-red-500' : 'text-emerald-500'}`}>{healthScore}%</p>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-800 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Healthy Systems</p>
              <p className="text-2xl font-mono font-bold text-white">{systemsHealthy}/{assets.length}</p>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-800 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Critical Alerts</p>
              <p className="text-2xl font-mono font-bold text-red-500">{overdueTasks.length}</p>
            </div>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* CRITICAL SECTION */}
            <section>
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> System Deficiencies
              </h3>
              <div className="space-y-2">
                {overdueTasks.length > 0 ? overdueTasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-red-500/5 border border-red-900/30 rounded-sm">
                    <div className="text-left">
                      <p className="text-[9px] font-mono text-red-500 uppercase font-bold">{t.asset_name}</p>
                      <h4 className="text-white font-bold text-xs uppercase">{t.task_name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Overdue Since</p>
                      <p className="text-xs font-mono text-red-500">{t.next_due_date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 border border-dashed border-slate-800 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-mono text-slate-500 uppercase">All systems within operational parameters</p>
                  </div>
                )}
              </div>
            </section>

            {/* UPCOMING MAINTENANCE */}
            <section className="pt-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Scheduled Maintenance (Next 30 Days)
              </h3>
              <div className="space-y-2">
                {upcomingTasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-sm opacity-60">
                    <div className="text-left">
                      <p className="text-[9px] font-mono text-slate-500 uppercase">{t.asset_name}</p>
                      <h4 className="text-white font-bold text-xs uppercase">{t.task_name}</h4>
                    </div>
                    <p className="text-xs font-mono text-slate-400">{t.next_due_date}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="bg-slate-950 p-6 border-t border-slate-800 text-center">
           <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest leading-relaxed">
             Performance audit is based on localized AI research and manufacturer-specific equipment schedules.
           </p>
        </div>
      </div>
    </div>
  );
}