import React, { useState, useEffect } from 'react';
import { Siren, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await api.getIncidents();
        setIncidents(data);
      } catch (e) {
        setIncidents([
          { id: 1, title: "Road Subsidence at Shillong NH-6 km 48.2", severity: "Severe", status: "DISPATCHED", description: "Fissure observed across northbound lane after torrential downpour on Shillong ridge." },
          { id: 2, title: "Colluvium Debris Slide near Noney Railway Cutting (NH-37)", severity: "Critical", status: "INVESTIGATING", description: "Topsoil liquefaction encroaching on lower village bridge and approach highway." }
        ]);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading">Incident Dispatch &amp; Logs</h1>
          <p className="text-xs text-[#8E959E]">Field reported slope failures, road blockages, and quick rescue response</p>
        </div>
      </div>

      <div className="space-y-3">
        {incidents.map((inc) => (
          <div key={inc.id} className="command-card rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-heading">{inc.title}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                {inc.status}
              </span>
            </div>
            <p className="text-xs text-[#A8ADB2]">{inc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
