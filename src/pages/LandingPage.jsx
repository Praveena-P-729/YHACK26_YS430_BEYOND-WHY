import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mountain, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Users, 
  Radio, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900 selection:bg-emerald-600 selection:text-white bg-ner-backdrop">
      
      {/* Navigation Header */}
      <nav className="border-b border-slate-300 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black text-slate-950 tracking-tight">LANDGUARD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-extrabold tracking-widest uppercase border border-emerald-300">AI</span>
              </div>
              <p className="text-[11px] text-slate-800 font-semibold">Landslide Early Warning &amp; Monitoring System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/citizen-dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-950 transition shadow-sm"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Resident Portal</span>
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition shadow-md flex items-center gap-1.5"
            >
              <span>Sign In</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden px-4 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 text-xs font-mono font-extrabold text-emerald-950 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-700" />
            <span className="tracking-wide">REAL-TIME NORTHEAST INDIA DISASTER TELEMETRY &bull; 24/7 AI PREDICTION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 font-heading tracking-tight leading-tight">
            Predicting Slope Failure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-950">
              Before the Mountain Moves
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-900 max-w-2xl mx-auto leading-relaxed font-semibold bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-md">
            LANDGUARD AI integrates satellite radar displacement, Open-Meteo weather forecasts, and Random Forest + XGBoost models to safeguard communities and highways across Northeast India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
            >
              <span>Open Landslide Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        {/* 3 Value Pillars with Light Solid Frosted Glass Containers */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 relative z-10">
          <div className="command-card-solid rounded-3xl p-6 border border-slate-300 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 border border-emerald-300 font-bold">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-black text-slate-950 mb-1.5">Multi-Model AI Prediction</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              Ensemble Random Forest &amp; XGBoost algorithms analyze 17 geotechnical &amp; weather features in real-time.
            </p>
          </div>

          <div className="command-card-solid rounded-3xl p-6 border border-slate-300 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 border border-emerald-300 font-bold">
              <Layers className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-black text-slate-950 mb-1.5">GIS Road Risk Mapping</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              Segment-level vulnerability indexing along NH-29, NH-10, and high-risk Northeast transit corridors.
            </p>
          </div>

          <div className="command-card-solid rounded-3xl p-6 border border-slate-300 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 border border-emerald-300 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-black text-slate-950 mb-1.5">Offline-First Resilience</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              Local IndexedDB caching and on-device risk scoring keep you protected even during severe telecom cutoffs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
