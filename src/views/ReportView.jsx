import React from 'react';
import { toTitleCase } from '../utils/helpers';
// VERIFIED ICON LIST: 8 Icons present.
import { 
  ShieldCheck, FileText, Wrench, ArrowLeft, 
  Printer, Calendar, UserCheck, CheckCircle 
} from 'lucide-react';

export default function ReportView({ property, assets, onClose }) {
  const activeAssets = assets.filter(a => a.status === 'active');
  const totalServices = activeAssets.reduce((sum, a) => sum + (a.service_records?.length || 0), 0);

  return (
    <div className="min-h-screen bg-white text-slate-950 p-8 md:p-20 animate-in fade-in duration-500 font-sans">
      
      {/* ACTION BAR - Uses print-hide class */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900 p-4 flex justify-between items-center print-hide z-[200]">
        <button onClick={onClose} className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit Report Mode
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all">
          <Printer className="w-4 h-4" /> Print Verified Dossier
        </button>
      </div>

      {/* --- PRINTABLE REPORT CONTAINER --- */}
      <div id="printable-report" className="max-w-4xl mx-auto">
        
        {/* DOCUMENT HEADER */}
        <div className="border-b-4 border-slate-950 pb-8 mb-12 flex justify-between items-end text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Official Property Dossier</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{property?.address}</h1>
            <p className="text-lg text-slate-600 uppercase font-mono tracking-tight">
              {property?.city}, {property?.state} {property?.zip_code}
            </p>
          </div>
          <div className="text-right">
            <div className="border-2 border-slate-950 p-4 inline-block bg-slate-50">
              <div className="flex items-center gap-2 text-slate-950">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-xl font-black uppercase italic tracking-tighter">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROPERTY SPECS */}
        <div className="grid grid-cols-4 gap-4 mb-16 text-left">
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Built</p>
            <p className="font-mono font-bold text-sm">{property?.year_built}</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Structure</p>
            <p className="font-mono font-bold text-sm">{property?.sq_ft?.toLocaleString()} SQ FT</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
            <p className="font-mono font-bold text-sm">{property?.bedrooms}BD / {property?.bathrooms}BA</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Records</p>
            <p className="font-mono font-bold text-sm">{totalServices} EVENTS</p>
          </div>
        </div>

        {/* ASSET LOGS */}
        <div className="space-y-16 text-left">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] border-b border-slate-200 pb-2 mb-8">
            Systems & Maintenance History
          </h2>

          {activeAssets.map(asset => {
            const history = [...(asset.service_records || [])].sort((a, b) => new Date(b.service_date) - new Date(a.service_date));

            return (
              <div key={asset.id} className="break-inside-avoid mb-12">
                {/* Asset Identity */}
                <div className="flex justify-between items-end mb-4 border-b-2 border-slate-100 pb-2">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">{asset.sub_category}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {asset.brand !== 'PROPERTY' && asset.brand} {asset.model !== 'GENERAL' && asset.model !== 'N/A' ? asset.model : ''}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[9px] font-black bg-slate-100 px-2 py-1 uppercase tracking-widest">
                      SN: {asset.serial_number !== 'N/A' ? asset.serial_number : 'HOUSE_RECORD'}
                    </span>
                  </div>
                </div>

                {/* Service Record Table */}
                <div className="w-full">
                  {history.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-2 text-[9px] font-black uppercase text-slate-400 tracking-widest w-24">Date</th>
                          <th className="py-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">Service Item</th>
                          <th className="py-2 text-[9px] font-black uppercase text-slate-400 tracking-widest w-40 text-right">Performed By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(record => (
                          <tr key={record.id} className="border-b border-slate-50">
                            <td className="py-3 text-[10px] font-mono font-bold">{record.service_date}</td>
                            <td className="py-3 text-[11px] font-bold uppercase tracking-tighter">
                              {record.description_of_work}
                            </td>
                            <td className="py-3 text-[10px] text-right font-mono uppercase text-slate-600">
                              {toTitleCase(record.provider_name)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-4 border border-dashed border-slate-200 text-center">
                      <p className="text-[10px] text-slate-400 font-mono uppercase italic tracking-widest">No historical service events recorded.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-24 pt-12 border-t border-slate-200 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
            Authenticated via Casa Dossier on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
          <div className="flex justify-center gap-4 text-slate-300">
            <Wrench className="w-3 h-3" />
            <ShieldCheck className="w-3 h-3" />
            <FileText className="w-3 h-3" />
          </div>
        </div>

      </div>
    </div>
  );
}