import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import SimulationModal from '../components/common/SimulationModal';

export default function DashboardLayout() {
  const [simulationOpen, setSimulationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A100D] text-[#F5F1EA] flex flex-col selection:bg-[#10B981] selection:text-white">
      <Navbar onOpenSimulation={() => setSimulationOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar">
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
