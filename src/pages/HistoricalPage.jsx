import React from 'react';
import { History, Calendar } from 'lucide-react';

const mockArchive = [
  { id: 1, event: "2022 Tupul Railway Yard Debris Flow (Noney)", date: "July 2022", fatalities: 58, trigger: "Continuous Monsoon Cloudburst & Colluvium Shear", state: "Manipur" },
  { id: 2, event: "2024 Dima Hasao NH-27 Corridor Breach", date: "May 2024", fatalities: 14, trigger: "Excessive Inundation & Rail Line Washout", state: "Assam" },
  { id: 3, event: "2023 South Lhonak Glacial Lake Outburst (GLOF)", date: "October 2023", fatalities: 42, trigger: "Teesta Basin Flash Flood & Slope Failure", state: "Sikkim" },
  { id: 4, event: "2022 Sohra Escarpment Slump & Shella Debris Surge", date: "June 2022", fatalities: 19, trigger: "972mm / 72h Extreme Orographic Precipitation", state: "Meghalaya" },
  { id: 5, event: "2020 Tawang - Bame Mountain Pass Blockage", date: "September 2020", fatalities: 8, trigger: "Steep Escarpment Failure & Highway Severance", state: "Arunachal Pradesh" }
];

export default function HistoricalPage() {
  return (
    <div className="space-y-6">
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">Historical Landslide Archive</h1>
        <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">Precipitation threshold records and major disaster event database across Northeast India</p>
      </div>

      <div className="space-y-3">
        {mockArchive.map((item) => (
          <div key={item.id} className="command-card-solid rounded-3xl p-5 border border-slate-300 flex items-center justify-between gap-4 shadow-md">
            <div>
              <h3 className="text-sm font-extrabold text-slate-950 font-heading">{item.event}</h3>
              <p className="text-xs text-slate-700 font-medium mt-0.5">Trigger: <strong className="text-slate-900">{item.trigger}</strong></p>
            </div>
            <div className="text-right text-xs">
              <div className="text-slate-950 font-mono font-black">{item.date}</div>
              <div className="text-emerald-900 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 inline-block mt-1">{item.state}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
