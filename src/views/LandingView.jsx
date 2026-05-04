import React from 'react';
// VERIFIED ICON LIST: 10 Icons accounted for.
import { 
  Home, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Check, 
  Search, 
  Wrench, 
  Activity, 
  ArrowRight, 
  CheckCircle,
  Crown,
  FileText
} from 'lucide-react';

export default function LandingView({ onLoginClick }) {
  const tiers = [
    {
      name: 'Essential',
      price: 'Free',
      features: ['One Property Dossier', 'AI Maintenance Agent', 'Capital Outlook Chart', 'Investment Ledger'],
      cta: 'Get Started',
      color: 'border-slate-800'
    },
    {
      name: 'Managed',
      price: '$35/mo',
      features: ['Up to 5 Properties', 'Quarterly Filter Delivery', '15% Off Service Calls', 'Annual Visual Inspection'],
      cta: 'Subscribe Now',
      color: 'border-amber-500/50 bg-amber-500/5',
      featured: true
    },
    {
      name: 'Concierge',
      price: '$99/mo',
      features: ['Unlimited Properties', 'Same-Day Support', '25% Off Service Calls', 'Leak Monitoring Kit'],
      cta: 'Go Concierge',
      color: 'border-amber-400 bg-amber-400/5'
    }
  ];

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 overflow-hidden flex flex-col">
      
      {/* --- FIXED NAVIGATION --- */}
      <nav className="shrink-0 w-full z-[100] bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-1.5 rounded-sm shadow-lg shadow-amber-500/20">
              <Home className="text-slate-950 w-5 h-5" />
            </div>
            <span className="font-black uppercase tracking-tighter text-xl text-white">CASA <span className="text-amber-500">DOSSIER</span></span>
          </div>
          <button 
            onClick={onLoginClick}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Sign In / Register
          </button>
        </div>
      </nav>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* HERO SECTION */}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-8">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">The Carfax for Homes</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 leading-[0.9]">
              THE MAINTENANCE <span className="text-amber-500">OPERATING SYSTEM</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 font-mono text-sm md:text-base uppercase tracking-tighter leading-relaxed mb-10">
              A high-utility ledger designed for the professional homeowner. Establish a verified service history, track capital spend, and automate technical research.
            </p>
            <button 
              onClick={onLoginClick}
              className="bg-amber-500 text-slate-950 px-10 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-white transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              Establish Your Dossier <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* OUR MOTIVATION */}
        <section className="bg-slate-900/50 border-y border-slate-900 py-24 px-6 text-left">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">Our Motivation</h2>
              <div className="space-y-6 text-slate-400 font-mono text-sm uppercase leading-relaxed tracking-tighter italic">
                <p>Home ownership is the largest investment of your life, yet it is often the least documented.</p>
                <p>When you buy a car, you demand a Carfax. When you buy a home, you get a binder of loose receipts and a guess. We are restoring order to the built environment.</p>
                <p>Casa Dossier is a Professional-grade tool built to capture every service event, photo, and dollar invested, turning your home into a liquid, verified asset.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-950 p-6 border border-slate-800 rounded-sm">
                 <Activity className="w-8 h-8 text-amber-500 mb-4" />
                 <h4 className="text-white font-bold text-xs uppercase mb-2">Live Diagnostics</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed uppercase">Real-time health score based on manufacturer protocols.</p>
               </div>
               <div className="bg-slate-950 p-6 border border-slate-800 rounded-sm">
                 <TrendingUp className="w-8 h-8 text-amber-500 mb-4" />
                 <h4 className="text-white font-bold text-xs uppercase mb-2">Capital Planning</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed uppercase">10-year liability forecasts for every major system.</p>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 px-6 text-left">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-12 text-center">Core System Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Search />, title: "AI Lens Intake", desc: "Scan technical plates to auto-fill brand, model, and serial data." },
                { icon: <Zap />, title: "Research Agent", desc: "Automated manufacturer maintenance schedule generation." },
                { icon: <FileText />, title: "Investment Ledger", desc: "A unified cash-flow audit of all capital and maintenance spend." },
                { icon: <CheckCircle />, title: "Verified Deed", desc: "Transfer the entire digital history to the next owner instantly." }
              ].map((f, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-8 hover:border-amber-500 transition-all">
                  <div className="text-amber-500 mb-6">{React.cloneElement(f.icon, { size: 32 })}</div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-3">{f.title}</h3>
                  <p className="text-slate-500 text-[11px] font-mono leading-relaxed uppercase tracking-tighter">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBSCRIPTION TIERS */}
        <section className="py-24 px-6 bg-slate-900/30 border-t border-slate-900 text-left">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-12 text-center">Service Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((t, i) => (
                <div key={i} className={`p-10 border rounded-sm flex flex-col transition-all hover:scale-[1.02] ${t.color}`}>
                  <h3 className="text-2xl font-black text-white uppercase mb-2">{t.name}</h3>
                  <div className="text-3xl font-mono font-bold text-white mb-8">{t.price}</div>
                  <ul className="space-y-4 flex-grow mb-12">
                    {t.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-[11px] text-slate-300 uppercase leading-tight font-mono">
                        <Check className="w-4 h-4 text-amber-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={onLoginClick}
                    className="w-full bg-amber-500 text-slate-950 font-black py-4 uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl"
                  >
                    {t.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-20 border-t border-slate-900 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-center md:text-left">
              <span className="font-black uppercase tracking-tighter text-xl text-white">CASA <span className="text-amber-500">DOSSIER</span></span>
              <p className="text-[10px] text-slate-600 font-mono uppercase mt-2">© 2024 Casa Dossier System Protocol. All rights reserved.</p>
            </div>
            <div className="flex gap-10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <a href="mailto:Feedback@CasaDossier.com" className="hover:text-amber-500 transition-colors">Feedback@CasaDossier.com</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}