import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { AnomalyFlag } from './AnomalyFlag';
import type { ChargeLineRow, AnomalyRead, Charge } from '../api/types';

interface Props {
  charges: ChargeLineRow[];
  isClient: boolean;
  showConfidence?: boolean;
  chargeMaster?: Charge[];
  onCorrectMapping?: (chargeId: number, mappedChargeId: number) => void;
  anomalies?: AnomalyRead[];
  quoteCharges?: ChargeLineRow[];
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MappingDropdown({
  chargeId,
  chargeMaster,
  onSelect,
}: {
  chargeId: number;
  chargeMaster: Charge[];
  onSelect: (chargeId: number, mappedChargeId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        Correct <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {chargeMaster.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(chargeId, c.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-400 font-mono w-10 flex-shrink-0">{c.short_name}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ChargeLineTable({
  charges,
  isClient,
  showConfidence = false,
  chargeMaster = [],
  onCorrectMapping,
  anomalies = [],
  quoteCharges = [],
}: Props) {
  const anomalyMap = new Map(anomalies.map((a) => [a.invoice_charge_id, a]));
  const quoteMap = new Map(quoteCharges.map((q) => [q.mapped_charge_id, q]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {isClient ? (
              <>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Charge</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Forwarder Term</th>
              </>
            ) : (
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Charge Name</th>
            )}
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Rate</th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Basis</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
            {quoteCharges.length > 0 && (
              <>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Quoted</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Variance</th>
              </>
            )}
            {showConfidence && isClient && (
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence</th>
            )}
            {anomalies.length > 0 && (
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Flag</th>
            )}
            {onCorrectMapping && isClient && (
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {charges.map((charge) => {
            const anomaly = anomalyMap.get(charge.id);
            const quoteCharge = quoteMap.get(charge.mapped_charge_id ?? -1);
            const needsReview = charge.mapping_tier === 'UNMAPPED' || charge.low_confidence;
            const rowClass = anomaly
              ? 'bg-red-50 border-l-2 border-l-red-400'
              : needsReview && isClient
              ? 'bg-amber-50 border-l-2 border-l-amber-400'
              : '';

            return (
              <tr key={charge.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${rowClass}`}>
                {isClient ? (
                  <>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-900">
                        {charge.mapped_charge_name ?? (
                          <span className="italic text-gray-400">Unmapped</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500">{charge.raw_charge_name}</span>
                    </td>
                  </>
                ) : (
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-gray-900">{charge.raw_charge_name}</span>
                  </td>
                )}
                <td className="px-5 py-3.5 text-right font-mono text-gray-700">{fmt(charge.rate)}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-mono">{charge.basis}</span>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-gray-700">{charge.qty}</td>
                <td className="px-5 py-3.5 text-right font-mono font-semibold text-gray-900">{fmt(charge.amount)}</td>
                {quoteCharges.length > 0 && (
                  <>
                    <td className="px-5 py-3.5 text-right font-mono text-gray-500">
                      {quoteCharge ? fmt(quoteCharge.amount) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono">
                      {quoteCharge ? (() => {
                        const v = charge.amount - quoteCharge.amount;
                        const rounded = Math.round(v * 100) / 100;
                        if (rounded === 0) return <span className="text-gray-400">—</span>;
                        return (
                          <span className={`font-bold ${rounded > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {rounded > 0 ? '+' : ''}{fmt(rounded)}
                          </span>
                        );
                      })() : <span className="text-red-600 font-bold">+{fmt(charge.amount)}</span>}
                    </td>
                  </>
                )}
                {showConfidence && isClient && (
                  <td className="px-5 py-3.5 text-center">
                    <ConfidenceBadge tier={charge.mapping_tier} score={charge.similarity_score} />
                  </td>
                )}
                {anomalies.length > 0 && (
                  <td className="px-5 py-3.5 text-center">
                    {anomaly ? (
                      <AnomalyFlag flagType={anomaly.flag_type} compact />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    )}
                  </td>
                )}
                {onCorrectMapping && isClient && (
                  <td className="px-5 py-3.5 text-center">
                    {needsReview && chargeMaster.length > 0 ? (
                      <MappingDropdown
                        chargeId={charge.id}
                        chargeMaster={chargeMaster}
                        onSelect={onCorrectMapping}
                      />
                    ) : charge.mapping_tier === 'HUMAN' ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1 justify-center">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : null}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 bg-gray-50">
            <td colSpan={isClient ? 4 : 3} className="px-5 py-3.5 text-sm font-semibold text-gray-600">
              Total
            </td>
            <td className="px-5 py-3.5" />
            <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">
              {fmt(charges.reduce((s, c) => s + c.amount, 0))}
            </td>
            {quoteCharges.length > 0 && (
              <>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-500">
                  {fmt(quoteCharges.reduce((s, c) => s + c.amount, 0))}
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-bold">
                  {(() => {
                    const invTotal = charges.reduce((s, c) => s + c.amount, 0);
                    const qtTotal = quoteCharges.reduce((s, c) => s + c.amount, 0);
                    const v = Math.round((invTotal - qtTotal) * 100) / 100;
                    if (v === 0) return <span className="text-gray-400">—</span>;
                    return <span className={v > 0 ? 'text-red-600' : 'text-green-600'}>{v > 0 ? '+' : ''}{fmt(v)}</span>;
                  })()}
                </td>
              </>
            )}
            {showConfidence && isClient && <td />}
            {anomalies.length > 0 && <td />}
            {onCorrectMapping && isClient && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
