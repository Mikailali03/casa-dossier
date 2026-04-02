import React from 'react';
import { ShieldCheck, FileText, Wrench, ArrowLeft, Printer } from 'lucide-react';

export default function ReportView({ property, assets, onClose }) {
  const activeAssets = assets.filter(a => a.status === 'active');

  return (
    <div className="min-h-screen bg-white text-slate-950 p-8 md:p-20 animate-in fade-in duration-500">
      <div className="fixed top-0 left-0 right-0 bg-slate-900 p-4 flex justify-between items-center print:hidden z-50">
        <button onClick={onClose} className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Close Report
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest shadow-lg">
          <Printer className="w-4 h-4" /> Print to PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto border-t-8 border-slate-950 pt-12">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{property?.address}</h1>
            <p className="text-xl text-slate-600 uppercase font-mono">{property?.city}, {property?.state} {property?.zip_code}</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-950 text-white p-4 inline-block">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Dossier Status</p>
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-lg font-bold uppercase italic">Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 border-y border-slate-200 py-8 mb-12">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Built</p>
            <p className="font-mono text-lg font-bold">{property?.year_built}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Square Footage</p>
            <p className="font-mono text-lg font-bold">{property?.sq_ft} SQ FT</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Configuration</p>
            <p className="font-mono text-lg font-bold">{property?.bedrooms}BD / {property?.bathrooms}BA</p>
          </div>
        </div>

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
          <Wrench className="w-6 h-6" /> Major Systems Inventory
        </h2>
        
        <div className="space-y-8">
          {activeAssets.map(asset => (
            <div key={asset.id} className="border border-slate-200 p-6 break-inside-avoid">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase">{asset.sub_category}</h3>
                  <p className="text-slate-500 font-mono text-sm">{asset.brand} {asset.model}</p>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400 uppercase">
                  Installed: {asset.install_date}
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-l-4 border-slate-950 font-mono text-xs">
                SERIAL_NO: {asset.serial_number}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}