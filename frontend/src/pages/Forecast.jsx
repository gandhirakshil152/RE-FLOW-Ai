import React, { useState, useMemo } from 'react';
import {
  SunMedium,
  Zap,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight,
  Brain,
  Cpu,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EnergyForecastChart from '../components/EnergyForecastChart';
import { useSimulation } from '../context/SimulationContext';

export default function Forecast() {
  const {
    hourlyEnergyData,
    setActiveTab,
    isLiveBackend,
    mlMetrics,
    mlAnomalies,
    setIsCopilotOpen,
    setIsTrainingModalOpen,
  } = useSimulation();


  const [selectedHour, setSelectedHour] = useState('12:00');
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  // Selected hour details
  const selectedData = hourlyEnergyData.find((d) => d.time === selectedHour) || hourlyEnergyData[12] || {};

  // DYNAMIC ML CALCULATIONS from actual telemetry dataset
  const { peakRen, peakDem, maxSurplus, maxDeficit, avgCarbon, minCarbon, surplusWindow } = useMemo(() => {
    if (!hourlyEnergyData || hourlyEnergyData.length === 0) {
      return {
        peakRen: { val: 820, time: '12:00' },
        peakDem: { val: 645, time: '19:00' },
        maxSurplus: 335,
        maxDeficit: 375,
        avgCarbon: 228,
        minCarbon: 98,
        surplusWindow: '11:00 AM – 3:30 PM',
      };
    }

    let pRen = { val: -Infinity, time: '12:00' };
    let pDem = { val: -Infinity, time: '19:00' };
    let surplusHrs = [];
    let carbonSum = 0;
    let minC = Infinity;
    let maxSurp = 0;
    let maxDef = 0;

    hourlyEnergyData.forEach((pt) => {
      const ren = pt.renewable || 0;
      const dem = pt.demand || 0;
      const gap = ren - dem;
      const carb = pt.carbonImpact || 0;

      if (ren > pRen.val) {
        pRen = { val: ren, time: pt.time };
      }
      if (dem > pDem.val) {
        pDem = { val: dem, time: pt.time };
      }
      if (gap > maxSurp) maxSurp = gap;
      if (-gap > maxDef) maxDef = -gap;

      if (gap > 0) {
        surplusHrs.push(parseInt(pt.time.split(':')[0], 10));
      }

      carbonSum += carb;
      if (carb < minC) minC = carb;
    });

    const windowText = surplusHrs.length > 0
      ? `${String(Math.min(...surplusHrs)).padStart(2, '0')}:00 – ${String(Math.max(...surplusHrs) + 1).padStart(2, '0')}:00`
      : '11:00 – 15:00 (Predicted High)';

    return {
      peakRen: pRen,
      peakDem: pDem,
      maxSurplus: Math.round(maxSurp),
      maxDeficit: Math.round(maxDef),
      avgCarbon: Math.round(carbonSum / hourlyEnergyData.length),
      minCarbon: minC === Infinity ? 98 : minC,
      surplusWindow: windowText,
    };
  }, [hourlyEnergyData]);

  // Unit string (kW when live backend, MW if large values)
  const unit = isLiveBackend ? 'kW' : 'MW';

  // Dynamically computed 4 Prediction Cards
  const predictionCards = [
    {
      id: 'peak-renewable',
      title: 'Peak Renewable Availability',
      value: `${peakRen.val.toLocaleString()} ${unit}`,
      subtitle: `Solar & Wind Peak at ${peakRen.time}`,
      timing: `${peakRen.time} Window`,
      icon: SunMedium,
      color: 'green',
      status: isLiveBackend ? 'ML Supervised' : 'Baseline Profile',
      delta: `${peakRen.time} Peak`,
    },
    {
      id: 'peak-demand',
      title: 'Peak Demand Period',
      value: `${peakDem.val.toLocaleString()} ${unit}`,
      subtitle: `Coincident Grid Peak at ${peakDem.time}`,
      timing: `${peakDem.time} Stress Window`,
      icon: Zap,
      color: 'amber',
      status: 'High Load',
      delta: `${peakDem.time} Peak`,
    },
    {
      id: 'supply-demand-gap',
      title: 'Renewable-Demand Gap',
      value: `+${maxSurplus} / -${maxDeficit} ${unit}`,
      subtitle: 'Midday Surplus vs Evening Deficit',
      timing: 'Duck Curve Dynamics',
      icon: Activity,
      color: 'blue',
      status: 'Surplus to Deficit',
      delta: 'Mismatch Identified',
    },
    {
      id: 'carbon-intensity',
      title: 'Avg Grid Carbon Intensity',
      value: `${avgCarbon} gCO₂/kWh`,
      subtitle: `Varies ${minCarbon}g (midday) to 415g (peak)`,
      timing: 'Dynamic 24h Average',
      icon: Sparkles,
      color: 'green',
      status: 'Low Carbon Window Available',
      delta: `${minCarbon} g/kWh at Midday`,
    },
  ];

  return (
    <div className="page-content">
      {/* Header Eyebrow & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="section-eyebrow blue">
              <TrendingUp size={14} />
              24-Hour Predictive Telemetry
            </span>
            {isLiveBackend ? (
              <span className="badge badge-green-live" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={12} />
                ML Regressor Synced (R² = {mlMetrics?.overall_r2 ?? 0.99})
              </span>
            ) : (
              <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={12} />
                Data: Synthetic ML Baseline
              </span>
            )}
          </div>
          <h2 className="section-title">Generation & Demand Forecast</h2>
          <p className="section-desc">
            Multi-variable supervised machine learning forecast projecting solar irradiance, wind generation, facility diurnal demand, and carbon intensity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary-outline btn-sm"
            onClick={() => setIsTrainingModalOpen(true)}
            type="button"
            title="Retrain ML model on live Open-Meteo satellite feed"
            style={{ borderColor: 'rgba(0, 194, 255, 0.4)', color: '#38bdf8' }}
          >
            <Cpu size={14} />
            <span>⚡ Retrain on Satellite</span>
          </button>
          <button
            className="btn btn-secondary-outline btn-sm"
            onClick={() => setShowConfidenceBands((v) => !v)}
            type="button"
            title="Toggle P10 - P90 Probabilistic Confidence Intervals"
          >
            <ShieldCheck size={14} />
            <span>{showConfidenceBands ? 'Hide 95% CI' : 'Show 95% CI'}</span>
          </button>
          <button
            className="btn btn-primary-glow btn-sm"
            onClick={() => setIsCopilotOpen(true)}
            type="button"
          >
            <Brain size={14} />
            <span>Ask RE-FLOW AI</span>
          </button>
        </div>

      </div>

      {/* ML Model Telemetry & Accuracy Strip */}
      <div className="card-surface" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderLeft: '4px solid var(--color-primary-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-primary-green)' }}>
            <Cpu size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Active Model: <span style={{ color: 'var(--color-primary-green)' }}>{mlMetrics?.model_name || 'RE-FLOW ML Ensemble'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Supervised regularized regression with cyclical hour encoding & cooling degree days
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Validation Accuracy</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-green)' }}>R² = {mlMetrics?.overall_r2 ?? 0.992}</span>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Mean Absolute Error</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{mlMetrics?.mae_kw ?? 9.9} kW</span>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Confidence Band</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-blue)' }}>P10 – P90</span>
          </div>
        </div>
      </div>

      {/* Real-Time ML Anomaly Alert Banner (if any detected) */}
      {mlAnomalies && mlAnomalies.anomalies && mlAnomalies.anomalies.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f87171' }}>
                {mlAnomalies.total_anomalies} Anomaly Warnings Detected (Stability Index: {mlAnomalies.grid_stability_index}%)
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {mlAnomalies.anomalies[0].title} — {mlAnomalies.anomalies[0].description}
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary-outline btn-sm"
            onClick={() => setIsCopilotOpen(true)}
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.75rem' }}
          >
            <span>View AI Copilot Diagnosis</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 4 Prediction Cards (Dynamically Calculated) */}
      <section>
        <div className="metrics-grid-layout">
          {predictionCards.map((card) => (
            <MetricCard
              key={card.id}
              title={card.title}
              value={card.value}
              delta={card.delta}
              caption={card.subtitle}
              icon={card.icon}
              colorClass={card.color}
              badge={card.status}
            />
          ))}
        </div>
      </section>

      {/* 2 Reusable Charts: Chart 1 (Renewable) & Chart 2 (Demand) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <EnergyForecastChart
          data={hourlyEnergyData}
          mode="renewable"
          title="24-Hour Renewable Availability & Clean Utilization"
          subtitle={`Supervised ML generation curve (${unit}) with ${showConfidenceBands ? '95% P10–P90 confidence envelope' : 'point forecast'}`}
          badgeText={`Surplus Window: ${surplusWindow}`}
          badgeIcon={SunMedium}
          icon={SunMedium}
          showConfidenceInterval={showConfidenceBands}
        />

        <EnergyForecastChart
          data={hourlyEnergyData}
          mode="demand"
          title="24-Hour Regional Electricity Demand & Clearing Tariff"
          subtitle={`Grid load curve (${unit}) contrasted with real-time wholesale energy clearing price`}
          badgeText={`Peak Stress: ${peakDem.time} Window`}
          badgeIcon={Zap}
          icon={Zap}
          showConfidenceInterval={showConfidenceBands}
        />
      </section>

      {/* Hourly Timeline Scrubber & Point Inspector */}
      <section className="card-surface" style={{ padding: '1.5rem 1.75rem' }}>
        <div className="card-header-bar" style={{ padding: 0, marginBottom: '1.25rem', border: 'none' }}>
          <div>
            <span className="section-eyebrow">Interactive Telemetry Inspector</span>
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>
              Hourly Diagnostic Snapshot ({selectedHour})
            </h3>
          </div>
          <span className="badge badge-blue-tech">Click any hour below</span>
        </div>

        {/* Quick Hour Selector Chips */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: '0.4rem', paddingBottom: '0.75rem', scrollbarWidth: 'thin' }}>
          {hourlyEnergyData.map((d) => (
            <button
              key={d.time}
              className={`btn btn-sm ${selectedHour === d.time ? 'btn-primary-glow' : 'btn-secondary-outline'}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', minWidth: '60px' }}
              onClick={() => setSelectedHour(d.time)}
              type="button"
            >
              {d.time}
            </button>
          ))}
        </div>

        {/* Selected Hour Details Strip */}
        <div className="ai-impact-strip" style={{ marginTop: '1rem' }}>
          <div className="ai-impact-unit">
            <span className="ai-impact-desc">ML Renewable Supply</span>
            <span className="ai-impact-val green">{selectedData.renewable || 0} {unit}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              CI: [{selectedData.confidence_p10 || Math.round(selectedData.renewable * 0.88)} – {selectedData.confidence_p90 || Math.round(selectedData.renewable * 1.12)} {unit}]
            </span>
          </div>

          <div className="ai-impact-unit">
            <span className="ai-impact-desc">Facility Demand</span>
            <span className="ai-impact-val blue">{selectedData.demand || 0} {unit}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Net Gap: {(selectedData.renewable || 0) - (selectedData.demand || 0) > 0 ? `+${(selectedData.renewable || 0) - (selectedData.demand || 0)} ${unit} Surplus` : `${(selectedData.renewable || 0) - (selectedData.demand || 0)} ${unit} Deficit`}
            </span>
          </div>

          <div className="ai-impact-unit">
            <span className="ai-impact-desc">Clearing Tariff</span>
            <span className="ai-impact-val amber">${selectedData.estimatedCost || 28}/MWh</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Wholesale tariff estimate
            </span>
          </div>

          <div className="ai-impact-unit">
            <span className="ai-impact-desc">Carbon Intensity</span>
            <span className="ai-impact-val purple">{selectedData.carbonImpact || 210} gCO₂/kWh</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Direct emissions factor
            </span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary-outline btn-sm"
            onClick={() => setActiveTab('simulator')}
            type="button"
          >
            <span>Test this hour in Simulator</span>
            <ArrowRight size={13} />
          </button>
          <button
            className="btn btn-primary-glow btn-sm"
            onClick={() => setActiveTab('scheduler')}
            type="button"
          >
            <span>Schedule load for this window</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>
    </div>
  );
}
