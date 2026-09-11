import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import StatCard from '../components/common/StatCard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-heading">Analytics &amp; Performance KPIs</h1>
        <p className="text-xs text-[#8E959E]">AI model accuracy, historical validation, and sensor uptime telemetry</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Model Accuracy" value="92.4%" subtitle="Validated on GLIF Dataset" icon={Activity} />
        <StatCard title="Mean Early Lead Time" value="8.4 Hours" subtitle="Before slope failure" icon={TrendingUp} />
        <StatCard title="Sensor Mesh Uptime" value="99.98%" subtitle="Solar + Battery backup" icon={ShieldCheck} />
      </div>
    </div>
  );
}
