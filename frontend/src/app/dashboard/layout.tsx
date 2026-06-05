'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Camera, Calendar, UserSquare2, Users2, FileText, Receipt, LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import AiAgentWidget from '@/components/AiAgentWidget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [branding, setBranding] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('evento_token');
    const savedUser = localStorage.getItem('evento_user');

    if (!token || !savedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    // Fetch branding configurations
    if (parsedUser.companyId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/company/branding`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setBranding(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('evento_token');
    localStorage.removeItem('evento_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
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
      className="min-h-screen bg-[#09090b] flex"
      style={{
        '--primary': brandPrimary,
      } as React.CSSProperties}
    >
      {/* Sidebar navigation */}
      <aside className="w-64 bg-[#0f0f13] border-r border-white/[0.05] flex flex-col justify-between p-6 z-10 shrink-0">
        <div>
          {/* Logo brand indicator */}
          <div className="flex items-center gap-3 mb-8">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-white/[0.08]" />
            ) : (
              <div className="p-1.5 rounded-md text-white" style={{ backgroundColor: brandPrimary }}>
                <Camera className="w-5 h-5" />
              </div>
            )}
            <span className="text-md font-bold tracking-tight text-white leading-tight">
              {brandName}
            </span>
          </div>

          {/* User profile identifier */}
          <div className="mb-6 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600/10 flex items-center justify-center font-bold text-[11px] text-violet-400">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block mt-0.5">{user?.role.replace('_', ' ')}</span>
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
                    active ? 'bg-white/[0.03] text-white border-l-2 border-solid' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
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
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-medium mt-auto pt-6 border-t border-white/[0.05]"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Workspace Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto relative">
        {children}
      </main>

      {/* Global AI Assistant Widget */}
      <AiAgentWidget brandColor={brandPrimary} />
    </div>
  );
}
