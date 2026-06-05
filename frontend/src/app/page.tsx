'use client';

import Link from 'next/link';
import { Camera, Calendar, FileText, Shield, Sparkles, Building2, UserSquare2, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-[#09090b]">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6d28d9] rounded-full blur-[160px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5] rounded-full blur-[160px] opacity-10 pointer-events-none" />

      {/* Navigation Header */}
      <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            EVENTO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            Portal Login
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:opacity-90 shadow-md shadow-violet-500/10 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs text-violet-400 mb-8 font-medium">
          <Sparkles className="w-3.5 h-3.5" /> Introducing EVENTO Multi-Tenant Core Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-8">
          The Operating System for{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Event Management
          </span>{' '}
          Companies.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Manage photostudios, videographers, wedding planners, schedules, invoices, and roster assignments from a premium single-tenant interface.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24">
          <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:opacity-95 shadow-xl shadow-violet-500/15 transition-all">
            Register Company <ChevronRight className="w-4 h-4" />
          </Link>

        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-violet-600/10 border border-violet-500/20 rounded-xl mb-6">
              <Shield className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Tenant Isolation</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Each studio gets a dedicated secure subdomain, custom database queries, personalized branding configuration, logos, and dashboard configurations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-600/10 border border-indigo-500/20 rounded-xl mb-6">
              <Calendar className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Roster Conflict Prevention</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Schedule staff to shoots and coordinates. Checks availability real-time and prevents double bookings to eliminate operational gaps.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-600/10 border border-cyan-500/20 rounded-xl mb-6">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Sleek Invoicing & VAT</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Generate quotation drafts and tax invoices automatically with QR verification codes. Track incoming advance deposits and outstanding balances dynamically.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-white/[0.05] text-xs text-gray-500 max-w-7xl mx-auto">
        &copy; 2026 EVENTO Inc. All rights reserved. Designed for elite event companies globally.
      </footer>
    </div>
  );
}
