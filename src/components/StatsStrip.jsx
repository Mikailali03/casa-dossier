import React from 'react';
// VERIFIED ICON LIST: 6 Icons present.
import { 
  Layers, 
  Calendar, 
  Activity, 
  BarChart3, 
  PiggyBank, 
  AlertCircle 
} from 'lucide-react';

export default function StatsStrip({ 
  activeAssetsCount, 
  dueTasksCount, 
  healthScore, 
  onCapExClick, 
  onLedgerClick, 
  onHealthClick 
}) {
  
  const stats = [
    { 
      label: 'Portfolio Assets', 
      val: activeAssetsCount, 
      icon: Layers, 
      color: 'text-white',
      isClickable: false 
    },
    { 
      label: 'Maint. Alerts', 
      val: dueTasksCount, 
      icon: dueTasksCount > 0 ? AlertCircle : Calendar, 
      color: dueTasksCount > 0 ? 'text-amber-500' : 'text-slate-400',
      isClickable: false,
      border: dueTasksCount > 0 ? 'border-amber-500/40' : 'border-slate-800'
    },
    { 
      label: 'Capital Outlook', 
      val: '10Y Forecast', 
      icon: BarChart3, 
      color: 'text-amber-500', 
      isClickable: true, 
      onClick: onCapExClick 
    },
    { 
      label: 'Home Health', 
      val: `${healthScore}%`, 
      icon: Activity, 
      color: healthScore < 80 ? 'text-red-500' : 'text-emerald-500',
      isClickable: true,
      onClick: onHealthClick,
      border: healthScore < 80 ? 'border-red-500/40' : 'border-slate-800'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-slate-500 uppercase font-black tracking-widest text-[9px] font-mono">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          onClick={stat.isClickable ? stat.onClick : undefined}
          className={`
            relative bg-slate-900/40 border p-4 rounded-sm transition-all shadow-lg 
            ${stat.border || 'border-slate-800'} 
            ${stat.isClickable ? 'cursor-pointer hover:border-amber-500 group active:scale-95' : 'cursor-default'}
          `}
        >
          {/* Subtle Background Icon for "Premium" feel */}
          <stat.icon className="absolute right-2 bottom-2 w-8 h-8 opacity-5 text-slate-400" />

          <div className="flex items-center gap-2 mb-2 relative z-10">
            <stat.icon className={`w-3.5 h-3.5 ${stat.isClickable ? 'group-hover:text-amber-500 transition-colors' : ''} ${dueTasksCount > 0 && stat.label === 'Maint. Alerts' ? 'animate-pulse' : ''}`} />
            <span className={stat.isClickable ? 'group-hover:text-slate-300 transition-colors' : ''}>
              {stat.label}
            </span>
          </div>

          <div className={`text-xl font-mono block mt-1 relative z-10 font-bold ${stat.color} ${stat.isClickable ? 'group-hover:text-amber-500' : ''}`}>
            {stat.val}
          </div>

          {stat.isClickable && (
            <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[7px] text-slate-600">Open Diagnostic</span>
              <div className="w-1 h-1 rounded-full bg-amber-500"></div>
            </div>
          )}
        </div>
      ))}

      {/* SECONDARY ROW FOR INVESTMENT LEDGER (HIGH VALUE FULL WIDTH BUTTON) */}
      <div 
        onClick={onLedgerClick}
        className="col-span-2 md:col-span-4 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-3 flex justify-between items-center cursor-pointer group transition-all rounded-sm shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 rounded-sm">
            <PiggyBank className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Investment Ledger</p>
            <p className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">View property cost basis and maintenance expenditure audit</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all mr-4">
           <span className="text-[9px] font-black uppercase">Run Analysis</span>
           <Layers className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}