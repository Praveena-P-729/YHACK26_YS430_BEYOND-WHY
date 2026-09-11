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
    <div className="min-h-screen bg-[#0A100D] text-[#F5F1EA] selection:bg-[#10B981] selection:text-white">
      
      {/* Navigation Header */}
      <nav className="border-b border-white/10 bg-[#101A16]/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
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
              <p className="text-[10px] text-[#8E959E]">Landslide Early Warning &amp; Monitoring System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/citizen-dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121E1A] hover:bg-[#25323C] border border-white/10 text-xs font-semibold text-emerald-400 transition"
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121E1A] border border-[#10B981]/30 text-xs font-mono text-[#10B981]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>REAL-TIME DISASTER MONITORING &bull; 24/7 AI EARLY WARNING</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white font-heading tracking-tight leading-tight">
            Predicting Slope Failure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#F5F1EA]">
              Before the Mountain Moves
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#CBD1D6] max-w-2xl mx-auto leading-relaxed">
            LANDGUARD AI integrates satellite radar displacement, weather forecasts, and machine learning to protect Northeast India communities from landslide risks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-xl shadow-[#10B981]/30 emerald-btn-glow flex items-center justify-center gap-2 transition"
            >
              <span>Open Landslide Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#121E1A] hover:bg-[#25323C] border border-white/10 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
