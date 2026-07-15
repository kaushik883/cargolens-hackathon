import { AlertTriangle, XCircle, MinusCircle, Copy, TrendingUp, ArrowUpDown, Weight, Thermometer } from 'lucide-react';
import type { AnomalyFlagType } from '../api/types';

interface Props {
  flagType: AnomalyFlagType;
  description?: string;
  variance?: number | null;
  compact?: boolean;
}

const CONFIG: Record<
  AnomalyFlagType,
  {
    label: string;
    sublabel: string;
    labelColor: string;
    rowBg: string;
    codeBg: string;
    Icon: React.ElementType;
  }
> = {
  AMOUNT_MISMATCH: {
    label: 'Amount Mismatch',
    sublabel: 'Charge total differs from quoted amount',
    labelColor: 'text-amber-700',
    rowBg: 'border-b border-gray-100 hover:bg-amber-50/50',
    codeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: TrendingUp,
  },
  RATE_MISMATCH: {
    label: 'Rate Mismatch',
    sublabel: 'Applied rate deviates from the quote',
    labelColor: 'text-amber-700',
    rowBg: 'border-b border-gray-100 hover:bg-amber-50/50',
    codeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: ArrowUpDown,
  },
  BASIS_MISMATCH: {
    label: 'Basis Mismatch',
    sublabel: 'Charge basis changed between quote and invoice',
    labelColor: 'text-amber-700',
    rowBg: 'border-b border-gray-100 hover:bg-amber-50/50',
    codeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
  },
  UNEXPECTED_CHARGE: {
    label: 'Unexpected Charge',
    sublabel: 'Line item not present in the original quote',
    labelColor: 'text-red-700',
    rowBg: 'border-b border-gray-100 hover:bg-red-50/50',
    codeBg: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  MISSING_CHARGE: {
    label: 'Missing Charge',
    sublabel: 'Quoted line item absent from invoice',
    labelColor: 'text-gray-600',
    rowBg: 'border-b border-gray-100 hover:bg-gray-50',
    codeBg: 'bg-gray-100 text-gray-600 border-gray-200',
    Icon: MinusCircle,
  },
  DUPLICATE_INVOICE: {
    label: 'Duplicate Invoice',
    sublabel: 'Invoice number already exists in the system',
    labelColor: 'text-red-700',
    rowBg: 'border-b border-gray-100 hover:bg-red-50/50',
    codeBg: 'bg-red-50 text-red-700 border-red-200',
    Icon: Copy,
  },
  TELEMETRY_WEIGHT_DROP: {
    label: 'Cargo Weight Drop',
    sublabel: 'Sudden weight loss detected in sensor readings',
    labelColor: 'text-orange-700',
    rowBg: 'border-b border-gray-100 hover:bg-orange-50/50',
    codeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    Icon: Weight,
  },
  SLA_TEMP_BREACH: {
    label: 'Temperature SLA Breach',
    sublabel: 'Cold-chain threshold exceeded for 2+ consecutive hours',
    labelColor: 'text-red-700',
    rowBg: 'border-b border-gray-100 hover:bg-red-50/50',
    codeBg: 'bg-red-50 text-red-700 border-red-200',
    Icon: Thermometer,
  },
};

export function AnomalyFlag({ flagType, description, variance, compact = false }: Props) {
  const c = CONFIG[flagType];
  const Icon = c.Icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${c.codeBg}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  }

  // Full row for the anomaly table
  return (
    <div className={`grid grid-cols-[200px_1fr_120px] items-start px-5 py-4 ${c.rowBg} transition-colors`}>
      {/* Type */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-3.5 h-3.5 ${c.labelColor} flex-shrink-0`} />
          <span className={`text-sm font-semibold ${c.labelColor}`}>{c.label}</span>
        </div>
        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${c.codeBg} uppercase`}>
          {flagType.replace(/_/g, '-')}
        </span>
      </div>
      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed pr-4">{description ?? c.sublabel}</p>
      {/* Variance */}
      <div className="text-right">
        {variance != null ? (
          <span className={`text-sm font-bold font-mono tabular-nums ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {variance > 0 ? '+' : ''}{variance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    </div>
  );
}
