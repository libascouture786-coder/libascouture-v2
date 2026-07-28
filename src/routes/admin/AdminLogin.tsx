import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getImage } from '@/config/images';
import { validateEmail } from '@/lib/validation';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    setError(null);
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error!);
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4">
      <img
        src={getImage('hero.main')}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy-950/60" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={getImage('logo')} alt="LIBAS COUTURE" className="mx-auto h-14 w-auto object-contain brightness-0 invert" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold-300">Admin Dashboard</p>
        </div>

        <div className="rounded-luxury-lg border border-ivory-200/10 bg-navy-900/80 p-8 shadow-soft-lg backdrop-blur-md">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-300/30 text-gold-300">
              <ShieldCheck size={24} strokeWidth={1.25} />
            </span>
            <h1 className="mt-4 text-h3 font-serif font-medium text-ivory-100">Sign In</h1>
            <p className="mt-1 text-sm font-light text-ivory-200/60">Access the LIBAS COUTURE admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="hidden" aria-hidden>
              <label htmlFor="admin-website">Website</label>
              <input id="admin-website" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-ivory-200/60">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory-200/30" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? 'true' : undefined}
                  className="w-full rounded-luxury border border-ivory-200/15 bg-navy-800/50 py-3 pl-11 pr-4 text-sm text-ivory-100 placeholder:text-ivory-200/30 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none"
                  placeholder="admin@libascouture.in"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-ivory-200/60">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory-200/30" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-luxury border border-ivory-200/15 bg-navy-800/50 py-3 pl-11 pr-4 text-sm text-ivory-100 placeholder:text-ivory-200/30 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-luxury bg-red-500/10 px-4 py-2.5 text-xs font-light text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-luxury bg-gold-500 py-3 text-sm font-medium uppercase tracking-[0.15em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between pt-2">
              <Link to="/" className="flex items-center gap-1 text-xs font-light text-ivory-200/40 hover:text-gold-300">
                <ArrowLeft size={12} /> Back to site
              </Link>
              <Link to="/admin/forgot-password" className="text-xs font-light text-gold-300 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-light text-ivory-200/30">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
