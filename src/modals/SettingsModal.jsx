import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// VERIFIED ICON LIST: 10 Icons present.
import { X, Globe, Lock, Copy, CheckCircle, Loader2, ShieldAlert, Send, UserPlus, AlertTriangle } from 'lucide-react';

export default function SettingsModal({ property, onClose, onRefresh }) {
  const [isPublic, setIsPublic] = useState(property?.is_public || false);
  const [copied, setCopied] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [pendingInvite, setPendingInvite] = useState(null);

  useEffect(() => {
    if (property?.id) fetchPendingInvite();
  }, [property?.id]);

  async function fetchPendingInvite() {
    const { data } = await supabase.from('transfer_invites').select('*').eq('property_id', property.id).eq('status', 'pending').single();
    setPendingInvite(data);
  }

  const togglePublic = async () => {
    const newVal = !isPublic;
    const { error } = await supabase.from('properties').update({ is_public: newVal }).eq('id', property.id);
    if (!error) {
      setIsPublic(newVal);
      onRefresh();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/report/${property.share_slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initiateTransfer = async (e) => {
    e.preventDefault();
    const emailLower = transferEmail.toLowerCase().trim();

    if (!confirm(`CRITICAL: Transferring to ${emailLower}. You will immediately lose all access to this Dossier. Continue?`)) return;
    
    setIsTransferring(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', emailLower).single();

      if (profile) {
        // 1. Instant Transfer using RPC
        const { error: rpcErr } = await supabase.rpc('transfer_property_ownership', {
          target_property_id: property.id,
          new_owner_id: profile.id
        });
        if (rpcErr) throw rpcErr;
        alert("DEED TRANSFERRED: Ownership has been successfully moved.");
        window.location.reload(); 
      } else {
        // 2. Create Invite with SNAPSHOT ADDRESS
        const { data: { user } } = await supabase.auth.getUser();
        const { error: inviteErr } = await supabase.from('transfer_invites').insert([{
          property_id: property.id,
          sender_id: user.id,
          recipient_email: emailLower,
          property_address: property.address // STORED DIRECTLY
        }]);
        if (inviteErr) throw inviteErr;
        alert(`TRANSFER INITIATED: The deed is in escrow for ${emailLower}.`);
        fetchPendingInvite();
      }
    } catch (err) {
      alert("Transfer Protocol Failed: " + err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/90 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-left">Property Settings</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1 text-left">ID: {property.id.split('-')[0]}</p>
          </div>
          <button onClick={onClose} className="bg-slate-800 p-2 rounded-sm hover:bg-red-900 transition-colors"><X className="w-5 h-5 text-white" /></button>
        </div>

        <div className="space-y-8">
          {/* PUBLIC SHARING */}
          <div className="p-6 border border-slate-800 bg-slate-950/50 rounded-sm text-left">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {isPublic ? <Globe className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
                <div><h4 className="text-white font-bold uppercase text-sm">Public Ledger</h4><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Dossier visible via URL</p></div>
              </div>
              <button onClick={togglePublic} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isPublic ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{isPublic ? 'Enabled' : 'Disabled'}</button>
            </div>
            {isPublic && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 font-mono">Dossier Share Link</p>
                <div className="flex gap-2">
                  <input readOnly className="flex-grow bg-slate-900 border border-slate-800 p-2 text-[10px] text-slate-400 font-mono truncate" value={`${window.location.origin}/report/${property.share_slug}`} />
                  <button onClick={copyLink} className="bg-slate-800 p-2 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all">{copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                </div>
              </div>
            )}
          </div>

          {/* DEED TRANSFER */}
          <div className="p-6 border border-red-900/30 bg-red-900/5 rounded-sm text-left">
            <div className="flex items-center gap-3 mb-4"><ShieldAlert className="w-5 h-5 text-red-500" /><h3 className="text-white font-black uppercase tracking-widest text-xs">Transfer Ownership</h3></div>
            {pendingInvite ? (
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-sm">
                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Pending Acceptance</p>
                <p className="text-[11px] text-slate-400 font-mono mt-2 leading-relaxed">Escrowed for: <span className="text-white underline">{pendingInvite.recipient_email}</span></p>
                <button onClick={async () => { await supabase.from('transfer_invites').delete().eq('id', pendingInvite.id); fetchPendingInvite(); }} className="mt-6 w-full py-2 bg-slate-900 border border-slate-800 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all">Void Transfer</button>
              </div>
            ) : (
              <form onSubmit={initiateTransfer} className="space-y-4">
                <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-mono">Enter recipient email to execute a permanent digital deed transfer.</p>
                <input required type="email" placeholder="RECIPIENT@PROVIDER.COM" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white outline-none focus:border-red-500 font-mono uppercase" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} />
                <button disabled={isTransferring} className="w-full bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white font-black py-4 uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl">{isTransferring ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Execute Deed Transfer'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}