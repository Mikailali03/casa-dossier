// src/tech/TechScannerModal.jsx
import React, { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera, Zap, AlertTriangle } from 'lucide-react';

export default function TechScannerModal({ onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          scannerRef.current.stop();
          onScanSuccess(result.data); 
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          // This helps with mobile performance
          preferredCamera: 'environment' 
        }
      );

      scannerRef.current.start().catch(err => {
        // Log the exact error to the console so we can see it
        console.error("CAMERA_INITIALIZATION_ERROR:", err);
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center p-6 animate-in fade-in">
      <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-sm shadow-lg">
            <Camera size={20} className="text-slate-950" />
          </div>
          <div>
            <h2 className="text-white font-black uppercase italic tracking-tighter text-xl leading-none">Optical_Intake</h2>
            <p className="font-mono text-[9px] text-amber-500 uppercase tracking-widest leading-none mt-1">Scanning_Active</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-2 border border-slate-800 bg-slate-900 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Frame with added Video Attributes */}
      <div className="relative w-full max-w-sm aspect-square bg-black border-4 border-slate-800 shadow-2xl overflow-hidden">
        <video 
          ref={videoRef} 
          // THESE THREE ARE CRITICAL FOR MOBILE:
          muted
          playsInline
          autoPlay
          className="w-full h-full object-cover grayscale contrast-125" 
        />
        
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-500/50 shadow-[0_0_15px_#f59e0b] animate-scan-line z-10" />
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-amber-500 z-20" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-amber-500 z-20" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-amber-500 z-20" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-amber-500 z-20" />
      </div>

      <div className="mt-8 text-center max-w-xs space-y-4">
        <div className="flex items-center justify-center gap-2 text-amber-500/60 font-mono text-[10px] uppercase tracking-widest font-black">
          <Zap size={14} /> System_Ready
        </div>
        <p className="text-slate-400 text-sm font-medium uppercase italic leading-tight">
          Align the asset identity plate within the viewport markers.
        </p>
      </div>

      <div className="mt-auto pb-6 flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-sm text-left">
        <AlertTriangle size={16} className="text-amber-500/40 shrink-0" />
        <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest leading-relaxed">
          Notice: Camera access requires an encrypted HTTPS connection. Check permissions if feed is dark.
        </p>
      </div>
    </div>
  );
}