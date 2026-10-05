import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '@/lib/auth';
import { Truck, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) navigate('/admin', { replace: true });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) { setError('Please fill in both fields.'); return; }
    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    if (result.ok) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error ?? 'Invalid credentials.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">CARGO</span>
              <span className="text-orange-400 font-black text-xl tracking-tight"> DHL</span>
            </div>
          </div>

          <h1 className="text-white font-bold text-2xl mb-1">Admin Portal</h1>
          <p className="text-white/40 text-sm mb-7">Sign in to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] text-sm shadow-lg shadow-orange-500/25 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/25 text-xs">
              Default: <span className="font-mono text-white/40">admin</span> / <span className="font-mono text-white/40">Admin@CargoDHL2026</span>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          Secured with SHA-256 · Rate limited · Session-only storage
        </p>
      </div>
    </div>
  );
}
