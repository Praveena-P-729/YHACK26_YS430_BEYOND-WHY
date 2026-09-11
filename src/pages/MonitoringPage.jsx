import React, { useState, useEffect } from 'react';
import { Activity, Droplets, Thermometer, Gauge, Radio, RefreshCw } from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';
import { api } from '../services/api';

export default function MonitoringPage() {
  const [readings, setReadings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLive = async () => {
    setLoading(true);
    try {
      const [readingsData, locsData] = await Promise.all([
        api.getLatestReadings(),
        api.getLocations()
      ]);
      setReadings(readingsData);
      setLocations(locsData);
    } catch (e) {
      // Demo mock readings
      setReadings([
        { id: 1, location_id: 1, rainfall_1h: 32.5, rainfall_24h: 142.0, pore_pressure: 34.2, soil_moisture: 72.0, displacement_rate: 6.8, sensor_battery: 97.0, sensor_status: "CRITICAL" },
        { id: 2, location_id: 2, rainfall_1h: 18.0, rainfall_24h: 78.0, pore_pressure: 24.5, soil_moisture: 58.0, displacement_rate: 2.1, sensor_battery: 99.0, sensor_status: "WARNING" },
        { id: 3, location_id: 3, rainfall_1h: 44.0, rainfall_24h: 188.0, pore_pressure: 38.5, soil_moisture: 84.0, displacement_rate: 9.4, sensor_battery: 95.0, sensor_status: "CRITICAL" }
      ]);
      setLocations([
        { id: 1, name: "Shillong Ridge (NH-6)", region: "East Khasi Hills", state: "Meghalaya", current_risk_score: 76.5, current_risk_level: "High" },
        { id: 2, name: "Noney Railway Cutting (NH-37)", region: "Noney", state: "Manipur", current_risk_score: 88.2, current_risk_level: "Severe" },
        { id: 3, name: "Kohima - Zubza Pass (NH-29)", region: "Kohima", state: "Nagaland", current_risk_score: 72.0, current_risk_level: "High" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  return (
    <div className="space-y-6">
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">Live Sensor Telemetry Array</h1>
          <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">Direct sensor stream (Rainfall, Pore Pressure, Soil Moisture, InSAR Displacement) across Northeast India</p>
        </div>

        <button
          onClick={fetchLive}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const reading = readings.find(r => r.location_id === loc.id) || {
            rainfall_24h: 112.0, pore_pressure: 28.5, soil_moisture: 65.0, displacement_rate: 4.2, sensor_battery: 98.0, sensor_status: "NORMAL"
          };

          return (
            <div key={loc.id} className="command-card-solid rounded-3xl p-6 border border-slate-300 space-y-4 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 font-heading">{loc.name}</h3>
                  <p className="text-[11px] text-slate-700 font-semibold">{loc.region}, {loc.state}</p>
                </div>
                <RiskBadge level={loc.current_risk_level} score={loc.current_risk_score} />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-700">24h Rainfall</div>
                  <div className="text-base font-black text-slate-950 font-mono">{reading.rainfall_24h} mm</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-700">Pore Pressure</div>
                  <div className="text-base font-black text-emerald-800 font-mono">{reading.pore_pressure} kPa</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-700">Soil Moisture</div>
                  <div className="text-base font-black text-blue-800 font-mono">{reading.soil_moisture}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-700">InSAR Shift</div>
                  <div className="text-base font-black text-red-700 font-mono">{reading.displacement_rate} mm/d</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold pt-2 border-t border-slate-200">
                <span>Array Battery: <strong className="text-slate-950 font-bold">{reading.sensor_battery}%</strong></span>
                <span className="font-mono text-emerald-900 font-extrabold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">{reading.sensor_status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
