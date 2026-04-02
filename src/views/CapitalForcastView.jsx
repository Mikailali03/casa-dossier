import React from 'react';
import { calculateLifecycle } from '../utils/lifecycle';
import { BarChart3, ArrowLeft, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function CapitalForecastView({ assets, onClose }) {
  const currentYear = new Date().getFullYear();
  const timelineYears = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  // Organize data by year
  const forecastData = timelineYears.map(year => {
    const assetsDue = assets.filter(a => {
      const life = calculateLifecycle(a.manufacture_date, a.category, a.sub_category);
      return (currentYear + life.yearsRemaining) === year;
    });

    const totalCost = assetsDue.reduce((sum, a) => sum + (a.replacement_cost_est || 0), 0);

    return { year, assets: assetsDue, totalCost };
  });

  const total10YearBurn = forecastData.reduce((sum, d) => sum + d.totalCost, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 md:p-12 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-12 flex justify-between items-end border-b border-slate-800 pb-8">
        <div>
          <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </button>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-amber-500" /> 10-Year Capital Roadmap
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Projected Liability</p>
          <p className="text-3xl font-mono font-bold text-amber-500">${total10YearBurn.toLocaleString()}</p>
        </div>
      </div>

      {/* TIMELINE GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6">
        {forecastData.map((item, i) => (
          <div key={item.year} className={`group flex flex-col md:flex-row border ${item.totalCost > 0 ? 'border-slate-700 bg-slate-900/50' : 'border-slate-900 bg-slate-900/10'} p-6 rounded-sm transition-all`}>
            {/* Year Column */}
            <div className="w-full md:w-32 shrink-0 mb-4 md:mb-0">
              <span className={`text-2xl font-black font-mono ${item.totalCost > 0 ? 'text-white' : 'text-slate-800'}`}>
                {item.year}
              </span>
              {item.totalCost > 5000 && <AlertTriangle className="w-4 h-4 text-red-500 mt-2" />}
            </div>

            {/* Assets Column */}
            <div className="flex-grow space-y-3">
              {item.assets.length > 0 ? item.assets.map(asset => (
                <div key={asset.id} className="flex justify-between items-center bg-slate-950 p-3 border-l-2 border-amber-500 shadow-xl">
                  <div>
                    <h4 className="text-xs font-bold uppercase">{asset.sub_category}</h4>
                    <p className="text-[9px] font-mono text-slate-500 uppercase">{asset.brand} {asset.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-slate-300">${(asset.replacement_cost_est || 0).toLocaleString()}</p>
                    <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Est. Replacement</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest py-2">No critical lifecycles ending</p>
              )}
            </div>

            {/* Total Column */}
            <div className="w-full md:w-48 shrink-0 md:text-right md:pl-8 mt-4 md:mt-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Annual Impact</p>
              <p className={`text-xl font-mono font-bold ${item.totalCost > 0 ? 'text-white' : 'text-slate-800'}`}>
                ${item.totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}