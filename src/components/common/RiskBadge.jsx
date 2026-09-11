import React from 'react';

export default function RiskBadge({ level, score }) {
  const normalized = (level || 'Low').toLowerCase();
  
  let colors = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (normalized === 'moderate' || normalized === 'medium') {
    colors = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (normalized === 'high') {
    colors = 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (normalized === 'severe' || normalized === 'critical') {
    colors = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border shadow-sm ${colors}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{level || 'Low'}</span>
      {score !== undefined && <span className="opacity-90">({score})</span>}
    </span>
  );
}
