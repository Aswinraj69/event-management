'use client';

import { useState } from 'react';
import { UserPlus, Mail, Phone, MapPin, Notebook, Loader2, X, DollarSign } from 'lucide-react';
import { useGetClientsQuery, useGetClientByIdQuery, useCreateClientMutation } from '@/store/api/eventoApi';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', notes: '' };

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useGetClientsQuery();
  const [createClient, { isLoading: creating }] = useCreateClientMutation();

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Lazily fetch detail only when a client row is selected
  const { data: selectedClient, isFetching: clientDetailsLoading } = useGetClientByIdQuery(selectedClientId!, { skip: !selectedClientId });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient(formData).unwrap();
      setShowAddForm(false);
      setFormData({ ...EMPTY_FORM });
      toast.success('Client registered successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to register client');
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
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all">
          <UserPlus className="w-4 h-4" /> Add New Client
        </button>
      </header>

      <input type="text" placeholder="Search by client name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f0f13] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500 text-xs text-white" />

      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
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
                  <tr key={c.id} onClick={() => setSelectedClientId(c.id)}
                    className={`border-b border-white/[0.03] hover:bg-black/10 backdrop-blur-md cursor-pointer transition-colors ${selectedClientId === c.id ? 'bg-black/20 backdrop-blur-xl' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center font-bold text-violet-400">{c.name[0]}</div>
                        <div>
                          <p className="font-semibold text-white">{c.name}</p>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{c.email || 'No Email'} &bull; {c.phone || 'No Phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md font-bold text-[10px]">{c.eventsCount} Events</span></td>
                    <td className="p-4 font-medium text-gray-300">AED {c.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4"><span className={`font-semibold ${c.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>AED {c.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Inspector Drawer */}
      {selectedClientId && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setSelectedClientId(null)} />
          <div className="fixed inset-y-0 right-0 h-[100dvh] w-full max-w-md bg-[#0d0d1a] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col" style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            {clientDetailsLoading ? (
              <div className="flex-1 flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
            ) : selectedClient ? (
              <>
                <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.08] shrink-0">
                  <div><h3 className="font-bold text-white text-lg">{selectedClient.name}</h3><p className="text-[11px] text-gray-500 mt-0.5">Customer Ledger Profile</p></div>
                  <button onClick={() => setSelectedClientId(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-4 text-xs">
                    {selectedClient.email && <div className="flex items-center gap-3 text-gray-300"><Mail className="w-4 h-4 text-gray-500 shrink-0" /><span className="truncate">{selectedClient.email}</span></div>}
                    {selectedClient.phone && <div className="flex items-center gap-3 text-gray-300"><Phone className="w-4 h-4 text-gray-500 shrink-0" /><span>{selectedClient.phone}</span></div>}
                    {selectedClient.address && <div className="flex items-start gap-3 text-gray-300"><MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" /><span>{selectedClient.address}</span></div>}
                    {selectedClient.notes && <div className="flex items-start gap-3 text-gray-300 bg-black/20 p-4 rounded-xl border border-white/[0.04]"><Notebook className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" /><span className="text-[11px] leading-relaxed text-gray-400">{selectedClient.notes}</span></div>}
                  </div>
                  <div className="space-y-4 border-t border-white/10 pt-6 text-xs">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Historical Campaigns</h4>
                    {selectedClient.events && selectedClient.events.length > 0 ? (
                      <div className="space-y-2">
                        {selectedClient.events.map((e: any) => (
                          <div key={e.id} className="p-3 bg-black/30 border border-white/[0.04] rounded-xl flex justify-between items-center">
                            <div><p className="font-semibold text-white truncate">{e.title}</p><span className="text-[10px] text-gray-500 block mt-0.5">{new Date(e.eventDate).toISOString().split('T')[0]}</span></div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${e.bookingStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'}`}>{e.bookingStatus}</span>
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-gray-600 italic block">No bookings recorded</span>}
                  </div>
                  <div className="space-y-4 border-t border-white/10 pt-6 text-xs pb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Financial Overview</h4>
                    <div className="p-4 bg-black/30 border border-white/[0.04] rounded-xl space-y-3">
                      <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Gross Billings</span><span className="text-white font-semibold">AED {selectedClient.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Deposits Credited</span><span className="text-white font-semibold">AED {selectedClient.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-3"><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Net Balance Due</span><span className={`font-bold text-sm ${selectedClient.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>AED {selectedClient.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </>
      )}

      {/* Add Client Drawer */}
      {showAddForm && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={() => !creating && setShowAddForm(false)} />
          <div className="fixed inset-y-0 right-0 h-[100dvh] w-full max-w-md bg-[#0d0d1a] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col" style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] shrink-0">
              <div><h2 className="text-lg font-bold text-white">Register Client</h2><p className="text-xs text-gray-500 mt-0.5">Add client contacts to generate billing accounts.</p></div>
              <button onClick={() => setShowAddForm(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form onSubmit={handleAddClient} className="space-y-4">
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Client Full Name / Company</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" /></div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Work Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" /></div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" /></div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Billing Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" /></div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Internal Notes</label><textarea name="notes" rows={4} value={formData.notes} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white resize-none" /></div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white transition-all">Cancel</button>
              <button onClick={handleAddClient} disabled={creating} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all disabled:opacity-60">{creating ? 'Registering...' : 'Register Client'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
