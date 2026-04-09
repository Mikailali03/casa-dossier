import React from 'react';
import { toTitleCase } from '../utils/helpers';
// VERIFIED ICON LIST: 9 Icons present.
import { 
  ShieldCheck, FileText, Wrench, ArrowLeft, 
  Printer, Calendar, UserCheck, CheckCircle, Archive 
} from 'lucide-react';

export default function ReportView({ property, assets, onClose }) {
  const activeAssets = assets.filter(a => a.status === 'active');
  const retiredAssets = assets.filter(a => a.status === 'retired');
  const totalEvents = assets.reduce((sum, a) => sum + (a.service_records?.length || 0), 0);

  // Reusable component for rendering an asset's service table
  const AssetServiceTable = ({ asset, isRetired }) => {
    const history = [...(asset.service_records || [])].sort((a, b) => new Date(b.service_date) - new Date(a.service_date));
    
    // Formatting logic for date display
    const isStewardship = asset.sub_category === 'Home Stewardship';
    const dateLabel = isStewardship ? 'Built' : 'Manufactured';
    const dateValue = isStewardship && asset.manufacture_date 
  ? asset.manufacture_date.split('-')[0] // STRING SPLIT - TIMEZONE IMMUNE
  : asset.manufacture_date;

    return (
      <div className={`break-inside-avoid mb-12 ${isRetired ? 'opacity-70' : ''}`}>
        {/* Asset Header Group */}
        <div className="flex justify-between items-end mb-4 border-b-2 border-slate-900 pb-2">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black uppercase tracking-tight">{asset.sub_category}</h3>
              {isRetired && (
                <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded-xs tracking-widest uppercase">
                  Decommissioned {asset.retired_date}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {asset.brand !== 'PROPERTY' && asset.brand} {asset.model !== 'GENERAL' && asset.model !== 'N/A' ? asset.model : ''}
            </p>
          </div>
          <div className="text-right font-mono flex flex-col items-end gap-1">
            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 uppercase tracking-widest">
              {dateLabel}: {dateValue}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
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
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 p-8 md:p-20 animate-in fade-in duration-500 font-sans">
      
      {/* ACTION BAR */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900 p-4 flex justify-between items-center print-hide z-[200]">
        <button onClick={onClose} className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest hover:text-amber-500 transition-colors font-mono">
          <ArrowLeft className="w-4 h-4" /> Exit Report Mode
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all font-mono">
          <Printer className="w-4 h-4" /> Print Verified Dossier
        </button>
      </div>

      {/* --- PRINTABLE REPORT CONTAINER --- */}
      <div id="printable-report" className="max-w-4xl mx-auto">
        
        {/* DOCUMENT HEADER */}
        <div className="border-b-8 border-slate-950 pb-8 mb-12 flex justify-between items-end text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2">Official Property Dossier</p>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-1">{property?.address}</h1>
            <p className="text-xl text-slate-600 uppercase font-mono tracking-tight">
              {property?.city}, {property?.state} {property?.zip_code}
            </p>
          </div>
          <div className="text-right">
            <div className="border-4 border-slate-950 p-4 inline-block bg-slate-50 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 text-slate-950">
                <ShieldCheck className="w-8 h-8" />
                <span className="text-2xl font-black uppercase italic tracking-tighter leading-none">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROPERTY SPECS */}
        <div className="grid grid-cols-4 gap-4 mb-16 text-left border-y border-slate-100 py-10">
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Built</p>
            <p className="font-mono font-bold text-sm">{property?.year_built}</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Structure</p>
            <p className="font-mono font-bold text-sm">{property?.sq_ft?.toLocaleString()} SQ FT</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Bed / Bath</p>
            <p className="font-mono font-bold text-sm">{property?.bedrooms}BD / {property?.bathrooms}BA</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry</p>
            <p className="font-mono font-bold text-sm">{totalEvents} AUDITED EVENTS</p>
          </div>
        </div>

        {/* ACTIVE SYSTEMS SECTION */}
        <div className="space-y-4 text-left">
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] bg-slate-950 text-white px-4 py-2 mb-12 inline-block">
            Current Operational Inventory
          </h2>
          {activeAssets.map(asset => (
            <AssetServiceTable key={asset.id} asset={asset} isRetired={false} />
          ))}
        </div>

        {/* RETIRED SYSTEMS SECTION */}
        {retiredAssets.length > 0 && (
          <div className="mt-24 pt-12 border-t-2 border-slate-200 space-y-4 text-left">
            <div className="flex items-center gap-3 mb-10 opacity-50">
              <Archive className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase tracking-[0.2em]">Decommissioned Systems Archive</h2>
            </div>
            <p className="text-[10px] text-slate-500 font-mono uppercase italic mb-12 max-w-2xl leading-relaxed">
              Historical records for replaced equipment. Maintained to establish property care narrative.
            </p>
            {retiredAssets.map(asset => (
              <AssetServiceTable key={asset.id} asset={asset} isRetired={true} />
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-32 pt-12 border-t-2 border-slate-900 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
            Record Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex justify-center gap-6 text-slate-200">
            <div className="flex items-center gap-1.5"><Wrench className="w-3 h-3" /><span className="text-[8px] font-bold uppercase tracking-widest">Technical Spec</span></div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /><span className="text-[8px] font-bold uppercase tracking-widest">Verified Logic</span></div>
            <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /><span className="text-[8px] font-bold uppercase tracking-widest">Chain of Custody</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}