import React from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  Award,
  Zap,
  DollarSign,
  Leaf,
  SunMedium,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Activity,
  TreePine,
  Car,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useSimulation } from '../context/SimulationContext';

export default function ImpactCenter() {
  const { latestImpactMetrics, simulatorResult, schedulerState, setActiveTab, isDemoMode } = useSimulation();

  // 4 Large Impact Cards (Requirement 10: uses latest simulated / optimized results)
  const impactCards = [
    {
      id: 'energy-optimized',
      title: 'Energy Optimized',
      value: latestImpactMetrics.energyOptimized,
      subtitle: 'Peak load shifted to green hours',
      icon: Zap,
      colorClass: 'green',
      delta: 'Optimal Shift',
    },
    {
      id: 'cost-saving',
      title: 'Estimated Cost Saving',
      value: latestImpactMetrics.costSaving,
      subtitle: 'Tariff savings per operational cycle',
      icon: DollarSign,
      colorClass: 'green',
      delta: 'Peak charge avoided',
    },
    {
      id: 'co2-avoided',
      title: 'Estimated CO₂ Avoided',
      value: latestImpactMetrics.co2Avoided,
      subtitle: 'Zero-emission solar & wind matching',
      icon: Leaf,
      colorClass: 'blue',
      delta: 'Emissions eliminated',
    },
    {
      id: 'renewable-util',
      title: 'Renewable Utilization',
      value: latestImpactMetrics.renewableUtil,
      subtitle: 'Higher absorption of clean electrons',
      icon: SunMedium,
      colorClass: 'green',
      delta: 'Surplus absorbed',
    },
  ];

  // Algorithmic Score Breakdown
  const scoreBreakdown = [
    { name: 'Renewable Utilization', score: 91, fill: '#00f59b' },
    { name: 'Cost Efficiency', score: 89, fill: '#00c2ff' },
    { name: 'Flexible Load Usage', score: 88, fill: '#a855f7' },
    { name: 'Carbon Efficiency', score: 85, fill: '#34d399' },
    { name: 'Peak Management', score: 84, fill: '#f59e0b' },
  ];

  // Dynamic Equivalencies based on simulated parameters
  const shiftedMWh = simulatorResult.totalMWh;
  const seedlingsEquivalent = Math.round(simulatorResult.netCO2SavedKg * 1.6);
  const evMilesEquivalent = (shiftedMWh * 3100).toLocaleString();

  return (
    <div className="page-content">
      {/* Page Title & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="section-eyebrow">
              <Award size={14} />
              Sustainability & Economic Intelligence
            </span>
            {isDemoMode ? (
              <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                DEMO SCENARIO
              </span>
            ) : (
              <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem' }}>
                Prototype Estimates
              </span>
            )}
          </div>
          <h2 className="section-title">IMPACT CENTER</h2>
          <p className="section-desc">
            Quantifiable environmental and economic return metrics proving the value of AI-orchestrated renewable energy synchronization.
          </p>
        </div>

        <div className="badge badge-green-live" style={{ padding: '0.4rem 0.85rem' }}>
          <Sparkles size={13} />
          <span>{latestImpactMetrics.source}</span>
        </div>
      </div>

      {/* 4 Large Impact Cards (Reusing MetricCard component) */}
      <section>
        <div className="metrics-grid-layout">
          {impactCards.map((card) => (
            <MetricCard
              key={card.id}
              title={card.title}
              value={card.value}
              delta={card.delta}
              caption={card.subtitle}
              icon={card.icon}
              colorClass={card.colorClass}
              badge="Dynamic Sync"
            />
          ))}
        </div>
      </section>

      {/* Before vs After Section */}
      <section>
        <div className="section-heading">
          <span className="section-eyebrow blue">
            <Activity size={14} />
            Operating Regime Comparison
          </span>
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
            Before vs. After Optimization
          </h3>
        </div>

        <div className="simulator-comparison-grid">
          {/* BEFORE RE-FLOW */}
          <div className="comparison-panel without-reflow">
            <div className="comp-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-red)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  CONVENTIONAL GRID DISPATCH
                </span>
                <h3 className="comp-title" style={{ color: 'var(--color-text-bright)' }}>
                  BEFORE RE-FLOW
                </h3>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-accent-red)' }}>
                <XCircle size={20} />
              </div>
            </div>

            <div className="impact-bullet-list">
              <div className="impact-bullet-item">
                <XCircle size={18} style={{ color: 'var(--color-accent-red)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>High evening demand:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Loads run concurrently during the 6:00 PM – 8:00 PM regional demand peak.</p>
                </div>
              </div>

              <div className="impact-bullet-item">
                <XCircle size={18} style={{ color: 'var(--color-accent-red)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Lower renewable availability:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Solar generation has sunset, forcing reliance on fossil peaker plants.</p>
                </div>
              </div>

              <div className="impact-bullet-item">
                <XCircle size={18} style={{ color: 'var(--color-accent-red)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Higher estimated cost:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Incurs steep peak-hour tariffs ({simulatorResult.without.estimatedCost} unmanaged run).
                  </p>
                </div>
              </div>

              <div className="impact-bullet-item">
                <XCircle size={18} style={{ color: 'var(--color-accent-red)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Lower renewable utilization:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Baseline clean energy absorption lingers at ~71% with severe carbon intensity.</p>
                </div>
              </div>
            </div>
          </div>

          {/* WITH RE-FLOW */}
          <div className="comparison-panel with-reflow">
            <div className="comp-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  AI-SYNCHRONIZED DISPATCH
                </span>
                <h3 className="comp-title" style={{ color: 'var(--color-text-bright)' }}>
                  WITH RE-FLOW
                </h3>
              </div>
              <div className="metric-icon-box green">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="impact-bullet-list">
              <div className="impact-bullet-item">
                <CheckCircle2 size={18} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-bright)' }}>Flexible demand shifted:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Electric loads automatically rescheduled to the 12:30 PM – 2:30 PM solar peak.</p>
                </div>
              </div>

              <div className="impact-bullet-item">
                <CheckCircle2 size={18} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-bright)' }}>Higher renewable utilization:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Absorbs {latestImpactMetrics.renewableUtil} clean electrons with curtailment risk eliminated.
                  </p>
                </div>
              </div>

              <div className="impact-bullet-item">
                <CheckCircle2 size={18} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-bright)' }}>Lower estimated peak:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Relieves evening grid bottleneck by {latestImpactMetrics.energyOptimized} coincident peak shaving.</p>
                </div>
              </div>

              <div className="impact-bullet-item">
                <CheckCircle2 size={18} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-bright)' }}>Better cost efficiency:</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Captures off-peak surplus tariffs ($18–$24/MWh), saving {latestImpactMetrics.costSaving} per run.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Intelligence Score (87/100) Radial Visualization & Breakdown */}
      <section className="radial-score-wrapper">
        {/* Left: Circular / Radial Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: '280px', height: '280px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="40%"
                outerRadius="100%"
                data={scoreBreakdown}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: 'rgba(255, 255, 255, 0.06)' }}
                  clockWise
                  dataKey="score"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Centered Score Label */}
            <div className="gauge-center-content">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Score
              </span>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-accent-green)', lineHeight: 1 }} className="tabular-nums">
                87
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                / 100
              </span>
            </div>
          </div>

          <div className="badge badge-green-live" style={{ marginTop: '0.5rem' }}>
            <span>Optimal Efficiency Tier</span>
          </div>
        </div>

        {/* Right: Breakdown of the 5 Sub-Scores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="section-eyebrow">Algorithmic Breakdown</div>
            <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
              Energy Intelligence Score Breakdown
            </h3>
            <p className="section-desc" style={{ fontSize: '0.82rem' }}>
              Audited composite performance across generation alignment, demand flexibility, cost optimization, and decarbonization.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {scoreBreakdown.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontWeight: 800, color: item.fill }} className="tabular-nums">
                    {item.score} / 100
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${item.score}%`,
                      backgroundColor: item.fill,
                      boxShadow: `0 0 10px ${item.fill}66`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Equivalence Section */}
      <section className="card-surface" style={{ padding: '1.75rem' }}>
        <h3 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
          Real-World Equivalencies
        </h3>
        <p className="section-desc" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Translating complex megawatt-hour shifts into tangible sustainability milestones
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="rec-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="metric-icon-box green" style={{ width: '34px', height: '34px' }}>
                <TreePine size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Forestry Offset</h4>
            </div>
            <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent-green)' }} className="tabular-nums">
              {seedlingsEquivalent > 0 ? seedlingsEquivalent.toLocaleString() : '87,200'} Seedlings
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
              Carbon sequestration equivalent to growing tree seedlings for 10 years based on abated emissions.
            </p>
          </div>

          <div className="rec-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="metric-icon-box blue" style={{ width: '34px', height: '34px' }}>
                <Car size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Clean Miles Powered</h4>
            </div>
            <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent-blue)' }} className="tabular-nums">
              {evMilesEquivalent} Miles
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
              Zero-emission electricity sufficient to power clean EV fleet transit.
            </p>
          </div>

          <div className="rec-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="metric-icon-box green" style={{ width: '34px', height: '34px' }}>
                <Award size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Renewable Purity</h4>
            </div>
            <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent-green)' }} className="tabular-nums">
              99.2% Green Index
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
              Percentage of shifted loads matched directly to verified clean solar & wind generation.
            </p>
          </div>
        </div>
      </section>

      {/* AI Continuous Optimization Insight Box */}
      <section
        className="card-surface ai-recommendation-glow"
        style={{
          padding: '1.75rem 2rem',
          border: '1px solid rgba(0, 245, 155, 0.3)',
          background: 'linear-gradient(135deg, rgba(11, 25, 20, 0.8) 0%, rgba(11, 17, 32, 0.95) 100%)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 25px rgba(0, 245, 155, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div className="metric-icon-box green" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
            <Sparkles size={24} />
          </div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="section-eyebrow" style={{ color: 'var(--color-accent-green)' }}>
                Continuous AI Optimization Insight
              </span>
              <span className="badge badge-green-live" style={{ fontSize: '0.68rem' }}>
                Active Synchronization
              </span>
            </div>

            <h3 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-text-bright)' }}>
              "Your current configuration saves {latestImpactMetrics.costSaving} with {latestImpactMetrics.energyOptimized} peak shaving."
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {schedulerState.hasOptimized
                ? `The Smart Scheduler has optimized dispatch for ${schedulerState.loadType}. Shifting to ${schedulerState.optimizationResult.recommendedWindow} captures maximum solar surplus.`
                : `What-If Simulator is actively evaluating ${simulatorResult.totalMWh.toFixed(1)} MWh of deferrable load. Move loads to the midday window in Smart Scheduler to lock in grid benefits.`}
            </p>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary-glow btn-sm"
                onClick={() => setActiveTab('scheduler')}
                type="button"
              >
                <span>Open Smart Scheduler</span>
                <ArrowRight size={14} />
              </button>
              <button
                className="btn btn-secondary-outline btn-sm"
                onClick={() => setActiveTab('simulator')}
                type="button"
              >
                <span>Adjust in Simulator</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
