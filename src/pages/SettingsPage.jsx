import React from 'react';
import { Settings, Shield, Bell, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="command-card-solid p-6 rounded-3xl border border-slate-300 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">System &amp; Station Configuration</h1>
        <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">Authentication credentials, threshold calibration, and broadcast gateways</p>
      </div>

      <div className="command-card-solid rounded-3xl p-6 border border-slate-300 space-y-4 shadow-md">
        <h3 className="text-sm font-extrabold text-slate-950 font-heading">Active User Profile</h3>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-700 font-bold">Full Name:</span>
            <span className="text-slate-950 font-extrabold">{user?.full_name || 'Praveena'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-700 font-bold">Email:</span>
            <span className="text-slate-950 font-mono font-bold">{user?.email || 'praveena@landguard.ai'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-700 font-bold">Assigned Role:</span>
            <span className="text-emerald-900 font-extrabold uppercase font-mono bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">{user?.role || 'field_officer'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
