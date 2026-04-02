import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Home, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 shadow-2xl text-center">
        <div className="bg-amber-500 p-2 rounded-sm inline-block mb-4"><Home className="text-slate-950 w-6 h-6" /></div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">CASA <span className="text-amber-500">DOSSIER</span></h1>
        <form onSubmit={handleAuth} className="space-y-4 font-mono">
          {error && <div className="text-red-500 text-[10px] border border-red-500/20 bg-red-500/5 p-3 flex items-center gap-2 uppercase italic text-left"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          <input type="email" placeholder="EMAIL" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white focus:border-amber-500 outline-none uppercase" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-slate-950 border border-slate-800 p-4 text-xs text-white focus:border-amber-500 outline-none uppercase" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-amber-500 text-slate-950 font-black py-4 text-xs uppercase tracking-widest mt-6 shadow-lg active:scale-95 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isSignUp ? 'REGISTER' : 'AUTHORIZE')}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] hover:text-amber-500 transition-colors">
          {isSignUp ? 'Return to login' : 'Register New Property'}
        </button>
      </div>
    </div>
  );
}