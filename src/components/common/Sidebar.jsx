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
    <aside className="w-64 border-r border-slate-200/90 bg-white/90 backdrop-blur-md flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
          Operational Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Quick link to citizen portal for officers */}
        <div className="pt-3 border-t border-slate-200">
          <NavLink
            to="/citizen-dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm"
          >
            <Users className="w-4 h-4 flex-shrink-0 text-emerald-700" />
            <span>Public Resident Portal</span>
          </NavLink>
        </div>
      </div>

      {/* Footer System Pill */}
      <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-[11px] text-slate-600 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-slate-900 font-mono font-bold">
          <span>AI Engine</span>
          <span className="text-emerald-700 font-bold">ONLINE</span>
        </div>
        <div className="text-slate-500 font-medium">Model: Ensemble-RF-XGB-v2.1</div>
      </div>
    </aside>
  );
}
