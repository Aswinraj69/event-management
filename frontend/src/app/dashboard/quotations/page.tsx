'use client';

import { useState } from 'react';
import { Plus, Share2, Mail, Trash, Check, X, Link as LinkIcon, Download } from 'lucide-react';
import {
  useGetQuotationsQuery, useCreateQuotationMutation, useUpdateQuotationStatusMutation,
  useGetClientsQuery, useGetBookingsQuery, useDeleteQuotationMutation,
} from '@/store/api/eventoApi';
import toast from 'react-hot-toast';

export default function QuotationsPage() {
  // All served from shared cache — no duplicate fetches
  const { data: quotations = [], isLoading } = useGetQuotationsQuery();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: events = [] } = useGetBookingsQuery();
  const [createQuotation] = useCreateQuotationMutation();
  const [updateQuotationStatus] = useUpdateQuotationStatusMutation();
  const [deleteQuotation] = useDeleteQuotationMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [clientId, setClientId] = useState('');
  const [eventId, setEventId] = useState('');
  const [terms, setTerms] = useState('Payment: 50% advance to book, remaining on delivery.');
  const [services, setServices] = useState<any[]>([{ description: 'Photography Core Service - 1 Day Session', quantity: 1, unitPrice: 2500 }]);
  const [selectedQuo, setSelectedQuo] = useState<any | null>(null);
  const [sharingMethod, setSharingMethod] = useState<'email' | 'whatsapp' | ''>('');

  const handleAddServiceRow = () => setServices([...services, { description: '', quantity: 1, unitPrice: 500 }]);
  const handleServiceChange = (index: number, field: string, value: any) => {
    setServices(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: field === 'description' ? value : Number(value) }; return copy; });
  };
  const handleRemoveServiceRow = (index: number) => { if (services.length === 1) return; setServices(services.filter((_, i) => i !== index)); };

  const handleCreateQuo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuotation({ clientId, eventId: eventId || undefined, services, termsConditions: terms }).unwrap();
      setShowAddForm(false);
      setClientId(''); setEventId('');
      setServices([{ description: 'Photography Core Service - 1 Day Session', quantity: 1, unitPrice: 2500 }]);
      toast.success('Quotation created successfully');
    } catch { toast.error('Failed to construct quotation'); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const next = await updateQuotationStatus({ id, status }).unwrap();
      setSelectedQuo(next);
      toast.success('Status updated');
    } catch { toast.error('Error updating status'); }
  };

  const computeQuoTotal = (servicesArray: any[]) =>
    servicesArray.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

  const handleCopyMagicLink = () => {
    if (!selectedQuo?.magicLinkToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/quote/${selectedQuo.magicLinkToken}`);
    toast.success('Magic Link copied to clipboard!');
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('quotation-preview-content');
    if (!element) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.3,
        filename: `Quotation_${selectedQuo?.quotationNumber || 'Document'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f0f13' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
      toast.success('PDF download started');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Quotations Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Compose professional estimations, customize line items, and share drafts.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Create Quotation
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-xs text-gray-500">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">No quotation templates found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead><tr className="border-b border-white/10 bg-black/10 backdrop-blur-md">
                  <th className="p-4 font-bold text-gray-400">Quote Number</th>
                  <th className="p-4 font-bold text-gray-400">Client / Event</th>
                  <th className="p-4 font-bold text-gray-400">Total Estimation</th>
                  <th className="p-4 font-bold text-gray-400">Status</th>
                </tr></thead>
                <tbody>
                  {quotations.map(q => (
                    <tr key={q.id} onClick={() => setSelectedQuo(q)}
                      className={`border-b border-white/[0.03] hover:bg-black/10 backdrop-blur-md cursor-pointer transition-colors ${selectedQuo?.id === q.id ? 'bg-black/20 backdrop-blur-xl' : ''}`}>
                      <td className="p-4 font-mono font-bold text-violet-400">{q.quotationNumber}</td>
                      <td className="p-4"><p className="font-semibold text-white">{q.client?.name}</p><span className="text-[10px] text-gray-500 block mt-0.5">{q.event?.title || 'Standalone Request'}</span></td>
                      <td className="p-4 font-medium text-gray-300">AED {computeQuoTotal(q.services).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-4"><span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${q.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : q.status === 'SENT' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-500/10 text-gray-400'}`}>{q.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div>
          {selectedQuo ? (
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-6 rounded-2xl space-y-6 animate-fade-in text-xs relative">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div><h3 className="font-bold text-white text-md">Document Preview</h3><p className="text-[10px] text-gray-500 mt-0.5">Branded layout template</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    toast((t) => (
                      <div>
                        <p className="text-sm mb-3 font-semibold text-white">Delete Quotation?</p>
                        <p className="text-xs text-gray-400 mb-4">This action cannot be undone.</p>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                          <button onClick={async () => {
                            toast.dismiss(t.id);
                            try { await deleteQuotation(selectedQuo.id).unwrap(); setSelectedQuo(null); toast.success('Quotation deleted'); }
                            catch { toast.error('Failed to delete'); }
                          }} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">Confirm Delete</button>
                        </div>
                      </div>
                    ), { duration: 5000 });
                  }} className="text-red-400 hover:text-red-300 p-2 transition-colors"><Trash className="w-4 h-4" /></button>
                  <button onClick={() => { setSelectedQuo(null); setSharingMethod(''); }} className="text-gray-500 hover:text-white p-2"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div id="quotation-preview-content" className="bg-[#0f0f13] border border-white/[0.06] rounded-xl p-5 space-y-4 shadow-inner">
                <div className="flex justify-between items-start border-b border-white/[0.03] pb-3">
                  <div>
                    {selectedQuo.company?.logoUrl ? <img src={selectedQuo.company.logoUrl} alt="Logo" className="w-10 h-10 object-cover rounded-lg border border-white/10 mb-2" /> : <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white mb-2">{selectedQuo.company?.name[0]}</div>}
                    <h4 className="font-bold text-white text-[11px]">{selectedQuo.company?.name}</h4>
                    <p className="text-[9px] text-gray-500 leading-tight mt-1">{selectedQuo.company?.address || 'Office Address'}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">VAT: {selectedQuo.company?.vatNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded uppercase">Quotation</span>
                    <p className="font-mono font-bold text-white text-[10px] mt-2">{selectedQuo.quotationNumber}</p>
                    <p className="text-[9px] text-gray-500 mt-1">{new Date(selectedQuo.createdAt).toISOString().split('T')[0]}</p>
                  </div>
                </div>
                <div><p className="text-[9px] text-gray-500 font-semibold uppercase">Estimating For:</p><p className="font-bold text-white mt-1">{selectedQuo.client?.name}</p><p className="text-gray-400 mt-0.5">{selectedQuo.client?.email} &bull; {selectedQuo.client?.phone}</p></div>
                <div className="border-t border-white/[0.03] pt-3">
                  <div className="grid grid-cols-3 font-bold text-[9px] text-gray-500 uppercase pb-1 border-b border-white/[0.03]"><span>Description</span><span className="text-center">Qty x Unit</span><span className="text-right">Total</span></div>
                  <div className="divide-y divide-white/[0.03] max-h-36 overflow-y-auto">
                    {selectedQuo.services.map((s: any, i: number) => (
                      <div key={i} className="grid grid-cols-3 py-2 text-[10px] text-gray-300">
                        <span className="truncate pr-2">{s.description}</span>
                        <span className="text-center text-gray-500">{s.quantity} x {s.unitPrice}</span>
                        <span className="text-right text-white font-medium">AED {Number(s.totalPrice).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-[11px]"><span className="text-gray-400">Total Valuation</span><span className="text-white">AED {computeQuoTotal(selectedQuo.services).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                {selectedQuo.termsConditions && <div className="border-t border-white/[0.03] pt-2 text-[9px] text-gray-500 leading-normal"><span className="font-semibold text-gray-400 block mb-0.5">Terms:</span>{selectedQuo.termsConditions}</div>}
                {selectedQuo.status === 'ACCEPTED' && selectedQuo.signatureUrl && (
                  <div className="border-t border-emerald-500/20 pt-3 mt-4">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">Digital Signature Executed</span>
                    <div className="bg-white rounded p-2 inline-block border border-emerald-500/30"><img src={selectedQuo.signatureUrl} alt="Client Signature" className="h-12 w-auto object-contain" /></div>
                    <p className="text-[8px] text-gray-500 mt-1">Signed legally by client.</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => { handleUpdateStatus(selectedQuo.id, 'SENT'); setSharingMethod('email'); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"><Mail className="w-3.5 h-3.5" /> Share Email</button>
                  <button onClick={() => { handleUpdateStatus(selectedQuo.id, 'SENT'); setSharingMethod('whatsapp'); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"><Share2 className="w-3.5 h-3.5" /> Share WhatsApp</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopyMagicLink} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-semibold rounded-xl transition-all"><LinkIcon className="w-3.5 h-3.5" /> Copy Client Link</button>
                  <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-semibold rounded-xl transition-all"><Download className="w-3.5 h-3.5" /> Download PDF</button>
                </div>
                {sharingMethod && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-medium animate-fade-in">
                    {sharingMethod === 'email' ? <p>&bull; Simulated email dispatched with branded PDF attachment link to `{selectedQuo.client?.email}` successfully.</p> : <p>&bull; Simulated WhatsApp notification compiled and shared with client line `{selectedQuo.client?.phone}` successfully.</p>}
                  </div>
                )}
                {selectedQuo.status !== 'ACCEPTED' && (
                  <div className="pt-2 border-t border-white/10">
                    <button onClick={() => handleUpdateStatus(selectedQuo.id, 'ACCEPTED')} className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"><Check className="w-4 h-4" /> Client Accept Quotation</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl p-8 text-center rounded-2xl text-xs text-gray-500 border-dashed">
              Select a quotation record to render the branded customer PDF preview and dispatch simulated WhatsApp or email updates.
            </div>
          )}
        </div>
      </div>

      {/* Create Quotation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#0f0f13] border border-white/[0.08] rounded-2xl max-w-2xl w-full p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            <div className="mb-6"><h3 className="text-xl font-bold">Create Professional Quotation</h3><p className="text-xs text-gray-500 mt-1">Compile pricing estimations and terms.</p></div>
            <form onSubmit={handleCreateQuo} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Link Client Card</label><select required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-3 py-2 bg-[#0f0f13] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"><option value="">Choose Client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Link Scheduled Event (Optional)</label><select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full px-3 py-2 bg-[#0f0f13] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"><option value="">No Linked Event</option>{events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><label className="block text-[10px] font-bold text-gray-400 uppercase">Estimates Itemized Line Items</label><button type="button" onClick={handleAddServiceRow} className="text-[10px] font-bold text-violet-400 hover:text-white">+ Add Row</button></div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {services.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center bg-black/20 p-3 border border-white/[0.03] rounded-xl">
                      <div className="flex-1"><input type="text" required placeholder="e.g. Photography Session" value={item.description} onChange={e => handleServiceChange(index, 'description', e.target.value)} className="w-full bg-transparent border-b border-white/[0.08] text-xs text-white pb-1 focus:outline-none focus:border-violet-500" /></div>
                      <div className="w-16"><input type="number" min={1} required value={item.quantity} onChange={e => handleServiceChange(index, 'quantity', e.target.value)} className="w-full bg-transparent border-b border-white/[0.08] text-xs text-center text-white pb-1 focus:outline-none focus:border-violet-500" /></div>
                      <div className="w-24"><input type="number" min={1} required value={item.unitPrice} onChange={e => handleServiceChange(index, 'unitPrice', e.target.value)} className="w-full bg-transparent border-b border-white/[0.08] text-xs text-right text-white pb-1 focus:outline-none focus:border-violet-500 font-mono" /></div>
                      <button type="button" onClick={() => handleRemoveServiceRow(index)} className="text-gray-500 hover:text-red-400 p-1"><Trash className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Terms and Conditions</label><textarea rows={2} value={terms} onChange={e => setTerms(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white resize-none" /></div>
              <div className="pt-4 border-t border-white/[0.04] flex justify-between items-center text-xs">
                <div><span className="text-gray-500 font-bold uppercase block">Grand Total Valuation</span><span className="text-white font-extrabold text-sm mt-0.5">AED {computeQuoTotal(services).toLocaleString()}</span></div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-white/[0.08] font-semibold text-gray-400 hover:text-white rounded-xl">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg">Build Quotation</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
