import React from 'react';

export default function ExplainableFactorBar({ factors }) {
  if (!factors) return null;

  return (
    <div className="space-y-2.5">
      {Object.entries(factors).map(([factor, percentage]) => (
        <div key={factor} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#CBD1D6]">{factor}</span>
            <span className="text-[#10B981] font-mono font-semibold">{percentage}%</span>
          </div>
          <div className="w-full bg-[#0D1714] rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-[#10B981] to-[#34D399] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
