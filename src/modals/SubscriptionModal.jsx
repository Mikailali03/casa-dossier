import React, { useState } from 'react';
import { 
  X, Check, Zap, ShieldCheck, Crown, 
  Droplet, Truck, BadgePercent, Calendar, 
  ArrowRight, Loader2, Star 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function SubscriptionModal({ userId, currentTier, onClose }) {
  const [loading, setLoading] = useState(null);

  const tiers = [
    {
      id: 'essential',
      name: 'Essential',
      price: 'FREE',
      limit: '1 Property',
      features: ['All core Dossier features', 'AI Maintenance Agent', 'Capital Outlook Chart', 'Investment Ledger'],
      icon: <ShieldCheck className="w-6 h-6 text-slate-400" />,
      cta: 'Current Plan',
      color: 'border-slate-800'
    },
    {
      id: 'managed',
      name: 'Managed',
      price: '$35',
      period: '/ month',
      limit: '5 Properties',
      features: [
        'Manage up to 5 properties',
        'Quarterly HVAC Filter Delivery',
        '15% OFF CasaService Calls',
        '1 Free Service Credit / Year',
        'Annual Visual Home Inspection'
      ],
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      cta: 'Upgrade to Managed',
      color: 'border-amber-500/50 bg-amber-500/5',
      recommended: true
    },
    {
      id: 'concierge',
      name: 'Concierge',
      price: '$99',
      period: '/ month',
      limit: 'Unlimited',
      features: [
        'Unlimited Properties',
        'Same-Day Priority Support',
        '25% OFF CasaService Calls',
        '4 Free Service Credits / Year',
        'Water Leak Monitoring Kit'
      ],
      icon: <Crown className="w-6 h-6 text-amber-400" />,
      cta: 'Go Concierge',
      color: 'border-amber-400 bg-amber-400/5'
    }
  ];

  const handleUpgrade = async (tierId) => {
    if (tierId === currentTier) return;
    setLoading(tierId);
    
    // STRIPE INTEGRATION LOGIC:
    // In a production app, you would call a Supabase Edge Function here:
    // const { data } = await supabase.functions.invoke('create-checkout-session', { body: { tierId } });
    // window.location.href = data.url;

    // For now, let's simulate the database update:
    await supabase.from('profiles').update({ subscription_tier: tierId }).eq('id', userId);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 font-sans overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 shadow-2xl rounded-sm relative my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10"><X className="w-6 h-6" /></button>

        <div className="p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Select your <span className="text-amber-500">Service Level</span></h2>
          <p className="text-slate-400 font-mono text-xs md:text-sm uppercase tracking-widest mb-12">Professional Stewardship & Asset Protection Plans</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div key={t.id} className={`relative p-8 border rounded-sm flex flex-col text-left transition-all hover:scale-[1.02] ${t.color}`}>
                {t.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-[0.2em] flex items-center gap-1">
                    <Star className="w-2 h-2 fill-current" /> Most Popular
                  </div>
                )}
                
                <div className="mb-6">{t.icon}</div>
                <h3 className="text-xl font-black text-white uppercase mb-1 tracking-tight">{t.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-mono font-bold text-white">{t.price}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.period}</span>
                </div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">{t.limit}</p>

                <ul className="space-y-4 flex-grow mb-8">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] text-slate-300 uppercase leading-tight font-medium">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  disabled={currentTier === t.id || (loading && loading !== t.id)}
                  onClick={() => handleUpgrade(t.id)}
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2
                    ${currentTier === t.id ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-amber-500 text-slate-950 hover:bg-white active:scale-95'}
                  `}
                >
                  {loading === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}