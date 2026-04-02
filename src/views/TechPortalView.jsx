// src/views/TechPortalView.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, QrCode, PenTool, CheckCircle, Package, User } from 'lucide-react';

export default function TechPortalView({ profile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAsset, setActiveAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lookupAsset = async () => {
    // Search by Serial Number or ID
    const { data, error } = await supabase
      .from('assets')
      .select('*, properties(owner_id, address)')
      .or(`serial_number.eq.${searchQuery},id.eq.${searchQuery}`)
      .single();

    if (data) setActiveAsset(data);
    else alert("Asset not found in registry.");
  };

  const submitServiceLog = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);

    const { error: logError } = await supabase
      .from('service_records')
      .insert([{
        asset_id: activeAsset.id,
        provider_name: "Tech Portal (Verified)",
        description_of_work: formData.get('description'),
        cost: formData.get('cost'),
        type: 'PRO',
        service_date: new Date()
      }]);

    if (!logError) {
      // Award 50 XP to the Homeowner for using a Verified Pro
      await supabase.rpc('award_xp_to_owner', { 
        property_id_input: activeAsset.property_id, 
        xp_amount: 50 
      });
      
      alert("Service Logged. Homeowner awarded 50 XP.");
      setActiveAsset(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Tech Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">
            Tech_Portal_v2.0
          </h1>
          <p className="font-mono text-xs tracking-widest text-slate-500">OPERATOR: {profile.id.slice(0, 8)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded shadow-[4px_4px_0px_0px_rgba(245,158,11,0.2)]">
            <span className="font-mono text-xs text-amber-500">SYSTEM_READY</span>
        </div>
      </header>

      {!activeAsset ? (
        <main className="max-w-xl mx-auto space-y-6">
          <div className="bg-slate-900 p-6 border border-slate-800 rounded-none">
            <label className="block font-mono text-xs tracking-widest mb-4 text-slate-400">INPUT_SERIAL_OR_SCAN</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-950 border border-slate-700 p-4 font-mono text-amber-500 focus:outline-none focus:border-amber-500"
                placeholder="SN-XXXXXXXX"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={lookupAsset}
                className="bg-amber-500 text-slate-950 p-4 hover:bg-amber-400 transition-colors"
              >
                <Search size={24} strokeWidth={3} />
              </button>
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 border border-slate-700 p-4 font-mono text-xs hover:bg-slate-800 transition-all uppercase">
              <QrCode size={18} /> Launch Scanner
            </button>
          </div>
        </main>
      ) : (
        <main className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Asset Summary Card */}
          <div className="bg-slate-900 border-l-4 border-amber-500 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">{activeAsset.brand} {activeAsset.model}</h2>
                <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">{activeAsset.category} // {activeAsset.serial_number}</p>
              </div>
              <button onClick={() => setActiveAsset(null)} className="text-slate-500 hover:text-white font-mono text-[10px]">ESC_EXIT</button>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-4">
              <div>
                <p className="font-mono text-[10px] text-slate-500 uppercase">Location</p>
                <p className="text-sm font-bold">{activeAsset.properties.address}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-slate-500 uppercase">Warranty Status</p>
                <p className="text-sm font-bold text-emerald-500">ACTIVE_PROTECTION</p>
              </div>
            </div>
          </div>

          {/* Service Logging Form */}
          <form onSubmit={submitServiceLog} className="space-y-4">
            <div className="bg-slate-900 p-6 border border-slate-800">
              <h3 className="font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                <PenTool size={18} className="text-amber-500" /> Maintenance_Entry
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Description of Work</label>
                  <textarea 
                    name="description"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-3 text-sm focus:border-amber-500 outline-none h-32"
                    placeholder="Describe maintenance performed..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Cost (USD)</label>
                    <input name="cost" type="number" className="w-full bg-slate-950 border border-slate-700 p-3 text-sm" placeholder="0.00" />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic p-3 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      {isSubmitting ? "SYNCING..." : <><CheckCircle size={18} /> Finalize_Log</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>
      )}
    </div>
  );
}