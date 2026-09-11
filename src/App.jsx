import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import DashboardPage from './pages/DashboardPage';
import MonitoringPage from './pages/MonitoringPage';
import MapPage from './pages/MapPage';
import PredictionPage from './pages/PredictionPage';
import AlertsPage from './pages/AlertsPage';
import IncidentsPage from './pages/IncidentsPage';
import HistoricalPage from './pages/HistoricalPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import LocationsPage from './pages/LocationsPage';
import SettingsPage from './pages/SettingsPage';

// Role Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A100D] text-white flex items-center justify-center">
        <div className="text-xs font-mono text-[#10B981] animate-pulse">
          Authenticating Secure Terminal Session...
        </div>
      </div>
    );
  }

  // If roles are specified, check access
  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    if (user.role === 'citizen') {
      return <Navigate to="/citizen-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dedicated Citizen Safety Portal Route */}
          <Route 
            path="/citizen-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin', 'field_officer']}>
                <CitizenDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Field Officer & Admin Command Center HUD Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['field_officer', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/predictions" element={<PredictionPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/historical" element={<HistoricalPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
