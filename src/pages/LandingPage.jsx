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
    <div className="min-h-screen bg-[#0A100D] text-[#F5F1EA] selection:bg-[#10B981] selection:text-white bg-ner-backdrop">
      
      {/* Navigation Header */}
      <nav className="border-b border-white/10 bg-[#0D1714]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-bold text-white tracking-tight">LANDGUARD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-mono font-bold tracking-widest uppercase border border-[#10B981]/30">AI</span>
              </div>
              <p className="text-[10px] text-[#A8ADB2]">Landslide Early Warning &amp; Monitoring System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/citizen-dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121E1A]/90 hover:bg-[#1A2E26] border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition shadow-md"
            >
              <Users className="w-4 h-4" />
              <span>Resident Portal</span>
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white transition shadow-lg shadow-[#10B981]/30 flex items-center gap-1.5"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D1714]/90 backdrop-blur-md border border-[#10B981]/40 text-xs font-mono text-[#10B981] shadow-lg">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="tracking-wide">REAL-TIME NORTHEAST INDIA DISASTER TELEMETRY &bull; 24/7 AI PREDICTION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white font-heading tracking-tight leading-tight text-contrast-glow">
            Predicting Slope Failure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#F5F1EA]">
              Before the Mountain Moves
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#F0FDF4] max-w-2xl mx-auto leading-relaxed text-contrast-glow font-medium bg-[#0A100D]/40 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
            LANDGUARD AI integrates satellite radar displacement, Open-Meteo weather forecasts, and Random Forest + XGBoost models to safeguard communities and highways across Northeast India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-xl shadow-[#10B981]/40 emerald-btn-glow flex items-center justify-center gap-2 transition"
            >
              <span>Open Landslide Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0D1714]/90 hover:bg-[#1A2E26] border border-white/20 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg backdrop-blur-md"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        {/* 3 Value Pillars with Frosted Glass Containers */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 relative z-10">
          <div className="command-card rounded-2xl p-6 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 text-contrast-glow">Multi-Model AI Prediction</h3>
            <p className="text-xs text-[#CBD1D6] leading-relaxed">
              Ensemble Random Forest &amp; XGBoost algorithms analyze 17 geotechnical &amp; weather features in real-time.
            </p>
          </div>

          <div className="command-card rounded-2xl p-6 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 text-contrast-glow">GIS Road Risk Mapping</h3>
            <p className="text-xs text-[#CBD1D6] leading-relaxed">
              Segment-level vulnerability indexing along NH-29, NH-10, and high-risk Northeast transit corridors.
            </p>
          </div>

          <div className="command-card rounded-2xl p-6 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 text-contrast-glow">Offline-First Resilience</h3>
            <p className="text-xs text-[#CBD1D6] leading-relaxed">
              Local IndexedDB caching and on-device risk scoring keep you protected even during severe telecom cutoffs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
