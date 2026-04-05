import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST: 10 Icons present.
import { 
  X, FileText, Loader2, DollarSign, Calendar, 
  CheckCircle, Hammer, UserCheck, Wrench, Plus 
} from 'lucide-react';

export default function ServiceLogModal({ assetId, task, providers, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState('PRO'); 
  const [selectedBill, setSelectedBill] = useState(null);
  
  const [form, setForm] = useState({ 
    provider_id: '', 
    provider_name: '', 
    description_of_work: task ? task.task_name : '', 
    cost: '', 
    service_date: new Date().toISOString().split('T')[0] 
  });

  const handleFileUpload = async (file) => {
    const { data: userData } = await supabase.auth.getUser();
    const fileName = `${userData.user.id}/receipt-${Date.now()}`;
    const { error } = await supabase.storage.from('dossier-assets').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('dossier-assets').getPublicUrl(fileName).data.publicUrl;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let receiptUrl = '';
      if (selectedBill && serviceType === 'PRO') {
        receiptUrl = await handleFileUpload(selectedBill);
      }

      const selectedPro = providers.find(p => p.id === form.provider_id);
      const finalProviderName = serviceType === 'DIY' ? 'Homeowner' : (selectedPro ? selectedPro.name : form.provider_name);

      // 1. Create Service Record
      const { error: logError } = await supabase.from('service_records').insert([{ 
        ...form, 
        type: serviceType,
        provider_id: serviceType === 'PRO' ? (form.provider_id || null) : null,
        provider_name: finalProviderName,
        asset_id: assetId, 
        receipt_url: receiptUrl,
        cost: parseInt(form.cost) || 0 
      }]);

      if (logError) throw logError;

      // 2. Adjust the future schedule
      if (task) {
        // Use the date from the form (the date the maintenance was completed)
        const baseDate = new Date(form.service_date + "T12:00:00"); // Add noon to avoid timezone shifts
        const freq = parseInt(task.frequency_months) || 6;
        
        baseDate.setMonth(baseDate.getMonth() + freq);
        const newDueDate = baseDate.toISOString().split('T')[0];

        const { error: taskError } = await supabase.from('maintenance_tasks')
          .update({ 
            last_completed_date: form.service_date,
            next_due_date: newDueDate 
          })
          .eq('id', task.id);
        
        if (taskError) throw taskError;
      }

      onRefresh(); 
      onClose();
    } catch (err) {
      alert("System Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/90 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-8 text-left">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{task ? 'Complete Task' : 'Log Service'}</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Dossier Maintenance Protocol</p>
          </div>
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-sm hover:bg-red-900 transition-colors"><X className="w-5 h-5 text-white" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button type="button" onClick={() => setServiceType('DIY')} className={`p-4 border flex flex-col items-center gap-2 transition-all ${serviceType === 'DIY' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
            <Hammer className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">DIY / Self</span>
          </button>
          <button type="button" onClick={() => setServiceType('PRO')} className={`p-4 border flex flex-col items-center gap-2 transition-all ${serviceType === 'PRO' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
            <UserCheck className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Professional</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6 text-left">
          {serviceType === 'PRO' && (
            <div className="relative w-full h-32 bg-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center hover:border-amber-500 group transition-all cursor-pointer rounded-sm">
              <input type="file" accept=".pdf,image/*" onChange={(e) => setSelectedBill(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <FileText className="w-8 h-8 text-slate-700 mb-2 group-hover:text-amber-500 transition-colors" />
              <span className="text-[10px] font-black text-slate-500 uppercase">{selectedBill ? selectedBill.name : 'Attach Invoice / Receipt'}</span>
              {selectedBill && <CheckCircle className="w-4 h-4 text-emerald-500 mt-2" />}
            </div>
          )}

          <div className="space-y-4 font-mono uppercase">
            {serviceType === 'PRO' && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Service Provider</label>
                <select className="w-full bg-slate-950 border border-slate-800 p-4 text-white text-xs outline-none focus:border-amber-500" value={form.provider_id} onChange={e => setForm({...form, provider_id: e.target.value})}>
                  <option value="">-- Manual Entry --</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {!form.provider_id && <input required placeholder="COMPANY NAME" className="w-full bg-slate-950 border border-slate-800 p-4 mt-2 text-xs text-white outline-none focus:border-amber-500 uppercase" value={form.provider_name} onChange={e => setForm({...form, provider_name: e.target.value})} />}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Description</label>
              <textarea required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none focus:border-amber-500 h-24" value={form.description_of_work} onChange={e => setForm({...form, description_of_work: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative"><label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 block mb-1">Total cost ($)</label><DollarSign className="absolute left-4 bottom-4 w-4 h-4 text-slate-600" /><input type="number" placeholder="0" className="w-full bg-slate-950 border border-slate-800 p-4 pl-10 text-xs text-white outline-none focus:border-amber-500 font-bold" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} /></div>
              <div className="relative"><label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 block mb-1">Date performed</label><Calendar className="absolute left-4 bottom-4 w-4 h-4 text-slate-600" /><input type="date" required className="w-full bg-slate-950 border border-slate-800 p-4 pl-10 text-xs text-white outline-none focus:border-amber-500 cursor-pointer" value={form.service_date} onChange={e => setForm({...form, service_date: e.target.value})} /></div>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black py-4 uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto w-4 h-4" /> : 'Commit to History'}
          </button>
        </form>
      </div>
    </div>
  );
}