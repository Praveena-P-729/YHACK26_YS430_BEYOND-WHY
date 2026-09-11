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
      <div>
        <h1 className="text-2xl font-extrabold text-white font-heading">Monitored Sensor Stations</h1>
        <p className="text-xs text-[#8E959E]">Geological attributes, slope gradients, and elevation telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="command-card rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-heading">{loc.name}</h3>
                <p className="text-xs text-[#8E959E]">{loc.region}, {loc.state}</p>
              </div>
              <RiskBadge level={loc.current_risk_level} score={loc.current_risk_score} />
            </div>
            <div className="flex items-center gap-4 text-xs text-[#A8ADB2]">
              <span>Elevation: {loc.elevation}m</span>
              <span>Slope: {loc.slope_angle}&deg;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
