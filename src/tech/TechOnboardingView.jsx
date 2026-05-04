import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowRight, Home, User, Phone, Mail, CheckCircle2, 
  Loader2, ArrowLeft, Search, Zap, Sparkles 
} from 'lucide-react';

export default function TechOnboardingView({ techProfile, onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState(null); // 'idle', 'searching', 'found', 'fail'
  
  const [formData, setFormData] = useState({
    homeowner_name: '', homeowner_email: '', homeowner_phone: '',
    address: '', city: '', state: '', zip_code: '',
    year_built: '', sq_ft: '', bedrooms: '', bathrooms: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- STAGE 1: RentCast Public Record Lookup ---
  const handlePublicRecordLookup = async () => {
    setLookupStatus('searching');
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}`;
    
    try {
      const res = await fetch(
        `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(fullAddress)}`, 
        { headers: { 'X-Api-Key': import.meta.env.VITE_RENTCAST_API_KEY } }
      );
      const data = await res.json();
      
      if (data?.[0]) {
        const p = data[0];
        setFormData(prev => ({ 
          ...prev, 
          year_built: p.yearBuilt || '',
          sq_ft: p.squareFootage || '',
          bedrooms: p.bedrooms || '',
          bathrooms: p.bathrooms || '',
          zip_code: p.zipCode || prev.zip_code 
        }));
        setLookupStatus('found');
      } else {
        setLookupStatus('fail');
      }
    } catch (err) {
      setLookupStatus('fail');
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // 1. Create the Property
      const { data: property, error: propError } = await supabase
        .from('properties')
        .insert([{
          ...formData,
          onboarded_by_tech_id: techProfile.id,
          has_seen_onboarding: true
        }])
        .select().single();

      if (propError) throw propError;

      // 2. Create "Home Stewardship" Asset
      const { data: homeAsset } = await supabase
        .from('assets')
        .insert([{
          property_id: property.id,
          category: 'STRUCTURE',
          sub_category: 'Home Stewardship',
          brand: 'PROPERTY',
          manufacture_date: `${formData.year_built || new Date().getFullYear()}-01-01`,
          status: 'active'
        }])
        .select().single();

      // 3. Call AI Edge Function for Regional Maintenance Plan
      const { data: aiResponse } = await supabase.functions.invoke('research-property-plans', {
        body: { 
            city: formData.city, 
            state: formData.state, 
            year_built: formData.year_built 
        }
      });

      // 4. Populate Tasks from AI response
      if (aiResponse?.tasks) {
        const taskData = aiResponse.tasks.map(t => ({
          asset_id: homeAsset.id,
          property_id: property.id,
          task_name: t.task_name.toUpperCase(),
          frequency_months: t.frequency_months,
          instructions: t.instructions,
          next_due_date: new Date(new Date().setMonth(
            new Date().getMonth() + t.frequency_months
          )).toISOString().split('T')[0]
        }));

        await supabase.from('maintenance_tasks').insert(taskData);
      }

      onComplete(property);
    } catch (err) {
      alert("Intake Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 text-left pb-20">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase hover:text-white transition-colors">
        <ArrowLeft size={14} /> Abort_Mission_Esc
      </button>

      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Client_Intake</h1>
        <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 transition-all duration-500 ${step >= i ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-slate-800'}`} />
            ))}
        </div>
      </header>

      {/* STEP 1: HOMEOWNER IDENTITY */}
      {step === 1 && (
        <section className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-slate-900 p-8 border border-slate-800 border-l-4 border-amber-500 shadow-xl">
            <h3 className="font-black uppercase italic text-amber-500 mb-6 flex items-center gap-3 tracking-tighter text-xl">
              <User size={22} /> Customer_Profile
            </h3>
            <div className="space-y-4">
                <div className="group">
                    <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-amber-500 transition-colors">Legal Name</label>
                    <input name="homeowner_name" placeholder="E.G. JOHN DOE" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono focus:border-amber-500 outline-none uppercase" onChange={handleChange} value={formData.homeowner_name} />
                </div>
                <div className="group">
                    <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-amber-500 transition-colors">Contact Email</label>
                    <input name="homeowner_email" placeholder="CLIENT@EMAIL.COM" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono focus:border-amber-500 outline-none uppercase" onChange={handleChange} value={formData.homeowner_email} />
                </div>
                <div className="group">
                    <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1 ml-1 group-focus-within:text-amber-500 transition-colors">Mobile Phone</label>
                    <input name="homeowner_phone" placeholder="555-000-0000" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono focus:border-amber-500 outline-none uppercase" onChange={handleChange} value={formData.homeowner_phone} />
                </div>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full bg-amber-500 p-5 font-black uppercase italic text-slate-950 text-xl flex justify-center items-center gap-3 shadow-[6px_6px_0px_0px_#92400e] active:translate-y-1 active:shadow-none transition-all">
            Next_Phase <ArrowRight size={24}/>
          </button>
        </section>
      )}

      {/* STEP 2: ADDRESS & API LOOKUP */}
      {step === 2 && (
        <section className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-slate-900 p-8 border border-slate-800 border-l-4 border-amber-500 shadow-xl">
            <h3 className="font-black uppercase italic text-amber-500 mb-6 flex items-center gap-3 tracking-tighter text-xl">
              <Home size={22} /> Site_Address
            </h3>
            <div className="space-y-4">
                <input name="address" placeholder="STREET ADDRESS" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono focus:border-amber-500 outline-none uppercase" onChange={handleChange} value={formData.address} />
                <div className="grid grid-cols-2 gap-4">
                    <input name="city" placeholder="CITY" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono focus:border-amber-500 outline-none uppercase" onChange={handleChange} value={formData.city} />
                    <input name="state" placeholder="STATE" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono focus:border-amber-500 outline-none uppercase" onChange={handleChange} value={formData.state} />
                </div>
                
                {/* API Trigger */}
                <button 
                  type="button"
                  onClick={handlePublicRecordLookup}
                  disabled={!formData.address || lookupStatus === 'searching'}
                  className={`w-full p-4 font-mono text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all border-2 
                    ${lookupStatus === 'found' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-amber-500 hover:text-amber-500'}`}
                >
                  {lookupStatus === 'searching' ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                  {lookupStatus === 'found' ? 'PUBLIC_RECORDS_SYNCED' : 'Query_Registry_Registry_Scout'}
                </button>
            </div>
          </div>
          <button onClick={() => setStep(3)} className="w-full bg-amber-500 p-5 font-black uppercase italic text-slate-950 text-xl flex justify-center items-center gap-3 shadow-[6px_6px_0px_0px_#92400e] transition-all">
            Verify_Specs <ArrowRight size={24}/>
          </button>
        </section>
      )}

      {/* STEP 3: STRUCTURAL SPECS (AUTO-FILLED) */}
      {step === 3 && (
        <section className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-slate-900 p-8 border border-slate-800 border-l-4 border-amber-500 shadow-xl text-white">
            <h3 className="font-black uppercase italic text-amber-500 mb-6 flex items-center gap-3 tracking-tighter text-xl">
              <Zap size={22} /> Technical_Specs
            </h3>
            <div className="grid grid-cols-2 gap-6">
                <div className="group">
                    <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Year Built</label>
                    <input name="year_built" type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono text-xl focus:border-amber-500 outline-none" onChange={handleChange} value={formData.year_built} />
                </div>
                <div className="group">
                    <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Square Footage</label>
                    <input name="sq_ft" type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono text-xl focus:border-amber-500 outline-none" onChange={handleChange} value={formData.sq_ft} />
                </div>
                <div className="group">
                    <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Bedrooms</label>
                    <input name="bedrooms" type="number" step="0.5" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono text-xl focus:border-amber-500 outline-none" onChange={handleChange} value={formData.bedrooms} />
                </div>
                <div className="group">
                    <label className="block font-mono text-[8px] text-slate-500 uppercase mb-1">Bathrooms</label>
                    <input name="bathrooms" type="number" step="0.5" className="w-full bg-slate-950 border border-slate-800 p-4 text-white font-mono text-xl focus:border-amber-500 outline-none" onChange={handleChange} value={formData.bathrooms} />
                </div>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={handleFinalize} 
            className="w-full bg-emerald-600 p-6 font-black uppercase italic text-white text-2xl flex justify-center items-center gap-4 shadow-[8px_8px_0px_0px_#064e3b] active:translate-y-2 active:shadow-none transition-all"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={24} />
                    <span className="animate-pulse">Initializing_AI_Steward...</span>
                </>
            ) : (
                <>
                    <Sparkles size={24} /> 
                    Finalize_Registry
                </>
            )}
          </button>
        </section>
      )}
    </div>
  );
}