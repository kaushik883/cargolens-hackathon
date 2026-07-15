import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, AlertCircle, ArrowLeft } from 'lucide-react';
import { getCompanies, getAirports, getCurrencies, submitQuote } from '../api/client';
import type { ChargeBasis, QuoteSubmitPayload } from '../api/types';

const BASIS_OPTIONS: ChargeBasis[] = ['Per KG', 'Per Shipment', 'Per CBM'];

interface ChargeLine {
  raw_charge_name: string;
  rate: string;
  basis: ChargeBasis;
  qty: string;
  amount: string;
}

const emptyCharge = (): ChargeLine => ({
  raw_charge_name: '',
  rate: '',
  basis: 'Per KG',
  qty: '',
  amount: '',
});

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function QuoteForm() {
  const navigate = useNavigate();
  const [charges, setCharges] = useState<ChargeLine[]>([emptyCharge()]);
  const [header, setHeader] = useState({
    buyer_id: '',
    origin_airport_id: '',
    destination_airport_id: '',
    tracking_number: '',
    gross_weight: '',
    volumetric_weight: '',
    chargeable_weight: '',
    currency_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
  const { data: airports = [] } = useQuery({ queryKey: ['airports'], queryFn: getAirports });
  const { data: currencies = [] } = useQuery({ queryKey: ['currencies'], queryFn: getCurrencies });

  const clientCompanies = companies.filter((c) => c.type === 'client' && c.is_active);

  const submitMutation = useMutation({
    mutationFn: (payload: QuoteSubmitPayload) => submitQuote(payload),
    onSuccess: (data) => navigate(`/app/quotes/${data.id}`),
    onError: (err: Error) => setApiError(err.message),
  });

  const updateCharge = (idx: number, field: keyof ChargeLine, value: string) => {
    setCharges((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const updated = { ...c, [field]: value };
        if (field === 'rate' || field === 'qty') {
          const r = parseFloat(field === 'rate' ? value : updated.rate) || 0;
          const q = parseFloat(field === 'qty' ? value : updated.qty) || 0;
          updated.amount = r && q ? (r * q).toFixed(2) : updated.amount;
        }
        return updated;
      }),
    );
  };

  const addCharge = () => setCharges((prev) => [...prev, emptyCharge()]);
  const removeCharge = (idx: number) => setCharges((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!header.buyer_id) errs.buyer_id = 'Select a client';
    if (!header.origin_airport_id) errs.origin = 'Select origin airport';
    if (!header.destination_airport_id) errs.destination = 'Select destination airport';
    if (!header.tracking_number.trim()) errs.tracking = 'AWB/tracking number required';
    if (!header.gross_weight || isNaN(Number(header.gross_weight))) errs.gross = 'Valid weight required';
    if (!header.currency_id) errs.currency = 'Select currency';
    charges.forEach((c, i) => {
      if (!c.raw_charge_name.trim()) errs[`charge_name_${i}`] = 'Charge name required';
      if (!c.rate || isNaN(Number(c.rate))) errs[`charge_rate_${i}`] = 'Valid rate required';
      if (!c.qty || isNaN(Number(c.qty))) errs[`charge_qty_${i}`] = 'Valid qty required';
      if (!c.amount || isNaN(Number(c.amount))) errs[`charge_amount_${i}`] = 'Valid amount required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: QuoteSubmitPayload = {
      buyer_id: Number(header.buyer_id),
      origin_airport_id: Number(header.origin_airport_id),
      destination_airport_id: Number(header.destination_airport_id),
      tracking_number: header.tracking_number,
      gross_weight: Number(header.gross_weight),
      volumetric_weight: Number(header.volumetric_weight) || 0,
      chargeable_weight: Number(header.chargeable_weight) || 0,
      currency_id: Number(header.currency_id),
      charges: charges.map((c) => ({
        raw_charge_name: c.raw_charge_name,
        rate: Number(c.rate),
        basis: c.basis,
        qty: Number(c.qty),
        amount: Number(c.amount),
      })),
    };
    submitMutation.mutate(payload);
  };

  const hField = (key: keyof typeof header) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setHeader((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <button onClick={() => navigate('/app/quotes')} className="hover:text-gray-700 transition-colors">
            Quotes
          </button>
          <span>/</span>
          <span className="text-gray-600">New Quote</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Quote</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Use your own charge terminology — we handle the mapping.</p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Shipment Details</h2>

          <Field label="Addressed To (Client)" error={errors.buyer_id}>
            <select value={header.buyer_id} onChange={hField('buyer_id')} className="input-field">
              <option value="">Select client company…</option>
              {clientCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Origin Airport" error={errors.origin}>
              <select value={header.origin_airport_id} onChange={hField('origin_airport_id')} className="input-field">
                <option value="">Select…</option>
                {airports.map((a) => (
                  <option key={a.id} value={a.id}>{a.iata_code} — {a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Destination Airport" error={errors.destination}>
              <select value={header.destination_airport_id} onChange={hField('destination_airport_id')} className="input-field">
                <option value="">Select…</option>
                {airports.map((a) => (
                  <option key={a.id} value={a.id}>{a.iata_code} — {a.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="AWB / Tracking Number" error={errors.tracking}>
            <input
              value={header.tracking_number}
              onChange={hField('tracking_number')}
              className="input-field"
              placeholder="e.g. 176-12345678"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Gross Weight (kg)" error={errors.gross}>
              <input type="number" step="0.01" value={header.gross_weight} onChange={hField('gross_weight')} className="input-field" placeholder="0.00" />
            </Field>
            <Field label="Volumetric Weight (kg)">
              <input type="number" step="0.01" value={header.volumetric_weight} onChange={hField('volumetric_weight')} className="input-field" placeholder="0.00" />
            </Field>
            <Field label="Chargeable Weight (kg)">
              <input type="number" step="0.01" value={header.chargeable_weight} onChange={hField('chargeable_weight')} className="input-field" placeholder="0.00" />
            </Field>
          </div>

          <Field label="Currency" error={errors.currency}>
            <select value={header.currency_id} onChange={hField('currency_id')} className="input-field">
              <option value="">Select currency…</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>{c.short_name} — {c.name}</option>
              ))}
            </select>
          </Field>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Charge Lines</h2>
            <button
              type="button"
              onClick={addCharge}
              className="btn-secondary text-sm"
            >
              <Plus className="w-4 h-4" /> Add Charge
            </button>
          </div>

          <div className="space-y-3">
            {charges.map((charge, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-400">CHARGE {idx + 1}</span>
                  {charges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCharge(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Charge Name (your terminology)</label>
                  <input
                    value={charge.raw_charge_name}
                    onChange={(e) => updateCharge(idx, 'raw_charge_name', e.target.value)}
                    className="input-field"
                    placeholder="e.g. Fuel Levy, Bunker Surcharge, Terminal Fee…"
                  />
                  {errors[`charge_name_${idx}`] && <p className="err">{errors[`charge_name_${idx}`]}</p>}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rate</label>
                    <input
                      type="number" step="0.01"
                      value={charge.rate}
                      onChange={(e) => updateCharge(idx, 'rate', e.target.value)}
                      className="input-field"
                      placeholder="0.00"
                    />
                    {errors[`charge_rate_${idx}`] && <p className="err">{errors[`charge_rate_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Basis</label>
                    <select
                      value={charge.basis}
                      onChange={(e) => updateCharge(idx, 'basis', e.target.value)}
                      className="input-field"
                    >
                      {BASIS_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                    <input
                      type="number" step="0.01"
                      value={charge.qty}
                      onChange={(e) => updateCharge(idx, 'qty', e.target.value)}
                      className="input-field"
                      placeholder="1"
                    />
                    {errors[`charge_qty_${idx}`] && <p className="err">{errors[`charge_qty_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <input
                      type="number" step="0.01"
                      value={charge.amount}
                      onChange={(e) => updateCharge(idx, 'amount', e.target.value)}
                      className="input-field"
                      placeholder="0.00"
                    />
                    {errors[`charge_amount_${idx}`] && <p className="err">{errors[`charge_amount_${idx}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <div className="text-right">
              <span className="text-xs text-gray-400">Total</span>
              <p className="text-xl font-bold text-gray-900 font-mono">
                {charges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/app/quotes')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="btn-primary disabled:opacity-60"
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit Quote'}
          </button>
        </div>
      </form>
    </div>
  );
}
