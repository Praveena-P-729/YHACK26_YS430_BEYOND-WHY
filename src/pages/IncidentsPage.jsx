import React, { useState, useEffect } from 'react';
import { Siren, Plus, CheckCircle2, AlertCircle, ShieldAlert, FileText, RefreshCw, Database } from 'lucide-react';
import { api } from '../services/api';
import FieldReportForm from '../components/FieldReportForm';
import { getAllFieldReports } from '../services/offlineStorage';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [fieldReports, setFieldReports] = useState([]);
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'list'
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Incidents
      try {
        const data = await api.getIncidents();
        setIncidents(data);
      } catch {
        setIncidents([
          { id: 1, title: "Road Subsidence at Shillong NH-6 km 48.2", severity: "Severe", status: "DISPATCHED", description: "Fissure observed across northbound lane after torrential downpour on Shillong ridge." },
          { id: 2, title: "Colluvium Debris Slide near Noney Railway Cutting (NH-37)", severity: "Critical", status: "INVESTIGATING", description: "Topsoil liquefaction encroaching on lower village bridge and approach highway." }
        ]);
      }

      // 2. Fetch Field Reports (API or IndexedDB)
      try {
        const reports = await api.getFieldReports();
        if (Array.isArray(reports) && reports.length > 0) {
          setFieldReports(reports);
        } else {
          const offlineReps = await getAllFieldReports();
          setFieldReports(offlineReps);
        }
      } catch {
        const offlineReps = await getAllFieldReports();
        setFieldReports(offlineReps);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">
            Field Officer Operations &amp; Incident Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">
            Offline-First field reconnaissance, landslide reporting, road blockages, and auto-sync
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-300 text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'report' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
          >
            + Submit Field Report
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Field Logs ({fieldReports.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'report' ? (
        <FieldReportForm
          isOnline={navigator.onLine}
          onReportSubmitted={() => {
            loadData();
            setActiveTab('list');
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-800 font-bold px-1">
            <span>Showing verified field reconnaissance logs and offline queued reports</span>
            <button
              onClick={loadData}
              className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-black cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldReports.map((rep) => (
              <div key={rep.report_id || rep.id} className="command-card-solid rounded-3xl p-5 border border-slate-300 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-950 text-xs font-mono">{rep.road_id}</span>
                    <span className="text-[11px] text-slate-700 font-semibold">({rep.state})</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase ${
                    rep.sync_status === 'pending'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  }`}>
                    {rep.sync_status || 'SYNCED'}
                  </span>
                </div>

                <p className="text-xs text-slate-900 font-medium leading-relaxed">{rep.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-200 font-semibold">
                  <div>Condition: <strong className="text-slate-950 font-bold">{rep.observed_condition}</strong></div>
                  <div>Rainfall: <strong className="text-slate-950 font-bold">{rep.rainfall_observation}</strong></div>
                  <div>Road Blocked: <strong className={rep.road_blocked ? "text-red-700 font-bold" : "text-emerald-800 font-bold"}>{rep.road_blocked ? "YES" : "NO"}</strong></div>
                  <div>Landslide: <strong className={rep.landslide_observed ? "text-red-700 font-bold" : "text-emerald-800 font-bold"}>{rep.landslide_observed ? "YES" : "NO"}</strong></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-700 font-semibold pt-1 border-t border-slate-200">
                  <span>Officer: <strong className="text-slate-950 font-mono font-bold">{rep.officer_id}</strong></span>
                  <span>{new Date(rep.timestamp || rep.created_at || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
