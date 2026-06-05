'use client';

import { useState, useEffect } from 'react';
import { Camera, CreditCard, DollarSign, Wallet, CalendarRange, Palette, Save, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOutstanding: 0,
    paidInvoicesCount: 0,
    pendingInvoicesCount: 0,
  });

  const [branding, setBranding] = useState<any>({
    name: '',
    logoUrl: '',
    faviconUrl: '',
    address: '',
    vatNumber: '',
    website: '',
    brandColors: { primary: '#8b5cf6' }
  });

  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [user, setUser] = useState<any | null>(null);

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/invoices/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading invoicing stats', err);
    }
  };

  const fetchBranding = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/company/branding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBranding({
          name: data.name,
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          address: data.address || '',
          vatNumber: data.vatNumber || '',
          website: data.website || '',
          brandColors: data.brandColors || { primary: '#8b5cf6' }
        });
      }
    } catch (err) {
      console.error('Error loading branding details', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('evento_token');
    const savedUser = localStorage.getItem('evento_user');

    if (token) {
      if (savedUser) setUser(JSON.parse(savedUser));
      Promise.all([fetchStats(token), fetchBranding(token)]).finally(() => setLoading(false));
    }
  }, []);

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBranding((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setBranding((prev: any) => ({
      ...prev,
      brandColors: { primary: value }
    }));
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranding(true);
    setSuccessMsg('');
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/company/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(branding),
      });

      if (res.ok) {
        setSuccessMsg('Branding settings saved successfully! Reload the portal to see theme updates.');
        // Force header branding update in local storage if necessary
        const u = localStorage.getItem('evento_user');
        if (u) {
          const parsed = JSON.parse(u);
          parsed.companyName = branding.name;
          localStorage.setItem('evento_user', JSON.stringify(parsed));
        }
      }
    } catch (err) {
      alert('Failed to save branding customizations');
    } finally {
      setSavingBranding(false);
    }
  };

  // Mock revenue chart points
  const chartData = [
    { month: 'Jan', revenue: stats.totalRevenue * 0.15 },
    { month: 'Feb', revenue: stats.totalRevenue * 0.35 },
    { month: 'Mar', revenue: stats.totalRevenue * 0.60 },
    { month: 'Apr', revenue: stats.totalRevenue * 0.85 },
    { month: 'May', revenue: stats.totalRevenue },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  const primaryColor = branding?.brandColors?.primary || '#8b5cf6';
  const isAdmin = user?.role === 'COMPANY_ADMIN';

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here is a summary of your operations and invoices.</p>
      </header>

      {/* Numerical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">AED {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">Cumulative payments received</span>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Outstanding Balance</p>
              <h3 className="text-2xl font-bold text-white mt-1">AED {stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold block">Uncollected invoice dues</span>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Paid Invoices</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.paidInvoicesCount}</h3>
            </div>
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-violet-400 font-semibold block">Settled client accounts</span>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Accounts</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingInvoicesCount}</h3>
            </div>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold block">Unpaid / partially paid entries</span>
        </div>
      </div>

      {/* Visual Chart and Activity layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Revenue Growth Trend</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.3)" fontSize={11} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f0f13', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (AED)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Settings Summary */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Tenant Parameters</h4>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-gray-500">Instance Domain</span>
                <span className="font-mono text-white text-right">{branding.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.evento.com</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-gray-500">VAT Reg Number</span>
                <span className="font-semibold text-white text-right">{branding.vatNumber || 'Not Configured'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-gray-500">Office Location</span>
                <span className="font-semibold text-white text-right truncate max-w-[150px]">{branding.address || 'Not Configured'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-gray-500">Corporate Email</span>
                <span className="font-semibold text-white text-right">{user?.email}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl flex items-center gap-3">
            <Palette className="w-5 h-5 text-violet-400 shrink-0" />
            <div className="text-[10px] text-gray-400 leading-normal">
              Theme updates automatically propagate to your emails, quotation sheets, invoices, and login portals.
            </div>
          </div>
        </div>
      </div>

      {/* Branding Configuration Dashboard Module */}
      {isAdmin && (
        <div className="glass-panel p-8 rounded-2xl">
          <div className="mb-6 flex items-center justify-between border-b border-white/[0.05] pb-4">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Company Branding Module</h3>
                <p className="text-xs text-gray-500 mt-0.5">Customize your company logo, color tokens, and corporate details.</p>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSaveBranding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={branding.name}
                  onChange={handleBrandingChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Corporate Website</label>
                <input
                  type="text"
                  name="website"
                  value={branding.website}
                  onChange={handleBrandingChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">VAT Number</label>
                <input
                  type="text"
                  name="vatNumber"
                  value={branding.vatNumber}
                  onChange={handleBrandingChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Logo URL (Unsplash or direct asset)</label>
                <input
                  type="text"
                  name="logoUrl"
                  placeholder="https://..."
                  value={branding.logoUrl}
                  onChange={handleBrandingChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Brand Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={handleColorChange}
                    className="w-12 h-11 bg-transparent border-0 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={handleColorChange}
                    className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Office Address</label>
              <textarea
                name="address"
                rows={2}
                value={branding.address}
                onChange={handleBrandingChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingBranding}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
              >
                {savingBranding ? (
                  <>Saving Config...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Branding Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
