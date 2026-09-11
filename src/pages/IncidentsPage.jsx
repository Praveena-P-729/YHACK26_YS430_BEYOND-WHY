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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Field Officer Operations &amp; Incident Dispatch
          </h1>
          <p className="text-xs text-[#8E959E] mt-0.5">
            Offline-First field reconnaissance, landslide reporting, road blockages, and auto-sync
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#0D1714] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'report' ? 'bg-emerald-600 text-white shadow' : 'text-[#8E959E] hover:text-white'
            }`}
          >
            + Submit Field Report
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'list' ? 'bg-emerald-600 text-white shadow' : 'text-[#8E959E] hover:text-white'
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
          <div className="flex items-center justify-between text-xs text-[#8E959E]">
            <span>Showing verified field reconnaissance logs and offline queued reports</span>
            <button
              onClick={loadData}
              className="flex items-center gap-1 text-emerald-400 hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldReports.map((rep) => (
              <div key={rep.report_id || rep.id} className="command-card rounded-2xl p-5 border border-white/10 bg-[#0D1714] space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{rep.road_id}</span>
                    <span className="text-[11px] text-[#8E959E]">({rep.state})</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    rep.sync_status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {rep.sync_status || 'SYNCED'}
                  </span>
                </div>

                <p className="text-xs text-[#CBD1D6] leading-relaxed">{rep.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div>Condition: <strong className="text-white">{rep.observed_condition}</strong></div>
                  <div>Rainfall: <strong className="text-white">{rep.rainfall_observation}</strong></div>
                  <div>Road Blocked: <strong className={rep.road_blocked ? "text-red-400" : "text-emerald-400"}>{rep.road_blocked ? "YES" : "NO"}</strong></div>
                  <div>Landslide: <strong className={rep.landslide_observed ? "text-red-400" : "text-emerald-400"}>{rep.landslide_observed ? "YES" : "NO"}</strong></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8E959E] pt-1 border-t border-white/5">
                  <span>Officer: <strong className="text-white font-mono">{rep.officer_id}</strong></span>
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
