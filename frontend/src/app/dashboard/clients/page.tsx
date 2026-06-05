'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, MapPin, Notebook, Plus, Loader2, X, DollarSign } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Client Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);

  const fetchClients = async () => {
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Error fetching clients', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (id: string) => {
    setClientDetailsLoading(true);
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data);
      }
    } catch (err) {
      console.error('Error fetching client details', err);
    } finally {
      setClientDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('evento_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        alert('Failed to register client');
        return;
      }
      setShowAddForm(false);
      fetchClients();
      setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    } catch (err) {
      alert('Network error');
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Clients Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Manage client contact cards, project lists, and balance ledgers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" /> Add New Client
        </button>
      </header>

      {/* Search filter */}
      <input
        type="text"
        placeholder="Search by client name, email or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f0f13] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500 text-xs text-white"
      />

      {/* Client layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Client Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-xs text-gray-500">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">No clients registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/10 backdrop-blur-md">
                    <th className="p-4 font-bold text-gray-400">Client Details</th>
                    <th className="p-4 font-bold text-gray-400">Campaigns</th>
                    <th className="p-4 font-bold text-gray-400">Total Billed</th>
                    <th className="p-4 font-bold text-gray-400">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => fetchClientDetails(c.id)}
                      className={`border-b border-white/[0.03] hover:bg-black/10 backdrop-blur-md cursor-pointer transition-colors ${
                        selectedClient?.id === c.id ? 'bg-black/20 backdrop-blur-xl' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center font-bold text-violet-400">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{c.name}</p>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{c.email || 'No Email'} &bull; {c.phone || 'No Phone'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md font-bold text-[10px]">
                          {c.eventsCount} Events
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-300">
                        AED {c.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${c.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          AED {c.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Client details inspector */}
        <div>
          {clientDetailsLoading ? (
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-10 text-center rounded-2xl flex justify-center items-center">
              <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            </div>
          ) : selectedClient ? (
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-md">{selectedClient.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Customer Ledger Profile</p>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* General contact information */}
              <div className="space-y-4 text-xs border-t border-white/10 pt-4">
                {selectedClient.email && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="truncate">{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-start gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{selectedClient.address}</span>
                  </div>
                )}
                {selectedClient.notes && (
                  <div className="flex items-start gap-2 text-gray-300 bg-black/10 backdrop-blur-md p-3 rounded-xl border border-white/[0.04]">
                    <Notebook className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed text-gray-400">{selectedClient.notes}</span>
                  </div>
                )}
              </div>

              {/* Event booking listing */}
              <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Historical Campaigns</h4>
                {selectedClient.events && selectedClient.events.length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.events.map((e: any) => (
                      <div key={e.id} className="p-2 bg-black/30 border border-white/[0.04] rounded-lg">
                        <p className="font-semibold text-white truncate">{e.title}</p>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{new Date(e.eventDate).toISOString().split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600 italic">No bookings recorded</span>
                )}
              </div>

              {/* Balance Card summary */}
              <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Financial Overview</h4>
                <div className="p-3 bg-black/40 border border-white/[0.04] rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross Billings</span>
                    <span className="text-white font-medium">AED {selectedClient.totalBilled.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deposits Credited</span>
                    <span className="text-white font-medium">AED {selectedClient.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                    <span className="text-gray-400">Net Balance Due</span>
                    <span className={selectedClient.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      AED {selectedClient.outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-8 text-center rounded-2xl text-xs text-gray-500 border-dashed">
              Select a client row to audit invoicing records, billing histories, and active project notes.
            </div>
          )}
        </div>
      </div>

      {/* Add Client Dialog Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#0f0f13] border border-white/[0.08] rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Register Client profile</h3>
              <p className="text-xs text-gray-500 mt-1">Add client contacts to book projects and generate billing accounts.</p>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Client Full Name / Company</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Work Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Billing Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Internal Notes</label>
                <textarea name="notes" rows={3} value={formData.notes} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white resize-none" />
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-lg">
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
