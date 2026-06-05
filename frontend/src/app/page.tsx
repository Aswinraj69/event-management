'use client';

import Link from 'next/link';
import { ArrowRight, Camera, ShieldCheck, CalendarDays, FileText, Zap, Star } from 'lucide-react';
import CosmicBackground from '../components/Hero3D';

const features = [
  {
    icon: ShieldCheck,
    color: 'violet',
    title: 'Multi-Tenant Isolation',
    desc: 'Each studio gets a dedicated subdomain, scoped DB queries, personalized branding, logos and dashboard configurations.',
  },
  {
    icon: CalendarDays,
    color: 'cyan',
    title: 'Roster Conflict Prevention',
    desc: 'Assign staff to shoots in real-time. Automated double-booking checks keep your operations gap-free.',
  },
  {
    icon: FileText,
    color: 'pink',
    title: 'Sleek Invoicing & VAT',
    desc: 'Auto-generate quotations and tax invoices with QR verification codes. Track deposits and balances dynamically.',
  },
  {
    icon: Zap,
    color: 'amber',
    title: 'Instant Provisioning',
    desc: 'Super Admin approves your request and your isolated platform is live in seconds — no DevOps required.',
  },
  {
    icon: Camera,
    color: 'indigo',
    title: 'Studio-First Design',
    desc: 'Built from the ground up for photostudios, videographers, and wedding planners — not generic businesses.',
  },
  {
    icon: Star,
    color: 'emerald',
    title: 'Premium Analytics',
    desc: 'Crystal-clear revenue dashboards, event utilisation charts, and employee performance at a glance.',
  },
];

const colorMap: Record<string, string> = {
  violet: 'bg-violet-500/15 border-violet-500/25 text-violet-300',
  cyan: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300',
  pink: 'bg-pink-500/15 border-pink-500/25 text-pink-300',
  amber: 'bg-amber-500/15 border-amber-500/25 text-amber-300',
  indigo: 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300',
  emerald: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      {/* Animated 3D cosmic background */}
      <CosmicBackground />

      {/* Noise/grain overlay for depth */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
        <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-lg">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wider text-white">EVENTO</span>
        </div>

        <div className="glass-panel px-6 py-2.5 rounded-2xl flex items-center gap-6">
          <Link href="/login" className="text-sm text-gray-300 hover:text-white font-medium transition-colors">Portal Login</Link>
          <Link
            href="/register"
            className="btn-cosmic text-sm px-5 py-2 rounded-xl"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-16">
        {/* Badge */}
        <div className="glass-panel inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold text-violet-300 border-violet-500/20 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Introducing EVENTO Multi-Tenant Platform
        </div>

        {/* Hero headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6 animate-fade-in"
          style={{ animationDelay: '80ms' }}
        >
          The Operating{' '}
          <br className="hidden md:block" />
          System for{' '}
          <span className="text-gradient-hero">
            <br className="hidden md:block" />
            Event Management
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
          style={{ animationDelay: '160ms' }}
        >
          Manage photostudios, videographers, wedding planners, schedules,
          invoices and roster assignments — all from one breathtaking interface.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mb-20 animate-fade-in"
          style={{ animationDelay: '240ms' }}
        >
          <Link href="/register" className="btn-cosmic px-8 py-4 rounded-2xl text-base">
            Launch Your Platform <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="glass-panel glass-panel-hover px-8 py-4 rounded-2xl text-sm font-semibold text-gray-200 transition-all hover:text-white"
          >
            Access Existing Portal
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="glass-panel px-8 py-5 rounded-2xl flex flex-col sm:flex-row items-center gap-8 animate-fade-in"
          style={{ animationDelay: '320ms' }}
        >
          {[
            { value: '500+', label: 'Studios Onboarded' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<1s', label: 'Provisioning Time' },
            { value: 'SOC2', label: 'Compliant' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="relative z-10 px-6 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Everything your studio{' '}
            <span className="text-gradient-violet">needs to scale</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            A full-stack SaaS platform engineered for event-driven businesses that demand reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="glass-panel glass-panel-hover p-7 rounded-3xl animate-fade-in"
            >
              <div className={`w-12 h-12 flex items-center justify-center border rounded-2xl mb-5 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-xs text-gray-600 tracking-widest uppercase font-medium">
          © 2026 EVENTO SaaS Systems — Built for Elite Event Companies Globally
        </p>
      </footer>
    </div>
  );
}
