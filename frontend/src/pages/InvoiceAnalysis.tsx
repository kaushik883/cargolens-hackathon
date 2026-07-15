import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Zap, AlertTriangle, CheckCircle2, FileText,
  ExternalLink, Activity, BarChart3, ShieldAlert, ChevronRight
} from 'lucide-react';
import { getInvoice, analyzeInvoice, getAnomalies, getCharges, correctInvoiceChargeMapping, getQuote } from '../api/client';
import { ChargeLineTable } from '../components/ChargeLineTable';
import { AnomalyFlag } from '../components/AnomalyFlag';
import TelemetryDashboard from '../components/TelemetryDashboard';
import { useAuth } from '../hooks/useAuth';

const TELEMETRY_FLAG_TYPES = new Set(['TELEMETRY_WEIGHT_DROP', 'SLA_TEMP_BREACH']);

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Stat card for variance summary ─────────────────────────────────────────────
function VarianceCard({
  label,
  value,
  sub,
  highlight,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  const borderColor = highlight
    ? positive ? 'border-green-200' : 'border-red-200'
    : 'border-gray-200';
  const labelColor = highlight
    ? positive ? 'text-green-600' : 'text-red-600'
    : 'text-gray-400';
  const valueColor = highlight
    ? positive ? 'text-green-600' : 'text-red-600'
    : 'text-gray-900';

  return (
    <div className={`bg-white border ${borderColor} rounded-xl p-6`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${labelColor}`}>{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

// ── Section block with label ────────────────────────────────────────────────────
function Section({
  label,
  title,
  badge,
  children,
}: {
  label: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function InvoiceAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const [analysed, setAnalysed] = useState(false);

  const { data: invoice, isLoading: invLoading } = useQuery({
    queryKey: ['invoices', Number(id)],
    queryFn: () => getInvoice(Number(id)),
    enabled: !!id,
  });

  const { data: chargeMaster = [] } = useQuery({
    queryKey: ['charges'],
    queryFn: getCharges,
    enabled: isClient,
  });

  const { data: quoteDetail } = useQuery({
    queryKey: ['quotes', invoice?.quote_id],
    queryFn: () => getQuote(invoice!.quote_id),
    enabled: !!invoice?.quote_id && isClient,
  });

  const { data: anomalies = [], refetch: refetchAnomalies } = useQuery({
    queryKey: ['anomalies', Number(id)],
    queryFn: () => getAnomalies(Number(id)),
    enabled: analysed,
  });

  const analyseMutation = useMutation({
    mutationFn: () => analyzeInvoice(Number(id)),
    onSuccess: async () => {
      setAnalysed(true);
      await refetchAnomalies();
    },
  });

  const correctMutation = useMutation({
    mutationFn: ({ chargeId, mappedChargeId }: { chargeId: number; mappedChargeId: number }) =>
      correctInvoiceChargeMapping(chargeId, mappedChargeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', Number(id)] }),
  });

  if (invLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 rounded-xl border border-gray-200 bg-white" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl border border-gray-200 bg-white" />)}
        </div>
        <div className="h-64 rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <FileText className="w-10 h-10 text-gray-200" />
        <p className="text-gray-400 font-medium">Invoice not found.</p>
      </div>
    );
  }

  const invoiceTotal = (invoice.charges ?? []).reduce((s, c) => s + c.amount, 0);
  const quoteTotal   = (quoteDetail?.charges ?? []).reduce((s, c) => s + c.amount, 0);
  const variance     = invoiceTotal - quoteTotal;

  const financialAnomalies = anomalies.filter((a) => !TELEMETRY_FLAG_TYPES.has(a.flag_type));
  const telemetryAnomalies = anomalies.filter((a) =>  TELEMETRY_FLAG_TYPES.has(a.flag_type));
  const telemetryData      = (quoteDetail as any)?.telemetry_data ?? [];

  const totalFlags = anomalies.length;
  const criticalFlags = telemetryAnomalies.length + financialAnomalies.filter(a =>
    a.flag_type === 'UNEXPECTED_CHARGE' || a.flag_type === 'AMOUNT_MISMATCH'
  ).length;

  return (
    <div className="space-y-8">

      {/* ── Breadcrumb + Header ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <button onClick={() => navigate('/app/invoices')} className="hover:text-gray-700 transition-colors">
            Invoices
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600">Analysis</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-3xl font-bold text-gray-900 font-mono">{invoice.invoice_number}</h1>
              {analysed && criticalFlags > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {criticalFlags} Critical Flag{criticalFlags > 1 ? 's' : ''}
                </span>
              )}
              {analysed && totalFlags === 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clean
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{invoice.quote?.quote_ref}</span>
              <span>·</span>
              <span>{invoice.invoice_date}</span>
              {analysed && totalFlags > 0 && (
                <>
                  <span>·</span>
                  <span className="text-red-600 font-medium">{totalFlags} flag{totalFlags > 1 ? 's' : ''} detected</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/invoices')}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {isClient && (
              <button
                onClick={() => analyseMutation.mutate()}
                disabled={analyseMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${analyseMutation.isPending ? 'animate-pulse' : ''}`} />
                {analyseMutation.isPending ? 'Analysing…' : 'Analyse Invoice'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Variance Summary ─────────────────────────────────────────────────── */}
      {isClient && analysed && quoteDetail && (
        <div className="grid grid-cols-3 gap-4">
          <VarianceCard
            label="Invoice Total"
            value={`${invoice.charges?.[0] ? '' : ''}${fmt(invoiceTotal)}`}
            sub="Extracted from PDF"
          />
          <VarianceCard
            label="Quoted Total"
            value={fmt(quoteTotal)}
            sub="Original accepted quote"
          />
          <VarianceCard
            label="Net Variance"
            value={`${variance >= 0 ? '+' : ''}${fmt(variance)}`}
            sub={variance !== 0 ? `${Math.abs((variance / (quoteTotal || 1)) * 100).toFixed(1)}% ${variance > 0 ? 'over' : 'under'} quote` : 'Exact match'}
            highlight
            positive={variance <= 0}
          />
        </div>
      )}

      {/* ── E&I Telemetry Forensics ──────────────────────────────────────────── */}
      {isClient && analysed && (
        <Section
          label="E&I Forensics"
          title="Virtual Telemetry Analysis"
          badge={
            telemetryAnomalies.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <Activity className="w-3.5 h-3.5" />
                {telemetryAnomalies.length} forensic flag{telemetryAnomalies.length > 1 ? 's' : ''}
              </span>
            ) : telemetryData.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Clear
              </span>
            ) : null
          }
        >
          {telemetryData.length > 0 ? (
            <TelemetryDashboard
              telemetryData={telemetryData}
              anomalies={telemetryAnomalies}
              tempThreshold={5}
            />
          ) : (
            <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-gray-200">
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">No sensor data available</p>
                <p className="text-xs text-gray-400 mt-0.5">Telemetry is generated when a quote is accepted.</p>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── Financial Anomalies ──────────────────────────────────────────────── */}
      {isClient && analysed && (
        <Section
          label="Audit Report"
          title="Financial Anomalies"
          badge={
            financialAnomalies.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {financialAnomalies.length} detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Clear
              </span>
            )
          }
        >
          {financialAnomalies.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[200px_1fr_120px] border-b border-gray-100 bg-gray-50 px-5 py-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Anomaly Type</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Variance</span>
              </div>
              <div>
                {financialAnomalies.map((a) => (
                  <AnomalyFlag key={a.id} flagType={a.flag_type} description={a.description} variance={a.variance} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-9 h-9 rounded-lg bg-white border border-green-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">All charges verified</p>
                <p className="text-xs text-green-600 mt-0.5">Invoice charges match the accepted quote.</p>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── Invoice Charges Table ────────────────────────────────────────────── */}
      <Section
        label="Line Items"
        title="Invoice Charges"
        badge={
          isClient ? (
            <span className="text-xs text-gray-400 font-normal">
              {analysed && quoteDetail ? 'charge-wise variance shown' : 'mapped to your Charge Master'}
            </span>
          ) : undefined
        }
      >
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <ChargeLineTable
            charges={invoice.charges ?? []}
            isClient={isClient}
            showConfidence={isClient}
            chargeMaster={chargeMaster}
            onCorrectMapping={
              isClient
                ? (chargeId, mappedChargeId) =>
                    correctMutation.mutate({ chargeId, mappedChargeId })
                : undefined
            }
            anomalies={isClient && analysed ? anomalies : []}
            quoteCharges={isClient && analysed && quoteDetail ? (quoteDetail.charges ?? []) : []}
          />
        </div>
      </Section>

      {/* ── PDF Source Document ──────────────────────────────────────────────── */}
      <a
        href={invoice.file_path}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-4 w-full px-5 py-4 rounded-xl border border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all group"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{invoice.invoice_number}.pdf</p>
          <p className="text-xs text-gray-400 mt-0.5">Source document · Click to open in a new tab</p>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0" />
      </a>

    </div>
  );
}
