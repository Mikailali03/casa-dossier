import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateLifecycle } from '../utils/lifecycle';
import { ArrowLeft, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-amber-500 p-4 shadow-2xl rounded-sm font-mono">
        <p className="text-amber-500 font-black text-xs uppercase mb-3 border-b border-amber-500/30 pb-2 tracking-widest">{data.year} Forecast</p>
        <div className="space-y-3">
          {data.assets.map((asset, idx) => (
            <div key={idx} className="flex flex-col border-l-2 border-slate-700 pl-3 text-left">
              <p className="text-white font-bold text-[10px] uppercase leading-tight">{asset.sub_category}</p>
              <p className="text-slate-500 text-[9px] uppercase">{asset.brand} • Est. ${(asset.replacement_cost_est || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-slate-500 text-[8px] font-black uppercase">Impact</span>
          <span className="text-white font-bold text-xs">${data.spend.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CapitalOutlookView({ assets, onClose }) {
  const currentYear = new Date().getFullYear();
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    const assetsDue = assets.filter(a => {
      if (!a.manufacture_date || !a.category) return false;
      const life = calculateLifecycle(a.manufacture_date, a.category, a.sub_category);
      return (currentYear + life.yearsRemaining) === year;
    });
    const spend = assetsDue.reduce((sum, a) => sum + (parseInt(a.replacement_cost_est) || 0), 0);
    return { year, spend, assets: assetsDue };
  });

  const totalLiability = chartData.reduce((sum, d) => sum + d.spend, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-6">
        <div className="text-left">
          <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors"><ArrowLeft className="w-4 h-4" /> Exit Outlook</button>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4"><TrendingUp className="w-8 h-8 text-amber-500" /> Capital Outlook</h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm shadow-xl flex items-center gap-6">
          <div className="text-left border-r border-slate-800 pr-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Liability Horizon</p>
            <p className="text-2xl font-mono font-bold text-amber-500">${totalLiability.toLocaleString()}</p>
          </div>
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900/40 border border-slate-800 p-8 rounded-sm shadow-2xl relative h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="year" stroke="#475569" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#475569" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}