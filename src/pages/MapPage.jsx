import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, ShieldAlert, Droplets, Mountain, Navigation, 
  AlertTriangle, RefreshCw, Search, Filter, Compass, 
  Eye, CheckCircle2, CloudRain, Building2, Home, ExternalLink, Bell, AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import { alertWebSocketService } from '../services/websocket';

// Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons for distinct risk levels and hazard types
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    className: 'custom-gis-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px ${color}, 0 2px 6px rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 11px;
        color: white;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const redIcon = createCustomIcon('#EF4444', '⚠️');
const orangeIcon = createCustomIcon('#F59E0B', '⚡');
const greenIcon = createCustomIcon('#10B981', '✓');
const floodIcon = createCustomIcon('#3B82F6', '🌊');
const slopeIcon = createCustomIcon('#8B5CF6', '📐');

// Northeast India boundary approximation polygon
const northeastBoundary = [
  [29.30, 91.50], [29.45, 95.00], [28.20, 97.40], [27.00, 97.10],
  [24.50, 95.20], [22.00, 93.10], [21.90, 92.30], [23.90, 91.20],
  [25.10, 90.00], [26.00, 89.80], [27.20, 88.00], [28.10, 88.70],
  [27.00, 92.00], [29.30, 91.50]
];

// Representative Northeast Location Dataset covering all 8 states
const defaultNEStations = [
  {
    id: 1,
    name: "Shillong Ridge (NH-6)",
    region: "East Khasi Hills",
    state: "Meghalaya",
    latitude: 25.5788,
    longitude: 91.8933,
    elevation: 1520.0,
    slope: 36.5,
    soil_type: "Lateritic Clay",
    landslide_probability: 78.5,
    landslide_level: "HIGH",
    flood_probability: 45.0,
    flood_level: "MEDIUM",
    slope_risk: "HIGH",
    rainfall_1h: 18.5,
    rainfall_24h: 88.0,
    nearest_road: "NH-6 (Shillong - Guwahati Expressway)",
    road_distance_m: 120,
    road_impact: "HIGH",
    road_status: "RESTRICTED (Single-Lane Escort)",
    infrastructure_exposure: "HIGH",
    community_access: "AT RISK",
    isolation_risk: "MEDIUM",
    alt_route: "Shillong Peak Bypass via Upper Nongthymmai link",
    warning: "Active soil creep and saturated escarpment shoulder. Monitor inclinometers."
  },
  {
    id: 2,
    name: "Guwahati - Khanapara Escarpment",
    region: "Kamrup Metro",
    state: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    elevation: 120.0,
    slope: 28.0,
    soil_type: "Alluvial Silt",
    landslide_probability: 32.0,
    landslide_level: "LOW",
    flood_probability: 68.0,
    flood_level: "HIGH",
    slope_risk: "LOW",
    rainfall_1h: 12.0,
    rainfall_24h: 52.0,
    nearest_road: "NH-27 (East-West Corridor)",
    road_distance_m: 210,
    road_impact: "MEDIUM",
    road_status: "OPEN (Advisory Watch)",
    infrastructure_exposure: "MEDIUM",
    community_access: "NORMAL",
    isolation_risk: "LOW",
    alt_route: "Primary national arterial open",
    warning: "Heavy urban surface runoff and low-lying water ponding."
  },
  {
    id: 3,
    name: "Noney Railway Cutting (NH-37)",
    region: "Noney",
    state: "Manipur",
    latitude: 24.8170,
    longitude: 93.6000,
    elevation: 1420.0,
    slope: 39.5,
    soil_type: "Clay-Rich Schist",
    landslide_probability: 88.2,
    landslide_level: "CRITICAL",
    flood_probability: 58.0,
    flood_level: "MEDIUM",
    slope_risk: "CRITICAL",
    rainfall_1h: 42.0,
    rainfall_24h: 165.0,
    nearest_road: "NH-37 (Silchar - Imphal Highway km 44)",
    road_distance_m: 85,
    road_impact: "CRITICAL",
    road_status: "BLOCKED / IMPASSABLE",
    infrastructure_exposure: "CRITICAL",
    community_access: "AT RISK",
    isolation_risk: "HIGH",
    alt_route: "Secondary Ridge Bypass via Local Panchayat Track",
    warning: "Active colluvium shear. Restrict all transit immediately."
  },
  {
    id: 4,
    name: "Kohima - Zubza Pass (NH-29)",
    region: "Kohima",
    state: "Nagaland",
    latitude: 25.6751,
    longitude: 94.1086,
    elevation: 1440.0,
    slope: 35.0,
    soil_type: "Disintegrated Shale",
    landslide_probability: 72.0,
    landslide_level: "HIGH",
    flood_probability: 40.0,
    flood_level: "MEDIUM",
    slope_risk: "HIGH",
    rainfall_1h: 22.0,
    rainfall_24h: 94.0,
    nearest_road: "NH-29 (Dimapur - Kohima Highway)",
    road_distance_m: 160,
    road_impact: "HIGH",
    road_status: "RESTRICTED (Single-Lane Escort)",
    infrastructure_exposure: "HIGH",
    community_access: "AT RISK",
    isolation_risk: "HIGH",
    alt_route: "Peducha - Tsiesema Bypass Track",
    warning: "Shoulder slump and minor rockfall on ghat curves."
  },
  {
    id: 5,
    name: "Gangtok - Deorali Sinking Zone (NH-10)",
    region: "East Sikkim",
    state: "Sikkim",
    latitude: 27.3389,
    longitude: 88.6065,
    elevation: 1650.0,
    slope: 39.0,
    soil_type: "Mica-Rich Gneiss",
    landslide_probability: 84.0,
    landslide_level: "CRITICAL",
    flood_probability: 62.0,
    flood_level: "HIGH",
    slope_risk: "CRITICAL",
    rainfall_1h: 38.0,
    rainfall_24h: 140.0,
    nearest_road: "NH-10 (Sevoke - Gangtok Lifeline)",
    road_distance_m: 95,
    road_impact: "CRITICAL",
    road_status: "BLOCKED / IMPASSABLE",
    infrastructure_exposure: "CRITICAL",
    community_access: "AT RISK",
    isolation_risk: "HIGH",
    alt_route: "Lava - Damdim Alternate Ridge Pass",
    warning: "Deorali subsidence accelerating. Teesta basin surge active."
  },
  {
    id: 6,
    name: "Itanagar - Papum Pare Escarpment",
    region: "Papum Pare",
    state: "Arunachal Pradesh",
    latitude: 27.0844,
    longitude: 93.6053,
    elevation: 750.0,
    slope: 34.0,
    soil_type: "Gravelly Sandstone",
    landslide_probability: 58.0,
    landslide_level: "MEDIUM",
    flood_probability: 52.0,
    flood_level: "MEDIUM",
    slope_risk: "MEDIUM",
    rainfall_1h: 16.0,
    rainfall_24h: 70.0,
    nearest_road: "NH-415 (Banderdewa - Itanagar Link)",
    road_distance_m: 140,
    road_impact: "MEDIUM",
    road_status: "OPEN (Advisory Watch)",
    infrastructure_exposure: "MEDIUM",
    community_access: "NORMAL",
    isolation_risk: "LOW",
    alt_route: "Hollongi Greenfield Expressway link",
    warning: "Moderate slope run-off. Retaining walls stable."
  },
  {
    id: 7,
    name: "Aizawl - Durtlang Sinking Ridge",
    region: "Aizawl",
    state: "Mizoram",
    latitude: 23.7271,
    longitude: 92.7176,
    elevation: 1132.0,
    slope: 37.0,
    soil_type: "Pore-Saturated Silt",
    landslide_probability: 66.0,
    landslide_level: "HIGH",
    flood_probability: 30.0,
    flood_level: "LOW",
    slope_risk: "HIGH",
    rainfall_1h: 24.0,
    rainfall_24h: 96.0,
    nearest_road: "NH-54 (Aizawl - Silchar Corridor)",
    road_distance_m: 110,
    road_impact: "HIGH",
    road_status: "RESTRICTED (Single-Lane Escort)",
    infrastructure_exposure: "HIGH",
    community_access: "AT RISK",
    isolation_risk: "HIGH",
    alt_route: "Sairang Valley Link",
    warning: "Hillside tension cracks widening due to antecedent rain."
  },
  {
    id: 8,
    name: "Agartala - Baramura Hill Cut",
    region: "West Tripura",
    state: "Tripura",
    latitude: 23.8315,
    longitude: 91.2868,
    elevation: 180.0,
    slope: 22.0,
    soil_type: "Red Clay Loam",
    landslide_probability: 24.0,
    landslide_level: "LOW",
    flood_probability: 44.0,
    flood_level: "MEDIUM",
    slope_risk: "LOW",
    rainfall_1h: 8.0,
    rainfall_24h: 38.0,
    nearest_road: "NH-8 (Assam - Tripura Lifeline)",
    road_distance_m: 190,
    road_impact: "LOW",
    road_status: "OPEN",
    infrastructure_exposure: "LOW",
    community_access: "NORMAL",
    isolation_risk: "LOW",
    alt_route: "Primary state highway open",
    warning: "Normal environmental conditions."
  },
  {
    id: 9,
    name: "Cherrapunji / Sohra Escarpment",
    region: "East Khasi Hills",
    state: "Meghalaya",
    latitude: 25.2702,
    longitude: 91.7323,
    elevation: 1430.0,
    slope: 44.0,
    soil_type: "Karstified Sandstone",
    landslide_probability: 91.5,
    landslide_level: "CRITICAL",
    flood_probability: 78.0,
    flood_level: "CRITICAL",
    slope_risk: "CRITICAL",
    rainfall_1h: 58.0,
    rainfall_24h: 240.0,
    nearest_road: "SH-12 (Sohra - Shella Ghat Pass)",
    road_distance_m: 60,
    road_impact: "CRITICAL",
    road_status: "BLOCKED / IMPASSABLE",
    infrastructure_exposure: "CRITICAL",
    community_access: "AT RISK",
    isolation_risk: "HIGH",
    alt_route: "Mawkdok Plateau Emergency Bypass",
    warning: "Torrential downpour exceeding flash threshold. Extreme waterfall surge."
  }
];

// Helper to recenter map
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [stations, setStations] = useState(defaultNEStations);
  const [selectedStation, setSelectedStation] = useState(defaultNEStations[0]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [isDemoData, setIsDemoData] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [hazardFilter, setHazardFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Layer Toggles
  const [layers, setLayers] = useState({
    landslide: true,
    flood: true,
    slope: true,
    rainfall: true,
    roads: true,
    infrastructure: true,
    communities: true,
    boundary: true
  });

  // Map Center: Default [25.5, 93.5], Zoom: 6
  const [mapCenter, setMapCenter] = useState([25.5, 93.5]);
  const [mapZoom, setMapZoom] = useState(6);

  // Fetch real data from backend API
  const fetchMapData = async () => {
    setLoading(true);
    try {
      const riskData = await api.getRiskMap();
      if (riskData && riskData.features && riskData.features.length > 0) {
        const mapped = riskData.features.map((f, index) => ({
          id: f.location_id || index + 1,
          name: f.name,
          region: f.region || 'North-East',
          state: f.state || 'Assam',
          latitude: f.latitude,
          longitude: f.longitude,
          elevation: f.elevation_m || 1000,
          slope: f.slope_angle || 30,
          soil_type: f.soil_type || 'Mountain Colluvium',
          landslide_probability: f.landslide_probability || 50,
          landslide_level: f.landslide_level || 'MEDIUM',
          flood_probability: f.flood_probability || 40,
          flood_level: f.flood_level || 'MEDIUM',
          slope_risk: f.slope_failure_risk || 'MEDIUM',
          rainfall_1h: 22.0,
          rainfall_24h: 95.0,
          nearest_road: f.road_impact?.nearest_road || 'NH-6 Corridor',
          road_distance_m: f.road_impact?.distance_m || 150,
          road_impact: f.road_impact?.impact_level || 'MEDIUM',
          road_status: f.road_impact?.road_status || 'OPEN',
          infrastructure_exposure: f.road_impact?.impact_level || 'MEDIUM',
          community_access: f.community_isolation?.accessibility_status || 'ACCESSIBLE',
          isolation_risk: f.community_isolation?.isolation_risk || 'LOW',
          alt_route: f.community_isolation?.alternative_route || 'Primary highway open',
          warning: f.summary || 'Environmental baseline active.'
        }));
        setStations(mapped);
        setSelectedStation(mapped[0]);
        setIsDemoData(false);
      } else {
        setStations(defaultNEStations);
        setIsDemoData(true);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Using default North-Eastern stations array:', err);
      setStations(defaultNEStations);
      setIsDemoData(true);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  const [liveWsAlert, setLiveWsAlert] = useState(null);

  useEffect(() => {
    fetchMapData();

    // Subscribe to real-time WebSocket alerts
    const unsubscribe = alertWebSocketService.subscribe((incomingAlert) => {
      console.log('[MapPage] Received real-time alert:', incomingAlert);
      setLiveWsAlert(incomingAlert);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const toggleLayer = (layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Filter stations
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      // Search
      const matchSearch = 
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.nearest_road.toLowerCase().includes(searchQuery.toLowerCase());
      
      // State
      const matchState = stateFilter === 'ALL' || st.state.toLowerCase() === stateFilter.toLowerCase();

      // Risk
      let matchRisk = true;
      if (riskFilter === 'CRITICAL') matchRisk = st.landslide_level === 'CRITICAL' || st.landslide_probability >= 80;
      else if (riskFilter === 'HIGH') matchRisk = st.landslide_level === 'HIGH' || (st.landslide_probability >= 60 && st.landslide_probability < 80);
      else if (riskFilter === 'MEDIUM') matchRisk = st.landslide_level === 'MEDIUM' || (st.landslide_probability >= 30 && st.landslide_probability < 60);
      else if (riskFilter === 'LOW') matchRisk = st.landslide_level === 'LOW' || st.landslide_probability < 30;

      // Hazard
      let matchHazard = true;
      if (hazardFilter === 'LANDSLIDE') matchHazard = st.landslide_probability >= 50;
      else if (hazardFilter === 'FLOOD') matchHazard = st.flood_probability >= 50;
      else if (hazardFilter === 'SLOPE') matchHazard = st.slope_risk === 'HIGH' || st.slope_risk === 'CRITICAL';

      return matchSearch && matchState && matchRisk && matchHazard;
    });
  }, [stations, searchQuery, stateFilter, riskFilter, hazardFilter]);

  const selectStationAndPan = (st) => {
    setSelectedStation(st);
    setMapCenter([st.latitude, st.longitude]);
    setMapZoom(9);
  };

  const resetView = () => {
    setMapCenter([25.5, 93.5]);
    setMapZoom(6);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP TITLE & SYSTEM STATUS BAR */}
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[10px] font-extrabold border border-emerald-300 shadow-sm">
              GIS RISK MONITORING
            </span>
            <span className="text-[11px] text-slate-700 font-mono font-bold">
              TARGET REGION: <strong className="text-slate-950">North-Eastern Region of India</strong>
            </span>
            {isDemoData && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-300">
                Representative Dataset
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight mt-1">
            AI-POWERED LANDSLIDE EARLY WARNING &amp; MONITORING SYSTEM
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">
            Multi-hazard geospatial intelligence across Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, &amp; Tripura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-600 font-mono font-bold">LAST SYNC</div>
            <div className="text-xs text-slate-950 font-mono font-black">{lastUpdated}</div>
          </div>

          <button
            onClick={resetView}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 text-slate-900 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Reset Map to Northeast Region Center [25.5, 93.5]"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Center NE</span>
          </button>

          <button
            onClick={fetchMapData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh GIS</span>
          </button>
        </div>
      </div>

      {/* Live WebSocket Real-Time Alert Banner */}
      {liveWsAlert && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-red-950 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-red-700 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-red-600 px-2.5 py-0.5 rounded text-white font-mono uppercase">
                  {liveWsAlert.risk_level || 'CRITICAL'} ALERT
                </span>
                <span className="font-extrabold text-sm text-red-950">
                  ⛔ AVOID ROAD: {liveWsAlert.road_id} ({liveWsAlert.state})
                </span>
              </div>
              <p className="text-xs text-red-900 font-semibold mt-0.5">{liveWsAlert.alert_message || liveWsAlert.title}</p>
            </div>
          </div>
          <button
            onClick={() => setLiveWsAlert(null)}
            className="px-3 py-1 bg-white hover:bg-red-100 border border-red-300 rounded-lg text-xs font-bold text-red-900 shrink-0 cursor-pointer shadow-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-white/95 p-4 rounded-3xl border border-slate-300 shadow-md text-xs">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search station, highway (e.g. NH-6, NH-37, Shillong)..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-950 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* State Filter */}
        <div className="lg:col-span-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All 8 Northeast States</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tripura">Tripura</option>
          </select>
        </div>

        {/* Hazard Filter */}
        <div className="lg:col-span-3">
          <select
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Hazard Layers</option>
            <option value="LANDSLIDE">Landslide Threat Priority</option>
            <option value="FLOOD">Flash Flood Runoff Priority</option>
            <option value="SLOPE">Steep Slope Failure Priority</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="lg:col-span-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">🔴 Critical (&ge;80%)</option>
            <option value="HIGH">🟠 High (60-79%)</option>
            <option value="MEDIUM">🟡 Medium (30-59%)</option>
            <option value="LOW">🟢 Low (&lt;30%)</option>
          </select>
        </div>
      </div>

      {/* 3. MAIN MAP & INSPECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: LEAFLET GIS MAP CONTAINER (8 COLS) */}
        <div className="lg:col-span-8 command-card-solid rounded-3xl p-4 border border-slate-300 relative overflow-hidden flex flex-col justify-between shadow-2xl h-[650px]">
          
          {/* Top Floating Layer Controls */}
          <div className="absolute top-6 left-6 right-6 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-300 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-950 font-mono font-extrabold">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>GIS LAYERS:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 cursor-pointer hover:border-emerald-600">
                <input
                  type="checkbox"
                  checked={layers.landslide}
                  onChange={() => toggleLayer('landslide')}
                  className="accent-red-600"
                />
                <span>Landslide</span>
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 cursor-pointer hover:border-emerald-600">
                <input
                  type="checkbox"
                  checked={layers.flood}
                  onChange={() => toggleLayer('flood')}
                  className="accent-blue-600"
                />
                <span>Flash Flood</span>
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 cursor-pointer hover:border-emerald-600">
                <input
                  type="checkbox"
                  checked={layers.slope}
                  onChange={() => toggleLayer('slope')}
                  className="accent-purple-600"
                />
                <span>Slope FoS</span>
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 cursor-pointer hover:border-emerald-600">
                <input
                  type="checkbox"
                  checked={layers.rainfall}
                  onChange={() => toggleLayer('rainfall')}
                  className="accent-teal-600"
                />
                <span>Rainfall</span>
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 cursor-pointer hover:border-emerald-600">
                <input
                  type="checkbox"
                  checked={layers.roads}
                  onChange={() => toggleLayer('roads')}
                  className="accent-amber-600"
                />
                <span>Roads (NH)</span>
              </label>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 cursor-pointer hover:border-emerald-600">
                <input
                  type="checkbox"
                  checked={layers.communities}
                  onChange={() => toggleLayer('communities')}
                  className="accent-emerald-600"
                />
                <span>Communities</span>
              </label>
            </div>
          </div>

          {/* Real Leaflet Map */}
          <div className="w-full h-full rounded-2xl overflow-hidden relative z-10 border border-slate-300">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', backgroundColor: '#F1F5F9' }}
            >
              <MapRecenter center={mapCenter} zoom={mapZoom} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* Northeast Region Boundary Polygon */}
              {layers.boundary && (
                <Polygon
                  positions={northeastBoundary}
                  pathOptions={{
                    color: '#059669',
                    weight: 2,
                    dashArray: '6, 6',
                    fillColor: '#10B981',
                    fillOpacity: 0.06
                  }}
                />
              )}

              {/* Markers for Stations */}
              {filteredStations.map((st) => {
                const isCrit = st.landslide_level === 'CRITICAL' || st.landslide_probability >= 80;
                const isHigh = st.landslide_level === 'HIGH' || (st.landslide_probability >= 60 && st.landslide_probability < 80);
                const markerColor = isCrit ? '#DC2626' : (isHigh ? '#D97706' : '#059669');
                const markerIcon = isCrit ? redIcon : (isHigh ? orangeIcon : greenIcon);

                return (
                  <React.Fragment key={st.id}>
                    {/* Landslide Risk Buffer Halo */}
                    {layers.landslide && (
                      <CircleMarker
                        center={[st.latitude, st.longitude]}
                        radius={isCrit ? 32 : (isHigh ? 24 : 16)}
                        pathOptions={{
                          color: markerColor,
                          fillColor: markerColor,
                          fillOpacity: isCrit ? 0.35 : 0.2,
                          weight: isCrit ? 2 : 1
                        }}
                      />
                    )}

                    {/* Flash Flood Radial Inundation */}
                    {layers.flood && st.flood_probability >= 60 && (
                      <CircleMarker
                        center={[st.latitude, st.longitude]}
                        radius={20}
                        pathOptions={{
                          color: '#2563EB',
                          fillColor: '#3B82F6',
                          fillOpacity: 0.25,
                          dashArray: '3, 4',
                          weight: 1.5
                        }}
                      />
                    )}

                    {/* Interactive Marker Pin */}
                    <Marker
                      position={[st.latitude, st.longitude]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => setSelectedStation(st)
                      }}
                    >
                      {/* Rich Professional Map Popup */}
                      <Popup className="custom-leaflet-popup">
                        <div className="p-3 text-xs text-slate-950 max-w-[280px] font-sans space-y-2">
                          <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-950 leading-tight">{st.name}</h4>
                              <p className="text-[11px] text-slate-700 font-semibold">{st.region}, {st.state}</p>
                            </div>
                            <span 
                              className="px-2 py-0.5 rounded font-mono font-extrabold text-[10px] text-white"
                              style={{ backgroundColor: markerColor }}
                            >
                              {st.landslide_level}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div>
                              <span className="text-slate-600 block font-semibold">Probability:</span>
                              <strong className="text-slate-950 font-mono text-xs font-black">{st.landslide_probability}%</strong>
                            </div>
                            <div>
                              <span className="text-slate-600 block font-semibold">24h Rainfall:</span>
                              <strong className="text-blue-700 font-mono text-xs font-black">{st.rainfall_24h} mm</strong>
                            </div>
                            <div>
                              <span className="text-slate-600 block font-semibold">Slope Angle:</span>
                              <strong className="text-slate-950 font-mono text-xs font-black">{st.slope}&deg;</strong>
                            </div>
                            <div>
                              <span className="text-slate-600 block font-semibold">Slope Risk:</span>
                              <strong className="text-purple-800 font-mono text-xs font-black">{st.slope_risk}</strong>
                            </div>
                          </div>

                          <div className="bg-amber-50 p-2 rounded-xl border border-amber-300 text-[11px] space-y-0.5">
                            <div className="font-extrabold text-amber-950">Road Impact: {st.road_impact}</div>
                            <div className="text-slate-800 font-medium">{st.nearest_road} ({st.road_distance_m}m)</div>
                            <div className="text-red-700 font-bold">{st.road_status}</div>
                          </div>

                          <div className="text-[11px] space-y-0.5">
                            <div className="text-slate-700">
                              Exposure: <strong className="text-slate-950">{st.infrastructure_exposure}</strong> | Access: <strong className="text-slate-950">{st.community_access}</strong>
                            </div>
                            <div className="text-slate-600 italic text-[10px]">
                              Bypass: {st.alt_route}
                            </div>
                          </div>

                          <div className="bg-red-50 p-2 rounded-xl border border-red-300 text-red-950 text-[10px] font-bold">
                            ⚠️ {st.warning}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* Bottom Floating Legend */}
          <div className="absolute bottom-6 left-6 right-6 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-300 text-[11px] text-slate-800 font-bold pointer-events-auto shadow-md">
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-950 font-mono text-xs">HAZARD LEGEND:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-sm"></span>
                <strong className="text-red-900">Critical (&ge;80%)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                <strong className="text-amber-900">High (60-79%)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-sm"></span>
                <strong className="text-emerald-900">Low (&lt;30%)</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="text-blue-800 flex items-center gap-1 font-bold">
                <span>🌊</span> Flood Runoff
              </span>
              <span className="text-purple-800 flex items-center gap-1 font-bold">
                <span>📐</span> Escarpment FoS
              </span>
              <span className="text-emerald-900 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {filteredStations.length} of {stations.length} Nodes Displayed
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: INSPECTION CONSOLE & INFRASTRUCTURE PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selected Station Telemetry Inspector */}
          <div className="command-card-solid rounded-3xl p-5 border border-slate-300 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-mono uppercase text-slate-800 font-extrabold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span>Station Inspector</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black ${
                selectedStation.landslide_probability >= 80 ? 'bg-red-100 text-red-900 border border-red-300' :
                selectedStation.landslide_probability >= 60 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {selectedStation.landslide_level} ({selectedStation.landslide_probability}%)
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-950 font-heading">{selectedStation.name}</h3>
              <p className="text-xs text-slate-700 font-semibold">{selectedStation.region}, {selectedStation.state}</p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-700 font-bold flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-700" />
                  <span>24h Rainfall</span>
                </span>
                <div className="text-sm font-black text-slate-950 font-mono">{selectedStation.rainfall_24h} mm</div>
                <div className="text-[10px] text-blue-800 font-mono font-bold">1h: {selectedStation.rainfall_1h} mm</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-700 font-bold flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-purple-700" />
                  <span>Slope &amp; Lithology</span>
                </span>
                <div className="text-sm font-black text-slate-950 font-mono">{selectedStation.slope}&deg; / {selectedStation.elevation}m</div>
                <div className="text-[10px] text-slate-800 font-bold truncate">{selectedStation.soil_type}</div>
              </div>
            </div>

            {/* Road Network & Impact */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5 font-mono text-[11px]">
                  <Navigation className="w-3.5 h-3.5 text-amber-700" />
                  <span>ROAD IMPACT: {selectedStation.road_impact}</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-700">{selectedStation.road_distance_m}m away</span>
              </div>
              <div className="text-slate-950 font-extrabold text-xs">{selectedStation.nearest_road}</div>
              <div className="text-[11px] text-red-800 font-bold">{selectedStation.road_status}</div>
            </div>

            {/* Infrastructure & Community Access */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Potential Infrastructure Exposure:</span>
                </span>
                <span className="text-slate-950 font-black font-mono">{selectedStation.infrastructure_exposure}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-semibold flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Community Access:</span>
                </span>
                <span className={`font-black font-mono ${
                  selectedStation.community_access === 'NORMAL' ? 'text-emerald-800' : 'text-red-700'
                }`}>
                  {selectedStation.community_access}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-700 font-medium">
                <strong className="text-slate-950 font-bold">Evacuation Bypass:</strong> {selectedStation.alt_route}
              </div>
            </div>

            {/* Recommended Action / Warning */}
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-950 text-xs space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 font-mono text-[11px] text-red-900">
                <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                <span>OPERATIONAL ADVISORY</span>
              </div>
              <p className="text-[11px] text-red-950 font-medium">{selectedStation.warning}</p>
            </div>
          </div>

          {/* Quick List of High-Risk Nodes */}
          <div className="command-card-solid rounded-3xl p-4 border border-slate-300 space-y-2 shadow-md">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono px-1">
              Northeast Monitored Stations ({filteredStations.length})
            </h4>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
              {filteredStations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => selectStationAndPan(st)}
                  className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                    selectedStation.id === st.id
                      ? 'bg-emerald-100 border-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-extrabold text-slate-950 truncate">{st.name}</div>
                    <div className="text-[10px] text-slate-700 font-semibold">{st.state}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-black ${
                    st.landslide_probability >= 80 ? 'bg-red-100 text-red-900 border border-red-300' :
                    st.landslide_probability >= 60 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {st.landslide_probability}%
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
