import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, ArrowRight, FileText, AlertCircle, X } from 'lucide-react';
import { getInvoices, uploadInvoice } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isForwarder = user?.role === 'forwarder';
  const isClient = user?.role === 'client';

  const [showUpload, setShowUpload] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadInvoice(trackingNumber, selectedFile!),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setShowUpload(false);
      setTrackingNumber('');
      setSelectedFile(null);
      setUploadError(null);
      navigate(`/app/invoices/${data.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail?.message || err.message;
      setUploadError(msg);
    },
  });

  const handleUpload = () => {
    if (!trackingNumber.trim()) { setUploadError('Enter a tracking number'); return; }
    if (!selectedFile) { setUploadError('Select a PDF file'); return; }
    setUploadError(null);
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Invoice Management</p>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isClient ? 'Review and analyse uploaded freight invoices' : 'Upload invoice PDFs using tracking numbers'}
          </p>
        </div>
        {isForwarder && (
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary"
          >
            <Upload className="w-4 h-4" /> Upload Invoice
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Upload Invoice</h2>
              <button
                onClick={() => { setShowUpload(false); setSelectedFile(null); setTrackingNumber(''); setUploadError(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {uploadError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-INV-123"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice PDF</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    selectedFile
                      ? 'border-gray-400 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                  <Upload className={`w-7 h-7 mx-auto mb-2 ${selectedFile ? 'text-gray-600' : 'text-gray-300'}`} />
                  {selectedFile ? (
                    <p className="text-sm text-gray-800 font-medium">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Click to select PDF</p>
                      <p className="text-xs text-gray-400 mt-1">Supports digital and scanned PDFs · max 10 MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowUpload(false); setSelectedFile(null); setTrackingNumber(''); setUploadError(null); }}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="btn-primary flex-1 justify-center disabled:opacity-50"
                >
                  {uploadMutation.isPending ? 'Uploading…' : 'Upload & Extract'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-24 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No invoices yet</p>
          {isForwarder && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary mt-5"
            >
              <Upload className="w-4 h-4" /> Upload first invoice
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Quote Ref</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploaded</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/invoices/${inv.id}`)}
                >
                  <td className="px-5 py-3.5 font-mono text-sm font-semibold text-gray-900">{inv.invoice_number}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{inv.quote?.quote_ref ?? '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{inv.invoice_date}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(inv.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ArrowRight className="w-4 h-4 text-gray-300 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
