import React from 'react';

export default function StatCard({ title, value, change, icon: Icon, trend, subtitle, color = "emerald" }) {
  return (
    <div className="command-card rounded-2xl p-5 border border-white/10 command-card-hover relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#8E959E]">{title}</p>
          <h3 className="text-2xl font-extrabold text-white font-heading mt-1.5">{value}</h3>
          {subtitle && <p className="text-[11px] text-[#A8ADB2] mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#0D1714] border border-white/5 flex items-center justify-center text-[#10B981]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs">
          <span className={trend === 'up' ? 'text-red-400 font-mono font-semibold' : 'text-emerald-400 font-mono font-semibold'}>
            {change}
          </span>
          <span className="text-[#8E959E] text-[11px]">vs previous 24h baseline</span>
        </div>
      )}
    </div>
  );
}
