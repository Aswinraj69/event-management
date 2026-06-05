'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera, ShieldCheck, Check, Ban, FileClock, ClipboardCopy, Building2,
  LogOut, Loader2, LayoutDashboard, Users, Activity, Search, RefreshCw,
  TrendingUp, ChevronRight, ArrowUpRight, Eye, MoreHorizontal, Filter,
  Globe, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Zap,
  BarChart3, PieChart, ExternalLink, ChevronDown, UserCheck
} from 'lucide-react';
import CosmicBackground from '../components/Hero3D';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app';
const TENANT_URL = process.env.NEXT_PUBLIC_TENANT_APP_URL || 'https://event-management-xi-swart.vercel.app';

type Section = 'overview' | 'registrations' | 'companies' | 'users' | 'stats';

const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',       label: 'Overview',        icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'registrations',  label: 'Registrations',   icon: <FileClock className="w-4 h-4" /> },
  { key: 'companies',      label: 'Companies',        icon: <Building2 className="w-4 h-4" /> },
  { key: 'users',          label: 'Users',            icon: <Users className="w-4 h-4" /> },
  { key: 'stats',          label: 'Platform Stats',   icon: <BarChart3 className="w-4 h-4" /> },
];

const STATUS_COLORS: Record<string, string> = {
  APPROVED:  'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  PENDING:   'bg-amber-500/10  border border-amber-500/30  text-amber-400',
  SUSPENDED: 'bg-red-500/10    border border-red-500/30    text-red-400',
  DELETED:   'bg-gray-500/10   border border-gray-500/30   text-gray-400',
  REJECTED:  'bg-red-500/10    border border-red-500/30    text-red-400',
  TRIALING:  'bg-blue-500/10   border border-blue-500/30   text-blue-400',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  APPROVED:  <CheckCircle2 className="w-3 h-3" />,
  PENDING:   <Clock className="w-3 h-3" />,
  SUSPENDED: <AlertCircle className="w-3 h-3" />,
  DELETED:   <XCircle className="w-3 h-3" />,
  REJECTED:  <XCircle className="w-3 h-3" />,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[status] ?? STATUS_COLORS.PENDING}`}>
      {STATUS_ICON[status]}
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: number | string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Avatar({ name, logoUrl }: { name: string; logoUrl?: string }) {
  if (logoUrl) return <img src={logoUrl} alt={name} className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0" />;
  return (
    <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function formatDate(d: string | Date) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── OVERVIEW SECTION ───────────────────────────────────────────────────────
function OverviewSection({ stats, registrations, companies, onNavigate }: {
  stats: any; registrations: any[]; companies: any[]; onNavigate: (s: Section) => void;
}) {
  const pending = registrations.filter(r => r.status === 'PENDING');
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Companies"     value={stats?.totalCompanies ?? companies.length}    sub="All provisioned tenants"    icon={<Building2 className="w-4 h-4 text-violet-400" />}  color="bg-violet-500/10" />
        <StatCard label="Pending Requests"    value={stats?.pendingRegistrations ?? pending.length} sub="Awaiting your review"        icon={<Clock className="w-4 h-4 text-amber-400" />}      color="bg-amber-500/10" />
        <StatCard label="Total Users"         value={stats?.totalUsers ?? '—'}                     sub="Across all companies"        icon={<Users className="w-4 h-4 text-cyan-400" />}       color="bg-cyan-500/10" />
        <StatCard label="Total Events"        value={stats?.totalEvents ?? '—'}                    sub="Managed on platform"         icon={<Calendar className="w-4 h-4 text-pink-400" />}    color="bg-pink-500/10" />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Approved Companies"  value={stats?.approvedCompanies ?? '—'}   sub="Active tenants"         icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} color="bg-emerald-500/10" />
        <StatCard label="Suspended"           value={stats?.suspendedCompanies ?? '—'}  sub="Inactive tenants"       icon={<Ban className="w-4 h-4 text-red-400" />}              color="bg-red-500/10" />
        <StatCard label="Total Clients"       value={stats?.totalClients ?? '—'}        sub="Across all companies"   icon={<UserCheck className="w-4 h-4 text-indigo-400" />}     color="bg-indigo-500/10" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white">Recent Registrations</h3>
            <button onClick={() => onNavigate('registrations')} className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {(stats?.recentRegistrations ?? registrations).slice(0, 5).map((reg: any) => (
              <div key={reg.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors">
                <Avatar name={reg.companyName} logoUrl={reg.logoUrl} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{reg.companyName}</p>
                  <p className="text-xs text-gray-500 truncate">{reg.ownerName} · {formatDate(reg.createdAt)}</p>
                </div>
                <StatusBadge status={reg.status} />
              </div>
            ))}
            {!registrations.length && (
              <p className="text-sm text-gray-500 text-center py-6">No registrations yet.</p>
            )}
          </div>
        </div>

        {/* Company Status Breakdown */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white">Company Breakdown</h3>
            <button onClick={() => onNavigate('companies')} className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-4">
            {[
              { label: 'Approved',  count: stats?.approvedCompanies  ?? companies.filter(c => c.status === 'APPROVED').length,  color: 'bg-emerald-500', total: stats?.totalCompanies || 1 },
              { label: 'Pending',   count: stats?.pendingRegistrations ?? registrations.filter(r => r.status === 'PENDING').length, color: 'bg-amber-500',   total: Math.max(stats?.totalCompanies || 1, registrations.length || 1) },
              { label: 'Suspended', count: stats?.suspendedCompanies ?? companies.filter(c => c.status === 'SUSPENDED').length, color: 'bg-red-500',     total: stats?.totalCompanies || 1 },
            ].map(({ label, count, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>{label}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, total > 0 ? (count / total) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('registrations')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all"
            >
              <FileClock className="w-3.5 h-3.5" />
              Review Requests
            </button>
            <button
              onClick={() => onNavigate('companies')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 rounded-xl transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              All Companies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTRATIONS SECTION ───────────────────────────────────────────────────
function RegistrationsSection({ registrations, onApprove, onReject }: {
  registrations: any[]; onApprove: (id: string) => void; onReject: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DELETED'>('ALL');

  const filtered = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch = !search || r.companyName.toLowerCase().includes(search.toLowerCase()) || r.ownerName?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || r.status === filter;
      return matchSearch && matchFilter;
    });
  }, [registrations, search, filter]);

  const counts = useMemo(() => ({
    ALL:     registrations.length,
    PENDING: registrations.filter(r => r.status === 'PENDING').length,
    APPROVED:registrations.filter(r => r.status === 'APPROVED').length,
    DELETED: registrations.filter(r => r.status === 'DELETED').length,
  }), [registrations]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Company Registrations</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and action all onboarding applications</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company, owner, email…"
            className="pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'DELETED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-black/20 border border-white/8 text-gray-400 hover:text-white'}`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Company</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Owner</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Location</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Employees</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Submitted</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500 text-sm">
                    <FileClock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No registrations match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map(reg => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={reg.companyName} logoUrl={reg.logoUrl} />
                        <div>
                          <p className="font-semibold text-white">{reg.companyName}</p>
                          <p className="text-xs text-gray-500">{reg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{reg.ownerName}</td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{reg.city}, {reg.country}</td>
                    <td className="px-4 py-4 text-gray-300">{reg.employeeCount ?? '—'}</td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{formatDate(reg.createdAt)}</td>
                    <td className="px-4 py-4"><StatusBadge status={reg.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {reg.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => onReject(reg.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-black/30 border border-white/8 hover:bg-white/5 rounded-lg transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => onApprove(reg.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all shadow shadow-violet-500/20"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-600 italic">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── COMPANIES SECTION ────────────────────────────────────────────────────────
function CompaniesSection({ companies, onToggleStatus }: {
  companies: any[]; onToggleStatus: (id: string, status: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'SUSPENDED' | 'PENDING'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'users'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let data = companies.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.subdomain?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || c.status === filter;
      return matchSearch && matchFilter;
    });
    data = [...data].sort((a, b) => {
      let av: any, bv: any;
      if (sortField === 'name')       { av = a.name; bv = b.name; }
      else if (sortField === 'users') { av = a._count?.users ?? 0; bv = b._count?.users ?? 0; }
      else                            { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [companies, search, filter, sortField, sortDir]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  const SortBtn = ({ field, children }: { field: typeof sortField; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-gray-300 transition-colors">
      {children}
      {sortField === field && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Companies</h2>
          <p className="text-sm text-gray-500 mt-0.5">{companies.length} provisioned tenants on the platform</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or subdomain…"
            className="pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'APPROVED', 'SUSPENDED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-black/20 border border-white/8 text-gray-400 hover:text-white'}`}
          >
            {s === 'ALL' ? `All (${companies.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${companies.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">
                  <SortBtn field="name">Company</SortBtn>
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Subscription</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">
                  <SortBtn field="createdAt">Created</SortBtn>
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">
                  <SortBtn field="users">Users</SortBtn>
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Events</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500 text-sm">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No companies match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map(comp => (
                  <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={comp.name} logoUrl={comp.logoUrl} />
                        <div>
                          <p className="font-semibold text-white">{comp.name}</p>
                          <p className="text-xs font-mono text-violet-400">{comp.subdomain}.evento.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={comp.status} /></td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium text-xs">{comp.plan?.name || 'Starter'}</p>
                        {comp.subscription?.status && (
                          <p className="text-[10px] text-gray-500 mt-0.5">{comp.subscription.status}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{formatDate(comp.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white">{comp._count?.users ?? 0}</span>
                      <span className="text-gray-600 text-xs ml-1">users</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white">{comp._count?.events ?? 0}</span>
                      <span className="text-gray-600 text-xs ml-1">events</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`${TENANT_URL}/login?subdomain=${comp.subdomain}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                          title="Open tenant portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => onToggleStatus(comp.id, comp.status)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            comp.status === 'APPROVED'
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {comp.status === 'APPROVED'
                            ? <><Ban className="w-3 h-3" /> Suspend</>
                            : <><Check className="w-3 h-3" /> Reactivate</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-500 flex justify-between items-center">
            <span>Showing <span className="text-white font-medium">{filtered.length}</span> of <span className="text-white font-medium">{companies.length}</span> companies</span>
            <span>Sorted by <span className="text-gray-300">{sortField}</span> ({sortDir})</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USERS SECTION ────────────────────────────────────────────────────────────
function UsersSection({ companies }: { companies: any[] }) {
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return companies
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b._count?.users ?? 0) - (a._count?.users ?? 0));
  }, [companies, search]);

  const totalUsers = companies.reduce((sum, c) => sum + (c._count?.users ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5"><span className="text-white font-semibold">{totalUsers}</span> total users across all companies</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by company…"
            className="pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none w-60"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Company</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Plan</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Users</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Clients</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Events</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">User Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No companies found.</td></tr>
              ) : rows.map(comp => {
                const userPct = totalUsers > 0 ? Math.round((comp._count?.users ?? 0) / totalUsers * 100) : 0;
                return (
                  <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={comp.name} logoUrl={comp.logoUrl} />
                        <div>
                          <p className="font-semibold text-white">{comp.name}</p>
                          <p className="text-xs font-mono text-violet-400">{comp.subdomain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={comp.status} /></td>
                    <td className="px-4 py-4 text-gray-300 text-xs font-medium">{comp.plan?.name || 'Starter'}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-white text-base">{comp._count?.users ?? 0}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{comp._count?.clients ?? 0}</td>
                    <td className="px-4 py-4 text-gray-300">{comp._count?.events ?? 0}</td>
                    <td className="px-4 py-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${userPct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{userPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── PLATFORM STATS SECTION ───────────────────────────────────────────────────
const CHART_COLORS = ['#7c3aed', '#2dd4bf', '#f472b6', '#f59e0b', '#60a5fa', '#34d399'];

function PlatformStatsSection({ companies, registrations, stats }: {
  companies: any[]; registrations: any[]; stats: any;
}) {
  // Plan distribution
  const planData = useMemo(() => {
    const map: Record<string, number> = {};
    companies.forEach(c => {
      const p = c.plan?.name || 'Starter';
      map[p] = (map[p] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Companies by month
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; companies: number; registrations: number }> = {};
    const addMonth = (date: string, field: 'companies' | 'registrations') => {
      if (!date) return;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { month: label, companies: 0, registrations: 0 };
      map[key][field]++;
    };
    companies.forEach(c => addMonth(c.createdAt, 'companies'));
    registrations.forEach(r => addMonth(r.createdAt, 'registrations'));
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [companies, registrations]);

  // Registration funnel
  const funnelData = [
    { name: 'Total Submitted', value: registrations.length },
    { name: 'Approved',        value: registrations.filter(r => r.status === 'APPROVED').length },
    { name: 'Active (Approved companies)', value: companies.filter(c => c.status === 'APPROVED').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Statistics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Visual breakdown of platform usage and growth</p>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Conversion Rate"   value={registrations.length > 0 ? `${Math.round(registrations.filter(r => r.status === 'APPROVED').length / registrations.length * 100)}%` : '—'} sub="Registrations → Approved" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}  color="bg-emerald-500/10" />
        <StatCard label="Avg Users/Company" value={companies.length > 0 ? Math.round(companies.reduce((s, c) => s + (c._count?.users ?? 0), 0) / companies.length) : '—'} sub="Staff per tenant" icon={<Users className="w-4 h-4 text-cyan-400" />} color="bg-cyan-500/10" />
        <StatCard label="Avg Events/Company" value={companies.length > 0 ? Math.round(companies.reduce((s, c) => s + (c._count?.events ?? 0), 0) / companies.length) : '—'} sub="Events per tenant" icon={<Calendar className="w-4 h-4 text-pink-400" />} color="bg-pink-500/10" />
        <StatCard label="Health Score" value={companies.filter(c => c.status === 'APPROVED').length > 0 ? `${Math.round(companies.filter(c => c.status === 'APPROVED').length / Math.max(companies.length, 1) * 100)}%` : '—'} sub="Active company ratio" icon={<Zap className="w-4 h-4 text-amber-400" />} color="bg-amber-500/10" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly growth */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-bold text-white mb-1">Monthly Growth</h3>
          <p className="text-xs text-gray-500 mb-5">Companies provisioned &amp; registrations received</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 700 }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Bar dataKey="companies"     name="Companies"     fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="registrations" name="Registrations" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm">Not enough data yet.</div>
          )}
        </div>

        {/* Plan distribution */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-bold text-white mb-1">Plan Distribution</h3>
          <p className="text-xs text-gray-500 mb-5">Subscription plan breakdown across tenants</p>
          {planData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RePieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {planData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>}
                />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm">No companies provisioned yet.</div>
          )}
        </div>
      </div>

      {/* Registration Funnel */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-bold text-white mb-1">Registration Funnel</h3>
        <p className="text-xs text-gray-500 mb-6">From application submission to active company</p>
        <div className="flex items-end gap-4">
          {funnelData.map((item, idx) => {
            const max = funnelData[0].value || 1;
            const pct = Math.round(item.value / max * 100);
            return (
              <div key={idx} className="flex-1 text-center">
                <div className="flex items-end justify-center mb-2" style={{ height: '120px' }}>
                  <div
                    className="w-full rounded-t-xl transition-all duration-700"
                    style={{
                      height: `${Math.max(8, pct)}%`,
                      background: `linear-gradient(180deg, ${CHART_COLORS[idx]}, ${CHART_COLORS[idx]}99)`,
                    }}
                  />
                </div>
                <p className="text-2xl font-extrabold text-white">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.name}</p>
                {idx > 0 && (
                  <p className="text-xs font-semibold mt-1" style={{ color: CHART_COLORS[idx] }}>{pct}% of total</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [token, setToken]       = useState('');
  const [email, setEmail]       = useState('superadmin@evento.com');
  const [password, setPassword] = useState('SuperAdmin123!');
  const [loading, setLoading]   = useState(false);
  const [loginError, setLoginError] = useState('');

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [companies,     setCompanies]     = useState<any[]>([]);
  const [stats,         setStats]         = useState<any>(null);
  const [section,       setSection]       = useState<Section>('overview');
  const [approvedDetails, setApprovedDetails] = useState<any | null>(null);
  const [refreshing, setRefreshing]       = useState(false);

  // ── Auth ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setLoginError('');
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.user.role !== 'SUPER_ADMIN') throw new Error('You are not authorized as a Super Admin');
      setToken(data.access_token);
      localStorage.setItem('evento_super_token', data.access_token);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const logout = () => { setToken(''); localStorage.removeItem('evento_super_token'); };

  // ── Data fetching ──
  const fetchData = async (tkn = token) => {
    if (!tkn) return;
    setRefreshing(true);
    try {
      const [regRes, compRes, statsRes] = await Promise.all([
        fetch(`${API}/api/super-admin/registrations`, { headers: { Authorization: `Bearer ${tkn}` } }),
        fetch(`${API}/api/super-admin/companies`,     { headers: { Authorization: `Bearer ${tkn}` } }),
        fetch(`${API}/api/super-admin/stats`,         { headers: { Authorization: `Bearer ${tkn}` } }),
      ]);
      if (regRes.ok)   setRegistrations(await regRes.json());
      if (compRes.ok)  setCompanies(await compRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) { console.error('Error fetching admin data', err); }
    finally { setRefreshing(false); }
  };

  useEffect(() => {
    const saved = localStorage.getItem('evento_super_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => { if (token) fetchData(token); }, [token]);

  // ── Actions ──
  const handleApprove = async (id: string) => {
    try {
      const res  = await fetch(`${API}/api/super-admin/registrations/${id}/approve`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Approval failed'); return; }
      setApprovedDetails(data);
      fetchData();
    } catch { alert('Network error during approval'); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this registration?')) return;
    try {
      const res = await fetch(`${API}/api/super-admin/registrations/${id}/reject`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
    } catch { alert('Network error during rejection'); }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      const res = await fetch(`${API}/api/super-admin/companies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchData();
    } catch { alert('Error updating status'); }
  };

  // ── Login screen ──
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <CosmicBackground />
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl shadow-black/50 z-10 animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg mb-4 glow-violet">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Super Admin Console</h2>
            <p className="text-xs text-gray-500 mt-1">EVENTO Platform Control Centre</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none text-sm text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none text-sm text-white transition-colors"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md shadow-violet-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Access Admin Platform
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  const pendingCount = registrations.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <CosmicBackground />

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 glass-sidebar flex flex-col justify-between py-6 z-20 relative">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2.5 px-6 mb-8">
            <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-md shadow glow-violet">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">EVENTO</span>
              <p className="text-[10px] text-gray-500 -mt-0.5">Super Admin</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map(({ key, label, icon }) => {
              const isActive = section === key;
              const badge = key === 'registrations' && pendingCount > 0 ? pendingCount : null;
              return (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-violet-400' : ''}>{icon}</span>
                    {label}
                  </div>
                  {badge && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="px-3 space-y-1">
          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-violet-400' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              {NAV_ITEMS.find(n => n.key === section)?.label}
            </h1>
            <p className="text-xs text-gray-500">
              {section === 'overview'      && 'Platform overview — all key metrics at a glance'}
              {section === 'registrations' && `${registrations.length} total · ${pendingCount} pending review`}
              {section === 'companies'     && `${companies.length} provisioned tenants`}
              {section === 'users'         && `${companies.reduce((s, c) => s + (c._count?.users ?? 0), 0)} total users across all companies`}
              {section === 'stats'         && 'Charts and analytics for the whole platform'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Provisioning success modal */}
          {approvedDetails && (
            <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Tenant Successfully Provisioned!</h3>
                    <p className="text-xs text-gray-400">30-day trial subscription is now active.</p>
                  </div>
                </div>
                <button onClick={() => setApprovedDetails(null)} className="text-gray-500 hover:text-white text-xs">Dismiss</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 p-4 rounded-xl border border-white/10 text-sm mb-4">
                <div>
                  <p className="text-gray-500 text-xs">Subdomain</p>
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
                      onClick={() => { navigator.clipboard.writeText(approvedDetails.temporaryPassword); alert('Copied!'); }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <ClipboardCopy className="w-3.5 h-3.5" />
                    </button>
                  </p>
                </div>
              </div>
              <Link
                href={`${TENANT_URL}/login?subdomain=${approvedDetails.subdomain}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Tenant Portal → {approvedDetails.subdomain}
              </Link>
            </div>
          )}

          {/* Sections */}
          {section === 'overview'      && <OverviewSection stats={stats} registrations={registrations} companies={companies} onNavigate={setSection} />}
          {section === 'registrations' && <RegistrationsSection registrations={registrations} onApprove={handleApprove} onReject={handleReject} />}
          {section === 'companies'     && <CompaniesSection companies={companies} onToggleStatus={handleToggleStatus} />}
          {section === 'users'         && <UsersSection companies={companies} />}
          {section === 'stats'         && <PlatformStatsSection companies={companies} registrations={registrations} stats={stats} />}
        </div>
      </main>
    </div>
  );
}
