import React from 'react';

export default function StatCard({ title, value, change, icon: Icon, trend, subtitle, color = "emerald" }) {
  return (
    <div className="command-card-solid rounded-2xl p-5 border border-slate-200/90 command-card-hover relative overflow-hidden shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-1.5">{value}</h3>
          {subtitle && <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-medium">
          <span className={trend === 'up' ? 'text-red-600 font-mono font-bold' : 'text-emerald-700 font-mono font-bold'}>
            {change}
          </span>
          <span className="text-slate-500 text-[11px]">vs previous 24h baseline</span>
        </div>
      )}
    </div>
  );
}
