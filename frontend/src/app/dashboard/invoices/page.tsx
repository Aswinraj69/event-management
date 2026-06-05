'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Calendar, QrCode, FileCheck2, DollarSign, Ban, X, Eye, FileText, Loader2 } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Invoice Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientId, setClientId] = useState('');
  const [eventId, setEventId] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(5.00); // 5% default VAT
  const [discount, setDiscount] = useState(0);
  const [dueDate, setDueDate] = useState('');

  // Payment Recording Form
  const [showPayForm, setShowPayForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [refNum, setRefNum] = useState('');

  const [selectedInv, setSelectedInv] = useState<any | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('evento_token');
    try {
      const invRes = await fetch('http://localhost:5000/api/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (invRes.ok) setInvoices(await invRes.json());

      const cRes = await fetch('http://localhost:5000/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cRes.ok) setClients(await cRes.json());

      const eRes = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (eRes.ok) setEvents(await eRes.json());
    } catch (err) {
      console.error('Error fetching invoices requirements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('evento_token');
    const payload = {
      clientId,
      eventId: eventId || undefined,
      subtotal: Number(subtotal),
      taxRate: Number(taxRate),
      discount: Number(discount),
      dueDate
    };

    try {
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddForm(false);
        fetchData();
        // Reset
        setClientId('');
        setEventId('');
        setSubtotal(0);
        setDiscount(0);
        setDueDate('');
      } else {
        alert('Failed to generate tax invoice');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('evento_token');
    const payload = {
      amount: Number(paymentAmount),
      paymentMethod,
      referenceNumber: refNum || undefined
    };

    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${selectedInv.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const next = await res.json();
        setSelectedInv(next);
        setShowPayForm(false);
        fetchData();
        setPaymentAmount(0);
        setRefNum('');
      } else {
        alert('Failed to log payment transaction');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const getInvoiceBalance = (invoice: any) => {
    const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    return Number(invoice.totalAmount) - totalPaid;
  };

  // Tax calculations for form preview
  const calcTaxAmount = () => Number(subtotal) * (Number(taxRate) / 100);
  const calcTotalAmount = () => Number(subtotal) + calcTaxAmount() - Number(discount);

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Invoices & Billing</h1>
          <p className="text-gray-400 text-sm mt-1">Generate VAT compliant invoices, accept advance deposits, and verify QR codes.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Generate Tax Invoice
        </button>
      </header>

      {/* Main Billing Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Invoices lists column */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-xs text-gray-500">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">No invoices generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                    <th className="p-4 font-bold text-gray-400">Invoice ID</th>
                    <th className="p-4 font-bold text-gray-400">Client / Event</th>
                    <th className="p-4 font-bold text-gray-400">Net Due Date</th>
                    <th className="p-4 font-bold text-gray-400">Status</th>
                    <th className="p-4 font-bold text-gray-400">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const balance = getInvoiceBalance(inv);
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => { setSelectedInv(inv); setShowPayForm(false); }}
                        className={`border-b border-white/[0.03] hover:bg-white/[0.01] cursor-pointer transition-colors ${
                          selectedInv?.id === inv.id ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-violet-400">{inv.invoiceNumber}</td>
                        <td className="p-4">
                          <p className="font-semibold text-white">{inv.client?.name}</p>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{inv.event?.title || 'Standalone Campaign'}</span>
                        </td>
                        <td className="p-4 font-mono text-gray-400">{new Date(inv.dueDate).toISOString().split('T')[0]}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                            inv.status === 'PARTIALLY_PAID' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white text-right">
                          AED {Number(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed tax invoice PDF inspector + Payment Logger */}
        <div>
          {selectedInv ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6 animate-fade-in text-xs relative">
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                <div>
                  <h3 className="font-bold text-white text-md">Invoice Ledger</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">VAT and compliance parameters</p>
                </div>
                <button onClick={() => { setSelectedInv(null); setShowPayForm(false); }} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BRANDED TAX INVOICE PRINT CARD */}
              <div className="bg-[#0f0f13] border border-white/[0.06] rounded-xl p-5 space-y-4 shadow-inner relative">
                {/* Visual Status stamp */}
                <div className="absolute top-12 right-6 opacity-10 pointer-events-none select-none border-4 border-solid border-white/20 p-2 text-2xl font-bold uppercase rounded-xl tracking-widest text-white rotate-12">
                  {selectedInv.status}
                </div>

                <div className="flex justify-between items-start border-b border-white/[0.03] pb-3">
                  <div>
                    {selectedInv.company?.logoUrl ? (
                      <img src={selectedInv.company.logoUrl} alt="Logo" className="w-10 h-10 object-cover rounded-lg border border-white/[0.05] mb-2" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white mb-2">
                        {selectedInv.company?.name[0]}
                      </div>
                    )}
                    <h4 className="font-bold text-white text-[10px]">{selectedInv.company?.name}</h4>
                    <p className="text-[9px] text-gray-500 leading-tight mt-1">{selectedInv.company?.address || 'Office Address'}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">VAT: {selectedInv.company?.vatNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase">Tax Invoice</span>
                    <p className="font-mono font-bold text-white text-[10px] mt-2">{selectedInv.invoiceNumber}</p>
                    <p className="text-[9px] text-gray-500 mt-1">Due: {new Date(selectedInv.dueDate).toISOString().split('T')[0]}</p>
                  </div>
                </div>

                {/* Client properties */}
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Debtor Info:</p>
                  <p className="font-bold text-white mt-1">{selectedInv.client?.name}</p>
                  <p className="text-gray-400 mt-0.5">{selectedInv.client?.email}</p>
                </div>

                {/* Math breakdown */}
                <div className="border-t border-white/[0.03] pt-3 space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Campaign Subtotal</span>
                    <span className="text-white">AED {Number(selectedInv.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax VAT ({selectedInv.taxRate}%)</span>
                    <span className="text-white">AED {Number(selectedInv.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {Number(selectedInv.discount) > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Discount</span>
                      <span>- AED {Number(selectedInv.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/[0.05] pt-2 font-bold text-[11px] text-white">
                    <span>Grand Invoiced Total</span>
                    <span>AED {Number(selectedInv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 border-t border-white/[0.03] pt-2 font-bold">
                    <span>Outstanding Balance Due</span>
                    <span>AED {getInvoiceBalance(selectedInv).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* QR Verification Barcode block */}
                {selectedInv.qrCodeData && (
                  <div className="border-t border-white/[0.04] pt-3 flex gap-3 items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                    <QrCode className="w-8 h-8 text-gray-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Compliance QR Verification</p>
                      <p className="text-[8px] font-mono text-gray-400 truncate mt-0.5">{selectedInv.qrCodeData}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payments log histories */}
              <div className="space-y-3 border-t border-white/[0.05] pt-4">
                <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Payments Ledger</h4>
                {selectedInv.payments && selectedInv.payments.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedInv.payments.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center bg-black/20 p-2.5 border border-white/[0.03] rounded-lg">
                        <div>
                          <p className="font-semibold text-white">AED {Number(p.amount).toLocaleString()}</p>
                          <span className="text-[9px] text-gray-500">{p.paymentMethod} &bull; Ref: {p.referenceNumber || 'N/A'}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">{new Date(p.paymentDate).toISOString().split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600 italic block text-xs">No payment transaction records linked</span>
                )}
              </div>

              {/* Record Deposit controls (Admin only) */}
              {getInvoiceBalance(selectedInv) > 0 ? (
                <div className="border-t border-white/[0.05] pt-4">
                  {!showPayForm ? (
                    <button
                      onClick={() => {
                        setPaymentAmount(getInvoiceBalance(selectedInv));
                        setShowPayForm(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl"
                    >
                      <DollarSign className="w-4 h-4" /> Record Deposit Payment
                    </button>
                  ) : (
                    <form onSubmit={handleRecordPayment} className="space-y-3 bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl animate-fade-in">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[10px] text-violet-400">Record Deposit Transaction</span>
                        <button type="button" onClick={() => setShowPayForm(false)} className="text-gray-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Paid Amount (AED)</label>
                          <input
                            type="number"
                            required
                            min={0.01}
                            max={getInvoiceBalance(selectedInv)}
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/[0.08] text-xs text-white rounded-lg py-1.5 px-2.5 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Method</label>
                          <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="w-full bg-black/40 border border-white/[0.08] text-xs text-gray-400 rounded-lg py-1.5 px-2 focus:outline-none"
                          >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Stripe">Stripe Gateway</option>
                            <option value="Razorpay">Razorpay Gateway</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Reference Code (Ref / Check Number)</label>
                        <input
                          type="text"
                          placeholder="e.g. TXN-198822"
                          value={refNum}
                          onChange={e => setRefNum(e.target.value)}
                          className="w-full bg-black/40 border border-white/[0.08] text-xs text-white rounded-lg py-1.5 px-2.5 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px]"
                      >
                        Commit Payment Row
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="pt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-center">
                  Invoice is Fully Settled
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center rounded-2xl text-xs text-gray-500 border-dashed">
              Select an invoice ledger to review tax summaries, print barcodes, and record client deposit payments.
            </div>
          )}
        </div>
      </div>

      {/* Add Invoice Dialog Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#0f0f13] border border-white/[0.08] rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Generate Tax Invoice</h3>
              <p className="text-xs text-gray-500 mt-1">Compile client accounts and calculate tax (VAT) compliance.</p>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Debtor Client</label>
                <select required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400 focus:outline-none">
                  <option value="">Choose Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Scheduled Event (Optional)</label>
                <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400 focus:outline-none">
                  <option value="">No Linked Event</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Subtotal Amount (AED)</label>
                  <input type="number" required min={0} value={subtotal} onChange={e => setSubtotal(Number(e.target.value))} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Discount (AED)</label>
                  <input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tax VAT (%)</label>
                  <input type="number" required min={0} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Due Date</label>
                  <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400 focus:outline-none" />
                </div>
              </div>

              {/* Real-time preview */}
              <div className="bg-black/40 p-4 border border-white/[0.04] rounded-xl space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">AED {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({taxRate}%)</span>
                  <span className="text-white">AED {calcTaxAmount().toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Discount</span>
                    <span>- AED {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/[0.06] pt-2 font-bold text-white">
                  <span>Grand Total</span>
                  <span>AED {calcTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-lg">
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
