import React from 'react';
import { Settings, Shield, Bell, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-heading">System &amp; Station Configuration</h1>
        <p className="text-xs text-[#8E959E]">Authentication credentials, threshold calibration, and broadcast gateways</p>
      </div>

      <div className="command-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">Active User Profile</h3>
        <div className="p-4 rounded-2xl bg-[#0D1714] border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#8E959E]">Full Name:</span>
            <span className="text-white font-semibold">{user?.full_name || 'Officer'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E959E]">Email:</span>
            <span className="text-white font-mono">{user?.email || 'officer@landguard.ai'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E959E]">Assigned Role:</span>
            <span className="text-[#10B981] font-bold uppercase font-mono">{user?.role || 'field_officer'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
