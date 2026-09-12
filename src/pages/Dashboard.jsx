import React from 'react';
import {
  SunMedium,
  Zap,
  Activity,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EnergyForecastChart from '../components/EnergyForecastChart';
import { useSimulation } from '../context/SimulationContext';

export default function Dashboard() {
  const {
    hourlyEnergyData,
    simulatedLoads,
    setActiveTab,
    isDemoMode,
  } = useSimulation();

  // 4 Top Metric Cards (reflects strongest demonstration state in Demo Mode)
  const topMetrics = isDemoMode
    ? [
        {
          id: 'renewable-avail',
          label: 'Renewable Availability',
          value: '92%',
          trendText: '+22%',
          trendType: 'up',
          caption: 'Peak solar generation window',
          icon: SunMedium,
          colorClass: 'green',
        },
        {
          id: 'curr-demand',
          label: 'Current Demand',
          value: '54%',
          trendText: '-16%',
          trendType: 'down',
          caption: 'Evening peak avoided',
          icon: Zap,
          colorClass: 'blue',
        },
        {
          id: 'renew-util',
          label: 'Renewable Utilization',
          value: '96%',
          trendText: '+25%',
          trendType: 'up',
          caption: '100 EV fleet absorbs clean power',
          icon: Activity,
          colorClass: 'green',
        },
        {
          id: 'ai-score',
          label: 'Energy Intelligence Score',
          value: '96/100',
          trendText: 'Optimal',
          trendType: 'neutral',
          caption: 'RE-FLOW AI synchronized dispatch',
          icon: Award,
          colorClass: 'amber',
        },
      ]
    : [
        {
          id: 'renewable-avail',
          label: 'Renewable Availability',
          value: '82%',
          trendText: '+12%',
          trendType: 'up',
          caption: 'vs baseline average (demo)',
          icon: SunMedium,
          colorClass: 'green',
        },
        {
          id: 'curr-demand',
          label: 'Current Demand',
          value: '64%',
          trendText: '-4%',
          trendType: 'down',
          caption: 'below peak forecast (demo)',
          icon: Zap,
          colorClass: 'blue',
        },
        {
          id: 'renew-util',
          label: 'Renewable Utilization',
          value: '71%',
          trendText: '+8%',
          trendType: 'up',
          caption: 'absorption rate (demo)',
          icon: Activity,
          colorClass: 'green',
        },
        {
          id: 'ai-score',
          label: 'Energy Intelligence Score',
          value: '87/100',
          trendText: 'Optimal',
          trendType: 'neutral',
          caption: 'algorithmic efficiency (demo)',
          icon: Award,
          colorClass: 'amber',
        },
      ];

  // Energy Status indicators with progress values
  const energyStatusItems = isDemoMode
    ? [
        {
          label: 'Renewable Supply',
          value: '92%',
          statusText: 'Massive Surplus Window',
          progressPercent: 92,
          color: 'green',
        },
        {
          label: 'Current Demand',
          value: '54%',
          statusText: 'Moderate Off-Peak Load',
          progressPercent: 54,
          color: 'blue',
        },
        {
          label: 'Peak Risk',
          value: 'Low (12%)',
          statusText: 'Zero Peaker Risk',
          progressPercent: 12,
          color: 'amber',
        },
        {
          label: 'Grid Flexibility',
          value: '94%',
          statusText: '100 EV Fleet Available',
          progressPercent: 94,
          color: 'purple',
        },
      ]
    : [
        {
          label: 'Renewable Supply',
          value: '82%',
          statusText: 'Surplus Generation',
          progressPercent: 82,
          color: 'green',
        },
        {
          label: 'Current Demand',
          value: '64%',
          statusText: 'Moderate Grid Load',
          progressPercent: 64,
          color: 'blue',
        },
        {
          label: 'Peak Risk',
          value: 'Low (24%)',
          statusText: 'No Curtailment Expected',
          progressPercent: 24,
          color: 'amber',
        },
        {
          label: 'Grid Flexibility',
          value: '78%',
          statusText: 'High Dispatch Reserve',
          progressPercent: 78,
          color: 'purple',
        },
      ];

  return (
    <div className="page-content">
      {/* Header Eyebrow & Subtitle with Prototype Notice / Demo Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="section-eyebrow">
              <Sparkles size={14} />
              Renewable Energy Intelligence
            </span>
            {isDemoMode ? (
              <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                DEMO SCENARIO
              </span>
            ) : (
              <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem' }}>
                Data: Simulated Prototype
              </span>
            )}
          </div>
          <h2 className="section-title">Control Room Dashboard</h2>
          <p className="section-desc">
            Predictive intelligence platform forecasting clean energy availability, diagnosing demand peaks, and orchestrating flexible loads.
          </p>
        </div>

        {/* Small Panel: Best Renewable Window */}
        <div
          className="best-window-panel"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('scheduler')}
          title="Click to view in Smart Scheduler"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon-box amber" style={{ width: '38px', height: '38px' }}>
              <Clock size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Best Renewable Window
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }} className="tabular-nums">
                {isDemoMode ? '1:00 PM – 2:00 PM' : '12:30 PM – 2:30 PM'}
              </div>
            </div>
          </div>
          <span className="badge badge-green-live" style={{ fontSize: '0.68rem' }}>
            {isDemoMode ? 'Optimal Solar Slot' : 'Peak Solar Surplus'}
          </span>
        </div>
      </div>

      {/* 1. Top Metric Cards (Reusing MetricCard component) */}
      <section>
        <div className="metrics-grid-layout">
          {topMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              title={metric.label}
              value={metric.value}
              delta={metric.trendText}
              trend={metric.trendType}
              caption={metric.caption}
              icon={metric.icon}
              colorClass={metric.colorClass}
            />
          ))}
        </div>
      </section>

      {/* 2. Reusable 24-Hour Energy Forecast Chart */}
      <section>
        <EnergyForecastChart
          data={hourlyEnergyData}
          mode="overview"
          title="24-Hour Renewable Availability & Demand Curve"
          subtitle="Multi-source generation telemetry vs. aggregate regional load demand (MW)"
          badgeText="Optimal Clean Surplus: 11:00 AM – 03:30 PM"
        />
      </section>

      {/* 3. Energy Status Indicators & Flexible Load Queue */}
      <section>
        <div className="dashboard-double-grid">
          {/* Real-Time Energy Status Panel */}
          <div className="card-surface" style={{ padding: '1.5rem 1.75rem' }}>
            <div className="card-header-bar" style={{ padding: 0, marginBottom: '1.25rem', border: 'none' }}>
              <div>
                <span className="section-eyebrow blue">Live Telemetry Diagnostics</span>
                <h3 className="section-title" style={{ fontSize: '1.15rem' }}>
                  Real-Time Energy Status
                </h3>
              </div>
              <span className="badge badge-green-live">Nominal</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {energyStatusItems.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {item.statusText}
                      </span>
                      <span className="tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-bright)' }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${item.color}`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-accent-green)' }} />
                <span>Grid Reserve Margin: <strong>+18.2%</strong> above requirement</span>
              </div>
            </div>
          </div>

          {/* Flexible Load Dispatch Queue */}
          <div className="card-surface" style={{ padding: '1.5rem 1.75rem' }}>
            <div className="card-header-bar" style={{ padding: 0, marginBottom: '1.25rem', border: 'none' }}>
              <div>
                <span className="section-eyebrow">Demand-Side Flexibility</span>
                <h3 className="section-title" style={{ fontSize: '1.15rem' }}>
                  Flexible Load Queue
                </h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('scheduler')}
                style={{ fontSize: '0.75rem' }}
                type="button"
              >
                <span>Manage in Scheduler</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {simulatedLoads.slice(0, 3).map((load) => (
                <div key={load.id} className="rec-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-bright)' }}>
                        {load.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Capacity: <strong style={{ color: 'var(--color-accent-blue)' }}>{load.energyRequired}</strong>
                      </span>
                    </div>
                    <span className="badge badge-amber-warning" style={{ fontSize: '0.65rem' }}>
                      {load.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginTop: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
                      <Clock size={13} style={{ color: 'var(--color-accent-amber)' }} />
                      <span>Current: <strong className="tabular-nums" style={{ color: 'var(--color-accent-red)' }}>{load.currentTime}</strong></span>
                      <span>&rarr;</span>
                      <span>Target: <strong className="tabular-nums" style={{ color: 'var(--color-accent-green)' }}>{load.earliestTime} – {load.latestTime}</strong></span>
                    </div>

                    <button
                      className="btn btn-secondary-outline btn-sm"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                      onClick={() => setActiveTab('scheduler')}
                      type="button"
                    >
                      Shift
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Actionable Recommendation Banner */}
      <section
        className="card-surface ai-recommendation-glow"
        style={{
          padding: '1.5rem 1.75rem',
          border: '1px solid rgba(0, 245, 155, 0.25)',
          background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.04) 0%, rgba(0, 194, 255, 0.04) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div className="metric-icon-box green" style={{ width: '42px', height: '42px', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-green-live" style={{ fontSize: '0.68rem' }}>AI Actionable Recommendation</span>
                {isDemoMode ? (
                  <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.65rem' }}>
                    DEMO SCENARIO
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Updated 2 mins ago</span>
                )}
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-bright)' }}>
                {isDemoMode
                  ? 'Shift 100 EV fleet (50 MWh) from 6:00 PM evening peak to 1:00 PM solar surplus window.'
                  : 'Shift 185 MW deferrable load to 12:30 PM – 2:30 PM to absorb surplus solar generation.'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                {isDemoMode
                  ? 'Estimated impact: Avoid ₹8,400 peak tariffs, shave 18% peak stress, and eliminate 61 kg CO₂ emissions per operational cycle.'
                  : 'Estimated impact: Avoid ₹6,100 peak tariffs and eliminate 29 kg CO₂ emissions per operational cycle.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary-outline btn-sm"
              onClick={() => setActiveTab('simulator')}
              type="button"
            >
              <Sliders size={14} />
              <span>Simulate ROI</span>
            </button>
            <button
              className="btn btn-primary-glow btn-sm"
              onClick={() => setActiveTab('scheduler')}
              type="button"
            >
              <span>Apply Load Shift</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
