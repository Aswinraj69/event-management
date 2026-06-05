'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, Building2, UserSquare2, Eye, EyeOff, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import CosmicBackground from '../../components/Hero3D';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSubdomain = searchParams.get('subdomain') || '';

  const [subdomain, setSubdomain] = useState(initialSubdomain);
  const [subdomainResolved, setSubdomainResolved] = useState(false);
  const [branding, setBranding] = useState<any | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill logins for testing
  const [demoRole, setDemoRole] = useState<'admin' | 'staff' | ''>('');

  // Fetch company branding if subdomain is specified
  const resolveSubdomainBranding = async (sub: string) => {
    if (!sub) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/company/public/${sub}`);
      if (!res.ok) {
        throw new Error('Subdomain not registered');
      }
      const data = await res.json();
      setBranding(data);
      setSubdomainResolved(true);
      setError('');
    } catch (err: any) {
      setBranding(null);
      setSubdomainResolved(false);
      setError(`Subdomain "${sub}" is not active or registered. Go to Super Admin to approve registrations.`);
    }
  };

  useEffect(() => {
    if (initialSubdomain) {
      resolveSubdomainBranding(initialSubdomain);
    }
  }, [initialSubdomain]);

  const handleSubdomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomain) {
      resolveSubdomainBranding(subdomain.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save credentials context
      localStorage.setItem('evento_token', data.access_token);
      localStorage.setItem('evento_user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Connection to backend API failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to auto-fill common testing credentials
  const autofillDemoCredentials = (role: 'admin' | 'staff') => {
    setDemoRole(role);
    if (role === 'admin') {
      setEmail('owner@shutter.com'); // standard seed values or custom ones
      setPassword('Welcome123!');
    } else {
      setEmail('staff@shutter.com');
      setPassword('UserWelcome123!');
    }
  };

  // 1. STEP ONE: RESOLVE SUBDOMAIN CONTEXT (if not loaded yet)
  if (!subdomainResolved) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-6 relative">
        <div className="absolute top-[20%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl shadow-black/50 z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg mb-4">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">EVENTO SaaS</h2>
            <p className="text-xs text-gray-500 mt-1">Enter your company subdomain to enter your workspace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubdomainSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Subdomain</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    placeholder="e.g. shutter"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none text-sm text-white pr-28"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-gray-500 font-medium">.evento.com</span>
                </div>
                <button
                  type="submit"
                  className="px-5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Go
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 flex justify-between text-xs text-gray-500">
            <Link href="/register" className="hover:text-white transition-colors">
              Need a company instance? Register
            </Link>
            <Link href="/super-admin" className="hover:text-white transition-colors">
              Platform Admin Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. STEP TWO: RENDER CUSTOM BRANDED PORTAL LOGIN SCREEN
  // Standard brandColors custom styling fallback
  const brandPrimary = branding?.brandColors?.primary || '#8b5cf6';

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <CosmicBackground />
      {/* Dynamic glow using company primary brand color */}
      <div
        className="absolute top-[20%] w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: brandPrimary }}
      />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl shadow-black/50 z-10 animate-fade-in">
        <button
          onClick={() => {
            setSubdomainResolved(false);
            setBranding(null);
          }}
          className="text-xs text-gray-500 hover:text-white mb-6 transition-all"
        >
          &larr; Switch Subdomain
        </button>

        <div className="flex flex-col items-center mb-8">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-cover mb-4 border border-white/[0.08]" />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl mb-4"
              style={{ backgroundColor: brandPrimary }}
            >
              {branding.name[0].toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-bold text-white tracking-tight">{branding.name}</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">{branding.subdomain}.evento.com</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Work Email</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none text-sm text-white focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none text-sm text-white pr-12 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white text-sm font-semibold rounded-xl hover:opacity-95 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: brandPrimary }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In to Dashboard
          </button>
        </form>

        {/* TESTING SHORTCUTS WIDGET */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="p-4 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl">
            <h4 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1.5">
              <UserSquare2 className="w-3.5 h-3.5" /> Simulation Autofill Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => autofillDemoCredentials('admin')}
                className={`py-2 px-3 text-left rounded-lg border text-xs font-medium transition-all ${
                  demoRole === 'admin' ? 'bg-violet-600/10 border-violet-500/40 text-violet-400' : 'bg-black/30 border-white/10 hover:bg-black/50 text-gray-400'
                }`}
              >
                <span className="block font-semibold text-white">Company Admin</span>
                <span className="text-[10px] text-gray-500">owner@shutter.com</span>
              </button>
              <button
                onClick={() => autofillDemoCredentials('staff')}
                className={`py-2 px-3 text-left rounded-lg border text-xs font-medium transition-all ${
                  demoRole === 'staff' ? 'bg-violet-600/10 border-violet-500/40 text-violet-400' : 'bg-black/30 border-white/10 hover:bg-black/50 text-gray-400'
                }`}
              >
                <span className="block font-semibold text-white">Roster Staff</span>
                <span className="text-[10px] text-gray-500">staff@shutter.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center bg-[#020617]"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
