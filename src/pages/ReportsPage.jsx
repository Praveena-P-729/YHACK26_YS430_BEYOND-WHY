import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading">Situation Reports (SITREP)</h1>
          <p className="text-xs text-[#8E959E]">Daily disaster management summaries &amp; NDMA export dossiers</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="command-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Daily Landslide Early Warning Sitrep</h3>
            <p className="text-xs text-[#8E959E]">Report Ref: SITREP-20260910-01</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">CLEARED FOR DISPATCH</span>
        </div>

        <p className="text-xs text-[#CBD1D6] leading-relaxed">
          Intense monsoon precipitation across the North-Eastern Region of India (Assam, Meghalaya, Manipur, Nagaland, Sikkim) has elevated pore water pressure in 4 primary mountain corridors. All 12 telemetry radar stations operating normally.
        </p>

        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Priority Directives:</h4>
          <ul className="text-xs text-[#A8ADB2] space-y-1 list-disc list-inside">
            <li>Maintain Stage-2 Watch in Shillong Ridge (NH-6) and Cherrapunji Escarpment (SH-12).</li>
            <li>Pre-position 2 NDRF quick-response teams at Noney NH-37 mountain staging base.</li>
            <li>Verify backup telemetry link for Kohima Zubza Pass (NH-29) and Gangtok Deorali (NH-10) array.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
