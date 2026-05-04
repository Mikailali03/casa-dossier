import React from 'react';
// 1. IMPORT YOUR IMAGE FILE
import logoImg from '../assets/CasaDossierLogo.png'; 

export default function Logo({ size = "sm", type = "full" }) {
  /**
   * size: "sm" for Header, "lg" for Login/Onboarding
   * type: "icon" if the image is just the house, "full" if it includes the text
   */
  
  // Set height based on location
  const height = size === "lg" ? "h-16" : "h-8";

  return (
    <div className="flex items-center gap-3 group select-none transition-transform active:scale-95">
      {type === "icon" ? (
        // --- OPTION A: IMAGE INSIDE THE FOLDER SHAPE ---
        <div className="relative pt-1">
          <div className={`${size === 'lg' ? 'h-2 w-10' : 'h-1 w-5'} bg-amber-500 absolute top-0 left-0 rounded-t-[1px]`} />
          <div className={`${size === 'lg' ? 'p-3' : 'p-1.5'} bg-amber-500 rounded-b-sm rounded-tr-sm relative z-10`}>
            <img 
              src={logoImg} 
              alt="Casa Dossier" 
              className={`${size === 'lg' ? 'w-10 h-10' : 'w-5 h-5'} object-contain`} 
            />
          </div>
        </div>
      ) : (
        // --- OPTION B: IMAGE IS THE ENTIRE LOGO (Text Included) ---
        <img 
          src={logoImg} 
          alt="Casa Dossier" 
          className={`${height} w-auto object-contain drop-shadow-xl`} 
        />
      )}

      {/* If your image is ONLY the icon, keep the text below. 
          If your image INCLUDES the text, delete the <span> below. */}
      {type === "icon" && (
        <span className={`font-black uppercase tracking-tighter ${size === 'lg' ? 'text-3xl' : 'text-xl'} text-white`}>
          CASA <span className="text-amber-500">DOSSIER</span>
        </span>
      )}
    </div>
  );
}