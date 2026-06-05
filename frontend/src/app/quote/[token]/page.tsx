'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function PublicQuotationPage({ params }: { params: { token: string } }) {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const sigPad = useRef<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quotations/public/${params.token}`)
      .then(res => {
        if (!res.ok) throw new Error('Quotation not found or link has expired.');
        return res.json();
      })
      .then(data => {
        setQuotation(data);
        if (data.status === 'ACCEPTED') {
          setSignatureDone(true);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.token]);

  const handleClearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  const handleSign = async () => {
    if (sigPad.current && sigPad.current.isEmpty()) {
      alert('Please provide a signature before accepting.');
      return;
    }

    setSigning(true);
    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quotations/public/${params.token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData }),
      });

      if (!res.ok) throw new Error('Failed to submit signature');
      setSignatureDone(true);
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { company, client, services, termsConditions, status, quotationNumber, createdAt, signatureUrl } = quotation;
  const brandPrimary = company.brandColors?.primary || '#8b5cf6';
  const subtotal = services.reduce((acc: number, item: any) => acc + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="Logo" className="h-16 w-auto mb-4 rounded-lg object-contain bg-white p-2 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-sm" style={{ backgroundColor: brandPrimary }}>
              {company.name[0]}
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{company.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{company.address || company.website}</p>
        </div>

        {/* Quotation Document */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-8 sm:p-12 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-8">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prepared For</h2>
              <p className="text-lg font-bold text-gray-900">{client.name}</p>
              <p className="text-sm text-gray-500">{client.email || client.phone}</p>
            </div>
            <div className="sm:text-right">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Quotation</h2>
              <p className="text-lg font-bold text-gray-900">{quotationNumber}</p>
              <p className="text-sm text-gray-500">Date: {new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Service Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold text-right">Qty</th>
                    <th className="pb-3 font-semibold text-right">Unit Price</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-4 text-gray-900">{item.description}</td>
                      <td className="py-4 text-right text-gray-500">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-500">{company.currency} {item.unitPrice.toLocaleString()}</td>
                      <td className="py-4 text-right font-medium text-gray-900">{company.currency} {item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-right">
                    <td colSpan={3} className="pt-6 pb-2 text-gray-500">Subtotal</td>
                    <td className="pt-6 pb-2 font-medium text-gray-900">{company.currency} {subtotal.toLocaleString()}</td>
                  </tr>
                  <tr className="text-right text-lg font-bold">
                    <td colSpan={3} className="py-2 text-gray-900">Total Amount</td>
                    <td className="py-2" style={{ color: brandPrimary }}>{company.currency} {subtotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {termsConditions && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Terms & Conditions</h3>
                <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">{termsConditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* E-Signature Section */}
        {!signatureDone ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Quotation</h3>
            <p className="text-sm text-gray-500 mb-6">By signing below, you agree to the terms and authorize the services outlined in this document.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 mb-4 cursor-crosshair">
              <SignatureCanvas 
                ref={sigPad}
                penColor="black"
                canvasProps={{className: 'w-full h-48'}}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <button onClick={handleClearSignature} className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                Clear Signature
              </button>
              
              <button 
                onClick={handleSign}
                disabled={signing}
                className="w-full sm:w-auto px-8 py-3.5 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: brandPrimary }}
              >
                {signing && <Loader2 className="w-5 h-5 animate-spin" />}
                Sign & Accept Quotation
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Quotation Accepted!</h3>
            <p className="text-emerald-700 text-sm max-w-md">Thank you for your approval. A copy of this signed document has been saved to your account.</p>
            {signatureUrl && (
              <div className="mt-8 pt-6 border-t border-emerald-200/50 w-full">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">Digital Signature</p>
                <div className="bg-white rounded-xl p-4 inline-block border border-emerald-100 shadow-sm">
                  <img src={signatureUrl} alt="Signature" className="h-24 w-auto object-contain" />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
