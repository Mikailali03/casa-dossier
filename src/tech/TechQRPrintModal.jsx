import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // npm install qrcode.react
import { X, Printer } from 'lucide-react';

export default function TechQRPrintModal({ asset, address, onClose }) {
  const printAction = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/95 flex items-center justify-center p-4">
      <div className="bg-white p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white print:hidden flex items-center gap-2 font-mono text-xs uppercase">
            <X size={20} /> Close
        </button>

        <div className="border-4 border-black p-4 inline-block">
            <QRCodeSVG value={asset.id} size={180} level="H" />
        </div>

        <div className="text-black space-y-1">
            <h2 className="text-2xl font-black uppercase italic leading-tight">{asset.brand}</h2>
            <p className="font-bold uppercase text-lg">{asset.sub_category}</p>
            <div className="h-px bg-black/10 w-full my-4" />
            <p className="font-mono text-[10px] uppercase font-bold tracking-tighter">Location: {address}</p>
            <p className="font-mono text-[10px] uppercase font-bold">Registry_ID: {asset.id.slice(0, 8)}</p>
        </div>

        <button 
            onClick={printAction}
            className="w-full bg-black text-white p-4 font-black uppercase italic flex justify-center items-center gap-2 print:hidden"
        >
            <Printer size={20} /> Send_to_Label_Printer
        </button>
      </div>
    </div>
  );
}