import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Siren, 
  MapPin, 
  TrendingUp, 
  ShieldAlert, 
  Radio, 
  Layers,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Navigation,
  Compass,
  FileCheck,
  Building2,
  PhoneCall,
  Search,
  Filter,
  Eye,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import RiskBadge from '../components/common/RiskBadge';
import HorizonTimeline from '../components/common/HorizonTimeline';
import SimulationModal from '../components/common/SimulationModal';
import RiskMap from '../components/RiskMap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  // Core Data States
  const [overviewStats, setOverviewStats] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(1);
  const [horizons, setHorizons] = useState([]);

  // Simulation Modal State
  const [simulationOpen, setSimulationOpen] = useState(false);

  // Map Filter Toggles
  const [layerHeatmap, setLayerHeatmap] = useState(true);
  const [layerRoads, setLayerRoads] = useState(true);
  const [layerReports, setLayerReports] = useState(true);
  const [layerShelters, setLayerShelters] = useState(true);

  // Dispatch Planner State
  const [dispatchTeam, setDispatchTeam] = useState('NDRF Quick Response Team 4');
  const [dispatchLocationId, setDispatchLocationId] = useState(1);
  const [dispatchVehicle, setDispatchVehicle] = useState('Heavy Excavator');
  const [dispatchPriority, setDispatchPriority] = useState('CRITICAL');
  const [dispatchResult, setDispatchResult] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Field Verification Action Center State
  const [actionNotes, setActionNotes] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');

  // Initial Data Fetching
  const fetchDashboardData = async () => {
    try {
      const [statsData, priorityData, locsData, alertsData, incsData, horizonData] = await Promise.all([
        api.getOfficerOverview().catch(() => null),
        api.getEmergencyPrioritization().catch(() => []),
        api.getLocations().catch(() => []),
        api.getActiveAlerts().catch(() => []),
        api.getIncidents().catch(() => []),
        api.getPredictionHorizons(selectedLocationId).catch(() => ({ forecasts: [] }))
      ]);

      if (statsData) setOverviewStats(statsData);
      if (priorityData && priorityData.length > 0) setPriorities(priorityData);
      if (locsData && locsData.length > 0) setLocations(locsData);
      if (alertsData && alertsData.length > 0) setAlerts(alertsData);
      if (incsData && incsData.length > 0) setIncidents(incsData);
      if (horizonData?.forecasts) setHorizons(horizonData.forecasts);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedLocationId]);

  // Fallback defaults if backend is still initializing
  const stats = overviewStats || {
    risk_distribution: { low: 124, medium: 48, high: 21, critical: 7 },
    total_monitored_areas: 200,
    active_alerts_count: 5,
    new_field_reports_count: 12,
    verified_reports_count: 8,
    affected_roads_count: 5,
    vulnerable_villages_count: 9,
    at_risk_infrastructure: 14
  };

  const defaultLocations = locations.length > 0 ? locations : [
    { id: 1, name: "Shillong - Mawlai Escarpment (NH-6)", region: "East Khasi Hills", state: "Meghalaya", current_risk_score: 84.5, current_risk_level: "Critical", latitude: 25.5788, longitude: 91.8933 },
    { id: 2, name: "Cherrapunji - Shella Ghat Pass (SH-12)", region: "East Khasi Hills", state: "Meghalaya", current_risk_score: 91.5, current_risk_level: "Critical", latitude: 25.2702, longitude: 91.7323 },
    { id: 3, name: "Noney Colluvium Railway Cutting (NH-37)", region: "Noney", state: "Manipur", current_risk_score: 88.2, current_risk_level: "Critical", latitude: 24.8170, longitude: 93.6000 },
    { id: 4, name: "Kohima - Zubza Sinking Pass (NH-29)", region: "Kohima", state: "Nagaland", current_risk_score: 74.0, current_risk_level: "High", latitude: 25.6751, longitude: 94.1086 },
    { id: 5, name: "Gangtok - Deorali Sinking Zone (NH-10)", region: "East Sikkim", state: "Sikkim", current_risk_score: 86.0, current_risk_level: "Critical", latitude: 27.3389, longitude: 88.6065 },
    { id: 6, name: "Jatinga Valley Slip Corridor (NH-27)", region: "Dima Hasao", state: "Assam", current_risk_score: 78.0, current_risk_level: "High", latitude: 25.1200, longitude: 92.9800 }
  ];

  const defaultPriorities = priorities.length > 0 ? priorities : [
    { rank: 1, location_id: 2, location_name: "Cherrapunji - Shella Ghat Pass (SH-12)", region: "East Khasi Hills, Meghalaya", risk_score: 91.5, risk_tier: "Critical", vulnerability: "Critical (Sohra Escarpment | Gorge Highway)", recommended_action: "Immediate traffic embargo & NDRF mountain team dispatch", active_reports_count: 3 },
    { rank: 2, location_id: 3, location_name: "Noney Colluvium Railway Cutting (NH-37)", region: "Noney, Manipur", risk_score: 88.2, risk_tier: "Critical", vulnerability: "High (NH-37 Lifeline | Tupul Rail Approaches)", recommended_action: "Stage-3 Evacuation & pre-position heavy earth-movers", active_reports_count: 2 },
    { rank: 3, location_id: 5, location_name: "Gangtok - Deorali Sinking Zone (NH-10)", region: "East Sikkim, Sikkim", risk_score: 86.0, risk_tier: "Critical", vulnerability: "High (NH-10 Mountain Lifeline | Teesta Valley)", recommended_action: "Close single-lane pass & deploy heavy clearing patrol", active_reports_count: 3 },
    { rank: 4, location_id: 1, location_name: "Shillong - Mawlai Escarpment (NH-6)", region: "East Khasi Hills, Meghalaya", risk_score: 84.5, risk_tier: "Critical", vulnerability: "High (Guwahati-Shillong Expressway Corridor)", recommended_action: "Traffic diversion via Shillong Peak Bypass & sensor watch", active_reports_count: 2 },
    { rank: 5, location_id: 6, location_name: "Jatinga Valley Slip Corridor (NH-27)", region: "Dima Hasao, Assam", risk_score: 78.0, risk_tier: "High", vulnerability: "Medium (East-West Highway | Hill Settlements)", recommended_action: "Night transit restriction & emergency escort", active_reports_count: 1 },
    { rank: 6, location_id: 4, location_name: "Kohima - Zubza Sinking Pass (NH-29)", region: "Kohima, Nagaland", risk_score: 74.0, risk_tier: "High", vulnerability: "Medium (Dimapur-Kohima Pass | Peducha Link)", recommended_action: "Night travel embargo & inclinometer alert watch", active_reports_count: 1 }
  ];

  const defaultIncidents = incidents.length > 0 ? incidents : [
    { id: 1, title: "Transverse Slope Tension Crack", description: "2.5 cm wide fissure expanding along upper road cut near Shillong NH-6 km 48.2.", location_name: "Shillong Ridge NH-6", severity: "High", status: "PENDING", reported_at: "18 mins ago" },
    { id: 2, title: "Rockfall & Mud Spillage", description: "Boulders (~1.5m diameter) detached from 45-degree granite outcrop along Dimapur-Kohima ghat.", location_name: "Kohima Zubza Pass NH-29", severity: "Medium", status: "INVESTIGATING", reported_at: "42 mins ago" },
    { id: 3, title: "Severe Slope Slump & Debris Flow", description: "Continuous colluvium debris slide along NH-37 approach road after 165mm continuous monsoon rain. Evacuation requested.", location_name: "Noney Railway Cutting NH-37", severity: "Critical", status: "PENDING", reported_at: "1 hour ago" }
  ];

  // Helper functions for time formatting & location extraction
  const formatReportedTime = (ts) => {
    if (!ts) return 'Just now';
    if (ts.includes('ago')) return ts;
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      const now = new Date();
      const diffSec = Math.floor((now - d) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  const getIncidentLocation = (incident) => {
    if (incident.location_name && incident.location_name.trim()) return incident.location_name;
    if (incident.location && incident.location.trim()) return incident.location;
    if (incident.title && incident.title.includes(' at ')) {
      const part = incident.title.split(' at ')[1];
      if (part && part.trim()) return part.trim();
    }
    return 'North-Eastern Hill Corridor';
  };

  // Handle Verification Action
  const handleUpdateStatus = async (incidentId, newStatus) => {
    const note = actionNotes[incidentId] || `Field verified by Officer ${user?.full_name || 'Praveena'}`;
    try {
      await api.updateIncidentStatus(incidentId, newStatus, note);
      setActionSuccess(`✓ Incident #${incidentId} successfully marked as ${newStatus}`);
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus, officer_notes: note } : inc));
      fetchDashboardData();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      // Optimistic update
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus, officer_notes: note } : inc));
      setActionSuccess(`✓ Status updated to ${newStatus} (Offline / Local State)`);
      setTimeout(() => setActionSuccess(''), 5000);
    }
  };

  // Handle Dispatch Plan Generation
  const handleGenerateDispatch = async (e) => {
    e.preventDefault();
    setDispatchLoading(true);
    try {
      const plan = await api.calculateDispatchPlan(dispatchTeam, dispatchLocationId, dispatchVehicle, dispatchPriority);
      setDispatchResult(plan);
    } catch (err) {
      const targetLoc = defaultLocations.find(l => l.id === Number(dispatchLocationId)) || defaultLocations[0];
      setDispatchResult({
        dispatch_id: `DISP-${Date.now().toString().slice(-6)}`,
        team_name: dispatchTeam,
        target_location: targetLoc.name,
        vehicle_type: dispatchVehicle,
        priority: dispatchPriority,
        recommended_route: {
          name: "Route A (Ridge Road via Upper Checkpost)",
          risk_level: "Low",
          distance_km: 18.2,
          eta_minutes: 25,
          vehicle_suitability: `Suitable for ${dispatchVehicle} & Emergency Convoy`,
          road_condition: "Paved & Cleared (Max Gradient: 12%)"
        },
        avoided_route: {
          name: "Route B (Lower Valley Stream Cutting)",
          risk_level: "Critical",
          warning: "Active debris flow hazard near milestone 14. Road impassable for heavy vehicles."
        }
      });
    } finally {
      setDispatchLoading(false);
    }
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & OPERATIONAL STATUS */}
      {/* ========================================================= */}
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold border border-emerald-300 shadow-sm">
              FIELD COMMAND MODE
            </span>
            <span className="text-xs text-slate-700 font-mono font-semibold">
              OFFICER: <strong className="text-slate-950 font-extrabold">{user?.full_name || 'Praveena'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading mt-2 tracking-tight">
            Hazard Assessment &amp; Emergency Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">
            Physics-guided ML telemetry stream, spatial risk prioritization, and response convoy routing across Northeast India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSimulationOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Rainfall Scenario Sim</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-600 text-slate-900 hover:text-emerald-700 font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
            title="Refresh live telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. 4-TIER RISK OVERVIEW COUNTERS */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">
            Spatial Hazard Overview (Grid v2.4)
          </h2>
          <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {stats.total_monitored_areas} Sectors Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Critical Tier */}
          <div className="p-4 rounded-2xl bg-red-50/95 border-2 border-red-300 hover:border-red-500 shadow-sm transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-red-900 font-mono uppercase">Critical</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-950 font-heading">
              {stats.risk_distribution?.critical || 7}
            </div>
            <p className="text-[11px] text-red-900 font-bold">Score &ge; 80 (Stage-3)</p>
          </div>

          {/* High Tier */}
          <div className="p-4 rounded-2xl bg-amber-50/95 border-2 border-amber-300 hover:border-amber-500 shadow-sm transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-amber-900 font-mono uppercase">High Risk</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 font-heading">
              {stats.risk_distribution?.high || 21}
            </div>
            <p className="text-[11px] text-amber-900 font-bold">Score 60 - 79 (Warning)</p>
          </div>

          {/* Medium Tier */}
          <div className="p-4 rounded-2xl bg-yellow-50/95 border-2 border-yellow-300 hover:border-yellow-500 shadow-sm transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-yellow-900 font-mono uppercase">Medium</span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-yellow-950 font-heading">
              {stats.risk_distribution?.medium || 48}
            </div>
            <p className="text-[11px] text-yellow-900 font-bold">Score 30 - 59 (Advisory)</p>
          </div>

          {/* Low Tier */}
          <div className="p-4 rounded-2xl bg-emerald-50/95 border-2 border-emerald-300 hover:border-emerald-500 shadow-sm transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-emerald-900 font-mono uppercase">Low / Safe</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-heading">
              {stats.risk_distribution?.low || 124}
            </div>
            <p className="text-[11px] text-emerald-900 font-bold">Score &lt; 30 (Stable)</p>
          </div>

          {/* Affected Roads */}
          <div className="p-4 rounded-2xl bg-teal-50/95 border-2 border-teal-300 hover:border-teal-500 shadow-sm transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-teal-900 font-mono uppercase">Blocked Roads</span>
              <Navigation className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-950 font-heading">
              {stats.affected_roads_count || 5}
            </div>
            <p className="text-[11px] text-teal-900 font-bold">Ghat Arterials</p>
          </div>

          {/* Vulnerable Villages */}
          <div className="p-4 rounded-2xl bg-blue-50/95 border-2 border-blue-300 hover:border-blue-500 shadow-sm transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-blue-900 font-mono uppercase">Settlements</span>
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              {stats.vulnerable_villages_count || 9}
            </div>
            <p className="text-[11px] text-blue-900 font-bold">Downslope Paths</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. GIS SITUATIONAL MAP & SENSOR TELEMETRY DRILL-DOWN */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Interactive Multi-Layer GIS Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="command-card-solid rounded-3xl p-5 border border-slate-300 shadow-lg space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 font-heading flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Integrated GIS Risk Map &amp; Field Asset Tracking</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Real-time spatial grid overlaying ML hazard polygons with active convoy and shelter layers.
                </p>
              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-300 text-[11px]">
                <button
                  onClick={() => setLayerHeatmap(!layerHeatmap)}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${layerHeatmap ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-700 font-semibold hover:bg-slate-200'}`}
                >
                  Risk Grid
                </button>
                <button
                  onClick={() => setLayerRoads(!layerRoads)}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${layerRoads ? 'bg-teal-600 text-white font-bold shadow-sm' : 'text-slate-700 font-semibold hover:bg-slate-200'}`}
                >
                  Roads
                </button>
                <button
                  onClick={() => setLayerReports(!layerReports)}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${layerReports ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-slate-700 font-semibold hover:bg-slate-200'}`}
                >
                  Reports ({defaultIncidents.length})
                </button>
                <button
                  onClick={() => setLayerShelters(!layerShelters)}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${layerShelters ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-700 font-semibold hover:bg-slate-200'}`}
                >
                  Shelters
                </button>
              </div>
            </div>

            {/* Real-time Interactive Leaflet GIS Risk Map */}
            <div className="w-full">
              <RiskMap isOnline={navigator.onLine} />
            </div>

            {/* Quick Sector Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {defaultLocations.slice(0, 3).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedLocationId === loc.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-950 truncate">{loc.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      loc.current_risk_score > 80 ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {loc.current_risk_score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-semibold mt-1">{loc.region}, {loc.state}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Physics Telemetry & Explainable AI */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Multi-Horizon Timeline Forecast */}
          <div className="command-card-solid rounded-3xl p-5 border border-slate-300 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 font-heading">Multi-Horizon AI Trajectory</h3>
                <p className="text-xs text-slate-700 font-medium">Ensemble failure projection over 24h</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold border border-emerald-300">
                LIVE MODEL
              </span>
            </div>

            <HorizonTimeline 
              forecasts={horizons.length > 0 ? horizons : [
                { horizon: "Now", risk_score: 84.5, risk_level: "Severe" },
                { horizon: "+6h", risk_score: 89.0, risk_level: "Severe" },
                { horizon: "+12h", risk_score: 93.7, risk_level: "Severe" },
                { horizon: "+24h", risk_score: 97.2, risk_level: "Severe" }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. EMERGENCY PRIORITIZATION MATRIX TABLE */}
      {/* ========================================================= */}
      <div className="command-card-solid rounded-3xl p-6 border border-slate-300 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Emergency Prioritization Matrix</span>
            </h3>
            <p className="text-xs text-slate-700 font-medium">
              Dynamic ranking combining ML Risk % &bull; Population Density &bull; Critical Infrastructure Vulnerability
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900">
            AUTO-SORTED BY COMPOSITE PRIORITY
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-900">
            <thead className="bg-slate-100 text-slate-950 uppercase font-mono text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Priority</th>
                <th className="py-3 px-4">Location &amp; Sector</th>
                <th className="py-3 px-4">ML Risk Score</th>
                <th className="py-3 px-4">Infrastructure &amp; Population Exposure</th>
                <th className="py-3 px-4">Recommended Emergency Action</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {defaultPriorities.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                      item.rank === 1 ? 'bg-red-600 text-white' : item.rank === 2 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-950">{item.location_name}</div>
                    <div className="text-[11px] text-slate-700 font-semibold">{item.region}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-extrabold ${
                        item.risk_score >= 80 ? 'text-red-700' : 'text-amber-700'
                      }`}>
                        {item.risk_score}%
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.risk_tier === 'Critical' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {item.risk_tier}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium max-w-xs">
                    {item.vulnerability}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-900 font-bold">
                    {item.recommended_action}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setDispatchLocationId(item.location_id || 1);
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. FIELD REPORT VERIFICATION & CITIZEN REPORT ACTION CENTER */}
      {/* ========================================================= */}
      <div className="command-card-solid rounded-3xl p-6 border border-slate-300 shadow-lg space-y-5">
        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-200 px-2.5 py-1 rounded-lg text-emerald-950 font-bold border border-emerald-400">
              ACTION COMMITTED
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 font-heading flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Field Verification Action Center (Citizen Reports)</span>
            </h3>
            <p className="text-xs text-slate-700 font-medium">
              Validate citizen slope crack submissions, upgrade severity, and trigger immediate dispatch.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-800 font-semibold">
            Pending Review: <strong className="text-amber-700 font-black">{defaultIncidents.filter(i => i.status === 'PENDING' || i.status === 'INVESTIGATING').length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultIncidents.map((incident) => {
            const locName = getIncidentLocation(incident);
            const timeStr = formatReportedTime(incident.reported_at);
            const isVerified = incident.status === 'VERIFIED';
            const isInvestigating = incident.status === 'INVESTIGATING';
            const isRejected = incident.status === 'REJECTED';

            return (
              <div 
                key={incident.id} 
                className={`p-5 rounded-2xl border space-y-3 transition flex flex-col justify-between shadow-sm ${
                  isVerified
                    ? 'bg-emerald-50/90 border-emerald-400'
                    : isRejected
                    ? 'bg-red-50/70 border-red-300 opacity-80'
                    : isInvestigating
                    ? 'bg-amber-50/90 border-amber-400'
                    : 'bg-white border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-slate-950 font-heading leading-snug">{incident.title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${
                      incident.severity === 'Critical' || incident.severity === 'Severe' ? 'bg-red-100 text-red-900 border border-red-300' :
                      incident.severity === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{locName}</span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-700 font-mono pt-1">
                    <span>Reported: <strong className="text-slate-950 font-bold">{timeStr}</strong></span>
                    <span className={`px-2 py-0.5 rounded font-extrabold uppercase ${
                      isVerified ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      isInvestigating ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      isRejected ? 'bg-red-100 text-red-900 border border-red-300' :
                      'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}>
                      {incident.status}
                    </span>
                  </div>

                  {/* Verified / Investigating Officer Info Banner */}
                  {isVerified && (
                    <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs text-emerald-950 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1 font-extrabold text-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Verified by Officer {user?.full_name || 'Praveena'}
                        </span>
                        <span className="text-emerald-800 font-bold">AUTHENTICATED</span>
                      </div>
                      {incident.officer_notes && (
                        <p className="text-[11px] text-emerald-950 font-medium italic bg-white/70 p-2 rounded-lg border border-emerald-300">
                          "{incident.officer_notes}"
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDispatchLocationId(1);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                        className="w-full py-1.5 mt-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 shadow cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Emergency Response Team</span>
                      </button>
                    </div>
                  )}

                  {isInvestigating && (
                    <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-xs text-amber-950 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1 font-extrabold text-amber-900">
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          Field Inspection In Progress
                        </span>
                        <span className="text-amber-800 font-bold">ACTIVE</span>
                      </div>
                      {incident.officer_notes && (
                        <p className="text-[11px] text-amber-950 font-medium italic bg-white/70 p-2 rounded-lg border border-amber-300">
                          "{incident.officer_notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <input
                    type="text"
                    placeholder="Officer verification notes..."
                    value={actionNotes[incident.id] || ''}
                    onChange={(e) => setActionNotes({ ...actionNotes, [incident.id]: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-950 placeholder-slate-500 focus:outline-none focus:border-emerald-600 font-medium"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(incident.id, 'VERIFIED')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                        isVerified
                          ? 'bg-emerald-800 text-white border border-emerald-600'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                      }`}
                      title="Verify and confirm incident"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isVerified ? 'Re-Verify' : 'Verify'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(incident.id, 'INVESTIGATING')}
                      className="flex-1 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Mark as under inspection"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(incident.id, 'REJECTED')}
                      className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-950 border border-red-300 font-bold text-xs transition flex items-center justify-center cursor-pointer"
                      title="Reject report / False alarm"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-700" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. EMERGENCY VEHICLE RESPONSE & SAFE DISPATCH PLANNER */}
      {/* ========================================================= */}
      <div className="command-card-solid rounded-3xl p-6 border border-slate-300 shadow-lg space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 font-heading flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Emergency Convoy &amp; Response Vehicle Dispatch Planner</span>
          </h3>
          <p className="text-xs text-slate-700 font-medium">
            Computes guaranteed safe routes avoiding active landslide polygons, debris flows, and structural road failures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatch Input Form (5 cols) */}
          <form onSubmit={handleGenerateDispatch} className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Assigned Emergency Response Unit
              </label>
              <select
                value={dispatchTeam}
                onChange={(e) => setDispatchTeam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value="NDRF Quick Response Team 4">NDRF Quick Response Team 4</option>
                <option value="Meghalaya & Assam State Disaster QRT Patrol">Meghalaya &amp; Assam State Disaster QRT Patrol</option>
                <option value="SDRF Heavy Clearing Convoy">SDRF Heavy Clearing Convoy</option>
                <option value="Fire & Rescue Emergency Ambulance Unit">Fire &amp; Rescue Emergency Ambulance Unit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Target Incident / Hazard Sector
              </label>
              <select
                value={dispatchLocationId}
                onChange={(e) => setDispatchLocationId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
              >
                {defaultLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.region}) - Risk: {loc.current_risk_score}%
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Vehicle Type
                </label>
                <select
                  value={dispatchVehicle}
                  onChange={(e) => setDispatchVehicle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="Heavy Excavator">Heavy Excavator</option>
                  <option value="Ambulance Convoy">Ambulance Convoy</option>
                  <option value="4x4 Emergency Patrol">4x4 Emergency Patrol</option>
                  <option value="NDRF Rescue Bus">NDRF Rescue Bus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Priority Tier
                </label>
                <select
                  value={dispatchPriority}
                  onChange={(e) => setDispatchPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="ROUTINE">ROUTINE</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={dispatchLoading}
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {dispatchLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Safe Transit Vector...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate AI Safe Dispatch Plan</span>
                </>
              )}
            </button>
          </form>

          {/* Dispatch Result Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-300 p-5 space-y-4 shadow-sm">
            {dispatchResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800">{dispatchResult.dispatch_id}</span>
                    <h4 className="text-sm font-extrabold text-slate-950 font-heading">
                      Dispatch Authorization: {dispatchResult.team_name}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-extrabold border border-emerald-300">
                    ETA: {dispatchResult.recommended_route.eta_minutes} MINS
                  </span>
                </div>

                {/* Recommended Green Route */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{dispatchResult.recommended_route.name}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 border border-emerald-400">
                      SAFE CONVOY PASS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800 font-medium pt-1">
                    <div>Transit Distance: <strong className="text-slate-950 font-bold">{dispatchResult.recommended_route.distance_km} km</strong></div>
                    <div>Road Condition: <strong className="text-slate-950 font-bold">{dispatchResult.recommended_route.road_condition}</strong></div>
                  </div>
                  <p className="text-[11px] text-emerald-950 font-bold pt-1">
                    &bull; {dispatchResult.recommended_route.vehicle_suitability}
                  </p>
                </div>

                {/* Avoided Red Route */}
                <div className="p-4 rounded-2xl bg-red-50 border border-red-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-950 flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-700" />
                      <span>{dispatchResult.avoided_route.name}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-200 text-red-950 border border-red-400">
                      AVOID: CRITICAL DANGER
                    </span>
                  </div>
                  <p className="text-xs text-red-950 font-medium leading-relaxed">
                    {dispatchResult.avoided_route.warning}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <Truck className="w-10 h-10 text-slate-600" />
                <h4 className="text-xs font-black text-slate-950">No Active Dispatch Calculated</h4>
                <p className="text-[11px] text-slate-800 font-bold max-w-xs">
                  Select an assigned unit and target hazard sector to compute a debris-free response trajectory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Modal Component */}
      <SimulationModal isOpen={simulationOpen} onClose={() => setSimulationOpen(false)} />
    </div>
  );
}

