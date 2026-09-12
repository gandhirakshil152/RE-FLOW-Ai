import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  CalendarClock,
  SlidersHorizontal,
  Leaf,
  X,
  Zap,
} from 'lucide-react';
import { simulationMetadata } from '../data/energyData';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'forecast', label: 'Forecast', icon: LineChart },
  { id: 'scheduler', label: 'Smart Scheduler', icon: CalendarClock },
  { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
  { id: 'impact', label: 'Impact Center', icon: Leaf },
];

export default function Sidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  return (
    <aside className={`app-sidebar ${isOpen ? 'drawer-open' : ''}`}>
      {/* Sidebar Branding */}
      <div className="sidebar-header">
        <div className="sidebar-brand-group">
          <div className="brand-icon-emblem">
            <Zap size={22} fill="#060911" />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">RE-FLOW AI</span>
            <span className="brand-subtitle">Renewable Energy Intelligence</span>
          </div>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation drawer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-body">
        <div>
          <div className="sidebar-nav-section-label">Navigation</div>
          <nav className="sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onClose) onClose();
                  }}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Telemetry Status Footer Widget */}
      <div className="sidebar-footer">
        <div className="sidebar-status-card">
          <div className="status-card-row">
            <span className="status-label">Grid Frequency</span>
            <span className="status-val-pill live-green tabular-nums">59.98 Hz</span>
          </div>
          <div className="status-card-row">
            <span className="status-label">Region</span>
            <span className="status-val-pill tech-blue" title={simulationMetadata.gridRegion}>
              ISO-N Grid
            </span>
          </div>
          <div className="status-card-row" style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span className="status-label">Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }}></span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-accent-green)', letterSpacing: '0.04em' }}>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
