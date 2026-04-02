import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST: 14 Icons.
import { 
  X, Camera, Loader2, Cpu, Zap, CheckCircle, 
  Calendar, Sparkles, Scan, FileCheck, Shield, 
  DollarSign, FileText, Key 
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
  const [form, setForm] = useState(asset || { 
    category: 'HVAC', sub_category: 'AC Unit', brand: '', model: '', 
    serial_number: '', manufacture_date: new Date().toISOString().split('T')[0], 
    status: 'active', notes: '', image_url: '', install_cost: 0, replacement_cost_est: 0, has_warranty: false, warranty_expiration: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null); 
  const [scannedTasks, setScannedTasks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(asset?.image_url || null);

  const isStewardship = form.sub_category === 'Home Stewardship';

  // AUTO-FILL LOGIC: If user selects Home Stewardship, pull from property year_built
  useEffect(() => {
    if (isStewardship && activeProperty?.year_built && !editMode) {
      setForm(prev => ({
        ...prev,
        brand: 'PROPERTY',
        model: 'N/A',
        serial_number: 'N/A',
        manufacture_date: `${activeProperty.year_built}-01-01`
      }));
    }
  }, [form.sub_category, activeProperty]);

  const handleCategoryChange = (newCat) => {
    setForm({ 
      ...form, 
      category: newCat, 
      sub_category: CATEGORY_MAP[newCat][0],
      model: newCat === 'STRUCTURE' ? 'N/A' : (form.model === 'N/A' ? '' : form.model),
      serial_number: newCat === 'STRUCTURE' ? 'N/A' : (form.serial_number === 'N/A' ? '' : form.serial_number)
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // BYPASS AI SCAN for Home Stewardship
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
          setForm(prev => ({ ...prev, brand: data.brand?.toUpperCase(), model: data.model?.toUpperCase(), serial_number: data.serial_number?.toUpperCase(), manufacture_date: data.manufacture_date || prev.manufacture_date, replacement_cost_est: data.replacement_cost_est || 0, category: validCat, sub_category: CATEGORY_MAP[validCat][0] }));
          if (data.tasks) setScannedTasks(data.tasks);
          setAiStatus('complete');
          setTimeout(() => setAiStatus(null), 2000);
        }
      } catch (err) { setAiStatus(null); }
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImg = form.image_url;
      let finalBill = form.install_receipt_url;
      const { data: userData } = await supabase.auth.getUser();

      if (selectedFile) {
        const path = `${userData.user.id}/${Date.now()}-img`;
        await supabase.storage.from('dossier-assets').upload(path, selectedFile);
        finalImg = supabase.storage.from('dossier-assets').getPublicUrl(path).data.publicUrl;
      }
      if (selectedBill) {
        const path = `${userData.user.id}/${Date.now()}-bill`;
        await supabase.storage.from('dossier-assets').upload(path, selectedBill);
        finalBill = supabase.storage.from('dossier-assets').getPublicUrl(path).data.publicUrl;
      }

      const { maintenance_tasks, id, created_at, updated_at, ...sanitized } = form;
      const submissionData = { ...sanitized, image_url: finalImg, install_receipt_url: finalBill, install_cost: parseInt(form.install_cost) || 0, replacement_cost_est: parseInt(form.replacement_cost_est) || 0, has_warranty: Boolean(form.has_warranty), warranty_expiration: form.warranty_expiration || null };

      if (editMode) {
        await supabase.from('assets').update(submissionData).eq('id', asset.id);
      } else {
        const { data: newAsset } = await supabase.from('assets').insert([{ ...submissionData, property_id: propertyId }]).select().single();
        if (scannedTasks.length === 0) {
          const { data: res } = await supabase.functions.invoke('research-maintenance', { body: { brand: form.brand, model: form.model, category: form.category } });
          if (res?.tasks) {
            const taskData = res.tasks.map(t => ({ asset_id: newAsset.id, task_name: String(t.task_name).toUpperCase(), frequency_months: parseInt(t.frequency_months) || 12, instructions: t.instructions, next_due_date: new Date(new Date().setMonth(new Date().getMonth() + (parseInt(t.frequency_months) || 12))).toISOString().split('T')[0] }));
            await supabase.from('maintenance_tasks').insert(taskData);
          }
        }
      }
      onRefresh(); onClose();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-10 text-left">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{editMode ? 'Edit' : 'Catalog'} Asset</h2>
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-sm hover:bg-red-900 transition-colors"><X className="w-5 h-5 text-white" /></button>
        </div>

        {aiStatus && <div className="mb-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-sm flex flex-col items-center text-center animate-pulse"><Scan className="w-8 h-8 text-amber-500 mb-3" /><h3 className="text-xs font-black text-white uppercase">AI LENS PROCESSING</h3></div>}

        <form onSubmit={submit} className={`space-y-6 text-left ${aiStatus ? 'opacity-10 pointer-events-none' : ''}`}>
          <div className="relative w-full h-40 bg-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center hover:border-amber-500 transition-all cursor-pointer overflow-hidden">
            <input type="file" accept="image/*" onChange={handlePhotoSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover opacity-40" /> : <Camera className="w-10 h-10 text-slate-700 mb-2 group-hover:text-amber-500" />}
            <span className="text-[10px] font-black text-slate-500 uppercase">{isStewardship ? 'Attach Home Photo' : 'Scan technical plate'}</span>
          </div>

          <div className="space-y-4 font-mono">
            <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Category</label><select className="w-full bg-slate-950 border border-slate-800 p-4 text-white text-xs outline-none focus:border-amber-500" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>{Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Sub-Type</label><select className="w-full bg-slate-950 border border-slate-800 p-4 text-white text-xs outline-none focus:border-amber-500 uppercase" value={form.sub_category} onChange={e => setForm({...form, sub_category: e.target.value})}>{CATEGORY_MAP[form.category]?.map(sub => <option key={sub} value={sub}>{sub.toUpperCase()}</option>)}</select></div>
            
            <div className="grid grid-cols-2 gap-4 uppercase">
              <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Brand</label><input required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.brand} onChange={e=>setForm({...form, brand: e.target.value})} /></div>
              {!isStewardship && <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Model #</label><input disabled={form.category === 'STRUCTURE'} className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.model} onChange={e=>setForm({...form, model: e.target.value})} /></div>}
            </div>

            <div className="grid grid-cols-2 gap-4 uppercase">
              {!isStewardship && <div><label className="text-[9px] font-black text-slate-600 uppercase ml-1">Serial #</label><input disabled={form.category === 'STRUCTURE'} className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.serial_number} onChange={e=>setForm({...form, serial_number: e.target.value})} /></div>}
              <div className={isStewardship ? 'col-span-2' : ''}>
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1">{isStewardship ? 'Year Built' : 'Manufactured'}</label>
                <input type="date" required className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none" value={form.manufacture_date} onChange={e => setForm({...form, manufacture_date: e.target.value})} />
              </div>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black py-4 uppercase text-[10px] tracking-widest active:scale-95 shadow-xl">{loading ? <Loader2 className="animate-spin mx-auto w-4 h-4" /> : 'Commit to Dossier'}</button>
        </form>
      </div>
    </div>
  );
}