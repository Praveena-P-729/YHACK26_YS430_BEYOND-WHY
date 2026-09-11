import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">Situation Reports (SITREP)</h1>
          <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">Daily disaster management summaries &amp; NDMA export dossiers across Northeast India</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="command-card-solid rounded-3xl p-6 border border-slate-300 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 font-heading">Daily Landslide Early Warning Sitrep</h3>
            <p className="text-xs text-slate-700 font-semibold">Report Ref: SITREP-20260910-01</p>
          </div>
          <span className="text-xs font-mono text-emerald-900 font-extrabold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">CLEARED FOR DISPATCH</span>
        </div>

        <p className="text-xs text-slate-900 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          Intense monsoon precipitation across the North-Eastern Region of India (Assam, Meghalaya, Manipur, Nagaland, Sikkim) has elevated pore water pressure in 4 primary mountain corridors. All 12 telemetry radar stations operating normally.
        </p>

        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Priority Directives:</h4>
          <ul className="text-xs text-slate-800 font-medium space-y-1.5 list-disc list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <li>Maintain Stage-2 Watch in Shillong Ridge (NH-6) and Cherrapunji Escarpment (SH-12).</li>
            <li>Pre-position 2 NDRF quick-response teams at Noney NH-37 mountain staging base.</li>
            <li>Verify backup telemetry link for Kohima Zubza Pass (NH-29) and Gangtok Deorali (NH-10) array.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
