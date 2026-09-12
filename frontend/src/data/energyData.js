/**
 * RE-FLOW AI — Simulated Data Layer
 * 
 * PROTOTYPE / SYNTHETIC DATASET:
 * Multi-day 16-day simulated energy availability, grid demand, and flexible loads
 * starting from current date through 15 days ahead (384 hours).
 * Illustrates the classic renewable supply-demand mismatch with date selection.
 */

export const getTodayDateString = () => {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
};

export const generateMultiDayEnergyData = (daysCount = 16) => {
  const data = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + dayOffset);
    const dateStr = currentDay.toISOString().split('T')[0];

    // Day variation factors
    const weatherFactor = 0.85 + 0.3 * Math.sin(dayOffset * 1.7);
    const demandFactor = 0.9 + 0.2 * Math.cos(dayOffset * 1.3);

    for (let h = 0; h < 24; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      const timestampStr = `${dateStr}T${timeStr}`;

      // Solar profile
      let solar = 0;
      if (h >= 6 && h <= 18) {
        const angle = Math.sin(((h - 6) * Math.PI) / 12);
        solar = Math.round(750 * Math.pow(Math.max(0, angle), 1.2) * weatherFactor);
      }
      // Wind profile
      const wind = Math.round(180 + 90 * Math.sin(((h - 3) * Math.PI) / 12) + (dayOffset % 3) * 20);
      const totalRen = solar + wind;

      // Demand profile
      let dem = 250;
      if (h >= 6 && h < 9) dem = 350 + (h - 6) * 90;
      else if (h >= 9 && h < 17) dem = 620 + Math.round(170 * Math.sin(((h - 9) * Math.PI) / 8));
      else if (h >= 17 && h < 21) dem = 540 + (21 - h) * 25;
      else dem = 270;
      dem = Math.round(dem * demandFactor);

      const isPeakTariff = (h >= 11 && h <= 15) || (h >= 18 && h <= 21);
      const util = dem > 0 ? Math.min(100, Math.round((Math.min(totalRen, dem) / dem) * 100 * 10) / 10) : 0;
      const netGrid = Math.max(0, dem - totalRen);

      data.push({
        date: dateStr,
        time: timeStr,
        timestamp: timestampStr,
        renewable: totalRen,
        demand: dem,
        solar_kw: solar,
        wind_kw: wind,
        confidence_p10: Math.round(totalRen * 0.86),
        confidence_p90: Math.round(totalRen * 1.14),
        demand_p10: Math.round(dem * 0.94),
        demand_p90: Math.round(dem * 1.06),
        renewableUtilization: util,
        estimatedCost: isPeakTariff ? 54 : 28,
        carbonImpact: netGrid > 0 ? Math.round((netGrid / Math.max(1, dem)) * 420) : 45,
        temperature_c: Math.round((24 + 8 * Math.sin(((h - 8) * Math.PI) / 12)) * 10) / 10,
        cloud_cover_percent: Math.round(15 + 25 * (1 - weatherFactor)),
        solar_radiation_w_m2: Math.round(solar * 1.2),
        wind_speed_m_s: Math.round((3 + wind / 60) * 10) / 10,
      });
    }
  }
  return data;
};

export const multiDayEnergyData = generateMultiDayEnergyData(16);

// 24-Hour Hourly Energy Availability & Demand Telemetry (Day 0 / Today)
export const hourlyEnergyData = multiDayEnergyData.slice(0, 24);


// Simulated Flexible Electricity Loads
export const simulatedLoads = [
  {
    id: 'load-ev-charging',
    name: 'EV Charging',
    energyRequired: '45 MWh',
    currentTime: '18:30', // Unfavorable evening peak
    earliestTime: '11:00',
    latestTime: '15:30',
    flexibility: 'High',
    status: 'Pending Shift'
  },
  {
    id: 'load-water-pump',
    name: 'Water Pump',
    energyRequired: '28 MWh',
    currentTime: '19:00', // Evening peak tariff
    earliestTime: '10:30',
    latestTime: '16:00',
    flexibility: 'High',
    status: 'Scheduled'
  },
  {
    id: 'load-battery-charging',
    name: 'Battery Charging',
    energyRequired: '60 MWh',
    currentTime: '20:00', // Peak carbon intensity
    earliestTime: '11:00',
    latestTime: '14:30',
    flexibility: 'Very High',
    status: 'Recommended'
  },
  {
    id: 'load-factory-process',
    name: 'Factory Process',
    energyRequired: '85 MWh',
    currentTime: '17:45',
    earliestTime: '12:00',
    latestTime: '16:00',
    flexibility: 'Moderate',
    status: 'Shift Available'
  },
  {
    id: 'load-water-heating',
    name: 'Water Heating',
    energyRequired: '32 MWh',
    currentTime: '19:30',
    earliestTime: '11:30',
    latestTime: '15:00',
    flexibility: 'High',
    status: 'Pre-heating Recommended'
  }
];

// Simulation Telemetry Metadata
export const simulationMetadata = {
  version: '1.0.0-production',
  environment: 'Open-Meteo Satellite & Telemetry Pipeline',
  gridRegion: 'North Regional Interconnect (ISO-N)',
  patternType: 'Duck Curve with High Midday Solar Penetration',
  peakRenewableHour: '12:00 (820 MW)',
  peakDemandHour: '19:00 (645 MW)',
  maxSupplyDemandMismatch: '375 MW Deficit at 19:00 | 335 MW Surplus at 12:00',
  summaryMetrics: {
    totalDailyRenewableMWh: 10470,
    totalDailyDemandMWh: 10695,
    avgRenewableShare: 72.8,
    potentialShiftableLoadMWh: 250,
    estTotalSavings: '$31,450 / day',
    estCarbonAvoided: '52.8 tCO2 / day'
  }
};

export default {
  hourlyEnergyData,
  simulatedLoads,
  simulationMetadata
};
