import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toTitleCase } from '../utils/helpers';
import { calculateLifecycle } from '../utils/lifecycle';
import { QRCodeSVG } from 'qrcode.react';
// VERIFIED ICON LIST: 26 Icons present.
import { 
  ChevronRight, Edit3, FileText, Lock, Image as ImageIcon, 
  Wrench, Archive, BookOpen, Info, Calendar, ShieldCheck, 
  User, DollarSign, ArrowUpRight, Loader2, CheckCircle,
  Hourglass, AlertTriangle, TrendingUp, Key, ChevronDown, ChevronUp, 
  Shield, Trash2, Hammer, UserCheck, Printer, QrCode
} from 'lucide-react';
import AssetModal from '../modals/AssetModal';
import ServiceLogModal from '../modals/ServiceLogModal';

// --- SUB-COMPONENT: FORMATTED TASK ITEM ---
function MaintenanceTaskItem({ task, onComplete, onDelete, isSaving }) {
  const [expanded, setExpanded] = useState(false);
  const [cost, setCost] = useState('');

  const renderInstructions = (val) => {
    if (!val) return null;
    let list = val.split('\n').map(line => line.replace(/^[•\-\*\d\.\s"\[\]]+/, '').replace(/["\[\]]/g, '').trim()).filter(Boolean);
    return (
      <ul className="space-y-3">
        {list.map((item, i) => (
          <li key={i} className="flex gap-3 text-[11px] leading-relaxed group text-left">
            <span className="text-amber-500 font-mono font-bold shrink-0">—</span>
            <span className="text-slate-400 uppercase tracking-tighter">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-slate-900 border-l-4 border-amber-500 p-5 shadow-xl mb-3 group transition-all font-sans">
      <div className="flex justify-between items-start">
        <div className="text-left flex-grow">
          <div className="flex items-center gap-3">
            <h4 className="text-white font-bold uppercase text-sm">{task.task_name}</h4>
            <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white hover:text-red-500 transition-all duration-200"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase font-bold tracking-widest font-mono">DUE: {task.next_due_date}</p>
          {task.instructions && (
            <button onClick={() => setExpanded(!expanded)} className="mt-3 flex items-center gap-1.5 text-amber-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-colors font-mono">
              How do I...? {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
            <input type="number" placeholder="COST" className="bg-slate-950 border border-slate-800 p-2 pl-6 text-[10px] text-white w-20 font-mono outline-none focus:border-amber-500" value={cost} onChange={e => setCost(e.target.value)} />
          </div>
          <button onClick={() => onComplete(task, cost)} disabled={isSaving} className="bg-amber-500 text-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 font-mono">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Complete
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2 duration-300 text-left">
          <div className="bg-slate-950 p-5 rounded-sm border border-slate-800">{renderInstructions(task.instructions)}</div>
        </div>
      )}
    </div>
  );
}

// --- MAIN VIEW ---
export default function AssetDetailView({ asset, setSelectedAsset, providers, onUpdate }) {
  const [history, setHistory] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const lifecycle = calculateLifecycle(asset.manufacture_date, asset.category, asset.sub_category);
  const isStewardship = asset.sub_category === 'Home Stewardship';

  const showSerial = asset.serial_number && asset.serial_number !== 'N/A';
  const showModel = asset.model && asset.model !== 'N/A' && asset.model !== 'GENERAL';
  const showBrand = asset.brand && asset.brand !== 'N/A' && asset.brand !== 'PROPERTY';
  const displayDate = isStewardship ? new Date(asset.manufacture_date).getFullYear() : asset.manufacture_date;

  const qrLink = `${window.location.origin}/asset/${asset.id}`;

  useEffect(() => { fetchDetails(); }, [asset.id]);

  async function fetchDetails() {
    setLoading(true);
    try {
      const [historyRes, guidesRes] = await Promise.all([
        supabase.from('service_records').select('*').eq('asset_id', asset.id).order('service_date', { ascending: false }),
        supabase.from('diy_guides').select('*').eq('category', asset.category)
      ]);
      setHistory(historyRes.data || []);
      setGuides(guidesRes.data || []);
    } finally { setLoading(false); }
  }

  async function completeTask(task, taskCost) {
    setIsSaving(true);
    await supabase.from('service_records').insert([{ 
      asset_id: asset.id, 
      description_of_work: `Completed: ${task.task_name}`, 
      service_date: new Date().toISOString().split('T')[0],
      cost: parseInt(taskCost) || 0
    }]);
    const nextDate = new Date(); nextDate.setMonth(nextDate.getMonth() + (task.frequency_months || 6));
    await supabase.from('maintenance_tasks').update({ next_due_date: nextDate.toISOString().split('T')[0] }).eq('id', task.id);
    await fetchDetails();
    onUpdate();
    setIsSaving(false);
  }

  async function deleteTask(taskId) {
    if (!confirm("Permanently remove?")) return;
    await supabase.from('maintenance_tasks').delete().eq('id', taskId);
    await fetchDetails();
    onUpdate();
  }

  if (loading) return <div className="p-20 text-center flex flex-col items-center"><Loader2 className="animate-spin text-amber-500 w-8 h-8 mb-4" /><p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Opening_Dossier_Vault...</p></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* HIDDEN PRINT-ONLY LABEL (Used for window.print()) */}
      <div id="printable-label" className="hidden flex-col items-center text-center bg-white text-black p-4 border border-black">
        <h2 className="text-sm font-black uppercase mb-1">{asset.sub_category}</h2>
        <p className="text-[10px] font-bold uppercase mb-4">{asset.brand} {asset.model !== 'N/A' ? asset.model : ''}</p>
        <QRCodeSVG value={qrLink} size={150} level="H" />
        <p className="text-[8px] font-mono mt-4 uppercase font-bold tracking-tighter">
          Scan for Verified Service History<br/>
          Casa Dossier ID: {asset.id.split('-')[0]}
        </p>
      </div>

      {/* REGULAR SCREEN HEADER */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setSelectedAsset(null)} className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors font-mono"><ChevronRight className="w-4 h-4 rotate-180" /> Dashboard</button>
        {asset.status === 'active' ? (
          <div className="flex gap-3">
            <button onClick={() => setShowEditModal(true)} className="bg-slate-800 text-white p-2 border border-slate-700 hover:border-amber-500 transition-all"><Edit3 className="w-4 h-4" /></button>
            <button onClick={() => { setSelectedTask(null); setShowLogModal(true); }} className="bg-amber-500 text-slate-950 px-6 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">Log Service</button>
          </div>
        ) : <div className="flex items-center gap-2 text-slate-600 font-mono text-[10px] uppercase border border-slate-800 px-4 py-2 bg-slate-900/50"><Lock className="w-3.5 h-3.5" /> Archived Record</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6 text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
            {asset.image_url ? <img src={asset.image_url} className="w-full h-48 object-cover border-b border-slate-800" alt="Asset" /> : <div className="h-48 bg-slate-950 flex items-center justify-center border-b border-slate-800"><ImageIcon className="w-12 h-12 text-slate-900" /></div>}
            <div className="p-8">
              <h2 className="text-2xl font-black text-white uppercase mb-1 tracking-tighter">{asset.sub_category}</h2>
              {showBrand || showModel ? <p className="text-slate-500 font-mono text-xs uppercase mb-6">{showBrand && asset.brand} {showModel && asset.model}</p> : <div className="mb-6"></div>}
              <div className="pt-6 border-t border-slate-800 space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono">
                {showSerial && <div>SERIAL: <span className="text-slate-300 block text-sm mt-1 font-bold">{asset.serial_number}</span></div>}
                {showModel && <div>MODEL: <span className="text-slate-300 block text-sm mt-1 font-bold">{asset.model}</span></div>}
                <div>{isStewardship ? 'PROPERTY_BUILT:' : 'MANUFACTURED:'} <span className="text-slate-300 block text-sm mt-1 font-bold">{displayDate}</span></div>
              </div>
            </div>
          </div>

          {/* PHYSICAL QR IDENTITY (SCREEN VERSION) */}
          {!isStewardship && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-xl flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6 w-full">
                <QrCode className="w-4 h-4 text-amber-500" />
                <h3 className="text-white font-black uppercase tracking-widest text-[10px] font-mono">Physical Label</h3>
              </div>
              <div className="p-4 bg-white rounded-sm">
                <QRCodeSVG value={qrLink} size={100} level="H" />
              </div>
              <button onClick={() => window.print()} className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-800 text-white border border-slate-700 px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:border-amber-500 transition-all">
                <Printer className="w-4 h-4 text-amber-500" /> Print ID Tag
              </button>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-xl text-left space-y-6">
             {!isStewardship && (
               <div>
                 <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2 font-mono"><DollarSign className="w-4 h-4 text-amber-500" /> Financial Value</h3>
                 <div className="bg-slate-950 p-4 border border-slate-800 rounded-sm space-y-4">
                   <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1 font-mono">Install Cost</p><p className="text-xl font-mono text-white font-bold">${(asset.install_cost || 0).toLocaleString()}</p></div>
                   <div className="pt-3 border-t border-slate-900"><p className="text-[8px] font-black text-amber-600 uppercase mb-1 font-mono">Est. Replacement</p><p className="text-lg font-mono text-amber-500 font-bold">${(asset.replacement_cost_est || 0).toLocaleString()}</p></div>
                   {asset.install_receipt_url && <a href={asset.install_receipt_url} target="_blank" className="flex items-center gap-2 text-amber-500 text-[9px] font-black uppercase hover:text-white transition-colors underline font-mono">View Invoice <ArrowUpRight className="w-3 h-3" /></a>}
                 </div>
               </div>
             )}
             <div>
               <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2 font-mono"><Shield className="w-4 h-4 text-amber-500" /> Protection</h3>
               <div className={`p-4 border rounded-sm ${asset.has_warranty ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-950 border-slate-800'}`}>
                 <p className={`text-[10px] font-black uppercase font-mono ${asset.has_warranty ? 'text-emerald-500' : 'text-slate-600'}`}>{asset.has_warranty ? 'Warranty Active' : 'No Warranty'}</p>
                 {asset.has_warranty && <p className="text-[9px] text-slate-500 mt-1 font-mono">Expires: {asset.warranty_expiration}</p>}
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8 text-left">
          {asset.status === 'active' && (
            <section>
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 font-mono"><Calendar className="w-4 h-4 text-amber-500" /> Maintenance Schedule</h3>
              {asset.maintenance_tasks?.length > 0 ? (
                [...asset.maintenance_tasks].sort((a,b) => new Date(a.next_due_date) - new Date(b.next_due_date)).map(t => (
                  <MaintenanceTaskItem key={t.id} task={t} onComplete={() => { setSelectedTask(t); setShowLogModal(true); }} onDelete={deleteTask} isSaving={isSaving} />
                ))
              ) : <div className="p-10 border border-dashed border-slate-800 text-center text-[10px] text-slate-600 uppercase font-mono tracking-widest">No schedule established</div>}
            </section>
          )}

          <section>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 font-mono"><ShieldCheck className="w-4 h-4 text-amber-500" /> System History</h3>
            <div className="bg-slate-900 border border-slate-800 divide-y divide-slate-800 shadow-2xl overflow-hidden">
              {history.map(r => (
                <div key={r.id} className="p-6 flex justify-between items-center group hover:bg-slate-800/30 transition-colors font-mono">
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-white font-bold uppercase text-sm">{r.description_of_work}</h4>
                      {r.type === 'PRO' ? <span className="text-[8px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-xs tracking-tighter uppercase font-mono">PRO</span> : <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-xs tracking-tighter uppercase font-mono border border-slate-700">DIY</span>}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-600">
                      <span className="text-amber-500 flex items-center gap-1"><UserCheck className="w-3 h-3" /> {toTitleCase(r.provider_name)} • {r.service_date}</span> 
                      {r.cost > 0 && <span className="ml-2 text-slate-400 font-mono text-xs">${r.cost.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="text-right">{r.receipt_url && <a href={r.receipt_url} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-white uppercase font-black text-[9px] tracking-widest flex items-center gap-1 underline">Receipt <ArrowUpRight className="w-3 h-3" /></a>}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      {showEditModal && <AssetModal activeProperty={null} propertyId={asset.property_id} asset={asset} editMode={true} onClose={() => setShowEditModal(false)} onRefresh={onUpdate} />}
      {showLogModal && <ServiceLogModal assetId={asset.id} task={selectedTask} providers={providers} onClose={() => setShowLogModal(false)} onRefresh={fetchDetails} />}
    </div>
  );
}