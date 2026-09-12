import { Menu, RefreshCw, Sparkles } from 'lucide-react';
import { navigationItems } from './Sidebar';
import { useSimulation } from '../context/SimulationContext';

export default function TopNav({ activeTab, onToggleSidebar, onRefresh, isRefreshing, lastUpdated = 'Just now' }) {
  const { isDemoMode, toggleDemoMode } = useSimulation();
  const currentItem = navigationItems.find((item) => item.id === activeTab) || navigationItems[0];

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="mobile-nav-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation drawer"
          type="button"
        >
          <Menu size={20} />
        </button>

        <div className="top-nav-breadcrumbs">
          <span className="breadcrumb-root">RE-FLOW AI</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-active">{currentItem.label}</span>
        </div>
      </div>

      <div className="top-navbar-right">
        {/* Demo Mode Button in Header */}
        <button
          className={`btn ${isDemoMode ? 'btn-primary-glow active' : 'btn-secondary-outline'} btn-sm demo-mode-toggle`}
          onClick={toggleDemoMode}
          title={isDemoMode ? 'Click to reset to standard configuration' : 'Activate impressive 100-EV pre-configured scenario'}
          type="button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 700 }}
        >
          <Sparkles size={13} style={{ color: isDemoMode ? '#030712' : 'var(--color-accent-amber)' }} />
          <span>{isDemoMode ? 'Demo Mode Active' : 'Demo Mode'}</span>
        </button>

        {/* Small Badge: DEMO SCENARIO */}
        {isDemoMode && (
          <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em' }}>
            DEMO SCENARIO
          </span>
        )}

        {/* Prototype Mode Indicator */}
        {!isDemoMode && (
          <div className="badge badge-amber-warning">
            <span>Prototype Mode</span>
          </div>
        )}

        {/* Animated Status Indicator: ● SYSTEM ONLINE */}
        <div className="status-indicator-online" title={`Grid telemetry online. Last sync: ${lastUpdated}`}>
          <span className="live-pulse-dot"></span>
          <span>SYSTEM ONLINE</span>
        </div>

        {/* Sync Trigger */}
        <button
          className={`btn btn-secondary-outline btn-sm ${isRefreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          title="Refresh real-time telemetry feed"
          type="button"
          disabled={isRefreshing}
        >
          <RefreshCw size={13} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
}
