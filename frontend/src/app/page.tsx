'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Camera, Shield, FileText, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { Suspense } from 'react';

// Dynamically import the 3D scene to prevent SSR issues
const Hero3D = dynamic(() => import('../components/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 w-full h-full -z-10 bg-gray-50 animate-pulse" />
});

export default function HomePage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-gray-50 text-gray-900 selection:bg-violet-500/30">
      {/* Dynamic 3D Background */}
      <Hero3D />

      {/* Navigation Header */}
      <header className="absolute top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20 backdrop-blur-md">
            <Camera className="w-6 h-6 text-gray-900" />
          </div>
          <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
            EVENTO
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors drop-shadow-md">
            Portal Login
          </Link>
          <Link href="/register" className="px-6 py-2.5 text-sm font-bold text-gray-900 bg-gray-200 hover:bg-gray-300 border border-white/20 backdrop-blur-xl rounded-full shadow-xl transition-all hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content Overlay */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 backdrop-blur-md rounded-full text-xs font-semibold text-violet-300 mb-8 animate-fade-in drop-shadow-xl">
          <Sparkles className="w-4 h-4 text-violet-400" /> Introducing EVENTO Multi-Tenant Platform
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter max-w-5xl mx-auto leading-[1.1] mb-8 drop-shadow-2xl">
          The Operating System for{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Event Management
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed font-medium drop-shadow-md">
          Manage photostudios, videographers, wedding planners, schedules, invoices, and roster assignments from a premium single-tenant interface.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-24 w-full">
          <Link href="/register" className="group flex items-center justify-center gap-2 px-10 py-5 w-full sm:w-auto font-bold text-lg text-gray-900 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl hover:opacity-90 shadow-2xl shadow-violet-600/30 transition-all hover:scale-105">
            Register Company <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="flex items-center justify-center gap-2 px-10 py-5 w-full sm:w-auto font-bold text-lg text-gray-900 bg-gray-100 border border-gray-200 hover:bg-gray-200 backdrop-blur-xl rounded-2xl transition-all shadow-xl">
            Access Portal
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto pb-32">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 p-8 rounded-3xl text-left shadow-2xl hover:bg-white/95 transition-colors">
            <div className="w-14 h-14 flex items-center justify-center bg-violet-500/20 border border-violet-500/30 rounded-2xl mb-6 shadow-inner shadow-violet-500/20">
              <Shield className="w-7 h-7 text-violet-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Multi-Tenant Isolation</h3>
            <p className="text-gray-500 leading-relaxed text-sm font-medium">
              Each studio gets a dedicated secure subdomain, custom database queries, personalized branding configuration, logos, and dashboard configurations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 p-8 rounded-3xl text-left shadow-2xl hover:bg-white/95 transition-colors">
            <div className="w-14 h-14 flex items-center justify-center bg-indigo-500/20 border border-indigo-500/30 rounded-2xl mb-6 shadow-inner shadow-indigo-500/20">
              <Calendar className="w-7 h-7 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Roster Conflict Prevention</h3>
            <p className="text-gray-500 leading-relaxed text-sm font-medium">
              Schedule staff to shoots and coordinates. Checks availability real-time and prevents double bookings to eliminate operational gaps.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 p-8 rounded-3xl text-left shadow-2xl hover:bg-white/95 transition-colors">
            <div className="w-14 h-14 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30 rounded-2xl mb-6 shadow-inner shadow-cyan-500/20">
              <FileText className="w-7 h-7 text-cyan-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Sleek Invoicing & VAT</h3>
            <p className="text-gray-500 leading-relaxed text-sm font-medium">
              Generate quotation drafts and tax invoices automatically with QR verification codes. Track incoming advance deposits and outstanding balances dynamically.
            </p>
          </div>
        </div>
      </main>

      {/* Footer overlay */}
      <div className="absolute bottom-6 w-full text-center z-50 pointer-events-none">
        <p className="text-xs font-medium text-gray-900/40 tracking-wider">
          &copy; 2026 EVENTO INC. DESIGNED FOR ELITE EVENT COMPANIES GLOBALLY.
        </p>
      </div>
    </div>
  );
}
