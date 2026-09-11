import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import SimulationModal from '../components/common/SimulationModal';
import OnlineStatus from '../components/OnlineStatus';

export default function DashboardLayout() {
  const [simulationOpen, setSimulationOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white bg-ner-backdrop">
      <Navbar onOpenSimulation={() => setSimulationOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar space-y-6">
          <OnlineStatus />
          <Outlet />
        </main>
      </div>

      <SimulationModal
        isOpen={simulationOpen}
        onClose={() => setSimulationOpen(false)}
      />
    </div>
  );
}
