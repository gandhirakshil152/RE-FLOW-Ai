import { Menu, RefreshCw, Sparkles, Cpu, Brain } from 'lucide-react';
import { navigationItems } from './Sidebar';
import { useSimulation } from '../context/SimulationContext';

export default function TopNav({ activeTab, onToggleSidebar, onRefresh, isRefreshing, lastUpdated = 'Just now' }) {
  const {
    isDemoMode,
    toggleDemoMode,
    isLiveBackend,
    liveWeather,
    mlMetrics,
    setIsTrainingModalOpen,
    setIsCopilotOpen,
  } = useSimulation();
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
        {/* Live Weather Indicator if connected */}
        {isLiveBackend && liveWeather && (
          <div
            className="badge badge-emerald-success"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.74rem',
              padding: '0.3rem 0.6rem',
            }}
            title="Live meteorological data from Open-Meteo API"
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></span>
            <span>LIVE: {liveWeather.temperature_c}°C • Wind {liveWeather.wind_speed_m_s} m/s</span>
          </div>
        )}

        {/* Live Retrain ML Button for Hackathon Showcases */}
        <button
          className="btn btn-secondary-outline btn-sm"
          onClick={() => setIsTrainingModalOpen(true)}
          title="Retrain ML model on live Open-Meteo satellite feed"
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderColor: 'rgba(0, 194, 255, 0.4)',
            color: '#38bdf8',
          }}
        >
          <Cpu size={13} color="#38bdf8" />
          <span>Retrain ML</span>
        </button>

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

        {/* Backend Connectivity Status Badge */}
        {!isDemoMode && (
          <div
            className={`badge ${isLiveBackend ? 'badge-emerald-success' : 'badge-amber-warning'}`}
            style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>{isLiveBackend ? 'LIVE API ONLINE' : 'LOCAL EDGE ENGINE'}</span>
          </div>
        )}

        {/* Animated Status Indicator: ● SYSTEM ONLINE */}
        <div className="status-indicator-online" title={`Grid telemetry online. Last sync: ${lastUpdated}`}>
          <span className="live-pulse-dot"></span>
          <span>{isLiveBackend ? 'BACKEND LIVE' : 'SYSTEM ONLINE'}</span>
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
