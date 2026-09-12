import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import SmartScheduler from './pages/SmartScheduler';
import WhatIfSimulator from './pages/WhatIfSimulator';
import ImpactCenter from './pages/ImpactCenter';
import { SimulationProvider, useSimulation } from './context/SimulationContext';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    isRefreshing,
    handleRefresh,
    lastUpdated,
  } = useSimulation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic View router based on activeTab (no page reload, instant switching)
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'forecast':
        return <Forecast />;
      case 'scheduler':
        return <SmartScheduler />;
      case 'simulator':
        return <WhatIfSimulator />;
      case 'impact':
        return <ImpactCenter />;
      default:
        return <Dashboard />;
    }
  };

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
        onSelectTab={(tabId) => setActiveTab(tabId)}
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
            {renderCurrentPage()}
          </div>
        </main>

        <footer className="app-footer">
          <p>
            RE-FLOW AI &bull; Autonomous Renewable Energy Intelligence Platform &bull; National CleanTech Hackathon
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
