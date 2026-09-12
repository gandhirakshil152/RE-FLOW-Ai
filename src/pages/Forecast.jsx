import React, { useState } from 'react';
import {
  SunMedium,
  Zap,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EnergyForecastChart from '../components/EnergyForecastChart';
import { useSimulation } from '../context/SimulationContext';

export default function Forecast() {
  const { hourlyEnergyData, setActiveTab } = useSimulation();
  const [selectedHour, setSelectedHour] = useState('12:00');

  // Selected hour details
  const selectedData = hourlyEnergyData.find((d) => d.time === selectedHour) || hourlyEnergyData[12];

  // 4 Prediction Cards (Prototype values)
  const predictionCards = [
    {
      id: 'peak-renewable',
      title: 'Peak Renewable Availability',
      value: '820 MW',
      subtitle: 'Midday Solar Surplus Peak',
      timing: '12:00 PM – 1:00 PM',
      icon: SunMedium,
      color: 'green',
      status: 'High Generation',
      delta: '12:00 PM Peak',
    },
    {
      id: 'peak-demand',
      title: 'Peak Demand Period',
      value: '645 MW',
      subtitle: 'Evening Grid Stress Peak',
      timing: '6:00 PM – 8:00 PM',
      icon: Zap,
      color: 'amber',
      status: 'High Load',
      delta: '7:00 PM Peak',
    },
    {
      id: 'supply-demand-gap',
      title: 'Renewable-Demand Gap',
      value: '+335 / -375 MW',
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
      value: '228 gCO₂/kWh',
      subtitle: 'Varies 98g (midday) to 415g (peak)',
      timing: 'Daily Average',
      icon: Sparkles,
      color: 'green',
      status: 'Low Carbon Window Available',
      delta: '98 g/kWh at Midday',
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
            <span className="badge badge-amber-warning" style={{ fontSize: '0.68rem' }}>
              Data: Simulated Prototype
            </span>
          </div>
          <h2 className="section-title">Generation & Demand Forecast</h2>
          <p className="section-desc">
            Granular 24-hour forward projection contrasting clean solar/wind generation against regional power demand and grid carbon intensity.
          </p>
        </div>

        <div className="badge badge-green-live" style={{ padding: '0.4rem 0.85rem' }}>
          <Sparkles size={13} />
          <span>Forecast Engine Synced</span>
        </div>
      </div>

      {/* 4 Prediction Cards (Reusing MetricCard) */}
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
          subtitle="Simulated generation profile (MW) and percentage absorption efficiency (%)"
          badgeText="Surplus Window: 11:00 AM – 3:30 PM"
          badgeIcon={SunMedium}
          icon={SunMedium}
        />

        <EnergyForecastChart
          data={hourlyEnergyData}
          mode="demand"
          title="24-Hour Regional Electricity Demand & Clearing Tariff"
          subtitle="Grid load curve (MW) contrasted with real-time wholesale energy price ($/MWh)"
          badgeText="Evening Peak: 6:00 PM – 8:00 PM ($125/MWh)"
          badgeIcon={Zap}
          icon={Zap}
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
            <span className="ai-impact-desc">Renewable Supply</span>
            <span className="ai-impact-val green">{selectedData.renewable} MW</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Utilization: {selectedData.renewableUtilization}%
            </span>
          </div>

          <div className="ai-impact-unit">
            <span className="ai-impact-desc">Grid Demand</span>
            <span className="ai-impact-val blue">{selectedData.demand} MW</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Net Gap: {selectedData.renewable - selectedData.demand > 0 ? `+${selectedData.renewable - selectedData.demand} MW Surplus` : `${selectedData.renewable - selectedData.demand} MW Deficit`}
            </span>
          </div>

          <div className="ai-impact-unit">
            <span className="ai-impact-desc">Clearing Tariff</span>
            <span className="ai-impact-val amber">${selectedData.estimatedCost}/MWh</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Wholesale tariff estimate
            </span>
          </div>

          <div className="ai-impact-unit">
            <span className="ai-impact-desc">Carbon Intensity</span>
            <span className="ai-impact-val purple">{selectedData.carbonImpact} gCO₂/kWh</span>
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
