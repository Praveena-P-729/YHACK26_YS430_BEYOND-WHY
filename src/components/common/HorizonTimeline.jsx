import React from 'react';

export default function HorizonTimeline({ forecasts }) {
  if (!forecasts || forecasts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {forecasts.map((f, idx) => {
        let color = "text-emerald-950 border-emerald-300 bg-emerald-50";
        if (f.risk_level === "High" || f.risk_level === "Severe") {
          color = "text-red-950 border-red-300 bg-red-50";
        } else if (f.risk_level === "Moderate") {
          color = "text-amber-950 border-amber-300 bg-amber-50";
        }

        return (
          <div key={idx} className={`p-3 rounded-2xl border ${color} text-center space-y-1 shadow-sm`}>
            <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-800">{f.horizon}</div>
            <div className="text-xl font-black font-heading">{f.risk_score}</div>
            <div className="text-[10px] font-mono font-bold uppercase">{f.risk_level}</div>
          </div>
        );
      })}
    </div>
  );
}
