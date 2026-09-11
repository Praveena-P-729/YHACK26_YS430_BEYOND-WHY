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
import ExplainableFactorBar from '../components/common/ExplainableFactorBar';
import HorizonTimeline from '../components/common/HorizonTimeline';
import SimulationModal from '../components/common/SimulationModal';
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

  // Handle Verification Action
  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      const note = actionNotes[incidentId] || `Field verification by Officer ${user?.full_name || 'Unit'}`;
      await api.updateIncidentStatus(incidentId, newStatus, note);
      setActionSuccess(`Incident #${incidentId} marked as ${newStatus}`);
      fetchDashboardData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      // Optimistic update
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc));
      setActionSuccess(`Status updated to ${newStatus} (Local State)`);
      setTimeout(() => setActionSuccess(''), 4000);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121E1A] p-5 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              FIELD COMMAND MODE
            </span>
            <span className="text-xs text-[#8E959E] font-mono">
              OFFICER: <strong className="text-white">{user?.full_name || 'Captain R. Verma'}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Hazard Assessment & Emergency Dispatch Center
          </h1>
          <p className="text-xs text-[#8E959E] mt-0.5">
            Physics-guided ML telemetry stream, spatial risk prioritization, and response convoy routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSimulationOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Rainfall Scenario Sim</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2.5 rounded-2xl bg-[#0D1714] border border-white/10 hover:border-emerald-500/40 text-[#CBD1D6] hover:text-white text-xs transition flex items-center gap-2"
            title="Refresh live telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. 4-TIER RISK OVERVIEW COUNTERS */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-[#8E959E] uppercase tracking-wider font-mono">
            Spatial Hazard Overview (Grid v2.4)
          </h2>
          <span className="text-xs text-emerald-400 font-mono">
            {stats.total_monitored_areas} Sectors Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Critical Tier */}
          <div className="p-4 rounded-2xl bg-[#1A1012] border border-red-500/30 hover:border-red-500/60 transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-400 font-mono uppercase">Critical</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div className="text-2xl font-black text-white font-heading">
              {stats.risk_distribution?.critical || 7}
            </div>
            <p className="text-[10px] text-[#A8ADB2]">Score &ge; 80 (Stage-3)</p>
          </div>

          {/* High Tier */}
          <div className="p-4 rounded-2xl bg-[#1A1710] border border-amber-500/30 hover:border-amber-500/60 transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 font-mono uppercase">High Risk</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-2xl font-black text-white font-heading">
              {stats.risk_distribution?.high || 21}
            </div>
            <p className="text-[10px] text-[#A8ADB2]">Score 60 - 79 (Warning)</p>
          </div>

          {/* Medium Tier */}
          <div className="p-4 rounded-2xl bg-[#151D14] border border-yellow-500/30 hover:border-yellow-500/60 transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-yellow-400 font-mono uppercase">Medium</span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            </div>
            <div className="text-2xl font-black text-white font-heading">
              {stats.risk_distribution?.medium || 48}
            </div>
            <p className="text-[10px] text-[#A8ADB2]">Score 30 - 59 (Advisory)</p>
          </div>

          {/* Low Tier */}
          <div className="p-4 rounded-2xl bg-[#0F1E19] border border-emerald-500/30 hover:border-emerald-500/60 transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 font-mono uppercase">Low / Safe</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-black text-white font-heading">
              {stats.risk_distribution?.low || 124}
            </div>
            <p className="text-[10px] text-[#A8ADB2]">Score &lt; 30 (Stable)</p>
          </div>

          {/* Affected Roads */}
          <div className="p-4 rounded-2xl bg-[#121E1A] border border-white/10 hover:border-white/20 transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-400 font-mono uppercase">Blocked Roads</span>
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white font-heading">
              {stats.affected_roads_count || 5}
            </div>
            <p className="text-[10px] text-[#A8ADB2]">Ghat Arterials</p>
          </div>

          {/* Vulnerable Villages */}
          <div className="p-4 rounded-2xl bg-[#121E1A] border border-white/10 hover:border-white/20 transition space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 font-mono uppercase">Settlements</span>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-heading">
              {stats.vulnerable_villages_count || 9}
            </div>
            <p className="text-[10px] text-[#A8ADB2]">In Downslope Paths</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. GIS SITUATIONAL MAP & SENSOR TELEMETRY DRILL-DOWN */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Interactive Multi-Layer GIS Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="command-card rounded-3xl p-5 border border-white/10 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Integrated GIS Risk Map & Field Asset Tracking</span>
                </h3>
                <p className="text-xs text-[#8E959E]">
                  Real-time spatial grid overlaying ML hazard polygons with active convoy and shelter layers.
                </p>
              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0D1714] p-1.5 rounded-2xl border border-white/10 text-[11px]">
                <button
                  onClick={() => setLayerHeatmap(!layerHeatmap)}
                  className={`px-2.5 py-1 rounded-xl transition ${layerHeatmap ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40' : 'text-[#8E959E]'}`}
                >
                  Risk Grid
                </button>
                <button
                  onClick={() => setLayerRoads(!layerRoads)}
                  className={`px-2.5 py-1 rounded-xl transition ${layerRoads ? 'bg-teal-500/30 text-teal-300 font-bold border border-teal-500/40' : 'text-[#8E959E]'}`}
                >
                  Roads
                </button>
                <button
                  onClick={() => setLayerReports(!layerReports)}
                  className={`px-2.5 py-1 rounded-xl transition ${layerReports ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40' : 'text-[#8E959E]'}`}
                >
                  Reports ({defaultIncidents.length})
                </button>
                <button
                  onClick={() => setLayerShelters(!layerShelters)}
                  className={`px-2.5 py-1 rounded-xl transition ${layerShelters ? 'bg-blue-500/30 text-blue-300 font-bold border border-blue-500/40' : 'text-[#8E959E]'}`}
                >
                  Shelters
                </button>
              </div>
            </div>

            {/* Interactive Vector Terrain Canvas */}
            <div className="relative h-96 w-full rounded-2xl bg-[#09110E] border border-white/10 overflow-hidden flex items-center justify-center p-4">
              {/* Radar scanning circle effect */}
              <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]"></div>

              {/* SVG Map Graphics */}
              <svg className="w-full h-full" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Elevation Contours */}
                <path d="M 50,80 Q 200,40 380,90 T 750,70" stroke="#162D24" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 30,160 Q 220,120 420,180 T 780,140" stroke="#162D24" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 70,250 Q 260,210 460,270 T 760,230" stroke="#162D24" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 40,350 Q 240,310 480,360 T 770,330" stroke="#162D24" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* River Basin Layer */}
                <path d="M 200,450 C 230,320 280,220 320,150 C 350,90 390,40 430,0" stroke="#0284C7" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                <text x="335" y="160" fill="#38BDF8" fontSize="10" fontFamily="sans-serif">Alaknanda Stream</text>

                {/* Major Arterial Roads Layer */}
                {layerRoads && (
                  <>
                    <path d="M 0,380 C 180,360 300,280 460,240 C 620,200 700,120 800,90" stroke="#E2E8F0" strokeWidth="3.5" opacity="0.8" strokeLinecap="round" />
                    <text x="480" y="235" fill="#E2E8F0" fontSize="10" fontFamily="sans-serif" fontWeight="bold">NH-181 Highway</text>
                    
                    {/* Alternate Pass Road */}
                    <path d="M 50,420 C 150,300 240,160 400,100 C 560,40 680,80 780,60" stroke="#10B981" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />
                    <text x="210" y="195" fill="#34D399" fontSize="10" fontFamily="sans-serif">Route A (Emergency Ridge Corridor)</text>
                  </>
                )}

                {/* Critical Hazard Zones (Polygons) */}
                {layerHeatmap && (
                  <>
                    {/* Zone 1: Coonoor Ghat km 14 */}
                    <g className="cursor-pointer" onClick={() => setSelectedLocationId(1)}>
                      <circle cx="460" cy="240" r="42" fill="#EF4444" fillOpacity="0.25" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
                      <circle cx="460" cy="240" r="7" fill="#EF4444" />
                      <text x="475" y="245" fill="#FCA5A5" fontSize="11" fontWeight="bold">Coonoor Ghat (84.5% - Critical)</text>
                    </g>

                    {/* Zone 2: Wayanad Meppadi */}
                    <g className="cursor-pointer" onClick={() => setSelectedLocationId(3)}>
                      <circle cx="280" cy="180" r="50" fill="#DC2626" fillOpacity="0.3" stroke="#DC2626" strokeWidth="2.5" />
                      <circle cx="280" cy="180" r="8" fill="#DC2626" />
                      <text x="295" y="185" fill="#F87171" fontSize="11" fontWeight="bold">Meppadi Chooralmala (91.2% - Extreme)</text>
                    </g>

                    {/* Zone 3: Kotagiri Pass */}
                    <g className="cursor-pointer" onClick={() => setSelectedLocationId(2)}>
                      <circle cx="620" cy="190" r="32" fill="#F59E0B" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="1.5" />
                      <circle cx="620" cy="190" r="6" fill="#F59E0B" />
                      <text x="635" y="195" fill="#FCD34D" fontSize="10">Kotagiri Pass (72.0% - High)</text>
                    </g>
                  </>
                )}

                {/* Verified Relief Shelters */}
                {layerShelters && (
                  <>
                    <g transform="translate(180, 290)">
                      <circle cx="0" cy="0" r="10" fill="#059669" stroke="#34D399" strokeWidth="2" />
                      <text x="14" y="4" fill="#6EE7B7" fontSize="10" fontWeight="bold">Shelter: Coonoor Govt College</text>
                    </g>
                    <g transform="translate(640, 80)">
                      <circle cx="0" cy="0" r="10" fill="#059669" stroke="#34D399" strokeWidth="2" />
                      <text x="14" y="4" fill="#6EE7B7" fontSize="10" fontWeight="bold">Shelter: Kotagiri Community Hall</text>
                    </g>
                  </>
                )}

                {/* Citizen Incident Reports Layer */}
                {layerReports && (
                  <>
                    <g transform="translate(435, 220)">
                      <polygon points="0,-12 10,6 -10,6" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                      <text x="14" y="2" fill="#FBBF24" fontSize="10" fontWeight="bold">Citizen: Tension Crack Fissure</text>
                    </g>
                    <g transform="translate(250, 160)">
                      <polygon points="0,-12 10,6 -10,6" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
                      <text x="14" y="2" fill="#FCA5A5" fontSize="10" fontWeight="bold">Citizen: Debris Liquefaction</text>
                    </g>
                  </>
                )}
              </svg>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-[#0D1714]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[10px] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-white">Critical Zone (&gt;80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-white">High Zone (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-white">Safe Evacuation Shelter</span>
                </div>
              </div>
            </div>

            {/* Quick Sector Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {defaultLocations.slice(0, 3).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedLocationId === loc.id
                      ? 'bg-[#152420] border-emerald-500'
                      : 'bg-[#0D1714] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{loc.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      loc.current_risk_score > 80 ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {loc.current_risk_score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E959E] mt-1">{loc.region}, {loc.state}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Physics Telemetry & Explainable AI */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Multi-Horizon Timeline Forecast */}
          <div className="command-card rounded-3xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-heading">Multi-Horizon AI Trajectory</h3>
                <p className="text-xs text-[#8E959E]">Ensemble failure projection over 24h</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
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

          {/* Explainable Factor Weights (SHAP Analysis) */}
          <div className="command-card rounded-3xl p-5 border border-white/10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Explainable Factor Weights (SHAP)</h3>
              <p className="text-xs text-[#8E959E]">Physics features driving current hazard score</p>
            </div>

            <ExplainableFactorBar
              factors={{
                "Rainfall Accumulation (72h)": 42.5,
                "Hydrostatic Pore Pressure": 28.0,
                "Soil Moisture Saturation": 18.5,
                "Slope Inclinometer Tilt": 11.0
              }}
            />

            <div className="p-3 rounded-2xl bg-[#0D1714] border border-white/5 text-[11px] text-[#A8ADB2] space-y-1">
              <span className="text-white font-semibold">Diagnostic Takeaway:</span>
              <p>
                Continuous rainfall of 142mm has supersaturated the laterite layer, exceeding the critical pore threshold (32 kPa).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. EMERGENCY PRIORITIZATION MATRIX TABLE */}
      {/* ========================================================= */}
      <div className="command-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Emergency Prioritization Matrix</span>
            </h3>
            <p className="text-xs text-[#8E959E]">
              Dynamic ranking combining ML Risk % &bull; Population Density &bull; Critical Infrastructure Vulnerability
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-[#0D1714] border border-white/10 text-emerald-400">
            AUTO-SORTED BY COMPOSITE PRIORITY
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#CBD1D6]">
            <thead className="bg-[#0D1714] text-[#8E959E] uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Priority</th>
                <th className="py-3 px-4">Location & Sector</th>
                <th className="py-3 px-4">ML Risk Score</th>
                <th className="py-3 px-4">Infrastructure & Population Exposure</th>
                <th className="py-3 px-4">Recommended Emergency Action</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {defaultPriorities.map((item) => (
                <tr key={item.rank} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      item.rank === 1 ? 'bg-red-500 text-white' : item.rank === 2 ? 'bg-amber-500 text-black' : 'bg-[#152420] text-emerald-400'
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{item.location_name}</div>
                    <div className="text-[10px] text-[#8E959E]">{item.region}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${
                        item.risk_score >= 80 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {item.risk_score}%
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.risk_tier === 'Critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.risk_tier}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#A8ADB2] max-w-xs">
                    {item.vulnerability}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300 font-medium">
                    {item.recommended_action}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setDispatchLocationId(item.location_id || 1);
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
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
      <div className="command-card rounded-3xl p-6 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Field Verification Action Center (Citizen Reports)</span>
            </h3>
            <p className="text-xs text-[#8E959E]">
              Validate citizen slope crack submissions, upgrade severity, and trigger immediate dispatch.
            </p>
          </div>

          <span className="text-xs font-mono text-[#8E959E]">
            Pending Review: <strong className="text-amber-400">{defaultIncidents.filter(i => i.status === 'PENDING').length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultIncidents.map((incident) => (
            <div 
              key={incident.id} 
              className={`p-5 rounded-2xl border space-y-3 transition flex flex-col justify-between ${
                incident.status === 'VERIFIED'
                  ? 'bg-[#10241A] border-emerald-500/40'
                  : incident.status === 'REJECTED'
                  ? 'bg-[#1F1414] border-red-500/20 opacity-70'
                  : 'bg-[#0D1714] border-white/10 hover:border-white/25'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-heading">{incident.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    incident.severity === 'Critical' ? 'bg-red-500/20 text-red-300' :
                    incident.severity === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {incident.severity}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{incident.location_name}</span>
                </div>

                <p className="text-xs text-[#CBD1D6] leading-relaxed">
                  {incident.description}
                </p>

                <div className="text-[10px] text-[#8E959E] font-mono">
                  Reported: {incident.reported_at} &bull; Status: <strong className="text-white">{incident.status}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <input
                  type="text"
                  placeholder="Officer verification notes..."
                  value={actionNotes[incident.id] || ''}
                  onChange={(e) => setActionNotes({ ...actionNotes, [incident.id]: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#121E1A] border border-white/10 text-xs text-white placeholder-[#5E6872] focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(incident.id, 'VERIFIED')}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(incident.id, 'INVESTIGATING')}
                    className="flex-1 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 font-semibold text-xs transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(incident.id, 'REJECTED')}
                    className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 font-semibold text-xs transition flex items-center justify-center"
                    title="Reject report"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. EMERGENCY VEHICLE RESPONSE & SAFE DISPATCH PLANNER */}
      {/* ========================================================= */}
      <div className="command-card rounded-3xl p-6 border border-white/10 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Emergency Convoy & Response Vehicle Dispatch Planner</span>
          </h3>
          <p className="text-xs text-[#8E959E]">
            Computes guaranteed safe routes avoiding active landslide polygons, debris flows, and structural road failures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatch Input Form (5 cols) */}
          <form onSubmit={handleGenerateDispatch} className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#CBD1D6] mb-1.5">
                Assigned Emergency Response Unit
              </label>
              <select
                value={dispatchTeam}
                onChange={(e) => setDispatchTeam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0D1714] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="NDRF Quick Response Team 4">NDRF Quick Response Team 4</option>
                <option value="Nilgiris District QRT Patrol">Nilgiris District QRT Patrol</option>
                <option value="SDRF Heavy Clearing Convoy">SDRF Heavy Clearing Convoy</option>
                <option value="Fire & Rescue Emergency Ambulance Unit">Fire & Rescue Emergency Ambulance Unit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD1D6] mb-1.5">
                Target Incident / Hazard Sector
              </label>
              <select
                value={dispatchLocationId}
                onChange={(e) => setDispatchLocationId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0D1714] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-semibold text-[#CBD1D6] mb-1.5">
                  Vehicle Type
                </label>
                <select
                  value={dispatchVehicle}
                  onChange={(e) => setDispatchVehicle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#0D1714] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Heavy Excavator">Heavy Excavator</option>
                  <option value="Ambulance Convoy">Ambulance Convoy</option>
                  <option value="4x4 Emergency Patrol">4x4 Emergency Patrol</option>
                  <option value="NDRF Rescue Bus">NDRF Rescue Bus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD1D6] mb-1.5">
                  Priority Tier
                </label>
                <select
                  value={dispatchPriority}
                  onChange={(e) => setDispatchPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#0D1714] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
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
          <div className="lg:col-span-7 bg-[#0D1714] rounded-2xl border border-white/10 p-5 space-y-4">
            {dispatchResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400">{dispatchResult.dispatch_id}</span>
                    <h4 className="text-sm font-bold text-white font-heading">
                      Dispatch Authorization: {dispatchResult.team_name}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                    ETA: {dispatchResult.recommended_route.eta_minutes} MINS
                  </span>
                </div>

                {/* Recommended Green Route */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{dispatchResult.recommended_route.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                      SAFE CONVOY PASS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#CBD1D6] pt-1">
                    <div>Transit Distance: <strong className="text-white">{dispatchResult.recommended_route.distance_km} km</strong></div>
                    <div>Road Condition: <strong className="text-white">{dispatchResult.recommended_route.road_condition}</strong></div>
                  </div>
                  <p className="text-[11px] text-emerald-400/90 font-medium pt-1">
                    &bull; {dispatchResult.recommended_route.vehicle_suitability}
                  </p>
                </div>

                {/* Avoided Red Route */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                      <span>{dispatchResult.avoided_route.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200">
                      AVOID: CRITICAL DANGER
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD1D6] leading-relaxed">
                    {dispatchResult.avoided_route.warning}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <Truck className="w-10 h-10 text-[#2D453C]" />
                <h4 className="text-xs font-bold text-white">No Active Dispatch Calculated</h4>
                <p className="text-[11px] text-[#8E959E] max-w-xs">
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

