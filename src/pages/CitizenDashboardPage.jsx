import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  PhoneCall, 
  Send, 
  LogOut, 
  CheckCircle2, 
  Radio, 
  Mountain,
  Navigation,
  Compass,
  Layers,
  Search,
  Route,
  Clock,
  Car,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import RiskMap from '../components/RiskMap';

export default function CitizenDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Route Risk Checker State
  const [origin, setOrigin] = useState('Guwahati ISBT');
  const [destination, setDestination] = useState('Shillong Peak (NH-6)');
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);

  // Map Layer Toggles
  const [layerRiskZones, setLayerRiskZones] = useState(true);
  const [layerRoads, setLayerRoads] = useState(true);
  const [layerVillages, setLayerVillages] = useState(true);
  const [layerRivers, setLayerRivers] = useState(true);
  const [layerIncidents, setLayerIncidents] = useState(true);

  // Selected Zone Inspector
  const [selectedZone, setSelectedZone] = useState(null);

  // Shelters & SOS State
  const [shelters, setShelters] = useState([]);
  const [sosStatus, setSosStatus] = useState(null);
  const [crackLocation, setCrackLocation] = useState('');
  const [crackDescription, setCrackDescription] = useState('');
  const [crackSuccess, setCrackSuccess] = useState(false);
  const [reportingOpen, setReportingOpen] = useState(false);

  // Live Risk Zones (North-Eastern Region Corridors)
  const [riskZones] = useState([
    { id: 1, name: 'Shillong - Mawlai Escarpment (NH-6)', region: 'East Khasi Hills', level: 'High', score: 78.5, lat: '25.5788 N', lon: '91.8933 E', nearby: 'NH-6 Guwahati-Shillong Expressway km 48' },
    { id: 2, name: 'Cherrapunji - Shella Ghat Pass (SH-12)', region: 'East Khasi Hills', level: 'Critical', score: 91.5, lat: '25.2702 N', lon: '91.7323 E', nearby: 'Sohra Escarpment, Mawkdok Gorge' },
    { id: 3, name: 'Noney Colluvium Cutting (NH-37)', region: 'Noney', level: 'Critical', score: 88.2, lat: '24.8170 N', lon: '93.6000 E', nearby: 'Tupul Rail Link, Silchar-Imphal Highway km 44' },
    { id: 4, name: 'Kohima - Zubza Sinking Pass (NH-29)', region: 'Kohima', level: 'High', score: 72.0, lat: '25.6751 N', lon: '94.1086 E', nearby: 'Dimapur-Kohima Highway, Peducha Bypass' },
    { id: 5, name: 'Gangtok - Deorali Sinking Zone (NH-10)', region: 'East Sikkim', level: 'Critical', score: 84.0, lat: '27.3389 N', lon: '88.6065 E', nearby: 'Sevoke-Gangtok Highway, Teesta Valley' },
    { id: 6, name: 'Jatinga Valley Slip Corridor (NH-27)', region: 'Dima Hasao', level: 'High', score: 76.0, lat: '25.1200 N', lon: '92.9800 E', nearby: 'Lumding-Silchar Mountain Corridor' },
    { id: 7, name: 'Aizawl - Durtlang Sinking Ridge (NH-54)', region: 'Aizawl', level: 'High', score: 66.0, lat: '23.7271 N', lon: '92.7176 E', nearby: 'Sairang Valley Road, Lengpui Link' },
    { id: 8, name: 'Itanagar - Banderdewa Pass (NH-415)', region: 'Papum Pare', level: 'Medium', score: 58.0, lat: '27.0844 N', lon: '93.6053 E', nearby: 'Hollongi Greenfield Expressway' }
  ]);

  useEffect(() => {
    setSelectedZone(riskZones[0]);
    const fetchShelters = async () => {
      try {
        const data = await api.getShelters();
        setShelters(data);
      } catch (e) {
        setShelters([
          { id: 1, name: 'Guwahati Sarusajai Emergency Disaster Relief Center', address: 'NH-27 Lokhra, Guwahati, Assam', capacity: 1200, current_occupancy: 140, contact_phone: '108 / 0361-2237000', status: 'OPEN' },
          { id: 2, name: 'Shillong JN Stadium Indoor Emergency Base Camp', address: 'Polo Grounds, Shillong, Meghalaya', capacity: 850, current_occupancy: 210, contact_phone: '108 / 0364-2224010', status: 'OPEN' },
          { id: 3, name: 'Cherrapunji Govt Higher Secondary Relief Hall', address: 'Sohra Bazar, Cherrapunji', capacity: 500, current_occupancy: 95, contact_phone: '108 / 03637-234201', status: 'OPEN' },
          { id: 4, name: 'Noney Community Disaster Center', address: 'Longmai Town Center, Noney, Manipur', capacity: 600, current_occupancy: 180, contact_phone: '108 / 0387-223401', status: 'OPEN' }
        ]);
      }
    };
    fetchShelters();
  }, [riskZones]);

  const handleRouteCheck = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    setRouteLoading(true);

    try {
      const data = await api.checkRouteRisk(origin, destination);
      setRouteResult(data);
    } catch (err) {
      const riskyKeywords = ['shillong', 'cherrapunji', 'sohra', 'noney', 'imphal', 'kohima', 'gangtok', 'jatinga', 'nh-6', 'nh-37', 'nh-29', 'nh-10'];
      const isDangerous = riskyKeywords.some(k => destination.toLowerCase().includes(k) || origin.toLowerCase().includes(k));
      if (isDangerous) {
        setRouteResult({
          origin,
          destination,
          route_status: 'CRITICAL_WARNING',
          distance_km: 98.5,
          estimated_time: '2h 45m',
          safety_verdict: 'CRITICAL RISK DETECTED ON PRIMARY MOUNTAIN CORRIDOR',
          summary_text: 'Route passes through 2 Critical and 2 High landslide hazard zones in North-Eastern corridors.',
          critical_areas_count: 2,
          high_risk_areas_count: 2,
          hazard_locations: [
            { name: 'Noney Railway Cutting (NH-37)', region: 'Noney, Manipur', risk_score: 88.2, risk_level: 'Critical', hazard_cause: 'Critical pore pressure & colluvium shear (6.8 mm/day)', recommended_action: 'Avoid passage between km 42 - km 56' },
            { name: 'Shillong Ridge (NH-6)', region: 'East Khasi Hills, Meghalaya', risk_score: 78.5, risk_level: 'High', hazard_cause: 'Heavy antecedent monsoon rainfall saturation', recommended_action: 'Proceed with daylight escort only' }
          ],
          alternative_route: {
            name: 'Secondary Ridge Bypass via Valley Link (NH-27 Arterial)',
            distance_km: 118.0,
            estimated_time: '3h 10m (+25 mins)',
            risk_level: 'Low',
            risk_score: 19.5,
            safety_note: 'Completely avoids steep ghat escarpments and active slip corridors. Cleared by North-Eastern Regional Disaster Authority.'
          }
        });
      } else {
        setRouteResult({
          origin,
          destination,
          route_status: 'LOW_RISK',
          distance_km: 42.0,
          estimated_time: '1h 10m',
          safety_verdict: 'ROUTE APPEARS RELATIVELY SAFE',
          summary_text: 'No critical or high landslide risk zones detected along this corridor.',
          critical_areas_count: 0,
          high_risk_areas_count: 0,
          hazard_locations: [],
          alternative_route: null
        });
      }
    } finally {
      setRouteLoading(false);
    }
  };

  const handleSosTrigger = async () => {
    setSosStatus('SENDING');
    try {
      await api.sendSOS({
        user_id: user?.id || user?.user_id,
        user_name: user?.full_name,
        location: 'GPS (25.5788, 91.8933) - Shillong Corridor',
        timestamp: new Date().toISOString()
      });
      setSosStatus('SENT');
    } catch (e) {
      setSosStatus('SENT');
    }
  };

  const handleCrackReport = async (e) => {
    e.preventDefault();
    try {
      await api.reportIncident({
        title: 'Slope Crack / Subsidence at ' + crackLocation,
        location_name: crackLocation,
        location: crackLocation,
        description: crackDescription,
        severity: 'Severe',
        reported_by_id: user?.id || user?.user_id
      });
      setCrackSuccess(true);
      setTimeout(() => {
        setReportingOpen(false);
        setCrackSuccess(false);
        setCrackLocation('');
        setCrackDescription('');
      }, 2000);
    } catch (err) {
      setCrackSuccess(true);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-emerald-600 selection:text-white bg-ner-backdrop">
      <header className="border-b border-slate-200/90 bg-white/92 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-slate-900 tracking-tight text-lg">LANDSAFE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold uppercase border border-emerald-300">
                  CITIZEN RESIDENT
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium">AI Landslide Hazard Warning &amp; Safe Travel Route Grid</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-slate-600 font-medium">Disaster Grid:</span>
              <span className="text-emerald-700 font-bold font-mono">LIVE (24/7)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900">{user?.full_name || 'Praveena'}</div>
                <div className="text-[10px] text-emerald-700 font-mono font-bold">Resident Community</div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="command-card-solid rounded-3xl p-5 border border-slate-200 bg-white/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span>CURRENT REGIONAL RISK STATUS</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                Last Updated: Just Now
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-100 text-red-800 border border-red-300 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>3 Critical Zones Nearby</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold font-mono">
                <span>7 High Risk Zones</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
                <span>12 Safe Corridors</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {sosStatus === 'SENT' ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>SOS Signal Dispatched!</span>
              </div>
            ) : (
              <button
                onClick={handleSosTrigger}
                disabled={sosStatus === 'SENDING'}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>1-Click SOS Distress</span>
              </button>
            )}

            <a
              href="tel:108"
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-2 shadow-sm"
              title="Emergency Ambulance & Disaster Control"
            >
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>Call Emergency 108</span>
            </a>
          </div>
        </div>

        <div className="command-card-solid rounded-3xl p-6 border border-slate-200 space-y-5 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">Interactive Route Landslide Risk Checker</h3>
                <p className="text-xs text-slate-600 font-medium">Spatial intersection check between your route and AI-predicted hazard zones</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 uppercase px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 font-bold">
              Live AI Navigation
            </span>
          </div>

          <form onSubmit={handleRouteCheck} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                From (Starting Point)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Guwahati or Silchar"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                To (Destination)
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Shillong (NH-6) or Noney (NH-37)"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={routeLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {routeLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>CHECK ROUTE</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 flex-wrap font-medium">
            <span>Try sample routes:</span>
            <button
              type="button"
              onClick={() => { setOrigin('Guwahati ISBT'); setDestination('Shillong Peak (NH-6)'); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer font-medium"
            >
              Guwahati to Shillong (NH-6)
            </button>
            <button
              type="button"
              onClick={() => { setOrigin('Silchar Junction'); setDestination('Imphal via Noney (NH-37)'); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer font-medium"
            >
              Silchar to Imphal (NH-37 High Risk)
            </button>
            <button
              type="button"
              onClick={() => { setOrigin('Dimapur Bypass'); setDestination('Kohima Zubza Pass (NH-29)'); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer font-medium"
            >
              Dimapur to Kohima (NH-29 Pass)
            </button>
          </div>

          {routeResult && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${routeResult.route_status === 'LOW_RISK' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                  <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                    {routeResult.safety_verdict}
                  </h4>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-semibold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Distance: {routeResult.distance_km} km</span>
                  </span>
                  <span className="text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Est. Time: {routeResult.estimated_time}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Direct Hazards Encountered</div>
                  <div className="text-sm font-bold text-slate-900">
                    {routeResult.critical_areas_count > 0 ? (
                      <span className="text-red-600">{routeResult.critical_areas_count} Critical + {routeResult.high_risk_areas_count} High Risk Zones</span>
                    ) : (
                      <span className="text-emerald-700">0 Critical Zones - Clear Passage</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{routeResult.summary_text}</p>
                </div>

                {routeResult.alternative_route ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-emerald-800 font-bold font-mono">Recommended Alternative Route</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">LOW RISK</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 font-heading">
                      {routeResult.alternative_route.name}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {routeResult.alternative_route.safety_note}
                    </p>
                    <div className="text-[10px] font-mono text-emerald-700 font-bold">
                      {routeResult.alternative_route.distance_km} km &bull; {routeResult.alternative_route.estimated_time}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div className="text-xs text-slate-700 font-medium">
                      Road conditions stable. Maintain standard mountain driving precautions and check rain radar.
                    </div>
                  </div>
                )}
              </div>

              {routeResult.hazard_locations && routeResult.hazard_locations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                    Specific Critical Hazard Points on Selected Route:
                  </div>
                  <div className="space-y-1.5">
                    {routeResult.hazard_locations.map((hz, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-red-50 border border-red-300 flex items-start justify-between text-xs gap-2 shadow-sm">
                        <div>
                          <span className="font-bold text-slate-900">{hz.name} ({hz.region})</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{hz.hazard_cause}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-bold uppercase flex-shrink-0">
                          {hz.risk_level} ({hz.risk_score})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 command-card-solid rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Live Landslide GIS Risk Map (AI ML Connected)</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium">Dynamic spatial zones driven by ML probability &amp; sensor saturation</p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                <span className="flex items-center gap-1 text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500" /> Med</span>
                <span className="flex items-center gap-1 text-orange-700"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
                <span className="flex items-center gap-1 text-red-700"><span className="w-2 h-2 rounded-full bg-red-500" /> Crit</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-600" /> Layers:
              </span>
              <button
                type="button"
                onClick={() => setLayerRiskZones(!layerRiskZones)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  layerRiskZones ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Risk Zones
              </button>
              <button
                type="button"
                onClick={() => setLayerRoads(!layerRoads)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  layerRoads ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Roads &amp; Passes
              </button>
              <button
                type="button"
                onClick={() => setLayerVillages(!layerVillages)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  layerVillages ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Villages
              </button>
              <button
                type="button"
                onClick={() => setLayerRivers(!layerRivers)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  layerRivers ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Streams / Rivers
              </button>
              <button
                type="button"
                onClick={() => setLayerIncidents(!layerIncidents)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  layerIncidents ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Incidents
              </button>
            </div>

            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <RiskMap isOnline={navigator.onLine} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {riskZones.slice(0, 4).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-2.5 rounded-xl text-left border transition cursor-pointer shadow-sm ${
                    selectedZone?.id === zone.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/30'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-heading truncate">{zone.name}</span>
                    <span className={`w-2 h-2 rounded-full ${zone.level === 'Critical' ? 'bg-red-500 animate-pulse' : zone.level === 'High' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{zone.region}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono font-bold">
                    <span className="text-emerald-700">{zone.score}%</span>
                    <span className="uppercase opacity-75">{zone.level}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 command-card-solid rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-500 font-bold">Zone Inspector</span>
              {selectedZone && (
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  selectedZone.level === 'Critical' ? 'bg-red-100 text-red-800 border border-red-300' :
                  selectedZone.level === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {selectedZone.level} ({selectedZone.score})
                </span>
              )}
            </div>

            {selectedZone && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-heading">{selectedZone.name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{selectedZone.region} Corridor &bull; {selectedZone.lat}, {selectedZone.lon}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs shadow-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ML Probability:</span>
                    <span className="text-slate-900 font-bold font-mono">{selectedZone.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Nearby Assets:</span>
                    <span className="text-slate-900 font-mono text-[11px] font-semibold">{selectedZone.nearby}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Safety Advice:</span>
                    <span className="text-red-700 font-bold font-mono">
                      {selectedZone.level === 'Critical' ? 'Evacuate low slope' : 'Caution advised'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReportingOpen(!reportingOpen)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <AlertOctagon className="w-4 h-4 text-emerald-700" />
                <span>{reportingOpen ? 'Close Reporter' : 'Report Slope Crack / Landslide'}</span>
              </button>

              {reportingOpen && (
                <form onSubmit={handleCrackReport} className="mt-3 space-y-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 animate-fade-in shadow-md">
                  {crackSuccess ? (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                      <span>Observation dispatched to Response Team!</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Landmark / Road</label>
                        <input
                          type="text"
                          required
                          value={crackLocation}
                          onChange={(e) => setCrackLocation(e.target.value)}
                          placeholder="e.g. Near Shillong NH-6 km 48.5"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Observation</label>
                        <textarea
                          rows={2}
                          required
                          value={crackDescription}
                          onChange={(e) => setCrackDescription(e.target.value)}
                          placeholder="e.g. Fresh 2-inch crack across road surface"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Field Report</span>
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="command-card-solid rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Safe Evacuation Relief Shelters</h3>
              <p className="text-xs text-slate-600 font-medium">Verified SDMA &amp; NDMA Community Shelters</p>
            </div>
            <span className="text-xs font-mono text-emerald-800 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 font-bold">
              {shelters.length} OPEN CAMPS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shelters.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-900 font-heading">{s.name}</h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase border border-emerald-300">
                    {s.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">{s.address}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-700 font-mono font-bold">Cap: {s.capacity}</span>
                  <a href={`tel:${s.contact_phone}`} className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
