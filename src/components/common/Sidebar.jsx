import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Map, 
  BrainCircuit, 
  AlertTriangle, 
  Siren, 
  History, 
  BarChart3, 
  FileText, 
  MapPin, 
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Command Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Monitoring', path: '/monitoring', icon: Activity },
  { name: 'Hazard GIS Map', path: '/map', icon: Map },
  { name: 'AI Risk Predictions', path: '/predictions', icon: BrainCircuit },
  { name: 'Active Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Incident Dispatch', path: '/incidents', icon: Siren },
  { name: 'Historical Archive', path: '/historical', icon: History },
  { name: 'Analytics & KPIs', path: '/analytics', icon: BarChart3 },
  { name: 'Situation Reports', path: '/reports', icon: FileText },
  { name: 'Sensor Stations', path: '/locations', icon: MapPin },
  { name: 'System Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0D1714] flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[#8E959E]">
          Operational Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25'
                    : 'text-[#CBD1D6] hover:bg-[#121E1A] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Quick link to citizen portal for officers */}
        <div className="pt-3 border-t border-white/5">
          <NavLink
            to="/citizen-dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>Public Resident Portal</span>
          </NavLink>
        </div>
      </div>

      {/* Footer System Pill */}
      <div className="p-3 rounded-2xl bg-[#121E1A] border border-white/5 text-[11px] text-[#8E959E] space-y-1">
        <div className="flex items-center justify-between text-white font-mono">
          <span>AI Engine</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
        <div>Model: Ensemble-RF-XGB-v2.1</div>
      </div>
    </aside>
  );
}
