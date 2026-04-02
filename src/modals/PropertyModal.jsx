import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST
import { X, Sparkles, Loader2, Cpu, CheckCircle, Zap } from 'lucide-react';

export default function PropertyModal({ onClose, onRefresh }) {
  const [form, setForm] = useState({ 
    address: '', city: '', state: '', zip_code: '', 
    year_built: '', sq_ft: '', bedrooms: '', bathrooms: '', lot_size: '' 
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [aiStatus, setAiStatus] = useState(null); // 'researching' | 'syncing' | 'complete'

  const lookup = async () => {
    if (!form.address || !form.city) return alert("Enter address and city first.");
    setFetching(true);
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
          lot_size: p.lotSize || '',
          zip_code: p.zipCode || '' 
        });
      }
    } finally { setFetching(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Create Property with Sanitized Data
      const { data: prop, error: propErr } = await supabase.from('properties').insert([{ 
        address: form.address.toUpperCase(),
        city: form.city.toUpperCase(),
        state: form.state.toUpperCase(),
        zip_code: form.zip_code,
        owner_id: user.id,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        sq_ft: form.sq_ft ? parseInt(form.sq_ft) : null,
        bedrooms: form.bedrooms ? parseFloat(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
        lot_size: form.lot_size ? parseInt(form.lot_size) : null
      }]).select().single();

      if (propErr) throw propErr;

      // 2. Create Default "Home Stewardship" Asset
      const { data: homeAsset, error: assetErr } = await supabase.from('assets').insert([{
        property_id: prop.id,
        category: 'STRUCTURE',
        sub_category: 'Home Stewardship',
        brand: 'Property',
        model: 'General',
        manufacture_date: `${form.year_built || new Date().getFullYear()}-01-01`,
        status: 'active'
      }]).select().single();

      if (assetErr) throw assetErr;

      // 3. Trigger Property Scout AI
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
      setTimeout(() => { onRefresh(); onClose(); }, 1500);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 relative">
        
        {/* AI STATUS OVERLAY */}
        {aiStatus && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-center p-10 font-mono">
            {aiStatus === 'complete' ? <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" /> : <Cpu className="w-12 h-12 text-amber-500 mb-4 animate-pulse" />}
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Establishing Dossier</h2>
            <p className="text-[10px] text-slate-500 uppercase mt-2 tracking-widest">Property Scout is building your plan...</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add Property</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Stewardship Onboarding</p>
          </div>
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-sm hover:bg-red-900 transition-colors"><X className="w-5 h-5 text-white" /></button>
        </div>

        <form onSubmit={submit} className={`space-y-6 text-left ${aiStatus ? 'opacity-10 pointer-events-none' : ''}`}>
          
          {/* ADDRESS SECTION */}
          <div className="relative">
            <label className="text-[9px] font-black text-slate-600 uppercase ml-1">Street Address</label>
            <input required placeholder="123 MAIN ST" className="w-full bg-slate-950 border border-slate-800 p-4 pr-24 text-xs text-white outline-none focus:border-amber-500 font-mono uppercase" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
            <button type="button" onClick={lookup} className="absolute right-2 top-8 bottom-2 bg-slate-800 hover:bg-slate-700 text-amber-500 px-3 rounded-sm text-[9px] font-black uppercase flex items-center gap-2">
              {fetching ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3" />} Sync
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">City</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono uppercase" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} /></div>
            <div className="col-span-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">ST</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono uppercase" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} /></div>
            <div className="col-span-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">ZIP</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono" value={form.zip_code} onChange={e=>setForm({...form, zip_code:e.target.value})} /></div>
          </div>

          {/* TECHNICAL SPECS SECTION */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Year Built</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono" value={form.year_built} onChange={e=>setForm({...form, year_built:e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">SQ FT</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono" value={form.sq_ft} onChange={e=>setForm({...form, sq_ft:e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Bedrooms</label><input type="number" step="0.1" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono" value={form.bedrooms} onChange={e=>setForm({...form, bedrooms:e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Bathrooms</label><input type="number" step="0.1" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono" value={form.bathrooms} onChange={e=>setForm({...form, bathrooms:e.target.value})} /></div>
            <div className="col-span-2 space-y-1"><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Lot Size (Sq Ft)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none font-mono" value={form.lot_size} onChange={e=>setForm({...form, lot_size:e.target.value})} /></div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 flex items-center gap-4">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[9px] text-slate-500 uppercase font-mono leading-relaxed">Property Scout AI will analyze regional climate to build your initial stewardship schedule.</p>
          </div>

          <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black py-4 uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl shadow-amber-500/10">
            Commit Portfolio Entry
          </button>
        </form>
      </div>
    </div>
  );
}