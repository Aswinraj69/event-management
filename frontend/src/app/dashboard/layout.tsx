'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Calendar, UserSquare2, Users2, FileText, Receipt, LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import AiAgentWidget from '@/components/AiAgentWidget';
import { initAuth, logout, selectUser } from '@/store/slices/authSlice';
import { useGetBrandingQuery } from '@/store/api/eventoApi';
import type { AppDispatch } from '@/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  // Hydrate auth from localStorage once on mount
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  // Redirect if no token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('evento_token');
      if (!token) router.push('/login');
    }
  }, [router]);

  // Fetch branding via RTK Query (cached globally — not re-fetched on page switch)
  const { data: branding, isLoading: brandingLoading } = useGetBrandingQuery(undefined, {
    skip: !user,
  });

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!user || brandingLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const brandPrimary = branding?.brandColors?.primary || '#8b5cf6';
  const brandName = branding?.name || user?.companyName || 'EVENTO Workspace';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['COMPANY_ADMIN', 'EMPLOYEE', 'FREELANCER'] },
    { name: 'Events Manager', path: '/dashboard/events', icon: Calendar, roles: ['COMPANY_ADMIN', 'EMPLOYEE', 'FREELANCER'] },
    { name: 'Master Calendar', path: '/dashboard/calendar', icon: Calendar, roles: ['COMPANY_ADMIN', 'EMPLOYEE', 'FREELANCER'] },
    { name: 'Availability', path: '/dashboard/availability', icon: Calendar, roles: ['COMPANY_ADMIN', 'EMPLOYEE', 'FREELANCER'] },
    { name: 'Clients Directory', path: '/dashboard/clients', icon: Users2, roles: ['COMPANY_ADMIN'] },
    { name: 'Employees Roster', path: '/dashboard/employees', icon: UserSquare2, roles: ['COMPANY_ADMIN', 'EMPLOYEE', 'FREELANCER'] },
    { name: 'Quotations', path: '/dashboard/quotations', icon: FileText, roles: ['COMPANY_ADMIN'] },
    { name: 'Invoices & Billing', path: '/dashboard/invoices', icon: Receipt, roles: ['COMPANY_ADMIN'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div
      className="min-h-screen bg-transparent flex relative"
      style={{ '--primary': brandPrimary } as React.CSSProperties}
    >
      {/* Deep cosmic background */}
      <div className="fixed inset-0 -z-10 bg-[#020617]" />
      <div className="fixed inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(45,212,191,0.08) 0%, transparent 60%)' }} />

      {/* Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col justify-between p-6 z-10 shrink-0">
        <div>
          {/* Brand logo */}
          <div className="flex items-center gap-3 mb-8">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-white/[0.08]" />
            ) : (
              <div className="p-1.5 rounded-md text-white" style={{ backgroundColor: brandPrimary }}>
                <Camera className="w-5 h-5" />
              </div>
            )}
            <span className="text-md font-bold tracking-tight text-white leading-tight">{brandName}</span>
          </div>

          {/* User profile */}
          <div className="mb-6 p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600/10 flex items-center justify-center font-bold text-[11px] text-violet-400">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block mt-0.5">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-medium rounded-xl transition-all ${
                    active ? 'bg-white/[0.03] text-white border-l-2 border-solid' : 'text-gray-400 hover:text-white hover:bg-black/10 backdrop-blur-md'
                  }`}
                  style={{ borderLeftColor: active ? brandPrimary : 'transparent' }}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-medium mt-auto pt-6 border-t border-white/10"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto relative z-10">
        {children}
      </main>

      <AiAgentWidget brandColor={brandPrimary} />
    </div>
  );
}
