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
    <header className="h-16 border-b border-slate-200/90 bg-white/92 backdrop-blur-md sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between shadow-sm">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-md shadow-emerald-500/30">
          <Mountain className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900 tracking-tight text-base">LANDGUARD</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold tracking-widest uppercase border border-emerald-300">AI EARLY WARNING</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">Northeast India Landslide Monitoring &amp; Alert System</p>
        </div>
      </div>

      {/* Middle Status */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-slate-600 font-medium">Telemetry Grid:</span>
          <span className="text-emerald-700 font-mono font-bold">NE INDIA (OPEN-METEO LIVE)</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time Alerts Link */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl bg-amber-50 hover:bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Live Alerts Feed"
        >
          <Bell className="w-4 h-4 text-amber-600" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1 animate-ping" />
          <span className="hidden sm:inline">Live Alerts</span>
        </button>

        {/* Disaster Simulation Trigger */}
        <button
          onClick={onOpenSimulation}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Flame className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Stress Simulation</span>
        </button>

        {/* User Profile Pill & Signout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{user?.full_name || 'Officer'}</div>
            <div className="text-[10px] text-emerald-700 font-mono font-bold uppercase">{user?.role || 'field_officer'}</div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
