import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Protected pages
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import SmartScheduler from './pages/SmartScheduler';
import WhatIfSimulator from './pages/WhatIfSimulator';
import ImpactCenter from './pages/ImpactCenter';

// Layout
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/splash" element={<LandingPage />} />
        <Route path="/login" element={<AdminLoginPage />} />

        {/* Protected Routes (require authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <SimulationProvider>
                <DashboardLayout />
              </SimulationProvider>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/scheduler" element={<SmartScheduler />} />
            <Route path="/simulator" element={<WhatIfSimulator />} />
            <Route path="/impact" element={<ImpactCenter />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
