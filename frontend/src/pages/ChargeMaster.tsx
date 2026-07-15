import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronDown, ChevronRight, X, BookOpen, Tag } from 'lucide-react';
import { getCharges, createCharge, addAlias, deleteAlias } from '../api/client';
import type { Charge } from '../api/types';

function AliasBadge({
  alias,
  chargeId,
  aliasId,
  onDelete,
}: {
  alias: string;
  chargeId: number;
  aliasId: number;
  onDelete: (chargeId: number, aliasId: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-600">
      {alias}
      <button
        onClick={() => onDelete(chargeId, aliasId)}
        className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function ChargeRow({ charge, onAddAlias, onDeleteAlias }: {
  charge: Charge;
  onAddAlias: (chargeId: number, alias: string) => void;
  onDeleteAlias: (chargeId: number, aliasId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newAlias, setNewAlias] = useState('');

  const handleAddAlias = () => {
    const trimmed = newAlias.trim();
    if (!trimmed) return;
    onAddAlias(charge.id, trimmed);
    setNewAlias('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1 flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{charge.short_name}</span>
          <span className="font-medium text-gray-800">{charge.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{charge.aliases?.length ?? 0} aliases</span>
          <span
            className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
              charge.is_active
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {charge.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aliases (Tier 1 dictionary)</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {charge.aliases?.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No aliases yet</span>
            ) : (
              charge.aliases?.map((a) => (
                <AliasBadge
                  key={a.id}
                  alias={a.alias}
                  chargeId={charge.id}
                  aliasId={a.id}
                  onDelete={onDeleteAlias}
                />
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAlias()}
              className="input-field flex-1"
              placeholder="Add alias… (e.g. Fuel Levy, Bunker Fee)"
            />
            <button
              onClick={handleAddAlias}
              disabled={!newAlias.trim()}
              className="btn-primary px-3 py-2 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChargeMaster() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [formError, setFormError] = useState('');

  const { data: charges = [], isLoading } = useQuery({
    queryKey: ['charges'],
    queryFn: getCharges,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; short_name: string }) => createCharge(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['charges'] });
      setNewName('');
      setNewShortName('');
      setShowForm(false);
      setFormError('');
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const aliasMutation = useMutation({
    mutationFn: ({ chargeId, alias }: { chargeId: number; alias: string }) =>
      addAlias(chargeId, alias),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['charges'] }),
  });

  const deleteAliasMutation = useMutation({
    mutationFn: ({ chargeId, aliasId }: { chargeId: number; aliasId: number }) =>
      deleteAlias(chargeId, aliasId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['charges'] }),
  });

  const handleCreate = () => {
    if (!newName.trim() || !newShortName.trim()) {
      setFormError('Both name and short name are required');
      return;
    }
    createMutation.mutate({ name: newName.trim(), short_name: newShortName.trim().toUpperCase() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Configuration</p>
          <h1 className="text-2xl font-bold text-gray-900">Charge Master</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Your internal charge standard — never exposed to forwarders
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Charge
        </button>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
        <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Aliases act as your Tier 1 synonym dictionary. Add known forwarder terms here to ensure deterministic, instant mapping for all future quotes and invoices.
        </p>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">New Charge Entry</h2>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field"
                placeholder="e.g. Bunker Adjustment Factor"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Short Code</label>
              <input
                value={newShortName}
                onChange={(e) => setNewShortName(e.target.value.toUpperCase())}
                className="input-field font-mono"
                placeholder="BAF"
                maxLength={10}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setShowForm(false); setNewName(''); setNewShortName(''); setFormError(''); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="btn-primary disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating…' : 'Create Charge'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : charges.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Your Charge Master is empty</p>
          <p className="text-sm text-gray-400 mt-1">Add your first charge entry above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {charges.map((charge: Charge) => (
            <ChargeRow
              key={charge.id}
              charge={charge}
              onAddAlias={(chargeId, alias) => aliasMutation.mutate({ chargeId, alias })}
              onDeleteAlias={(chargeId, aliasId) => deleteAliasMutation.mutate({ chargeId, aliasId })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
