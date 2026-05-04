import React from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Plus, 
  Box, 
  QrCode, 
  Printer, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  MailCheck
} from 'lucide-react';

export default function TechPropertyDetailView({ 
  property, 
  assets, 
  upsells, 
  onSelectAsset, 
  onBack, 
  onOpenModal, 
  onOpenScanner,
  onOpenAssetModal, // Trigger for New Asset Cataloging
  onPrintAsset, // Trigger for QR Print Modal
  onTransfer // Trigger for Digital Deed Transfer
}) {
  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 max-w-2xl mx-auto text-left pb-20">
      
      {/* 1. Navigation Breadcrumb */}
      <button onClick={onBack} className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase hover:text-white transition-colors">
        <ArrowLeft size={14} /> Back_To_Lookup
      </button>

      {/* 2. Dispatch Header */}
      <div className="bg-slate-900 p-8 border-l-8 border-amber-500 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
            <p className="font-mono text-[10px] text-amber-500 uppercase tracking-[0.3em] font-black mb-1">Dispatch_Active</p>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">{property.address}</h1>
            <p className="font-mono text-xs text-slate-500 mt-2 uppercase tracking-widest">{property.city}, {property.state} {property.zip_code}</p>
        </div>
        <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" size={140} />
      </div>
      {/* Add this button below the property address card */}
{!property.owner_id && (
  <button 
    onClick={() => onTransfer(property)}
    className="w-full bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-none flex items-center justify-between group transition-all mb-8 shadow-[8px_8px_0px_0px_#1e3a8a]"
  >
    <div className="text-left">
      <p className="font-black uppercase italic text-xl leading-none mb-1">Transfer_Dossier_Ownership</p>
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">Ready for homeowner claim: {property.homeowner_email}</p>
    </div>
    <div className="bg-white/20 p-2 group-hover:bg-white/40 transition-colors">
      <MailCheck size={24} />
    </div>
  </button>
)}

      {/* 3. Primary Technician Action: Optical Scan */}
      <button 
        onClick={onOpenScanner}
        className="w-full bg-slate-900 border-2 border-dashed border-amber-500/40 p-8 flex items-center justify-between hover:bg-amber-500 hover:border-amber-500 group transition-all"
      >
        <div className="flex items-center gap-6">
          <QrCode size={44} className="text-amber-500 group-hover:text-slate-950 transition-colors" strokeWidth={1.5} />
          <div className="text-left">
            <p className="font-black uppercase italic text-2xl leading-none group-hover:text-slate-950 transition-colors">Scan_Asset_Plate</p>
            <p className="font-mono text-[10px] text-slate-500 group-hover:text-slate-900 uppercase tracking-widest mt-1">Optical Recognition Bypass</p>
          </div>
        </div>
        <Plus size={24} className="text-slate-800 group-hover:text-slate-950" />
      </button>

      {/* 4. Smart Upsells / Field Intelligence */}
      {upsells.length > 0 && (
        <div className="bg-amber-500/5 border-2 border-amber-500/20 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase italic text-amber-500 flex items-center gap-2 tracking-tighter text-xl leading-none">
                <TrendingUp size={22} /> Smart_Service_Upsells
            </h3>
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 font-mono text-[10px] font-black">DUE_SOON</span>
          </div>
          
          <div className="grid gap-3">
            {upsells.map(u => (
              <button 
                key={u.id} 
                onClick={() => onOpenModal({ 
                  task_id: u.id, 
                  task_name: u.task_name, 
                  asset_id: u.asset_id, 
                  asset_name: `${u.assets.brand} ${u.assets.sub_category}` 
                })} 
                className="bg-slate-950 border border-amber-500/10 p-5 flex justify-between items-center hover:bg-amber-500 hover:text-slate-950 transition-all group"
              >
                <div className="text-left flex items-start gap-4">
                  <AlertCircle size={18} className="text-amber-500 mt-0.5 group-hover:text-slate-950" />
                  <div>
                    <p className="text-md font-bold uppercase leading-none mb-1">{u.task_name}</p>
                    <p className="text-[10px] font-mono opacity-70 uppercase tracking-widest">Unit: {u.assets.brand} {u.assets.sub_category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="font-mono text-[10px] uppercase font-black mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Add_To_Cart</p>
                    <Plus size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Equipment Registry Header & Catalog Toggle */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
            <div>
                <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.5em] font-black leading-none">Equipment_Registry</h3>
                <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase italic">{assets.length} System Components Identified</p>
            </div>
            <button 
                onClick={onOpenAssetModal}
                className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 font-mono text-[10px] text-amber-500 uppercase hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-2 font-black"
            >
                <Plus size={14} strokeWidth={3} /> Catalog_New_Unit
            </button>
        </div>

        {/* 6. Asset List */}
        <div className="grid gap-4">
          {assets.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 flex items-stretch hover:border-emerald-500 group transition-all shadow-xl">
                {/* Main Action Area: Selection */}
                <button 
                    onClick={() => onSelectAsset(a)}
                    className="flex-1 p-7 flex items-center gap-6 text-left"
                >
                    <div className="bg-slate-950 p-4 border border-slate-800 group-hover:border-emerald-500 transition-colors">
                        <Box className="text-slate-600 group-hover:text-emerald-500 transition-colors" size={32} />
                    </div>
                    <div>
                        <p className="font-black uppercase italic text-2xl leading-none group-hover:text-white transition-colors">{a.brand} {a.sub_category}</p>
                        <div className="flex gap-4 mt-3 font-mono text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                            <span>SN: {a.serial_number || 'UNVERIFIED'}</span>
                            <span className="text-slate-800">|</span>
                            <span>{a.category}</span>
                        </div>
                    </div>
                </button>

                {/* Side Action: Quick Print QR */}
                <button 
                    title="Print QR Tag"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrintAsset(a);
                    }}
                    className="px-8 border-l border-slate-800 bg-slate-950/20 hover:bg-amber-500 hover:text-slate-950 transition-all flex flex-col items-center justify-center gap-2 group/print"
                >
                    <Printer size={22} className="text-slate-600 group-hover/print:text-slate-950 transition-colors" />
                    <span className="font-mono text-[8px] uppercase font-black opacity-0 group-hover/print:opacity-100">Tag_QR</span>
                </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}