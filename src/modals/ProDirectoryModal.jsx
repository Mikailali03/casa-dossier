import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST: All icons used in JSX are imported here.
import { X, Phone, User, Loader2, Wrench, Plus } from 'lucide-react';

export default function ProDirectoryModal({ activeProperty, onClose }) {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [proForm, setProForm] = useState({ 
    name: '', 
    specialty: 'HVAC', 
    phone: '', 
    email: '' 
  });

  const specialties = [
    'HVAC', 'Plumbing', 'Electrical', 'Roofing', 
    'Appliances', 'Exterior', 'Structure', 'EV Infrastructure'
  ];

  useEffect(() => {
    if (activeProperty?.id) {
      fetchPros();
    }
  }, [activeProperty?.id]);

  async function fetchPros() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('service_providers')
        .select('*')
        .eq('property_id', activeProperty.id)
        .order('name');
      setPros(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!activeProperty?.id) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('service_providers')
      .insert([{ ...proForm, property_id: activeProperty.id }]);
    
    if (!error) {
      setProForm({ name: '', specialty: 'HVAC', phone: '', email: '' });
      fetchPros();
    } else {
      alert(error.message);
    }
    setIsSaving(false);
  };

  // Safety exit if no property is selected
  if (!activeProperty) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-left">Pro Directory</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1 text-left">Verified Contact List</p>
          </div>
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-sm hover:bg-red-900 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={submit} className="mb-10 bg-slate-950/50 p-6 border border-slate-800 space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Company / Name</label>
            <input 
              required 
              placeholder="E.G. SPARKY ELECTRIC" 
              className="w-full bg-slate-900 border border-slate-800 p-3 text-xs text-white outline-none focus:border-amber-500 uppercase font-mono" 
              value={proForm.name} 
              onChange={(e) => setProForm({...proForm, name: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Specialty</label>
              <select 
                className="w-full bg-slate-900 border border-slate-800 p-3 text-xs text-white outline-none focus:border-amber-500 font-mono"
                value={proForm.specialty}
                onChange={(e) => setProForm({...proForm, specialty: e.target.value})}
              >
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Phone</label>
              <input 
                placeholder="555-0123" 
                className="w-full bg-slate-900 border border-slate-800 p-3 text-xs text-white outline-none focus:border-amber-500 font-mono" 
                value={proForm.phone} 
                onChange={(e) => setProForm({...proForm, phone: e.target.value})} 
              />
            </div>
          </div>

          <button 
            disabled={isSaving} 
            className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-500 font-bold py-3 text-[10px] uppercase transition-all tracking-widest flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Register New Pro
          </button>
        </form>

        {/* PRO LIST */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-left font-mono">Active Contacts</h3>
          {loading ? (
             <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-700 mx-auto" /></div>
          ) : pros.length > 0 ? (
            pros.map(p => (
              <div key={p.id} className="p-4 border border-slate-800 bg-slate-900/50 flex justify-between items-center group hover:border-slate-700 transition-all shadow-xl">
                <div className="text-left">
                  <h4 className="text-white font-bold uppercase text-xs">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black bg-slate-800 text-amber-500/80 px-1.5 py-0.5 rounded-xs tracking-tighter uppercase border border-slate-700 font-mono">
                      {p.specialty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.phone && (
                    <a 
                      href={`tel:${p.phone}`} 
                      className="p-2 bg-slate-800 text-slate-400 rounded-sm hover:bg-amber-500 hover:text-slate-950 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 border border-dashed border-slate-800 rounded-sm text-center">
              <User className="w-8 h-8 text-slate-800 mx-auto mb-2" />
              <p className="text-[10px] font-mono text-slate-600 uppercase">No professionals registered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}