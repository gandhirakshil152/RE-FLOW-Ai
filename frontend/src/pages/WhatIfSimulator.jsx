import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  Leaf,
  Activity,
  Cpu,

  Zap,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import AnimatedNumber from '../components/AnimatedNumber';
import { useSimulation } from '../context/SimulationContext';

// Custom Tooltip for Before vs After Chart
function ComparisonChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-timestamp">Metric: {label}</div>
        {payload.map((entry, index) => (
          <div key={`comp-${index}`} className="tooltip-data-row" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="tabular-nums" style={{ fontWeight: 700 }}>
              {entry.value > 0 ? `+${entry.value}` : entry.value}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function WhatIfSimulator() {
  const {
    simulatorParams,
    simulatorResult,
    updateSimulatorParams,
    setActiveTab,
    isDemoMode,
  } = useSimulation();

  const [isSimulating, setIsSimulating] = useState(false);

  // Helper to format 24h to 12h
  const formatTime12h = (timeStr) => {
    const h = parseInt(timeStr.split(':')[0], 10);
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h12}:00 ${ampm}`;
  };

  // Requirement 9: Update inputs immediately
  const handleEVChange = (val) => {
    const clamped = Math.min(500, Math.max(10, val));
    updateSimulatorParams({ numEVs: clamped });
  };

  const handleTimeChange = (e) => {
    updateSimulatorParams({ chargingStartTime: e.target.value });
  };

  const handleKwhChange = (val) => {
    const clamped = Math.min(120, Math.max(20, val));
    updateSimulatorParams({ energyPerEV: clamped });
  };

  const handleScenarioChange = (e) => {
    updateSimulatorParams({ scenario: e.target.value });
  };

  // Explicit simulation trigger with visual feedback
  const handleManualSimulate = (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 350);
  };

  const { totalMWh, without, withReflow, netSavingsINR, netCO2SavedKg, chartData } = simulatorResult;

  // AI Recommendation text
  const isEvening = parseInt(simulatorParams.chargingStartTime.split(':')[0], 10) >= 17;
  const timeFormatted = formatTime12h(simulatorParams.chargingStartTime);

  return (
    <div className="page-content">
      {/* Page Title & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="section-eyebrow blue">
              <SlidersHorizontal size={14} />
              Scenario Analysis Engine
            </span>
            <span className="badge badge-green-live" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={12} />
              ML Optimization Simulation
            </span>

          </div>
          <h2 className="section-title">ENERGY WHAT-IF SIMULATOR</h2>
          <p className="section-desc">
            Test how different consumption scenarios affect renewable utilization, demand, cost and carbon impact. Results update dynamically as you change parameters.
          </p>
        </div>

        <div className="badge badge-green-live" style={{ padding: '0.4rem 0.85rem' }}>
          <Sparkles size={13} />
          <span>Real-Time Reactive Model</span>
        </div>
      </div>

      {/* Simulator Real-Time KPIs (Reusing MetricCard) */}
      <section>
        <div className="metrics-grid-layout">
          <MetricCard
            title="Total Shifted Load"
            value={`${totalMWh.toFixed(1)} MWh`}
            delta={`${simulatorParams.numEVs} Vehicles`}
            caption={`${simulatorParams.energyPerEV} kWh / vehicle average`}
            icon={Zap}
            colorClass="blue"
          />
          <MetricCard
            title="Projected Cost Savings"
            value={`₹${netSavingsINR.toLocaleString()}`}
            delta="Peak Tariff Avoided"
            caption={`vs baseline ${without.estimatedCost}`}
            icon={IndianRupee}
            colorClass="green"
          />
          <MetricCard
            title="CO₂ Emissions Abated"
            value={`${netCO2SavedKg} kg`}
            delta="Clean Solar Matching"
            caption="Direct fossil peaker displacement"
            icon={Leaf}
            colorClass="green"
          />
          <MetricCard
            title="Peak Shaving Factor"
            value={withReflow.peakDemand}
            delta="Grid Bottleneck Relieved"
            caption="Coincident peak reduction"
            icon={Activity}
            colorClass="amber"
          />
        </div>
      </section>

      {/* Interactive Controls Form */}
      <section className="card-surface" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
            Scenario Parameters
          </h3>
          <span className="badge badge-blue-tech" style={{ fontSize: '0.72rem' }}>
            Live Calculations Active
          </span>
        </div>

        <form onSubmit={handleManualSimulate}>
          <div className="scheduler-form-grid">
            {/* Number of EVs (Slider & Input Synced) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Number of EVs</label>
                <span className="tabular-nums" style={{ color: 'var(--color-accent-green)', fontWeight: 800 }}>
                  {simulatorParams.numEVs} Vehicles
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={simulatorParams.numEVs}
                onChange={(e) => handleEVChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-accent-green)', cursor: 'pointer', margin: '0.35rem 0' }}
              />
              <input
                type="number"
                className="form-input tabular-nums"
                min="10"
                max="500"
                value={simulatorParams.numEVs}
                onChange={(e) => handleEVChange(Number(e.target.value))}
              />
            </div>

            {/* Charging Start Time Dropdown */}
            <div className="form-group">
              <label className="form-label">Charging Start Time</label>
              <select
                className="form-select tabular-nums"
                value={simulatorParams.chargingStartTime}
                onChange={handleTimeChange}
              >
                <option value="19:00">7:00 PM (19:00) — Evening Peak</option>
                <option value="18:00">6:00 PM (18:00) — Peak Inflow</option>
                <option value="20:00">8:00 PM (20:00) — High Tariff</option>
                <option value="12:00">12:00 PM (12:00) — Solar Surplus</option>
                <option value="13:00">1:00 PM (13:00) — Solar Surplus</option>
                <option value="09:00">9:00 AM (09:00) — Morning Ramp</option>
                <option value="02:00">2:00 AM (02:00) — Night Wind</option>
              </select>
            </div>

            {/* Energy per EV */}
            <div className="form-group">
              <label className="form-label">Energy per EV (kWh)</label>
              <input
                type="number"
                className="form-input tabular-nums"
                min="20"
                max="120"
                step="5"
                value={simulatorParams.energyPerEV}
                onChange={(e) => handleKwhChange(Number(e.target.value))}
                required
              />
            </div>

            {/* Scenario Preset Dropdown */}
            <div className="form-group">
              <label className="form-label">Grid Condition Scenario</label>
              <select
                className="form-select"
                value={simulatorParams.scenario}
                onChange={handleScenarioChange}
              >
                <option value="Normal">Normal</option>
                <option value="High EV Demand">High EV Demand (+25% load)</option>
                <option value="Factory Peak">Factory Peak (+35% coincident load)</option>
                <option value="Low Renewable Generation">Low Renewable Generation (-30% solar/wind)</option>
              </select>
            </div>
          </div>

          {/* Action Button: SIMULATE SCENARIO */}
          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className={`btn btn-primary-glow ${isSimulating ? 'spinning' : ''}`}
              style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em' }}
              disabled={isSimulating}
            >
              <Zap size={18} />
              <span>{isSimulating ? 'COMPUTING GRID DYNAMICS...' : 'SIMULATE SCENARIO'}</span>
            </button>

            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Total Load: <strong>{totalMWh.toFixed(1)} MWh</strong> ({simulatorParams.numEVs} &times; {simulatorParams.energyPerEV} kWh). Real-time simulation updates Impact Center.
            </span>
          </div>
        </form>
      </section>

      {/* Two Comparison Panels: WITHOUT RE-FLOW vs WITH RE-FLOW */}
      <section>
        <div className="section-heading">
          <span className="section-eyebrow blue">
            <Activity size={14} />
            Comparative Dispatch Analysis
          </span>
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
            Operating Regime Comparison
          </h3>
        </div>

        <div className="simulator-comparison-grid">
          {/* WITHOUT RE-FLOW */}
          <div className="comparison-panel without-reflow">
            <div className="comp-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-red)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  UNMANAGED CONCURRENT CHARGING
                </span>
                <h3 className="comp-title" style={{ color: 'var(--color-text-bright)' }}>
                  WITHOUT RE-FLOW
                </h3>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-accent-red)' }}>
                <AlertTriangle size={20} />
              </div>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Peak Demand Impact</span>
              <span className="comp-metric-val red tabular-nums">{without.peakDemand}</span>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Renewable Utilization</span>
              <span className="comp-metric-val red tabular-nums">{without.renewableUsage}</span>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Estimated Wholesale Cost</span>
              <span className="comp-metric-val red tabular-nums">{without.estimatedCost}</span>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Carbon Impact</span>
              <span className="comp-metric-val red tabular-nums">{without.carbonImpact}</span>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-accent-red)', fontWeight: 600 }}>
                High evening grid stress risk & fossil peaker activation.
              </span>
            </div>
          </div>

          {/* WITH RE-FLOW */}
          <div className="comparison-panel with-reflow">
            <div className="comp-header">
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  AI-SYNCHRONIZED SOLAR WINDOW
                </span>
                <h3 className="comp-title" style={{ color: 'var(--color-text-bright)' }}>
                  WITH RE-FLOW
                </h3>
              </div>
              <div className="metric-icon-box green">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Peak Demand Shaving</span>
              <span className="comp-metric-val green tabular-nums">{withReflow.peakDemand}</span>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Renewable Utilization</span>
              <span className="comp-metric-val green tabular-nums">{withReflow.renewableUsage}</span>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Estimated Wholesale Cost</span>
              <span className="comp-metric-val green tabular-nums">{withReflow.estimatedCost}</span>
            </div>

            <div className="comp-metric-row">
              <span className="comp-metric-label">Carbon Impact</span>
              <span className="comp-metric-val green tabular-nums">{withReflow.carbonImpact}</span>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 245, 155, 0.2)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-accent-green)', fontWeight: 600 }}>
                Clean electrons absorbed; ₹{netSavingsINR.toLocaleString()} saved vs conventional dispatch.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bar Chart: Before vs After */}
      <section className="card-surface" style={{ padding: '1.75rem 2rem' }}>
        <div className="card-header-bar" style={{ padding: 0, marginBottom: '1.25rem', border: 'none' }}>
          <div>
            <span className="section-eyebrow blue">Comparative Telemetry</span>
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>
              Grid Impact Delta (% Change Relative to Baseline)
            </h3>
          </div>
          <span className="badge badge-green-live">Live Delta Projection</span>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
              <XAxis dataKey="metric" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip content={<ComparisonChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '12px' }} />
              <Bar
                dataKey="Without RE-FLOW"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
                isAnimationActive={true}
                animationDuration={850}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="With RE-FLOW"
                fill="#00f59b"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
                isAnimationActive={true}
                animationDuration={950}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* RE-FLOW AI Decision Engine Recommendation Card */}
      {simulatorResult.decisionEngine && (
        <section
          className="card-surface ai-recommendation-glow animate-slide-up"
          style={{
            padding: '1.5rem 1.75rem',
            border: '1px solid rgba(0, 194, 255, 0.3)',
            background: 'linear-gradient(135deg, rgba(0, 194, 255, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="metric-icon-box blue" style={{ width: '42px', height: '42px', flexShrink: 0 }}>
              <Sparkles size={22} />
            </div>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <span className="section-eyebrow blue">RE-FLOW AI Decision Engine</span>
                {isDemoMode && (
                  <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                    DEMO SCENARIO
                  </span>
                )}
                <span className="badge badge-green-live" style={{ fontSize: '0.68rem' }}>
                  Confidence: {simulatorResult.decisionEngine.confidence}%
                </span>
                <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem' }}>
                  AI Score: <AnimatedNumber value={simulatorResult.decisionEngine.aiScore} /> pts
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-bright)' }}>
                Recommended Shift Window: {simulatorResult.decisionEngine.recommendedTime}
              </h4>

              {/* Decision Engine Formula Score Chips */}
              <div style={{ display: 'flex', gap: '0.65rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
                <div className="badge badge-blue-tech" style={{ fontSize: '0.72rem' }}>
                  Renewable Score: +<AnimatedNumber value={simulatorResult.decisionEngine.renewableScore} />/100
                </div>
                <div className="badge badge-amber-warning" style={{ fontSize: '0.72rem' }}>
                  Demand Pressure: -<AnimatedNumber value={simulatorResult.decisionEngine.demandScore} />/100
                </div>
                <div className="badge badge-pill" style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  Flexibility Benefit: +<AnimatedNumber value={simulatorResult.decisionEngine.flexibilityBenefit} /> pts
                </div>
                <div className="badge badge-pill" style={{ fontSize: '0.72rem', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  Schedule Penalty: -<AnimatedNumber value={simulatorResult.decisionEngine.schedulePenalty} /> pts
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', lineHeight: 1.6 }}>
                {simulatorResult.decisionEngine.explanation}
              </p>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  * Powered by Google OR-Tools Mixed-Integer Linear Programming (MILP) & Supervised ML Telemetry.
                </span>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-secondary-outline btn-sm"
                    onClick={() => setActiveTab('scheduler')}
                    type="button"
                  >
                    <span>Apply in Scheduler</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    className="btn btn-primary-glow btn-sm"
                    onClick={() => setActiveTab('impact')}
                    type="button"
                  >
                    <span>Inspect in Impact Center</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
