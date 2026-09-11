import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Mountain, Droplets, MapPin, Navigation, AlertOctagon, Info } from 'lucide-react';
import { getCachedRoadRisks, cacheRoadRisks } from '../services/offlineStorage';
import { api } from '../services/api';

const createPinIcon = (color, text) => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        background: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px ${color}, 0 2px 5px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
      ">
        ${text}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

const redPin = createPinIcon('#EF4444', '⚠️');
const orangePin = createPinIcon('#F59E0B', '⚡');
const yellowPin = createPinIcon('#EAB308', '•');
const greenPin = createPinIcon('#10B981', '✓');

export default function RiskMap({ isOnline = true, selectedRoadId = null }) {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoad, setSelectedRoad] = useState(null);

  const defaultRoads = [
    {
      road_id: 'NH-27-SEC-04',
      road_name: 'NH-27 East-West Corridor (Guwahati-Nagaon)',
      state: 'Assam',
      latitude: 26.1445,
      longitude: 91.7362,
      risk_level: 'High',
      probability: 0.68,
      status: 'RESTRICTED (Single-Lane Escort)',
      alt_route: 'Upper Khanapara Bypass corridor'
    },
    {
      road_id: 'NH-206-SEC-02',
      road_name: 'NH-206 Shillong Peak Pass Bypass',
      state: 'Meghalaya',
      latitude: 25.5788,
      longitude: 91.8933,
      risk_level: 'Critical',
      probability: 0.88,
      status: 'BLOCKED / IMPASSABLE',
      alt_route: 'Divert through Upper Nongthymmai link'
    },
    {
      road_id: 'NH-10-SEC-08',
      road_name: 'NH-10 Gangtok-Siliguri Mountain Lifeline',
      state: 'Sikkim',
      latitude: 27.3389,
      longitude: 88.6065,
      risk_level: 'Critical',
      probability: 0.91,
      status: 'EMERGENCY AVOIDANCE',
      alt_route: 'Melli-Nayabazar valley connector'
    },
    {
      road_id: 'NH-29-SEC-03',
      road_name: 'NH-29 Dimapur-Kohima Ghat Highway',
      state: 'Nagaland',
      latitude: 25.6751,
      longitude: 94.1086,
      risk_level: 'Medium',
      probability: 0.44,
      status: 'OPEN (Advisory Watch)',
      alt_route: 'Primary ghat road open'
    },
    {
      road_id: 'NH-102-SEC-01',
      road_name: 'NH-102 Imphal-Moreh Lifeline',
      state: 'Manipur',
      latitude: 24.8170,
      longitude: 93.9368,
      risk_level: 'High',
      probability: 0.72,
      status: 'RESTRICTED',
      alt_route: 'Tengnoupal hill bypass'
    },
    {
      road_id: 'NH-54-SEC-06',
      road_name: 'NH-54 Aizawl-Lunglei Ridge',
      state: 'Mizoram',
      latitude: 23.7271,
      longitude: 92.7176,
      risk_level: 'Medium',
      probability: 0.48,
      status: 'OPEN',
      alt_route: 'Ridge route open'
    },
    {
      road_id: 'NH-13-SEC-05',
      road_name: 'NH-13 Trans-Arunachal Highway (Tawang)',
      state: 'Arunachal Pradesh',
      latitude: 27.0844,
      longitude: 93.6053,
      risk_level: 'Critical',
      probability: 0.86,
      status: 'BLOCKED',
      alt_route: 'Bhalukpong-Bomdila link'
    },
    {
      road_id: 'NH-8-SEC-02',
      road_name: 'NH-8 Agartala-Udaipur Hill Connector',
      state: 'Tripura',
      latitude: 23.8315,
      longitude: 91.2868,
      risk_level: 'Low',
      probability: 0.18,
      status: 'OPEN',
      alt_route: 'Normal state highway open'
    }
  ];

  const loadMapData = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        // Online: Fetch from API and update IndexedDB cache
        const riskData = await api.getRiskMap();
        if (riskData && riskData.features && riskData.features.length > 0) {
          const mapped = riskData.features.map((f) => ({
            road_id: f.road_impact?.nearest_road || f.name,
            road_name: f.name,
            state: f.state || 'Assam',
            latitude: f.latitude,
            longitude: f.longitude,
            risk_level: f.landslide_level || 'Medium',
            probability: (f.landslide_probability || 50) / 100.0,
            status: f.road_impact?.road_status || 'OPEN',
            alt_route: f.community_isolation?.alternative_route || 'Primary highway open'
          }));
          setRoads(mapped);
          await cacheRoadRisks(mapped);
        } else {
          setRoads(defaultRoads);
          await cacheRoadRisks(defaultRoads);
        }
      } else {
        // Offline: Fetch from IndexedDB cache
        const cached = await getCachedRoadRisks();
        if (cached && cached.length > 0) {
          setRoads(cached);
        } else {
          setRoads(defaultRoads);
        }
      }
    } catch (e) {
      console.warn('Map data load note, using offline fallback:', e);
      const cached = await getCachedRoadRisks();
      setRoads(cached.length > 0 ? cached : defaultRoads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [isOnline]);

  const getPinForRisk = (risk) => {
    const r = (risk || '').toLowerCase();
    if (r === 'critical') return redPin;
    if (r === 'high') return orangePin;
    if (r === 'medium') return yellowPin;
    return greenPin;
  };

  return (
    <div className="space-y-3">
      {/* Offline Status Header Indicator */}
      {!isOnline && (
        <div className="bg-blue-950/40 border border-blue-500/40 rounded-xl p-2.5 text-xs text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>🔵 <strong>Offline GIS Map Active:</strong> Rendering cached road vectors and risk telemetry from local IndexedDB storage.</span>
          </div>
          <span className="text-[10px] font-mono bg-blue-900/60 px-2 py-0.5 rounded text-blue-300">
            {roads.length} Roads Loaded
          </span>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[450px]">
        <MapContainer
          center={[25.8, 93.2]}
          zoom={7}
          scrollWheelZoom={true}
          className="w-full h-full bg-[#0D1714]"
        >
          {/* Tile Layer with fallback background color */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          {/* Road Segment Markers */}
          {roads.map((road) => {
            const isCrit = (road.risk_level || '').toLowerCase() === 'critical';
            return (
              <Marker
                key={road.road_id || road.name}
                position={[road.latitude, road.longitude]}
                icon={getPinForRisk(road.risk_level)}
                eventHandlers={{
                  click: () => setSelectedRoad(road)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 space-y-2 min-w-[220px] text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-gray-900">{road.road_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono text-white ${
                        isCrit ? 'bg-red-600' : 'bg-amber-600'
                      }`}>
                        {road.risk_level?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-[11px] font-medium">{road.road_name || road.state}</p>
                    <div className="text-gray-600 text-[11px]">
                      Probability: <strong>{road.probability ? (road.probability * 100).toFixed(1) : '65'}%</strong>
                    </div>
                    <div className="text-gray-600 text-[11px]">
                      Status: <strong>{road.status || 'OPEN'}</strong>
                    </div>
                    {road.alt_route && (
                      <div className="text-emerald-700 font-semibold text-[11px] pt-1 border-t">
                        Bypass: {road.alt_route}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
