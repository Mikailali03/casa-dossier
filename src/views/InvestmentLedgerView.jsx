import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, PiggyBank, CreditCard, TrendingUp, History, Wrench, Shield, ArrowUpRight } from 'lucide-react';

export default function InvestmentLedgerView({ assets, serviceRecords, property, onClose }) {
  // 1. Calculate and Merge Transactions
  const transactions = [
    // Capital Investment (Installs)
    ...assets.filter(a => (parseInt(a.install_cost) || 0) > 0).map(a => ({
      date: a.manufacture_date,
      type: 'CAPITAL',
      label: `System Install: ${a.sub_category}`,
      provider: a.brand,
      cost: parseInt(a.install_cost) || 0,
      category: a.category,
      receipt: a.install_receipt_url
    })),
    // Operating Expenses (Maintenance/Pro Services)
    ...serviceRecords.filter(s => (parseInt(s.cost) || 0) > 0).map(s => ({
      date: s.service_date,
      type: 'MAINTENANCE',
      label: s.description_of_work,
      provider: s.provider_name || 'Homeowner',
      cost: parseInt(s.cost) || 0,
      // Robust category check (structure might be nested under assets)
      category: s.assets?.category || 'OTHER',
      receipt: s.receipt_url
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // 2. Aggregate spend by category
  const categoryTotals = transactions.reduce((acc, t) => {
    const cat = t.category || 'OTHER';
    acc[cat] = (acc[cat] || 0) + t.cost;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const totalBasis = transactions.reduce((sum, t) => sum + t.cost, 0);
  const COLORS = ['#f59e0b', '#71717a', '#d97706', '#3f3f46', '#fbbf24', '#27272a'];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 md:p-12 animate-in fade-in duration-500 font-sans">
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-end border-b border-slate-800 pb-8">
        <div className="text-left">
          <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors font-mono"><ArrowLeft className="w-4 h-4" /> Exit Ledger</button>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4"><PiggyBank className="w-8 h-8 text-amber-500" /> Property Basis</h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase mt-2 tracking-[0.2em]">Verified Investment Ledger for {property?.address}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Total Basis</p>
          <p className="text-4xl font-mono font-bold text-white">${totalBasis.toLocaleString()}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-2xl h-fit">
          <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-8 flex items-center gap-2 font-mono"><TrendingUp className="w-4 h-4 text-amber-500" /> Allocation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} itemStyle={{ color: '#f59e0b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {pieData.map((d, i) => (
               <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                 <div className="flex items-center gap-2"><div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div><span className="text-slate-400">{d.name}</span></div>
                 <span className="text-white font-bold">${d.value.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center font-mono">
              <h3 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2"><History className="w-4 h-4 text-amber-500" /> Transaction History</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {transactions.map((t, i) => (
                <div key={i} className="p-6 flex justify-between items-center hover:bg-slate-800/30 transition-colors group">
                  <div className="flex gap-6 items-center">
                    <div className={`p-3 border rounded-sm ${t.type === 'CAPITAL' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 text-slate-500 border-slate-800 group-hover:border-slate-700'}`}>
                      {t.type === 'CAPITAL' ? <Shield className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2"><h4 className="text-white font-bold uppercase text-sm">{t.label}</h4><span className={`text-[8px] font-black px-1.5 py-0.5 rounded-xs uppercase ${t.type === 'CAPITAL' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>{t.type}</span></div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">{t.provider} • {t.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-black text-white">${t.cost.toLocaleString()}</p>
                    {t.receipt && <a href={t.receipt} target="_blank" className="text-amber-500 text-[9px] uppercase font-black hover:text-white transition-colors underline flex items-center gap-1 mt-1 justify-end font-mono">View Receipt <ArrowUpRight className="w-3 h-3" /></a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
}
