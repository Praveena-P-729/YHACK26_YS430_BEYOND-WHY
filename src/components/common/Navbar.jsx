import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mountain, 
  Bell, 
  ShieldCheck, 
  Search, 
  User, 
  LogOut, 
  Flame, 
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenSimulation }) {
  const { user, logout, emergencyMode, toggleEmergencyMode } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0D1714]/90 backdrop-blur sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-md shadow-[#10B981]/30">
          <Mountain className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white tracking-tight text-base">LANDGUARD</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-mono font-bold tracking-widest uppercase border border-[#10B981]/30">AI COMMAND HUD</span>
          </div>
          <p className="text-[10px] text-[#8E959E]">National Disaster Telemetry &bull; GSI &bull; NDMA Synced</p>
        </div>
      </div>

      {/* Middle Status */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#121E1A] px-3 py-1.5 rounded-full border border-white/10 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[#8E959E]">Telemetry Grid:</span>
          <span className="text-emerald-400 font-mono font-semibold">NE INDIA (OPEN-METEO LIVE)</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time Alerts Link */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl bg-[#121E1A] hover:bg-[#25323C] border border-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          title="Live Alerts Feed"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1 animate-ping" />
          <span className="hidden sm:inline">Live Alerts</span>
        </button>

        {/* Disaster Simulation Trigger */}
        <button
          onClick={onOpenSimulation}
          className="px-3 py-1.5 rounded-xl bg-[#121E1A] hover:bg-[#25323C] border border-[#10B981]/40 text-[#10B981] text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stress Simulation</span>
        </button>

        {/* User Profile Pill & Signout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">{user?.full_name || 'Officer'}</div>
            <div className="text-[10px] text-[#10B981] font-mono uppercase">{user?.role || 'field_officer'}</div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl bg-[#121E1A] border border-white/10 text-[#8E959E] hover:text-white hover:border-red-500/50 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
