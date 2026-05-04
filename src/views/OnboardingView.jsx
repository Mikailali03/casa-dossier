import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST: 10 Icons present.
import { 
  MapPin, Sparkles, Loader2, Cpu, CheckCircle, 
  Zap, ShieldCheck, LogOut, Building, ArrowRight 
} from 'lucide-react';

export default function OnboardingView({ onCreated, userId }) {
  // --- FORM STATE ---
  const [form, setForm] = useState({ 
    address: '', city: '', state: '', zip_code: '', 
    year_built: '', sq_ft: '', bedrooms: '', bathrooms: '' 
  });
  
  // --- UI & DATA STATE ---
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [pendingDeeds, setPendingDeeds] = useState([]);

  useEffect(() => {
    if (userId) fetchPendingDeeds();
  }, [userId]);

  async function fetchPendingDeeds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user.email.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('transfer_invites')
        .select('id, property_id, property_address, status')
        .eq('recipient_email', userEmail)
        .eq('status', 'pending');
      
      if (!error) setPendingDeeds(data || []);
    } catch (err) { console.error(err); }
  }

  const handleClaimDeed = async (inviteId) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('claim_property_deed', { invite_id: inviteId });
      if (error) throw error;
      onCreated(userId);
    } catch (err) {
      alert("Transfer Claim Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!form.address || !form.city) return alert("Enter address and city first.");
    setFetchingData(true);
    try {
      const res = await fetch(`https://api.rentcast.io/v1/properties?address=${encodeURIComponent(form.address + ', ' + form.city)}`, { 
        headers: { 'X-Api-Key': import.meta.env.VITE_RENTCAST_API_KEY } 
      });
      const data = await res.json();
      if (data?.[0]) {
        const p = data[0];
        setForm({ 
          ...form, 
          year_built: p.yearBuilt || '', 
          sq_ft: p.squareFootage || '', 
          bedrooms: p.bedrooms || '', 
          bathrooms: p.bathrooms || '', 
          zip_code: p.zipCode || form.zip_code 
        });
      }
    } finally { setFetchingData(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanData = {
        owner_id: userId,
        address: form.address.toUpperCase(),
        city: form.city.toUpperCase(),
        state: form.state.toUpperCase(),
        zip_code: form.zip_code,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        sq_ft: form.sq_ft ? parseInt(form.sq_ft) : null,
        bedrooms: form.bedrooms ? parseFloat(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null
      };

      const { data: prop, error: propErr } = await supabase.from('properties').insert([cleanData]).select().single();
      if (propErr) throw propErr;

      const { data: homeAsset } = await supabase.from('assets').insert([{
        property_id: prop.id,
        category: 'STRUCTURE',
        sub_category: 'Home Stewardship',
        brand: 'PROPERTY',
        manufacture_date: `${form.year_built || new Date().getFullYear()}-01-01`,
        status: 'active'
      }]).select().single();

      setAiStatus('researching');
      const { data: aiResponse } = await supabase.functions.invoke('research-property-plans', {
        body: { city: prop.city, state: prop.state, year_built: prop.year_built }
      });

      if (aiResponse?.tasks) {
        setAiStatus('syncing');
        const taskData = aiResponse.tasks.map(t => ({
          asset_id: homeAsset.id,
          property_id: prop.id,
          task_name: String(t.task_name).toUpperCase(),
          frequency_months: parseInt(t.frequency_months) || 6,
          instructions: t.instructions,
          next_due_date: new Date(new Date().setMonth(new Date().getMonth() + (parseInt(t.frequency_months) || 6))).toISOString().split('T')[0]
        }));
        await supabase.from('maintenance_tasks').insert(taskData);
      }

      setAiStatus('complete');
      setTimeout(() => onCreated(userId), 1500);
    } catch (err) {
      alert("System Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-slate-200 font-sans">
      
      {/* 1. FIXED HEADER */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-1.5 rounded-sm"><MapPin className="text-slate-950 w-5 h-5" /></div>
          <span className="font-black uppercase tracking-tighter text-xl text-white">CASA <span className="text-amber-500">DOSSIER</span></span>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="bg-slate-800 px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:bg-red-900/40 transition-all flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-grow overflow-y-auto px-4 py-10 md:py-16 scroll-smooth">
        <div className="w-full max-w-xl mx-auto space-y-8 pb-10">
          
          {/* PENDING DEEDS */}
          {pendingDeeds.length > 0 && (
            <div className="bg-amber-500 p-8 rounded-sm shadow-2xl animate-in slide-in-from-top duration-700 relative overflow-hidden">
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-slate-950 rounded-sm shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-left flex-grow">
                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none mb-2">Verified Deed Transfer</h2>
                  <p className="text-slate-900 text-xs font-bold uppercase tracking-tight opacity-80 font-mono">Registry records detected.</p>
                </div>
              </div>
              <div className="mt-8 space-y-3 relative z-10">
                {pendingDeeds.map(invite => (
                  <div key={invite.id} className="bg-slate-950/20 border border-slate-950/20 p-5 flex flex-col md:flex-row justify-between items-center rounded-sm group hover:bg-slate-950/30 transition-all">
                    <div className="text-left mb-4 md:mb-0">
                      <div className="flex items-center gap-2 text-slate-950">
                        <Building className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Escrowed Asset</span>
                      </div>
                      <p className="text-sm font-mono font-black text-slate-950 uppercase mt-1">
                        {invite.property_address || 'VERIFIED PROPERTY'}
                      </p>
                    </div>
                    <button onClick={() => handleClaimDeed(invite.id)} className="bg-slate-950 text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Claim Deed</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN ESTABLISH CARD */}
          <div className="bg-slate-900 border border-slate-800 p-10 shadow-2xl relative overflow-hidden text-left">
            {aiStatus && (
              <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-center p-10 font-mono">
                {aiStatus === 'complete' ? <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" /> : <Cpu className="w-12 h-12 text-amber-500 mb-4 animate-pulse" />}
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Syncing Records...</h2>
              </div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-amber-500 p-2 rounded-sm"><MapPin className="text-slate-950 w-6 h-6" /></div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                {pendingDeeds.length > 0 ? 'Or Establish New' : 'Establish Dossier'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative font-mono">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1">Street Address</label>
                <div className="relative mt-1">
                  <input required placeholder="123 MAIN ST" className="w-full bg-slate-950 border border-slate-800 p-4 pr-32 text-xs text-white focus:border-amber-500 outline-none uppercase" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                  <button type="button" onClick={handleLookup} disabled={fetchingData} className="absolute right-2 top-2 bottom-2 bg-slate-800 text-amber-500 px-4 rounded-sm text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-700 transition-all">
                    {fetchingData ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Verify
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 font-mono">
                <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">City</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none uppercase" value={form.city} onChange={(e)=>setForm({...form, city: e.target.value})}/></div>
                <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">ST</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none uppercase" value={form.state} onChange={(e)=>setForm({...form, state: e.target.value})}/></div>
                <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Zip</label><input placeholder="ZIP" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.zip_code} onChange={(e)=>setForm({...form, zip_code: e.target.value})}/></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 font-mono">
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Year Built</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.year_built} onChange={(e)=>setForm({...form, year_built:e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Sq Ft</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.sq_ft} onChange={(e)=>setForm({...form, sq_ft:e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Beds</label><input type="number" step="0.1" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.bedrooms} onChange={(e)=>setForm({...form, bedrooms:e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Baths</label><input type="number" step="0.1" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.bathrooms} onChange={(e)=>setForm({...form, bathrooms:e.target.value})} /></div>
              </div>

              <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black py-4 uppercase text-xs active:scale-95 transition-all shadow-xl shadow-amber-500/10 font-mono tracking-[0.2em]">
                Commit Property Dossier
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}