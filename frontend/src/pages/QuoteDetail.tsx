import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, X, AlertCircle, ChevronRight } from 'lucide-react';
import { getQuote, updateQuoteStatus, correctQuoteChargeMapping, getCharges } from '../api/client';
import { ChargeLineTable } from '../components/ChargeLineTable';
import { useAuth } from '../hooks/useAuth';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Pending Review', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACCEPTED:  { label: 'Accepted',        cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:  { label: 'Rejected',        cls: 'bg-red-50 text-red-700 border-red-200' },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quotes', Number(id)],
    queryFn: () => getQuote(Number(id)),
    enabled: !!id,
  });

  const { data: chargeMaster = [] } = useQuery({
    queryKey: ['charges'],
    queryFn: getCharges,
    enabled: isClient,
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: 'ACCEPTED' | 'REJECTED'; note?: string }) =>
      updateQuoteStatus(Number(id), status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes', Number(id)] });
      qc.invalidateQueries({ queryKey: ['quotes'] });
      setShowRejectModal(false);
      setRejectNote('');
      setActionError(null);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const correctMutation = useMutation({
    mutationFn: ({ chargeId, mappedChargeId }: { chargeId: number; mappedChargeId: number }) =>
      correctQuoteChargeMapping(chargeId, mappedChargeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', Number(id)] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-gray-200 bg-white" />
        ))}
      </div>
    );
  }

  if (!quote) {
    return <div className="text-gray-400 py-12 text-center">Quote not found.</div>;
  }

  const sc = STATUS_CONFIG[quote.status];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <button onClick={() => navigate('/app/quotes')} className="hover:text-gray-700 transition-colors">
          Quotes
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 font-mono">{quote.quote_ref}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900 font-mono">{quote.quote_ref}</h1>
            <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${sc.cls}`}>
              {sc.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {isClient ? quote.forwarder?.name : quote.buyer?.name}
          </p>
        </div>

        {isClient && quote.status === 'SUBMITTED' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRejectModal(true)}
              className="btn-secondary border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={() => statusMutation.mutate({ status: 'ACCEPTED' })}
              disabled={statusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {statusMutation.isPending ? 'Accepting…' : 'Accept Quote'}
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {actionError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Rejection note */}
      {quote.status === 'REJECTED' && quote.rejection_note && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Rejection Note</p>
          <p className="text-sm text-red-800">{quote.rejection_note}</p>
        </div>
      )}

      {/* Info panels */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Shipment</h2>
          <InfoRow label="Origin" value={<span className="font-mono">{quote.origin_airport?.iata_code} — {quote.origin_airport?.name}</span>} />
          <InfoRow label="Destination" value={<span className="font-mono">{quote.destination_airport?.iata_code} — {quote.destination_airport?.name}</span>} />
          <InfoRow label="AWB / Tracking" value={<span className="font-mono">{quote.tracking_number}</span>} />
          <InfoRow label="Currency" value={quote.currency?.short_name} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Weights</h2>
          <InfoRow label="Gross Weight" value={`${quote.gross_weight} kg`} />
          <InfoRow label="Volumetric Weight" value={`${quote.volumetric_weight} kg`} />
          <InfoRow label="Chargeable Weight" value={`${quote.chargeable_weight} kg`} />
          <InfoRow label="Submitted" value={new Date(quote.created_at).toLocaleDateString()} />
        </div>
      </div>

      {/* Charge Lines */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Charge Lines
          {isClient && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              — showing your Charge Master nomenclature
            </span>
          )}
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <ChargeLineTable
            charges={quote.charges ?? []}
            isClient={isClient}
            showConfidence={isClient}
            chargeMaster={chargeMaster}
            onCorrectMapping={
              isClient
                ? (chargeId, mappedChargeId) =>
                    correctMutation.mutate({ chargeId, mappedChargeId })
                : undefined
            }
          />
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Reject Quote</h2>
              <button
                onClick={() => { setShowRejectModal(false); setRejectNote(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Optionally provide a reason. The forwarder will see this note.
              </p>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="e.g. BAF rate exceeds agreed ceiling…"
              />
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectNote(''); }}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => statusMutation.mutate({ status: 'REJECTED', note: rejectNote || undefined })}
                  disabled={statusMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {statusMutation.isPending ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
