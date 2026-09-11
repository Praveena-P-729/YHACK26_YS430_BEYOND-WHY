import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';
import { api } from '../services/api';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocs = async () => {
      try {
        const data = await api.getLocations();
        setLocations(data);
      } catch (e) {
        setLocations([
          { id: 1, name: "Shillong Ridge (NH-6)", region: "East Khasi Hills", state: "Meghalaya", elevation: 1520, slope_angle: 36.5, current_risk_level: "High", current_risk_score: 76.5 },
          { id: 2, name: "Noney Railway Cutting (NH-37)", region: "Noney", state: "Manipur", elevation: 1420, slope_angle: 38.5, current_risk_level: "Severe", current_risk_score: 88.2 },
          { id: 3, name: "Kohima - Zubza Bypass (NH-29)", region: "Kohima", state: "Nagaland", elevation: 1440, slope_angle: 35.0, current_risk_level: "High", current_risk_score: 72.0 },
          { id: 4, name: "Gangtok - Deorali Sinking Zone (NH-10)", region: "East Sikkim", state: "Sikkim", elevation: 1650, slope_angle: 39.0, current_risk_level: "Severe", current_risk_score: 84.0 }
        ]);
      }
    };
    fetchLocs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">Monitored Sensor Stations</h1>
        <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">Geological attributes, slope gradients, and elevation telemetry across Northeast India</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="command-card-solid rounded-3xl p-5 border border-slate-300 space-y-3 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 font-heading">{loc.name}</h3>
                <p className="text-xs text-slate-700 font-semibold">{loc.region}, {loc.state}</p>
              </div>
              <RiskBadge level={loc.current_risk_level} score={loc.current_risk_score} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-800 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span>Elevation: <strong className="text-slate-950 font-bold">{loc.elevation}m</strong></span>
              <span>Slope: <strong className="text-slate-950 font-bold">{loc.slope_angle}&deg;</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
