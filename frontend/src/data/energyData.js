/**
 * RE-FLOW AI — Simulated Data Layer
 * 
 * PROTOTYPE / SYNTHETIC DATASET:
 * Realistic 24-hour simulated energy availability, grid demand, and flexible loads.
 * Illustrates the classic renewable supply-demand mismatch (solar midday surplus vs evening peak deficit).
 * 
 * Note: No live APIs connected. All numbers represent synthetic prototype simulation.
 */

// 24-Hour Hourly Energy Availability & Demand Telemetry
export const hourlyEnergyData = [
  {
    time: '00:00',
    renewable: 190, // MW (Wind only)
    demand: 270,    // MW
    renewableUtilization: 70.4, // %
    estimatedCost: 38,          // $/MWh
    carbonImpact: 310           // gCO2/kWh
  },
  {
    time: '01:00',
    renewable: 210,
    demand: 255,
    renewableUtilization: 82.4,
    estimatedCost: 35,
    carbonImpact: 295
  },
  {
    time: '02:00',
    renewable: 230,
    demand: 245,
    renewableUtilization: 93.9,
    estimatedCost: 32,
    carbonImpact: 280
  },
  {
    time: '03:00',
    renewable: 240,
    demand: 240,
    renewableUtilization: 100.0,
    estimatedCost: 30,
    carbonImpact: 265
  },
  {
    time: '04:00',
    renewable: 235,
    demand: 250,
    renewableUtilization: 94.0,
    estimatedCost: 34,
    carbonImpact: 275
  },
  {
    time: '05:00',
    renewable: 220,
    demand: 285,
    renewableUtilization: 77.2,
    estimatedCost: 44,
    carbonImpact: 315
  },
  {
    time: '06:00',
    renewable: 260, // Dawn: Solar begins
    demand: 340,
    renewableUtilization: 76.5,
    estimatedCost: 52,
    carbonImpact: 300
  },
  {
    time: '07:00',
    renewable: 340,
    demand: 395,
    renewableUtilization: 86.1,
    estimatedCost: 58,
    carbonImpact: 270
  },
  {
    time: '08:00',
    renewable: 460,
    demand: 440,
    renewableUtilization: 100.0,
    estimatedCost: 48,
    carbonImpact: 220
  },
  {
    time: '09:00',
    renewable: 580,
    demand: 465,
    renewableUtilization: 100.0,
    estimatedCost: 36,
    carbonImpact: 175
  },
  {
    time: '10:00',
    renewable: 680,
    demand: 475,
    renewableUtilization: 100.0,
    estimatedCost: 28,
    carbonImpact: 145
  },
  {
    time: '11:00',
    renewable: 760, // High solar surplus
    demand: 480,
    renewableUtilization: 100.0,
    estimatedCost: 22,
    carbonImpact: 120
  },
  {
    time: '12:00', // Midday solar peak: Highest clean surplus
    renewable: 820,
    demand: 485,
    renewableUtilization: 100.0,
    estimatedCost: 18,
    carbonImpact: 98
  },
  {
    time: '13:00',
    renewable: 800,
    demand: 490,
    renewableUtilization: 100.0,
    estimatedCost: 20,
    carbonImpact: 105
  },
  {
    time: '14:00',
    renewable: 740,
    demand: 495,
    renewableUtilization: 100.0,
    estimatedCost: 24,
    carbonImpact: 125
  },
  {
    time: '15:00',
    renewable: 630,
    demand: 510,
    renewableUtilization: 100.0,
    estimatedCost: 32,
    carbonImpact: 160
  },
  {
    time: '16:00', // Solar ramps down
    renewable: 480,
    demand: 535,
    renewableUtilization: 89.7,
    estimatedCost: 48,
    carbonImpact: 215
  },
  {
    time: '17:00',
    renewable: 340,
    demand: 580,
    renewableUtilization: 58.6,
    estimatedCost: 75,
    carbonImpact: 290
  },
  {
    time: '18:00', // Evening peak begins: Renewable drops, demand spikes
    renewable: 260,
    demand: 630,
    renewableUtilization: 41.3,
    estimatedCost: 112,
    carbonImpact: 395
  },
  {
    time: '19:00', // Maximum evening peak mismatch
    renewable: 270,
    demand: 645,
    renewableUtilization: 41.9,
    estimatedCost: 125,
    carbonImpact: 415
  },
  {
    time: '20:00',
    renewable: 280,
    demand: 610,
    renewableUtilization: 45.9,
    estimatedCost: 108,
    carbonImpact: 390
  },
  {
    time: '21:00',
    renewable: 270,
    demand: 540,
    renewableUtilization: 50.0,
    estimatedCost: 82,
    carbonImpact: 360
  },
  {
    time: '22:00',
    renewable: 250,
    demand: 440,
    renewableUtilization: 56.8,
    estimatedCost: 58,
    carbonImpact: 335
  },
  {
    time: '23:00',
    renewable: 220,
    demand: 340,
    renewableUtilization: 64.7,
    estimatedCost: 44,
    carbonImpact: 320
  }
];

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
