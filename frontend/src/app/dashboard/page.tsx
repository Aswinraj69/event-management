'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Camera, CreditCard, DollarSign, Wallet, CalendarRange, Palette, Save, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { selectUser } from '@/store/slices/authSlice';
import { useGetInvoiceStatsQuery, useGetBrandingQuery, useUpdateBrandingMutation } from '@/store/api/eventoApi';

export default function DashboardPage() {
  const user = useSelector(selectUser);
  const isAdmin = user?.role === 'COMPANY_ADMIN';

  const { data: stats = { totalRevenue: 0, totalOutstanding: 0, paidInvoicesCount: 0, pendingInvoicesCount: 0 }, isLoading: statsLoading } = useGetInvoiceStatsQuery();
  const { data: brandingData, isLoading: brandingLoading } = useGetBrandingQuery();
  const [updateBranding, { isLoading: savingBranding }] = useUpdateBrandingMutation();

  const [branding, setBranding] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync local form state from fetched branding
  const localBranding = branding ?? (brandingData ? {
    name: brandingData.name,
    logoUrl: brandingData.logoUrl || '',
    faviconUrl: brandingData.faviconUrl || '',
    address: brandingData.address || '',
    vatNumber: brandingData.vatNumber || '',
    website: brandingData.website || '',
    brandColors: brandingData.brandColors || { primary: '#8b5cf6' },
  } : null);

  const primaryColor = localBranding?.brandColors?.primary || '#8b5cf6';

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBranding((prev: any) => ({ ...(prev ?? localBranding), [name]: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranding((prev: any) => ({ ...(prev ?? localBranding), brandColors: { primary: e.target.value } }));
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updateBranding(localBranding).unwrap();
      setSuccessMsg('Branding settings saved successfully! Reload the portal to see theme updates.');
      const u = localStorage.getItem('evento_user');
      if (u) {
        const parsed = JSON.parse(u);
        parsed.companyName = localBranding.name;
        localStorage.setItem('evento_user', JSON.stringify(parsed));
      }
    } catch {
      alert('Failed to save branding customizations');
    }
  };

  const chartData = [
    { month: 'Jan', revenue: stats.totalRevenue * 0.15 },
    { month: 'Feb', revenue: stats.totalRevenue * 0.35 },
    { month: 'Mar', revenue: stats.totalRevenue * 0.60 },
    { month: 'Apr', revenue: stats.totalRevenue * 0.85 },
    { month: 'May', revenue: stats.totalRevenue },
  ];

  if (statsLoading || brandingLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here is a summary of your operations and invoices.</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `AED ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', note: 'Cumulative payments received' },
          { label: 'Outstanding Balance', value: `AED ${stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', note: 'Uncollected invoice dues' },
          { label: 'Paid Invoices', value: stats.paidInvoicesCount, icon: CreditCard, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', note: 'Settled client accounts' },
          { label: 'Pending Accounts', value: stats.pendingInvoicesCount, icon: CalendarRange, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', note: 'Unpaid / partially paid entries' },
        ].map(({ label, value, icon: Icon, color, bg, note }) => (
          <div key={label} className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
              </div>
              <div className={`p-2 border rounded-xl ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
            </div>
            <span className={`text-[10px] font-semibold block ${color}`}>{note}</span>
          </div>
        ))}
      </div>

      {/* Chart + Tenant Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl lg:col-span-2">
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f0f13', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (AED)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Tenant Parameters</h4>
            <div className="space-y-4 text-xs">
              {[
                { label: 'Instance Domain', value: `${(localBranding?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.evento.com` },
                { label: 'VAT Reg Number', value: localBranding?.vatNumber || 'Not Configured' },
                { label: 'Office Location', value: localBranding?.address || 'Not Configured' },
                { label: 'Corporate Email', value: user?.email },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-white text-right truncate max-w-[150px]">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 p-4 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
            <Palette className="w-5 h-5 text-violet-400 shrink-0" />
            <div className="text-[10px] text-gray-400 leading-normal">
              Theme updates automatically propagate to your emails, quotation sheets, invoices, and login portals.
            </div>
          </div>
        </div>
      </div>

      {/* Branding Module */}
      {isAdmin && localBranding && (
        <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-8 rounded-2xl">
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl"><Palette className="w-5 h-5" /></div>
              <div>
                <h3 className="text-lg font-bold text-white">Company Branding Module</h3>
                <p className="text-xs text-gray-500 mt-0.5">Customize your company logo, color tokens, and corporate details.</p>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-medium">{successMsg}</div>
          )}

          <form onSubmit={handleSaveBranding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Company Name', name: 'name', value: localBranding.name, required: true },
                { label: 'Corporate Website', name: 'website', value: localBranding.website },
                { label: 'VAT Number', name: 'vatNumber', value: localBranding.vatNumber },
              ].map(({ label, name, value, required }) => (
                <div key={name}>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
                  <input type="text" name={name} required={required} value={value} onChange={handleBrandingChange}
                    className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Logo URL</label>
                <input type="text" name="logoUrl" placeholder="https://..." value={localBranding.logoUrl} onChange={handleBrandingChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Brand Color</label>
                <div className="flex gap-3">
                  <input type="color" value={primaryColor} onChange={handleColorChange} className="w-12 h-11 bg-transparent border-0 cursor-pointer shrink-0" />
                  <input type="text" value={primaryColor} onChange={handleColorChange}
                    className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white font-mono" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Office Address</label>
              <textarea name="address" rows={2} value={localBranding.address} onChange={handleBrandingChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white resize-none" />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={savingBranding}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-60">
                {savingBranding ? 'Saving Config...' : <><Save className="w-4 h-4" /> Save Branding Settings</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
