import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  CalendarClock,
  SlidersHorizontal,
  Leaf,
  X,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { simulationMetadata } from '../data/energyData';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'forecast', label: 'Forecast', icon: LineChart, path: '/forecast' },
  { id: 'scheduler', label: 'Smart Scheduler', icon: CalendarClock, path: '/scheduler' },
  { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal, path: '/simulator' },
  { id: 'impact', label: 'Impact Center', icon: Leaf, path: '/impact' },
];

export default function Sidebar({ activeTab, isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

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
                <NavLink
                  key={item.id}
                  to={item.path}
                  id={`nav-${item.id}`}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => { if (onClose) onClose(); }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer with Logout */}
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
          <div className="status-card-row" style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              onClick={handleLogout}
              className="sidebar-logout-btn"
              id="sidebar-logout-btn"
              type="button"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
