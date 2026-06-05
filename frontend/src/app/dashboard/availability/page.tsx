'use client';

import { useState, useEffect } from 'react';
import { CalendarX2, Plus, Loader2, Trash, X } from 'lucide-react';

export default function AvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('evento_token');
    const savedUser = localStorage.getItem('evento_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAvailabilities(await res.json());
    } catch (err) {
      console.error('Error fetching availability', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ startDate, endDate, reason, status: 'APPROVED' })
      });
      if (res.ok) {
        setShowAddForm(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchData();
      } else {
        alert('Failed to save availability');
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this block out period?')) return;
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Network Error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Availability Management</h1>
          <p className="text-gray-400 text-sm mt-1">Block out dates when you are unavailable for assignments or events.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Block Out Dates
        </button>
      </header>

      <div className="glass-panel p-8 rounded-2xl">
        {availabilities.length === 0 ? (
          <div className="text-center py-12">
            <CalendarX2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg">No block out periods</h3>
            <p className="text-gray-500 text-sm mt-1">You are currently marked as available for all dates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availabilities.map((a: any) => (
              <div key={a.id} className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col relative group">
                <button
                  onClick={() => handleDelete(a.id)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                    <CalendarX2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Unavailable</span>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="text-sm font-semibold text-white">
                    {new Date(a.startDate).toLocaleDateString()} &mdash; {new Date(a.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">{a.reason || 'No reason provided'}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-white/[0.05] flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">Status: {a.status}</span>
                  {user?.role === 'COMPANY_ADMIN' && (
                     <span className="text-[10px] text-violet-400 font-semibold">{a.user?.firstName} {a.user?.lastName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#0f0f13] border border-white/[0.08] rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Mark Unavailable</h3>
              <p className="text-xs text-gray-500 mt-1">Select the dates you will be away or unable to accept jobs.</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason (Optional)</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Annual Leave, Double Booked..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500 text-sm text-white resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 border border-white/[0.08] font-semibold text-gray-400 hover:text-white rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg">
                  Save Dates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
