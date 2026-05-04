import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST: 16 Icons present.
import { 
  X, Camera, Loader2, Cpu, Zap, CheckCircle, 
  Calendar, Sparkles, Scan, FileCheck, Shield, 
  DollarSign, FileText, Key, TrendingUp, FolderOpen,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORY_MAP = {
  'HVAC': ['AC Unit', 'Furnace', 'Air Handler', 'Thermostat'],
  'PLUMBING': ['Water Heater', 'Home Water Filter', 'Faucet', 'Other'],
  'APPLIANCES': ['Garage Door Opener', 'Refrigerator', 'Wine Fridge', 'Freezer', 'Stove', 'Oven', 'Cooktop', 'Range Hood', 'Microwave', 'Dishwasher', 'Garbage Disposal', 'Washing Machine', 'Clothes Dryer', 'Other'],
  'ELECTRICAL': ['EV Charger', 'Electrical Panel', 'Solar Panel', 'Other'],
  'SMART HOME': ['Door Lock', 'Outlet', 'Switch', 'Camera', 'Light'],
  'STRUCTURE': ['Home Stewardship', 'Foundation', 'Roof', 'Siding', 'Windows/Doors', 'Deck/Patio'],
  'OTHER': ['Other']
};

export default function AssetModal({ activeProperty, propertyId, asset, editMode, onClose, onRefresh }) {
  // --- CORE FORM STATE ---
  const [form, setForm] = useState(asset || { 
    category: 'HVAC', 
    sub_category: 'AC Unit', 
    brand: '', 
    model: '', 
    serial_number: '', 
    manufacture_date: new Date().toISOString().split('T')[0], 
    status: 'active', 
    notes: '', 
    image_url: '',
    install_cost: 0,
    replacement_cost_est: 0,
    has_warranty: false,
    warranty_expiration: '',
    install_receipt_url: ''
  });
  
  // --- UI & UPLOAD STATE ---
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null); 
  const [scannedTasks, setScannedTasks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(asset?.image_url || null);

  const isStewardship = form.sub_category === 'Home Stewardship';

  // --- AUTO-FILL LOGIC (FIXED) ---
  useEffect(() => {
    // ONLY auto-fill if we are NOT in edit mode
    if (isStewardship && activeProperty?.year_built && !editMode) {
      setForm(prev => ({ 
        ...prev, 
        brand: 'PROPERTY', 
        model: 'GENERAL', 
        serial_number: 'N/A', 
        manufacture_date: `${activeProperty.year_built}-01-01` 
      }));
    }
  }, [form.sub_category, activeProperty, editMode]);

  const handleCategoryChange = (newCat) => {
    setForm({ 
      ...form, 
      category: newCat, 
      sub_category: CATEGORY_MAP[newCat] ? CATEGORY_MAP[newCat][0] : 'Other'
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (isStewardship) return; 

    setAiStatus('scanning');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      try {
        const { data } = await supabase.functions.invoke('research-maintenance', { body: { image: base64Data } });
        if (data) {
          const aiCat = data.category?.toUpperCase();
          const validCat = CATEGORY_MAP[aiCat] ? aiCat : 'OTHER';
          setForm(prev => ({
            ...prev,
            brand: (data.brand || prev.brand)?.toUpperCase(),
            model: (data.model || prev.model)?.toUpperCase(),
            serial_number: (data.serial_number || prev.serial_number)?.toUpperCase(),
            manufacture_date: data.manufacture_date || prev.manufacture_date,
            replacement_cost_est: parseInt(data.replacement_cost_est) || 0,
            category: validCat,
            sub_category: CATEGORY_MAP[validCat] ? CATEGORY_MAP[validCat][0] : 'Other'
          }));
          if (data.tasks) setScannedTasks(data.tasks);
          setAiStatus('complete');
          setTimeout(() => setAiStatus(null), 2000);
        }
      } catch (err) { setAiStatus(null); }
    };
  };

  const uploadFileAction = async (file, prefix) => {
    const { data: userData } = await supabase.auth.getUser();
    const fileName = `${userData.user.id}/${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from('dossier-assets').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('dossier-assets').getPublicUrl(fileName).data.publicUrl;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = form.image_url;
      let finalBillUrl = form.install_receipt_url;

      if (selectedFile) finalImageUrl = await uploadFileAction(selectedFile, 'img');
      if (selectedBill) finalBillUrl = await uploadFileAction(selectedBill, 'bill');

      const { maintenance_tasks, service_records, id, created_at, updated_at, ...sanitized } = form;
      const submissionData = { 
        ...sanitized, 
        category: form.category.toUpperCase(),
        image_url: finalImageUrl, 
        install_receipt_url: finalBillUrl,
        install_cost: parseInt(form.install_cost) || 0,
        replacement_cost_est: parseInt(form.replacement_cost_est) || 0,
        has_warranty: Boolean(form.has_warranty),
        warranty_expiration: form.warranty_expiration || null
      };

      if (editMode) {
        const { error: updateErr } = await supabase.from('assets').update(submissionData).eq('id', asset.id);
        if (updateErr) throw updateErr;
      } else {
        const { data: newAsset, error: assetErr } = await supabase.from('assets').insert([{ ...submissionData, property_id: propertyId }]).select().single();
        if (assetErr) throw assetErr;
        let tasksToProcess = scannedTasks;
        if (tasksToProcess.length === 0) {
          const { data: res } = await supabase.functions.invoke('research-maintenance', { body: { brand: form.brand, model: form.model, category: form.category } });
          tasksToProcess = res?.tasks || [];
        }
        if (tasksToProcess.length > 0) {
          const taskData = tasksToProcess.map(t => ({ asset_id: newAsset.id, task_name: String(t.task_name || t.name).toUpperCase(), frequency_months: parseInt(t.frequency_months || t.freq) || 12, instructions: t.instructions || t.steps || '', next_due_date: new Date(new Date().setMonth(new Date().getMonth() + (parseInt(t.frequency_months) || 12))).toISOString().split('T')[0] }));
          await supabase.from('maintenance_tasks').insert(taskData);
        }
      }
      onRefresh(); onClose();
    } catch (err) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/90 backdrop-blur-sm p-0 md:p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{editMode ? 'Edit' : 'Catalog'} Asset</h2>
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-sm hover:bg-red-900 transition-colors"><X className="w-5 h-5 text-white" /></button>
        </div>

        <form onSubmit={submit} className={`space-y-6 text-left ${aiStatus && aiStatus !== 'complete' ? 'opacity-10 pointer-events-none' : ''}`}>
          
          <div className="relative w-full h-48 bg-slate-950 border-2 border-dashed border-slate-800 rounded-sm overflow-hidden flex flex-col items-center justify-center group transition-all">
            {previewUrl ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <img src={previewUrl} className="w-full h-full object-cover opacity-40" alt="" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                   <CheckCircle className="w-10 h-10 text-emerald-500 shadow-2xl" />
                   <button type="button" onClick={() => {setPreviewUrl(null); setSelectedFile(null);}} className="bg-slate-900/80 px-4 py-2 text-[9px] font-black uppercase text-white border border-slate-700 hover:bg-red-900 transition-all">Reset Photo</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 w-full h-full divide-x divide-slate-800">
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-900 transition-all group/cam">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
                  <Camera className="w-8 h-8 text-slate-600 group-hover/cam:text-amber-500 transition-colors" />
                  <span className="text-[10px] font-black text-slate-500 group-hover/cam:text-white uppercase tracking-widest">Use Camera</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-900 transition-all group/up">
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  <FolderOpen className="w-8 h-8 text-slate-600 group-hover/up:text-amber-500 transition-colors" />
                  <span className="text-[10px] font-black text-slate-500 group-hover/up:text-white uppercase tracking-widest">Browse Files</span>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 font-mono uppercase">
            <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">Category</label><select className="w-full bg-slate-950 border border-slate-800 p-4 text-white text-xs outline-none focus:border-amber-500" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>{Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">Sub-Type</label><select className="w-full bg-slate-950 border border-slate-800 p-4 text-white text-xs outline-none focus:border-amber-500 uppercase" value={form.sub_category} onChange={e => setForm({...form, sub_category: e.target.value})}>{CATEGORY_MAP[form.category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">Brand</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.brand} onChange={e=>setForm({...form, brand: e.target.value})} /></div>
              <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">Model #</label><input disabled={form.category === 'STRUCTURE'} className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none disabled:opacity-30" value={form.model} onChange={e=>setForm({...form, model: e.target.value})} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">Serial #</label><input disabled={form.category === 'STRUCTURE'} className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none disabled:opacity-30" value={form.serial_number} onChange={e=>setForm({...form, serial_number: e.target.value})} /></div>
              <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">{isStewardship ? 'Year Built' : 'Manufactured'}</label><input type="date" required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none focus:border-amber-500" value={form.manufacture_date} onChange={e => setForm({...form, manufacture_date: e.target.value})} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
               <div><label className="text-[9px] font-black text-slate-600 tracking-widest ml-1">Install Cost ($)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.install_cost} onChange={e => setForm({...form, install_cost: e.target.value})} /></div>
               <div><label className="text-[9px] font-black text-amber-500 tracking-widest ml-1">Est. Replace ($)</label><input type="number" className="w-full bg-slate-950 border border-amber-500/20 p-4 text-xs text-amber-500 outline-none focus:border-amber-500" value={form.replacement_cost_est} onChange={e => setForm({...form, replacement_cost_est: e.target.value})} /></div>
            </div>

            <div className="relative w-full bg-slate-950 border border-slate-800 p-4 flex items-center justify-between group hover:border-amber-500 cursor-pointer rounded-sm"><input type="file" accept=".pdf,image/*" onChange={e => setSelectedBill(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><div className="flex items-center gap-3"><FileText className="w-4 h-4 text-slate-600" /><span className="text-[10px] font-black text-slate-500 uppercase">{selectedBill ? selectedBill.name : 'Attach Original Bill'}</span></div>{selectedBill && <CheckCircle className="w-4 h-4 text-emerald-500" />}</div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3"><Shield className={`w-5 h-5 ${form.has_warranty ? 'text-amber-500' : 'text-slate-800'}`} /><span className="text-[10px] font-black text-slate-400">Active Warranty</span></div>
                <input type="checkbox" checked={form.has_warranty} onChange={e => setForm({...form, has_warranty: e.target.checked})} className="sr-only" />
                <div className={`w-10 h-5 rounded-full relative transition-all ${form.has_warranty ? 'bg-amber-500' : 'bg-slate-800'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.has_warranty ? 'left-6' : 'left-1'}`} /></div>
              </label>
              {form.has_warranty && <input type="date" className="w-full bg-slate-900 border border-amber-500/30 p-3 text-xs text-white outline-none" value={form.warranty_expiration} onChange={e => setForm({...form, warranty_expiration: e.target.value})} />}
            </div>
          </div>

          <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black py-4 uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">{loading ? <Loader2 className="animate-spin mx-auto w-4 h-4" /> : 'Commit to Dossier'}</button>
        </form>
      </div>
    </div>
  );
}