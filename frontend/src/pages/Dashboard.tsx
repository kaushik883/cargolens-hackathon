import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getQuotes, getInvoices } from '../api/client';
import type { QuoteHeader } from '../api/types';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACCEPTED:  { label: 'Accepted',  cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:  { label: 'Rejected',  cls: 'bg-red-50 text-red-700 border-red-200' },
};

function StatCard({
  label,
  value,
  Icon,
  accentColor = 'text-gray-900',
  note,
}: {
  label: string;
  value: number | string;
  Icon: React.ElementType;
  accentColor?: string;
  note?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
          <p className={`text-4xl font-bold tabular-nums ${accentColor}`}>{value}</p>
          {note && <p className="text-xs text-gray-400 mt-2">{note}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
}

function QuoteRow({ quote }: { quote: QuoteHeader }) {
  const navigate = useNavigate();
  const sc = STATUS_CONFIG[quote.status];
  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => navigate(`/app/quotes/${quote.id}`)}
    >
      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-gray-900">{quote.quote_ref}</td>
      <td className="px-5 py-3.5 text-sm text-gray-600">
        {quote.forwarder?.name ?? quote.buyer?.name ?? '—'}
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-semibold ${sc.cls}`}>
          {sc.label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-400">
        {new Date(quote.created_at).toLocaleDateString()}
      </td>
      <td className="px-5 py-3.5 text-right">
        <ArrowRight className="w-4 h-4 text-gray-300 inline" />
      </td>
    </tr>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isClient = user?.role === 'client';
  const isForwarder = user?.role === 'forwarder';

  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
    enabled: isClient || isForwarder,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
    enabled: isClient || isForwarder,
  });

  const openQuotes = quotes.filter((q) => q.status === 'SUBMITTED').length;
  const acceptedQuotes = quotes.filter((q) => q.status === 'ACCEPTED').length;
  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const now = new Date();
  const invoicesThisMonth = invoices.filter((inv) => {
    const d = new Date(inv.uploaded_at ?? inv.invoice_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (user?.role === 'super_admin') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Super Admin dashboard</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div
            onClick={() => navigate('/app/companies')}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-400 cursor-pointer transition-colors group"
          >
            <Building2 className="w-8 h-8 text-gray-400 group-hover:text-gray-900 mb-4 transition-colors" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Manage Companies</h2>
            <p className="text-sm text-gray-500">Create and manage client and forwarder companies.</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-900">
              Go to Companies <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{user?.company_name}</p>
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

      {/* KPI Cards */}
      {(quotesLoading || invoicesLoading) ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {isClient ? (
            <>
              <StatCard
                label="Open Quotes"
                value={openQuotes}
                Icon={Clock}
                accentColor={openQuotes > 0 ? 'text-blue-600' : 'text-gray-900'}
                note="Awaiting your review"
              />
              <StatCard
                label="Invoices This Month"
                value={invoicesThisMonth}
                Icon={Upload}
                note="Uploaded this month"
              />
              <StatCard
                label="Accepted Quotes"
                value={acceptedQuotes}
                Icon={CheckCircle2}
                accentColor="text-green-600"
                note="Total accepted"
              />
            </>
          ) : (
            <>
              <StatCard
                label="My Quotes"
                value={quotes.length}
                Icon={FileText}
                note="Total submitted"
              />
              <StatCard
                label="Accepted"
                value={acceptedQuotes}
                Icon={CheckCircle2}
                accentColor="text-green-600"
                note="Client accepted"
              />
              <StatCard
                label="Invoices Uploaded"
                value={invoices.length}
                Icon={Upload}
                note="Total invoices"
              />
            </>
          )}
        </div>
      )}

      {/* Alert banner */}
      {isClient && openQuotes > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{openQuotes} quote{openQuotes > 1 ? 's' : ''}</span> awaiting your review.
          </p>
          <button
            onClick={() => navigate('/app/quotes')}
            className="ml-auto text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            Review <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Forwarder quick action */}
      {isForwarder && (
        <div
          onClick={() => navigate('/app/quotes/new')}
          className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-gray-400 cursor-pointer transition-colors group text-center"
        >
          <Plus className="w-8 h-8 text-gray-300 group-hover:text-gray-700 mx-auto mb-3 transition-colors" />
          <p className="text-sm font-semibold text-gray-500 group-hover:text-gray-800 transition-colors">
            Submit a new freight quote
          </p>
        </div>
      )}

      {/* Recent Quotes table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" /> Recent Quotes
          </h2>
          <button
            onClick={() => navigate('/app/quotes')}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {recentQuotes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No quotes yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ref</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {isClient ? 'Forwarder' : 'Client'}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((q) => (
                  <QuoteRow key={q.id} quote={q} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
