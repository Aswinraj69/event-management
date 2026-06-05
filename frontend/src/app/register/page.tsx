'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    country: 'UAE',
    city: 'Dubai',
    employeeCount: 5,
    logoUrl: '',
    tradeLicenseUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employeeCount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong while submitting registration');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Connection to backend API failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col md:flex-row relative">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-[5%] w-[40%] h-[40%] bg-[#6d28d9]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left panel - Info panel */}
      <div className="md:w-[40%] bg-[#0f0f13] border-r border-white/[0.05] p-12 flex flex-col justify-between relative overflow-hidden">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="my-auto py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              EVENTO
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-snug">
            Launch Your Event Platform Instance in Minutes.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8 text-sm">
            Fill out the form to request activation. Our multi-tenant infrastructure provisions your dedicated subdomain and secure access controls dynamically.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="p-1 bg-violet-600/10 border border-violet-500/20 rounded-md text-violet-400 mt-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure Isolation Boundary</p>
                <p className="text-xs text-gray-500 mt-0.5">Separate tenant database lookups and scopes.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="p-1 bg-indigo-600/10 border border-indigo-500/20 rounded-md text-indigo-400 mt-1">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Instant Approval Simulation</p>
                <p className="text-xs text-gray-500 mt-0.5">Use the Super Admin Console simulator to review and approve registrations instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          &copy; 2026 EVENTO SaaS Systems.
        </div>
      </div>

      {/* Right panel - Form container */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-lg animate-fade-in">
          {success ? (
            <div className="glass-panel p-8 rounded-2xl border-emerald-500/20 shadow-xl shadow-emerald-500/5 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Application Submitted!</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Thank you for applying. To fast-track review, you can open the Super Admin Console simulator to approve this company immediately and generate credentials.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/super-admin" className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-md">
                  Go to Super Admin Approvals
                </Link>
                <Link href="/" className="w-full py-3 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-gray-300 font-semibold rounded-xl transition-all">
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl shadow-xl shadow-black/40">
              <div className="mb-8">
                <h3 className="text-2xl font-extrabold tracking-tight">Register Company</h3>
                <p className="text-gray-400 text-sm mt-1">Provide your event organization credentials below.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      placeholder="e.g. Shutter Studio"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Owner Full Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="owner@shutter.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      placeholder="+971 50..."
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Employee Count</label>
                    <input
                      type="number"
                      name="employeeCount"
                      min={1}
                      value={formData.employeeCount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Logo URL (Optional)</label>
                    <input
                      type="text"
                      name="logoUrl"
                      placeholder="https://..."
                      value={formData.logoUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:border-violet-500 focus:outline-none transition-all text-sm text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-95 shadow-md shadow-violet-500/10 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Registration'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
