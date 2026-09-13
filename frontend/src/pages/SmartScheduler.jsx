import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Info,
  IndianRupee,
  ChevronRight,
  Filter,
  Calculator,
  Layers,
  Leaf,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import AnimatedNumber from '../components/AnimatedNumber';
import { useSimulation } from '../context/SimulationContext';

export default function SmartScheduler() {
  const {
    simulatedLoads,
    schedulerState,
    runSchedulerOptimization,
    setActiveTab,
    isDemoMode,
  } = useSimulation();

  // Local form inputs matching all required decision engine inputs
  const [loadType, setLoadType] = useState(schedulerState.loadType);
  const [energyRequired, setEnergyRequired] = useState(schedulerState.energyRequired);
  const [currentSchedule, setCurrentSchedule] = useState(schedulerState.currentSchedule);
  const [earliestStart, setEarliestStart] = useState(schedulerState.earliestStart);
  const [latestStart, setLatestStart] = useState(schedulerState.latestStart);
  const [loadFlexibility, setLoadFlexibility] = useState('High');

  // React to Demo Mode or external state preset changes
  useEffect(() => {
    setLoadType(schedulerState.loadType);
    setEnergyRequired(schedulerState.energyRequired);
    setCurrentSchedule(schedulerState.currentSchedule);
    setEarliestStart(schedulerState.earliestStart);
    setLatestStart(schedulerState.latestStart);
    if (schedulerState.flexibility) {
      setLoadFlexibility(schedulerState.flexibility);
    }
  }, [
    schedulerState.loadType,
    schedulerState.energyRequired,
    schedulerState.currentSchedule,
    schedulerState.earliestStart,
    schedulerState.latestStart,
    schedulerState.flexibility,
  ]);

  // Sector filter for the flexible load cards
  const [filterSector, setFilterSector] = useState('All');
  const sectors = ['All', 'EV Charging', 'Industrial', 'Commercial', 'Storage'];

  // Presets when changing load type
  const handleLoadTypeChange = (e) => {
    const selected = e.target.value;
    setLoadType(selected);
    if (selected === 'EV Charging') {
      setEnergyRequired(45000);
      setCurrentSchedule('18:00');
      setEarliestStart('10:00');
      setLatestStart('16:00');
      setLoadFlexibility('High');
    } else if (selected === 'Water Pump') {
      setEnergyRequired(28000);
      setCurrentSchedule('19:00');
      setEarliestStart('10:30');
      setLatestStart('16:00');
      setLoadFlexibility('High');
    } else if (selected === 'Battery Charging') {
      setEnergyRequired(60000);
      setCurrentSchedule('20:00');
      setEarliestStart('11:00');
      setLatestStart('15:00');
      setLoadFlexibility('Very High');
    } else if (selected === 'Factory Process') {
      setEnergyRequired(85000);
      setCurrentSchedule('17:30');
      setEarliestStart('11:30');
      setLatestStart('16:00');
      setLoadFlexibility('Moderate');
    } else if (selected === 'Water Heating') {
      setEnergyRequired(32000);
      setCurrentSchedule('19:00');
      setEarliestStart('11:00');
      setLatestStart('15:00');
      setLoadFlexibility('High');
    }
  };

  // Staged loading state for live hackathon demonstration
  const [processingStage, setProcessingStage] = useState(null); // null | 0 | 1 | 2 | 3
  const processingMessages = [
    'Analyzing renewable availability...',
    'Comparing demand...',
    'Finding optimal load window...',
    'Recommendation ready.',
  ];

  // Trigger optimization with short staged processing state
  const handleOptimize = (e) => {
    e.preventDefault();
    setProcessingStage(0);

    setTimeout(() => {
      setProcessingStage(1);
    }, 380);

    setTimeout(() => {
      setProcessingStage(2);
    }, 760);

    setTimeout(() => {
      setProcessingStage(3);
    }, 1140);

    setTimeout(() => {
      runSchedulerOptimization({
        loadType,
        energyRequired,
        currentSchedule,
        earliestStart,
        latestStart,
        flexibility: loadFlexibility,
      });
      setProcessingStage(null);
    }, 1450);
  };

  const { isOptimizing, hasOptimized, optimizationResult } = schedulerState;
  const isCurrentlyProcessing = processingStage !== null || isOptimizing;

  // Filtered loads list
  const filteredLoads = simulatedLoads.filter((l) => {
    if (filterSector === 'All') return true;
    if (filterSector === 'EV Charging') return l.id.includes('ev');
    if (filterSector === 'Industrial') return l.id.includes('factory');
    if (filterSector === 'Commercial') return l.id.includes('water');
    if (filterSector === 'Storage') return l.id.includes('battery');
    return true;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="section-eyebrow blue">
              <CalendarClock size={14} />
              RE-FLOW AI Decision Engine
            </span>
            {isDemoMode ? (
              <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                DEMO SCENARIO
              </span>
            ) : (
              <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem' }}>
                Deterministic Rule Scoring
              </span>
            )}
          </div>
          <h2 className="section-title">Smart Load Scheduler</h2>
          <p className="section-desc">
            Deterministic multi-factor scoring engine evaluating renewable availability, demand pressure, load flexibility, and schedule disruption to select the highest-scoring dispatch slot.
          </p>
        </div>

        <div className="badge badge-green-live" style={{ padding: '0.4rem 0.85rem' }}>
          <Sparkles size={13} />
          <span>Local Rule Engine Active</span>
        </div>
      </div>

      {/* Scheduler KPIs (Reusing MetricCard) */}
      <section>
        <div className="metrics-grid-layout">
          <MetricCard
            title="Available Flexible Load"
            value="185 MW"
            delta="5 Loads Active"
            caption="Ready for automated dispatch"
            icon={Zap}
            colorClass="green"
          />
          <MetricCard
            title="Target Green Window"
            value="11:00 – 15:30"
            delta="Solar Surplus Period"
            caption="Tariffs dip to ~₹1,500–₹2,000/MWh"
            icon={Clock}
            colorClass="amber"
          />
          <MetricCard
            title="Peak Tariff Avoidance"
            value="₹24,850"
            delta="-31% off baseline bill"
            caption="Aggregated 24h schedule"
            icon={IndianRupee}
            colorClass="green"
          />
          <MetricCard
            title="Grid Stress Relieved"
            value="-14.8% Peak"
            delta="18:00 – 20:00 evening peak"
            caption="Peak demand curtailed"
            icon={ShieldCheck}
            colorClass="blue"
          />
        </div>
      </section>

      {/* Scheduler Interactive Configuration Form with Decision Engine Inputs */}
      <section className="card-surface" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
              Configure Load & Decision Engine Parameters
            </h3>
            <p className="section-desc" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Formula: <code>AI Score = Renewable Availability - Demand Pressure + Flexibility Benefit - Schedule Penalty</code>
            </p>
          </div>
          <span className="badge badge-blue-tech" style={{ fontSize: '0.72rem' }}>
            No External API Required
          </span>
        </div>

        <form onSubmit={handleOptimize}>
          <div className="scheduler-form-grid">
            {/* Load Type Dropdown */}
            <div className="form-group">
              <label className="form-label">Load Type</label>
              <select
                className="form-select"
                value={loadType}
                onChange={handleLoadTypeChange}
              >
                <option value="EV Charging">EV Charging</option>
                <option value="Water Pump">Water Pump</option>
                <option value="Battery Charging">Battery Charging</option>
                <option value="Factory Process">Factory Process</option>
                <option value="Water Heating">Water Heating</option>
              </select>
            </div>

            {/* Required Energy */}
            <div className="form-group">
              <label className="form-label">Energy Requirement (kWh)</label>
              <input
                type="number"
                className="form-input tabular-nums"
                min="1000"
                step="500"
                value={energyRequired}
                onChange={(e) => setEnergyRequired(Number(e.target.value))}
                required
              />
            </div>

            {/* Load Flexibility Input */}
            <div className="form-group">
              <label className="form-label">Load Flexibility</label>
              <select
                className="form-select"
                value={loadFlexibility}
                onChange={(e) => setLoadFlexibility(e.target.value)}
              >
                <option value="Very High">Very High (+25 pts)</option>
                <option value="High">High (+20 pts)</option>
                <option value="Moderate">Moderate (+12 pts)</option>
                <option value="Low">Low (+5 pts)</option>
              </select>
            </div>

            {/* Current Schedule */}
            <div className="form-group">
              <label className="form-label">Current Schedule</label>
              <select
                className="form-select tabular-nums"
                value={currentSchedule}
                onChange={(e) => setCurrentSchedule(e.target.value)}
              >
                <option value="17:00">5:00 PM (Peak Inflow)</option>
                <option value="17:30">5:30 PM (Peak Inflow)</option>
                <option value="18:00">6:00 PM (Evening Peak Tariff)</option>
                <option value="18:30">6:30 PM (Evening Peak Tariff)</option>
                <option value="19:00">7:00 PM (Severe Grid Strain)</option>
                <option value="20:00">8:00 PM (High Tariff)</option>
              </select>
            </div>

            {/* Earliest Allowed Start */}
            <div className="form-group">
              <label className="form-label">Allowed Window (Earliest)</label>
              <select
                className="form-select tabular-nums"
                value={earliestStart}
                onChange={(e) => setEarliestStart(e.target.value)}
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM (Solar Surplus)</option>
                <option value="12:00">12:00 PM (Peak Solar)</option>
                <option value="13:00">01:00 PM (Optimal Solar Window)</option>
              </select>
            </div>

            {/* Latest Allowed Start */}
            <div className="form-group">
              <label className="form-label">Allowed Window (Latest)</label>
              <select
                className="form-select tabular-nums"
                value={latestStart}
                onChange={(e) => setLatestStart(e.target.value)}
              >
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM (Pre-Peak)</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
          </div>

          {/* Action Button: RUN RE-FLOW DECISION ENGINE */}
          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className={`btn btn-primary-glow ${isCurrentlyProcessing ? 'spinning' : ''}`}
              style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em' }}
              disabled={isCurrentlyProcessing}
            >
              <Zap size={18} />
              <span>
                {isCurrentlyProcessing
                  ? (processingMessages[processingStage ?? 0] || 'ANALYZING...')
                  : 'OPTIMIZE WITH RE-FLOW AI'}
              </span>
            </button>

            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              * Evaluates all hourly slots in window [<strong>{earliestStart} – {latestStart}</strong>] using deterministic scoring.
            </span>
          </div>
        </form>
      </section>

      {/* Short Staged Processing Card for Live Hackathon Demo */}
      {processingStage !== null && (
        <section className="ai-processing-card animate-slide-up" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="live-pulse-dot" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--color-accent-green)', textTransform: 'uppercase' }}>
                AI Optimization Running
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Stage {processingStage + 1} of {processingMessages.length}
            </span>
          </div>

          <div className="processing-stages-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {processingMessages.map((msg, idx) => {
              const isCompleted = processingStage > idx;
              const isActive = processingStage === idx;
              return (
                <div
                  key={msg}
                  className={`stage-item ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'rgba(0, 229, 153, 0.08)' : isCompleted ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 229, 153, 0.3)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--color-accent-green)' }} />
                    ) : isActive ? (
                      <div className="processing-spinner" style={{ width: 14, height: 14, border: '2px solid rgba(0, 229, 153, 0.2)', borderTopColor: 'var(--color-accent-green)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-subtle)' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-accent-green)' : isCompleted ? 'var(--color-text-bright)' : 'var(--color-text-muted)',
                  }}>
                    {msg}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Decision Engine Recommendation Output Hero Card */}
      {hasOptimized && optimizationResult && (
        <section className="ai-recommendation-hero-card ai-recommendation-glow animate-slide-up">
          {/* Header row */}
          <div className="ai-rec-tag-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green-live" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                OPTIMAL TIME SLOT SELECTED
              </span>
              {isDemoMode && (
                <span className="badge badge-amber-warning demo-scenario-badge" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                  DEMO SCENARIO
                </span>
              )}
              <span className="badge badge-blue-tech" style={{ fontSize: '0.72rem' }}>
                Confidence: {optimizationResult.confidence}%
              </span>
              <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem' }}>
                AI Score: <AnimatedNumber value={optimizationResult.aiScore} /> pts
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Evaluated at {optimizationResult.timestamp}
            </span>
          </div>

          {/* Schedule Comparison Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', background: 'rgba(6, 9, 17, 0.7)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Current Schedule
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-accent-red)' }}>
                {optimizationResult.currentScheduleStr}
              </span>
            </div>

            <ArrowRight size={22} style={{ color: 'var(--color-text-muted)' }} />

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-green)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Recommended Time Window (recommendedTime)
              </span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-accent-green)' }}>
                {optimizationResult.recommendedTime}
              </span>
            </div>
          </div>

          {/* Decision Engine Score Attribution Breakdown */}
          <div style={{ background: 'rgba(11, 17, 32, 0.95)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calculator size={16} style={{ color: 'var(--color-accent-blue)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-bright)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Decision Engine Score Formula Breakdown
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="rec-card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Renewable Availability (renewableScore)
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent-green)' }} className="tabular-nums">
                  +<AnimatedNumber value={optimizationResult.renewableScore} /> / 100
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'block' }}>
                  Midday solar availability
                </span>
              </div>

              <div className="rec-card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Demand Pressure (demandScore)
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent-blue)' }} className="tabular-nums">
                  -<AnimatedNumber value={optimizationResult.demandScore} /> / 100
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'block' }}>
                  Grid regional load factor
                </span>
              </div>

              <div className="rec-card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Flexibility Benefit
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent-purple)' }} className="tabular-nums">
                  +<AnimatedNumber value={optimizationResult.flexibilityBenefit} /> pts
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'block' }}>
                  '{loadFlexibility}' dispatch rating
                </span>
              </div>

              <div className="rec-card" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Schedule Disruption Penalty
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent-red)' }} className="tabular-nums">
                  -<AnimatedNumber value={optimizationResult.schedulePenalty} /> pts
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'block' }}>
                  Operational shift distance
                </span>
              </div>
            </div>
          </div>

          {/* Engine Transparent Explanation */}
          <div style={{ background: 'rgba(0, 194, 255, 0.04)', border: '1px solid rgba(0, 194, 255, 0.2)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
              Engine Explanation (explanation)
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-bright)', lineHeight: 1.6 }}>
              {optimizationResult.explanation}
            </p>
          </div>

          {/* Estimated Returns Output Strip */}
          <div className="ai-impact-strip">
            <div className="ai-impact-unit">
              <span className="ai-impact-desc">Estimated Energy Optimization</span>
              <span className="ai-impact-val green"><AnimatedNumber value={optimizationResult.estimatedEnergyOptimization} /></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Absorbs clean generation surplus
              </span>
            </div>

            <div className="ai-impact-unit">
              <span className="ai-impact-desc">Estimated Cost Impact</span>
              <span className="ai-impact-val green"><AnimatedNumber value={optimizationResult.estimatedCostImpact} /></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Avoids peak demand charges
              </span>
            </div>

            <div className="ai-impact-unit">
              <span className="ai-impact-desc">Estimated Carbon Impact</span>
              <span className="ai-impact-val blue"><AnimatedNumber value={optimizationResult.estimatedCarbonImpact} /></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Direct fossil peaker displacement
              </span>
            </div>
          </div>

          {/* Disclaimer & Navigation Links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={14} style={{ color: 'var(--color-accent-teal)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <strong>Optimization Engine:</strong> Google OR-Tools Mixed-Integer Linear Programming (MILP) with Supervised ML Solar Availability Constraints.
              </span>
            </div>

            <button
              className="btn btn-primary-glow btn-sm"
              onClick={() => setActiveTab('impact')}
              type="button"
            >
              <span>View in Impact Center</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </section>
      )}

      {/* Flexible Load Recommendations Catalog */}
      <section className="card-surface" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="section-eyebrow blue">Identified Flexible Loads</span>
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>
              Flexible Demand Queue Catalog
            </h3>
          </div>

          {/* Sector Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
            {sectors.map((sector) => (
              <button
                key={sector}
                className={`btn btn-sm ${filterSector === sector ? 'btn-primary-glow' : 'btn-secondary-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
                onClick={() => setFilterSector(sector)}
                type="button"
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredLoads.map((load) => (
            <div key={load.id} className="rec-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{load.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Shiftable: <strong style={{ color: 'var(--color-accent-blue)' }}>{load.energyRequired}</strong>
                  </span>
                </div>
                <span className="badge badge-green-live" style={{ fontSize: '0.65rem' }}>
                  {load.flexibility} Flex
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0.65rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>Current: <strong className="tabular-nums" style={{ color: 'var(--color-accent-red)' }}>{load.currentTime}</strong> (Peak)</div>
                <div>Target Window: <strong className="tabular-nums" style={{ color: 'var(--color-accent-green)' }}>{load.earliestTime} – {load.latestTime}</strong></div>
              </div>

              <button
                className="btn btn-secondary-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setLoadType(load.name);
                  setLoadFlexibility(load.flexibility);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                type="button"
              >
                <span>Select for Decision Engine</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
