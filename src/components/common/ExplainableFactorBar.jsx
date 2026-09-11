import React from 'react';

export default function ExplainableFactorBar({ factors }) {
  if (!factors) return null;

  return (
    <div className="space-y-2.5">
      {Object.entries(factors).map(([factor, percentage]) => (
        <div key={factor} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-900 font-bold">{factor}</span>
            <span className="text-emerald-800 font-mono font-extrabold">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
