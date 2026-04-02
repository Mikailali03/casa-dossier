import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Home, Plus, 
  Bell, TrendingUp, PiggyBank, Heart, Mail, Check 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function WelcomeModal({ propertyId, onClose }) {
  const [step, setStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const slides = [
    {
      title: "Welcome to your new Casa!",
      description: "We've designed this app so you can log everything to take care of your new home and build a verified history.",
      icon: <Home className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "Add Assets",
      description: "Catalog appliances and systems using the 'Add Asset' button. Use the AI Lens to scan technical plates for instant data entry.",
      icon: <Plus className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "Maintenance Inbox",
      description: "Stay ahead of home decay. Your inbox shows mission-critical tasks due in the next 30 days based on manufacturer specs.",
      icon: <Bell className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "Capital Outlook",
      description: "Stop financial surprises. See 10-year spending forecasts for replacing systems nearing their end-of-life.",
      icon: <TrendingUp className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "Investment Ledger",
      description: "Track your home equity. View every dollar spent on maintenance and improvements in one verified ledger.",
      icon: <PiggyBank className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "Have Fun!",
      description: "Build a dossier your future self (and future buyers) will love. Feedback? Reach out at Feedback@CasaDossier.com",
      icon: <Heart className="w-12 h-12 text-amber-500" />,
    }
  ];

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      // Mark as seen in database
      const { error } = await supabase
        .from('properties')
        .update({ has_seen_onboarding: true })
        .eq('id', propertyId);
      
      if (error) throw error;
      
      // Close modal and trigger refresh in parent
      onClose();
    } catch (err) {
      console.error("Error marking onboarding as seen:", err);
      onClose(); // Close anyway to not trap user
    }
  };

  const next = () => step < slides.length - 1 ? setStep(step + 1) : handleFinish();
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 shadow-2xl rounded-sm overflow-hidden relative">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 flex">
          {slides.map((_, i) => (
            <div key={i} className={`h-full transition-all duration-500 ${i <= step ? 'bg-amber-500' : 'bg-transparent'}`} style={{ width: `${100/slides.length}%` }} />
          ))}
        </div>

        <div className="p-10 flex flex-col items-center text-center">
          <div className="mb-8 p-4 bg-slate-950 border border-slate-800 rounded-sm">
            {slides[step].icon}
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
            {slides[step].title}
          </h2>
          
          <p className="text-slate-400 font-mono text-sm leading-relaxed uppercase tracking-tighter h-20">
            {slides[step].description}
          </p>

          <div className="mt-12 flex justify-between items-center w-full">
            <button 
              onClick={prev}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button 
              onClick={next}
              disabled={isFinishing}
              className="flex items-center gap-2 bg-amber-500 text-slate-950 px-8 py-3 rounded-sm font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-white transition-all active:scale-95"
            >
              {isFinishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === slides.length - 1 ? (
                <>Initialize Dossier <Check className="w-4 h-4" /></>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}