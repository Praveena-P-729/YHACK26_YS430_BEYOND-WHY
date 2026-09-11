import React from 'react';

export default function RiskBadge({ level, score }) {
  const normalized = (level || 'Low').toLowerCase();
  
  let colors = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (normalized === 'moderate') {
    colors = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (normalized === 'high') {
    colors = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
  } else if (normalized === 'severe') {
    colors = 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${colors}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{level || 'Low'}</span>
      {score !== undefined && <span className="opacity-75">({score})</span>}
    </span>
  );
}
