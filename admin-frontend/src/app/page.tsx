'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, ShieldCheck, Check, Ban, FileClock, ClipboardCopy, Building2, LogOut, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('../components/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 w-full h-full -z-10 bg-[#020617] animate-pulse" />
});

export default function SuperAdminPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('superadmin@evento.com');
  const [password, setPassword] = useState('SuperAdmin123!');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'companies'>('pending');
  const [approvedDetails, setApprovedDetails] = useState<any | null>(null);

  // Authenticate as Super Admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      if (data.user.role !== 'SUPER_ADMIN') {
        throw new Error('You are not authorized as a Super Admin');
      }
      setToken(data.access_token);
      localStorage.setItem('evento_super_token', data.access_token);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch registrations & companies
  const fetchData = async () => {
    if (!token) return;
    try {
      // Fetch registrations
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/super-admin/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const regData = await regRes.json();
      if (regRes.ok) setRegistrations(regData);

      // Fetch companies
      const compRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/super-admin/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const compData = await compRes.json();
      if (compRes.ok) setCompanies(compData);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('evento_super_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/super-admin/registrations/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Approval failed');
        return;
      }
      setApprovedDetails(data);
      fetchData();
    } catch (err) {
      alert('Network error during approval');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this registration?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/super-admin/registrations/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Network error during rejection');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/super-admin/companies/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('evento_super_token');
  };

  // 1. LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <Hero3D />
        <div className="absolute top-[20%] w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl shadow-black/50 z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg mb-4">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Super Admin Console</h2>
            <p className="text-xs text-gray-500 mt-1">Simulate SaaS platform control operations</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none text-sm text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Access Admin Platform
            </button>
          </form>

          <div className="mt-6 text-center">

          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN PORTAL SCREEN
  return (
    <div className="min-h-screen bg-transparent flex relative overflow-hidden">
      <Hero3D />
      {/* Sidebar */}
      <aside className="w-64 bg-black/50 backdrop-blur-3xl border-r border-white/10 flex flex-col justify-between p-6 z-10 relative">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-md">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              EVENTO ADMIN
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'pending' ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-black/20 backdrop-blur-xl'
              }`}
            >
              <FileClock className="w-4 h-4" />
              Pending Requests ({registrations.filter(r => r.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'companies' ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-black/20 backdrop-blur-xl'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Active Tenants ({companies.length})
            </button>
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium mt-auto"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Super Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Review onboarding requests and configure active subscription limits.</p>
          </div>
        </header>

        {/* Modal for Provisioned Credentials */}
        {approvedDetails && (
          <div className="mb-10 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tenant Successfully Provisioned!</h3>
                  <p className="text-xs text-gray-400">Database rows generated, trial subscription is active.</p>
                </div>
              </div>
              <button
                onClick={() => setApprovedDetails(null)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 p-4 rounded-xl border border-white/10 text-sm mb-4">
              <div>
                <p className="text-gray-500 text-xs">Provisioned Subdomain</p>
                <p className="font-mono text-violet-400 mt-1">{approvedDetails.subdomain}.evento.com</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Login Email</p>
                <p className="font-semibold text-white mt-1">{approvedDetails.adminEmail}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Temporary Password</p>
                <p className="font-mono text-white mt-1 flex items-center gap-2">
                  {approvedDetails.temporaryPassword}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(approvedDetails.temporaryPassword);
                      alert('Password copied to clipboard!');
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>
            </div>
            <Link
              href={`${process.env.NEXT_PUBLIC_TENANT_APP_URL || 'http://localhost:3000'}/login?subdomain=${approvedDetails.subdomain}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow transition-all"
            >
              Simulate Login on `{approvedDetails.subdomain}`
            </Link>
          </div>
        )}

        {/* Tab Lists */}
        {activeTab === 'pending' ? (
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              Registration Requests{' '}
              <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.1] text-xs font-semibold rounded-md">
                {registrations.filter(r => r.status === 'PENDING').length}
              </span>
            </h2>

            {registrations.filter(r => r.status === 'PENDING').length === 0 ? (
              <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-12 text-center rounded-2xl">
                <FileClock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No pending onboarding applications at this time.</p>

              </div>
            ) : (
              <div className="space-y-4">
                {registrations
                  .filter(r => r.status === 'PENDING')
                  .map((reg) => (
                    <div key={reg.id} className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 animate-fade-in">
                      <div className="flex gap-4 items-center">
                        {reg.logoUrl ? (
                          <img src={reg.logoUrl} alt="logo" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
                            {reg.companyName[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white">{reg.companyName}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Owner: {reg.ownerName} &bull; {reg.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Location: {reg.city}, {reg.country} &bull; {reg.employeeCount} Employees</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => handleReject(reg.id)}
                          className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-black/20 backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.05] rounded-xl transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(reg.id)}
                          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Provision
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-6">Provisioned SaaS Companies</h2>

            {companies.length === 0 ? (
              <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-12 text-center rounded-2xl">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No company subdomains provisioned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map((comp) => (
                  <div key={comp.id} className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col justify-between border border-white/10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-violet-600/10 rounded-lg flex items-center justify-center font-bold text-violet-400">
                          {comp.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{comp.name}</h4>
                          <span className="text-xs font-mono text-violet-400">{comp.subdomain}.evento.com</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        comp.status === 'APPROVED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {comp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.04] text-xs mb-6 text-gray-400">
                      <div>
                        <p className="text-[10px] text-gray-500">Subscription Plan</p>
                        <p className="font-semibold text-white mt-0.5">{comp.plan?.name || 'Starter'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Staff Count</p>
                        <p className="font-semibold text-white mt-0.5">{comp._count.users}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Active Events</p>
                        <p className="font-semibold text-white mt-0.5">{comp._count.events}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Link
                        href={`${process.env.NEXT_PUBLIC_TENANT_APP_URL || 'https://event-management-xi-swart.vercel.app'}/login?subdomain=${comp.subdomain}`}
                        target="_blank"
                        className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                      >
                        Portal Login &rarr;
                      </Link>

                      <button
                        onClick={() => handleToggleStatus(comp.id, comp.status)}
                        className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all ${
                          comp.status === 'APPROVED' ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/5 hover:bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {comp.status === 'APPROVED' ? (
                          <>
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> Reactivate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
