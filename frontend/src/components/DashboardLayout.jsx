import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import AICopilotDrawer from './AICopilotDrawer';
import MLTrainingModal from './MLTrainingModal';
import { Brain, Cpu } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function DashboardLayout() {
  const {
    isRefreshing,
    handleRefresh,
    lastUpdated,
    isCopilotOpen,
    setIsCopilotOpen,
    isTrainingModalOpen,
    setIsTrainingModalOpen,
  } = useSimulation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Derive activeTab from current URL path
  const pathToTab = {
    '/dashboard': 'dashboard',
    '/forecast': 'forecast',
    '/scheduler': 'scheduler',
    '/simulator': 'simulator',
    '/impact': 'impact',
  };
  const activeTab = pathToTab[location.pathname] || 'dashboard';

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Persistent Desktop / Responsive Drawer Sidebar */}
      <Sidebar
        activeTab={activeTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Stage */}
      <div className="main-stage">
        <TopNav
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        {/* Dynamic Active Page View with Smooth Page Transitions */}
        <main style={{ flex: 1 }}>
          <div key={activeTab} className="page-transition-wrapper">
            <Outlet />
          </div>
        </main>

        <footer className="app-footer">
          <p>
            RE-FLOW AI &bull; Autonomous Renewable Energy Intelligence Platform &bull; National CleanTech Hackathon
          </p>
        </footer>
      </div>

      {/* Floating Action Buttons */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 900, display: 'flex', gap: '0.65rem' }}>
        <button
          onClick={() => setIsTrainingModalOpen(true)}
          className="btn btn-secondary-outline"
          style={{
            borderRadius: '24px',
            padding: '0.65rem 1.1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 194, 255, 0.4)',
            color: '#38bdf8',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}
          title="Retrain ML model on live Open-Meteo satellite feed"
        >
          <Cpu size={16} />
          <span>Retrain on Satellite</span>
        </button>

        <button
          onClick={() => setIsCopilotOpen(true)}
          className="btn btn-primary-glow"
          style={{
            borderRadius: '24px',
            padding: '0.65rem 1.25rem',
            boxShadow: '0 8px 25px rgba(0, 245, 155, 0.35)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}
          title="Open RE-FLOW AI Copilot"
        >
          <Brain size={16} />
          <span>AI Copilot</span>
        </button>
      </div>

      {/* Global AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Real-time Satellite ML Training Modal */}
      <MLTrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
      />
    </div>
  );
}
