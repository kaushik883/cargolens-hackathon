import type { MappingTier } from '../api/types';

interface Props {
  tier: MappingTier;
  score?: number | null;
}

const CONFIG: Record<MappingTier, { label: string; dot: string; cls: string }> = {
  DICTIONARY: {
    label: 'High Confidence',
    dot: 'bg-green-500',
    cls: 'bg-green-50 border-green-200 text-green-700',
  },
  VECTOR: {
    label: '',
    dot: '',
    cls: '',
  },
  LLM: {
    label: 'AI Resolved',
    dot: 'bg-blue-500',
    cls: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  HUMAN: {
    label: 'Human Verified',
    dot: 'bg-green-500',
    cls: 'bg-green-50 border-green-200 text-green-700',
  },
  UNMAPPED: {
    label: 'Needs Review',
    dot: 'bg-red-500',
    cls: 'bg-red-50 border-red-200 text-red-700',
  },
};

function resolveConfig(tier: MappingTier, score?: number | null) {
  if (tier === 'VECTOR') {
    if (score !== undefined && score !== null) {
      if (score >= 0.85) {
        return { label: 'High Confidence', dot: 'bg-green-500', cls: 'bg-green-50 border-green-200 text-green-700' };
      }
      if (score >= 0.70) {
        return { label: 'Review Suggested', dot: 'bg-amber-500', cls: 'bg-amber-50 border-amber-200 text-amber-700' };
      }
    }
    return { label: 'Low Similarity', dot: 'bg-amber-500', cls: 'bg-amber-50 border-amber-200 text-amber-700' };
  }
  return CONFIG[tier];
}

export function ConfidenceBadge({ tier, score }: Props) {
  const c = resolveConfig(tier, score);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-semibold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
      {tier === 'VECTOR' && score !== null && score !== undefined && (
        <span className="opacity-70">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
}
