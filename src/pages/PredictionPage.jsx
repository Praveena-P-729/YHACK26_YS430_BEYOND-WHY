import React, { useState } from 'react';
import { BrainCircuit, Sparkles, AlertCircle } from 'lucide-react';
import ExplainableFactorBar from '../components/common/ExplainableFactorBar';
import HorizonTimeline from '../components/common/HorizonTimeline';

export default function PredictionPage() {
  const [selectedStation, setSelectedStation] = useState('Shillong Ridge (NH-6)');

  const forecasts = [
    { horizon: "Now", risk_score: 84.5, risk_level: "Severe" },
    { horizon: "+6h", risk_score: 89.0, risk_level: "Severe" },
    { horizon: "+12h", risk_score: 93.7, risk_level: "Severe" },
    { horizon: "+24h", risk_score: 97.2, risk_level: "Severe" }
  ];

  return (
    <div className="space-y-6">
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">AI Risk Prediction &amp; SHAP Explainer</h1>
        <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">Ensemble Machine Learning (Random Forest + XGBoost) failure forecasts across Northeast India</p>
      </div>

      <div className="command-card-solid rounded-3xl p-6 border border-slate-300 space-y-5 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-950 font-heading">Multi-Horizon Failure Trajectory</h3>
          <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">Model: Ensemble-RF-XGB-Physics-v2.1</span>
        </div>

        <HorizonTimeline forecasts={forecasts} />

        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-950 font-heading">Explainable Factor Contributions (SHAP)</h4>
          <ExplainableFactorBar
            factors={{
              "Cumulative Rainfall (72h)": 42.5,
              "Hydrostatic Pore Pressure": 28.0,
              "Soil Moisture Saturation": 18.5,
              "Slope Tilt & Surface Displacement": 11.0
            }}
          />
        </div>
      </div>
    </div>
  );
}
