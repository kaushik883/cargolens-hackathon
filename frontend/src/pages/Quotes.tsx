import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRight, FileText } from 'lucide-react';
import { getQuotes } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACCEPTED:  { label: 'Accepted',  cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:  { label: 'Rejected',  cls: 'bg-red-50 text-red-700 border-red-200' },
};

export function Quotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const isForwarder = user?.role === 'forwarder';

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {isClient ? 'Client Portal' : 'Forwarder Portal'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isClient
              ? 'Review and act on incoming freight quotes'
              : 'Track your submitted freight quotes'}
          </p>
        </div>
        {isForwarder && (
          <button
            onClick={() => navigate('/app/quotes/new')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> New Quote
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-lg border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-24 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No quotes yet</p>
          {isForwarder && (
            <button
              onClick={() => navigate('/app/quotes/new')}
              className="btn-primary mt-5"
            >
              <Plus className="w-4 h-4" /> Submit your first quote
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Quote Ref</th>
                {isClient && (
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Forwarder</th>
                )}
                {isForwarder && (
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                )}
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Route</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">AWB</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                {isForwarder && (
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Note</th>
                )}
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const sc = STATUS_CONFIG[q.status];
                return (
                  <tr
                    key={q.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/quotes/${q.id}`)}
                  >
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold text-gray-900">{q.quote_ref}</td>
                    {isClient && (
                      <td className="px-5 py-3.5 text-gray-700">{q.forwarder?.name ?? '—'}</td>
                    )}
                    {isForwarder && (
                      <td className="px-5 py-3.5 text-gray-700">{q.buyer?.name ?? '—'}</td>
                    )}
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                      {q.origin_airport?.iata_code} → {q.destination_airport?.iata_code}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{q.tracking_number}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-semibold ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    {isForwarder && (
                      <td className="px-5 py-3.5 text-xs text-gray-400 max-w-[180px] truncate">
                        {q.rejection_note ?? '—'}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-right">
                      <ArrowRight className="w-4 h-4 text-gray-300 inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
