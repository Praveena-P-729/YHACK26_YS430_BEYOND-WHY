import React, { useState, useEffect } from 'react';
import { AlertTriangle, Radio, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getActiveAlerts();
        setAlerts(data);
      } catch (e) {
        setAlerts([
          { id: 1, alert_level: "Warning", title: "STAGE-3 WARNING: Shillong Ridge NH-6 km 48 Slope Movement", message: "6.8 mm/day downslope shift accompanied by 142mm 24-hr rainfall. Traffic diversion in effect via Shillong Peak Bypass." },
          { id: 2, alert_level: "Evacuate", title: "IMMEDIATE EVACUATION: Noney Railway Cutting & NH-37 Corridor", message: "Pore water pressure exceeds critical safety threshold of 30 kPa. High probability of colluvium debris flow within 6 to 12 hours." }
        ]);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-heading">Active Early Warning Broadcasts</h1>
        <p className="text-xs text-[#8E959E]">Automated multi-channel siren, SMS, and district alert management</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alt) => (
          <div key={alt.id} className="command-card rounded-3xl p-6 border border-red-500/30 bg-red-950/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-red-300 font-heading">{alt.title}</span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-500/40 uppercase font-bold">
                {alt.alert_level}
              </span>
            </div>
            <p className="text-xs text-[#CBD1D6] leading-relaxed">{alt.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
