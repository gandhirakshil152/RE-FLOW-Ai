import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Sparkles, SunMedium, Zap } from 'lucide-react';

function CustomChartTooltip({ active, payload, label, mode = 'overview' }) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload || {};
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-timestamp">Time: {label} (Forecast)</div>
        {payload.map((entry, index) => {
          let unit = ' MW';
          if (entry.dataKey === 'renewableUtilization') unit = '%';
          if (entry.dataKey === 'estimatedCost') unit = ' ₹/MWh';
          if (entry.dataKey === 'carbonImpact') unit = ' gCO₂/kWh';

          return (
            <div key={`tooltip-${index}`} className="tooltip-data-row" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="tabular-nums" style={{ fontWeight: 700 }}>
                {entry.value}
                {unit}
              </span>
            </div>
          );
        })}
        {mode === 'renewable' && dataPoint.carbonImpact !== undefined && (
          <div className="tooltip-data-row" style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
            <span>Carbon Intensity:</span>
            <span className="tabular-nums">{dataPoint.carbonImpact} gCO₂/kWh</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function EnergyForecastChart({
  data,
  mode = 'overview', // 'overview' | 'renewable' | 'demand'
  title = '24-Hour Renewable Availability & Demand Curve',
  subtitle = 'Multi-source generation telemetry vs. aggregate regional load demand (MW)',
  badgeText = 'Optimal Clean Surplus: 11:00 AM – 03:30 PM',
  badgeIcon: BadgeIcon = Sparkles,
  height = 360,
  icon: HeaderIcon = Activity,
  showConfidenceInterval = false,
}) {

  return (
    <div className="chart-wrapper">
      <div className="chart-header-row">
        <div className="chart-title-area">
          <div className="chart-icon-emblem">
            <HeaderIcon size={22} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
              {title}
            </h3>
            <p className="section-desc" style={{ fontSize: '0.82rem' }}>
              {subtitle}
            </p>
          </div>
        </div>

        {badgeText && (
          <div className="badge badge-green-live">
            <BadgeIcon size={12} />
            <span>{badgeText}</span>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="renewableGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f59b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f59b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="demandGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c2ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00c2ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'var(--font-sans)' }}
            />

            <YAxis
              yAxisId="left"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'var(--font-sans)' }}
              unit=" MW"
            />

            {mode !== 'overview' && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'var(--font-sans)' }}
                unit={mode === 'renewable' ? '%' : ' ₹/MWh'}
                domain={mode === 'renewable' ? [0, 100] : [0, 140]}
              />
            )}

            <Tooltip content={<CustomChartTooltip mode={mode} />} />

            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={(value) => (
                <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>{value}</span>
              )}
            />

            {mode === 'overview' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="renewable"
                  name="Renewable Generation"
                  stroke="#00f59b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#renewableGlow)"
                  isAnimationActive={true}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="demand"
                  name="Grid Demand"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f43f5e' }}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              </>
            )}

            {mode === 'renewable' && (
              <>
                {showConfidenceInterval && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="confidence_p90"
                    name="P90 Upper CI"
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    fillOpacity={0.08}
                    fill="#10b981"
                    isAnimationActive={false}
                  />
                )}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="renewable"
                  name="Renewable Availability"
                  stroke="#00f59b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#renewableGlow)"
                  isAnimationActive={true}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
                {showConfidenceInterval && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="confidence_p10"
                    name="P10 Lower CI"
                    stroke="#059669"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    fillOpacity={0}
                    isAnimationActive={false}
                  />
                )}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="renewableUtilization"
                  name="Clean Utilization %"
                  stroke="#00c2ff"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#00c2ff' }}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              </>
            )}

            {mode === 'demand' && (
              <>
                {showConfidenceInterval && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="demand_p90"
                    name="P90 Demand Bound"
                    stroke="#38bdf8"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    fillOpacity={0.08}
                    fill="#38bdf8"
                    isAnimationActive={false}
                  />
                )}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="demand"
                  name="Electricity Demand"
                  stroke="#00c2ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#demandGlow)"
                  isAnimationActive={true}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
                {showConfidenceInterval && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="demand_p10"
                    name="P10 Demand Bound"
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    fillOpacity={0}
                    isAnimationActive={false}
                  />
                )}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="estimatedCost"
                  name="Est. Clearing Tariff (₹/MWh)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
