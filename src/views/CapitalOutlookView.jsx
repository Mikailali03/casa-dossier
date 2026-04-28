import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { calculateLifecycle } from '../utils/lifecycle';
// VERIFIED ICON LIST: 4 Icons.
import { ArrowLeft, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-amber-500 p-4 shadow-2xl rounded-sm font-mono max-w-[240px] animate-in fade-in zoom-in duration-200">
        <p className="text-amber-500 font-black text-[10px] uppercase mb-3 border-b border-amber-500/30 pb-2 tracking-widest">
          {data.year} Projection
        </p>
        <div className="space-y-3">
          {data.assets.length > 0 ? data.assets.map((asset, idx) => (
            <div key={idx} className="flex flex-col border-l-2 border-slate-700 pl-3 text-left">
              <p className="text-white font-bold text-[9px] uppercase leading-tight">
                {asset.sub_category}
              </p>
              <p className="text-slate-500 text-[8px] uppercase tracking-tighter">
                Est. ${(asset.replacement_cost_est || 0).toLocaleString()}
              </p>
            </div>
          )) : (
            <p className="text-[9px] text-slate-600 uppercase italic">No cycles ending</p>
          )}
        </div>
        <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Total Impact</span>
          <span className="text-white font-bold text-[10px] font-mono">${data.spend.toLocaleString()}</span>
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
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-12 animate-in fade-in duration-500 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-6">
        <div className="text-left">
          <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors font-mono">
            <ArrowLeft className="w-4 h-4" /> Exit Outlook
          </button>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-amber-500" /> Capital Outlook
          </h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase mt-2 tracking-[0.2em]">10-Year Replacement & Liability Projection</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-sm shadow-xl flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="text-left border-r border-slate-800 pr-4 md:pr-6 flex-grow">
            <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 font-mono">Liability Horizon</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-amber-500">${totalLiability.toLocaleString()}</p>
          </div>
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="max-w-6xl mx-auto bg-slate-900/40 border border-slate-800 p-4 md:p-8 rounded-sm shadow-2xl relative h-[350px] md:h-[450px]">
        <div className="absolute top-2 left-4 flex items-center gap-2 opacity-50">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Telemetry Active</span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            
            <XAxis 
              dataKey="year" 
              stroke="#475569" 
              fontSize={9} 
              fontWeight="900" 
              tickLine={false} 
              axisLine={false} 
              dy={10}
              fontFamily="monospace"
            />
            
            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              fontWeight="900" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `$${v}`} 
              dx={0} 
              fontFamily="monospace"
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }} 
            />

            {/* UPDATED: type="monotone" creates the smooth curve */}
            <Line 
              type="monotone" 
              dataKey="spend" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }} 
              activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* INSIGHT FOOTER */}
      <div className="max-w-6xl mx-auto mt-6 text-left">
        <div className="p-4 bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-500 uppercase leading-relaxed tracking-tighter max-w-2xl">
           Projection algorithm identifies fiscal year liability based on manufacturer specific lifecycle datasets. High-impact years denote replacement costs exceeding $5,000 USD.
        </div>
      </div>
      <Analytics />
    </div>
  );
}
