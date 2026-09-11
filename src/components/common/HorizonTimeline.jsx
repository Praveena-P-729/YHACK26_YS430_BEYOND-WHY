import React from 'react';

export default function HorizonTimeline({ forecasts }) {
  if (!forecasts || forecasts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {forecasts.map((f, idx) => {
        let color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
        if (f.risk_level === "High" || f.risk_level === "Severe") {
          color = "text-red-400 border-red-500/30 bg-red-500/10";
        } else if (f.risk_level === "Moderate") {
          color = "text-amber-400 border-amber-500/30 bg-amber-500/10";
        }

        return (
          <div key={idx} className={`p-3 rounded-2xl border ${color} text-center space-y-1`}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider">{f.horizon}</div>
            <div className="text-xl font-bold font-heading">{f.risk_score}</div>
            <div className="text-[10px] font-mono opacity-80">{f.risk_level}</div>
          </div>
        );
      })}
    </div>
  );
}
