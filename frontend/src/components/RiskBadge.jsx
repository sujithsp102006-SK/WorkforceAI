import React from 'react';

export default function RiskBadge({ level = 'LOW', score, size = 'sm' }) {
  const norm = (level || 'LOW').toUpperCase();

  const config = {
    HIGH: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
      dot: 'bg-rose-500',
      label: 'HIGH RISK'
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      dot: 'bg-amber-500',
      label: 'MEDIUM RISK'
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      dot: 'bg-emerald-500',
      label: 'LOW RISK'
    },
    UNASSESSED: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20',
      dot: 'bg-slate-400',
      label: 'UNASSESSED'
    }
  };

  const current = config[norm] || config.LOW;
  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ${current.bg} ${
        isLarge ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      <span className={`rounded-full mr-1.5 animate-pulse ${current.dot} ${isLarge ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'}`} />
      <span>{current.label}</span>
      {score !== undefined && score !== null && (
        <span className="ml-1 opacity-75 font-mono text-[11px]">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </span>
  );
}
