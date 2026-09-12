import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { hourlyEnergyData as defaultHourlyEnergyData, simulatedLoads, simulationMetadata } from '../data/energyData';
import { optimizeLoadSchedule } from '../data/aiEngine';
import {
  checkBackendHealth,
  getDashboardData,
  getCurrentWeather,
  runBackendOptimization,
} from '../services/api';

const SimulationContext = createContext(null);

// Pure calculation for the What-If Simulator
export function calculateSimulation(evCount, startTime, kwhPerEV, scen) {
  let demandMultiplier = 1.0;
  let renewableFactor = 1.0;
  let tariffMultiplier = 1.0;

  switch (scen) {
    case 'High EV Demand':
      demandMultiplier = 1.25;
      renewableFactor = 1.0;
      tariffMultiplier = 1.15;
      break;
    case 'Factory Peak':
      demandMultiplier = 1.35;
      renewableFactor = 0.95;
      tariffMultiplier = 1.25;
      break;
    case 'Low Renewable Generation':
      demandMultiplier = 1.05;
      renewableFactor = 0.70;
      tariffMultiplier = 1.35;
      break;
    default:
      demandMultiplier = 1.0;
      renewableFactor = 1.0;
      tariffMultiplier = 1.0;
  }

  const totalMWh = (evCount * kwhPerEV) / 1000;
  const hour = parseInt(startTime.split(':')[0], 10);
  const isEveningPeak = hour >= 17 && hour <= 21;
  const isMiddaySurplus = hour >= 11 && hour <= 15;

  const loadScale = totalMWh / 5.0; // Baseline: 100 EVs @ 50 kWh = 5 MWh

  let withoutPeakChange;
  let withoutRenewableChange;
  let withoutCostINR;
  let withoutCO2Kg;

  let withPeakChange;
  let withRenewableChange;
  let withCostINR;
  let withCO2Kg;

  if (isEveningPeak) {
    withoutPeakChange = Math.round(18 * loadScale * demandMultiplier);
    withoutRenewableChange = -Math.round(11 * loadScale * (1 / renewableFactor));
    withoutCostINR = Math.round(8400 * loadScale * tariffMultiplier);
    withoutCO2Kg = Math.round(32 * loadScale * (1 / renewableFactor));

    withPeakChange = -Math.round(14 * loadScale * demandMultiplier);
    withRenewableChange = Math.round(23 * loadScale * renewableFactor);
    withCostINR = Math.round(6100 * loadScale * tariffMultiplier);
    withCO2Kg = -Math.round(29 * loadScale * renewableFactor);
  } else if (isMiddaySurplus) {
    withoutPeakChange = -Math.round(8 * loadScale);
    withoutRenewableChange = Math.round(16 * loadScale);
    withoutCostINR = Math.round(6500 * loadScale);
    withoutCO2Kg = -Math.round(20 * loadScale);

    withPeakChange = -Math.round(15 * loadScale);
    withRenewableChange = Math.round(25 * loadScale);
    withCostINR = Math.round(5800 * loadScale);
    withCO2Kg = -Math.round(31 * loadScale);
  } else {
    withoutPeakChange = Math.round(6 * loadScale);
    withoutRenewableChange = -Math.round(4 * loadScale);
    withoutCostINR = Math.round(7200 * loadScale);
    withoutCO2Kg = Math.round(15 * loadScale);

    withPeakChange = -Math.round(12 * loadScale);
    withRenewableChange = Math.round(20 * loadScale);
    withCostINR = Math.round(5900 * loadScale);
    withCO2Kg = -Math.round(26 * loadScale);
  }

  const netSavingsINR = Math.max(0, withoutCostINR - withCostINR);
  const netCO2SavedKg = Math.abs(withoutCO2Kg) + Math.abs(withCO2Kg);
  const peakShavedPercent = Math.abs(withPeakChange);

  const engineDecision = optimizeLoadSchedule({
    loadFlexibility: 'High',
    currentSchedule: startTime,
    allowedTimeWindow: { earliest: '13:00', latest: '16:00' },
    energyRequirement: totalMWh * 1000,
    loadName: `${evCount} EV Fleet`,
  });

  return {
    totalMWh,
    without: {
      peakDemand: withoutPeakChange > 0 ? `+${withoutPeakChange}%` : `${withoutPeakChange}%`,
      renewableUsage: withoutRenewableChange > 0 ? `+${withoutRenewableChange}%` : `${withoutRenewableChange}%`,
      estimatedCost: `₹${withoutCostINR.toLocaleString()}`,
      carbonImpact: withoutCO2Kg > 0 ? `+${withoutCO2Kg} kg` : `${withoutCO2Kg} kg`,
    },
    withReflow: {
      peakDemand: withPeakChange > 0 ? `+${withPeakChange}%` : `${withPeakChange}%`,
      renewableUsage: withRenewableChange > 0 ? `+${withRenewableChange}%` : `${withRenewableChange}%`,
      estimatedCost: `₹${withCostINR.toLocaleString()}`,
      carbonImpact: withCO2Kg > 0 ? `+${withCO2Kg} kg` : `${withCO2Kg} kg`,
    },
    netSavingsINR,
    netCO2SavedKg,
    peakShavedPercent,
    decisionEngine: engineDecision,
    raw: {
      withoutCostINR,
      withCostINR,
      withoutCO2Kg,
      withCO2Kg,
      withRenewableChange,
    },
    chartData: [
      {
        metric: 'Peak Demand',
        'Without RE-FLOW': withoutPeakChange,
        'With RE-FLOW': withPeakChange,
      },
      {
        metric: 'Renewable Usage',
        'Without RE-FLOW': withoutRenewableChange,
        'With RE-FLOW': withRenewableChange,
      },
    ],
  };
}

export function SimulationProvider({ children }) {
  // Navigation state (defaults to 'dashboard', no reload)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  // Live Backend State
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  const [liveGeneration, setLiveGeneration] = useState(null);
  const [hourlyEnergyData, setHourlyEnergyData] = useState(defaultHourlyEnergyData);

  // Helper to map live backend forecast points to chart-compatible structure
  const mapBackendForecast = useCallback((forecastPoints) => {
    return forecastPoints.map((p) => {
      const ren = Math.round(p.total_renewable_kw);
      const dem = Math.round(p.demand_kw);
      const util = dem > 0 ? Math.min(100, Math.round((Math.min(ren, dem) / dem) * 100 * 10) / 10) : 0;
      const hourNum = parseInt(p.time.split(':')[0], 10);
      const isPeakTariff = (hourNum >= 11 && hourNum <= 15) || (hourNum >= 18 && hourNum <= 21);

      return {
        time: p.time,
        renewable: ren,
        demand: dem,
        solar_kw: Math.round(p.solar_kw || 0),
        wind_kw: Math.round(p.wind_kw || 0),
        renewableUtilization: util,
        estimatedCost: isPeakTariff ? 54 : 28,
        carbonImpact: p.net_grid_kw > 0 ? Math.round((p.net_grid_kw / Math.max(1, dem)) * 420) : 35,
        temperature_c: p.temperature_c,
        cloud_cover_percent: p.cloud_cover_percent,
        solar_radiation_w_m2: p.solar_radiation_w_m2,
        wind_speed_m_s: p.wind_speed_m_s,
      };
    });
  }, []);

  // Fetch Live Backend Data on mount
  useEffect(() => {
    let isMounted = true;
    async function initLiveBackend() {
      try {
        const health = await checkBackendHealth();
        if (health && isMounted) {
          setIsLiveBackend(true);
          const dash = await getDashboardData();
          if (dash && dash.forecast && isMounted) {
            setHourlyEnergyData(mapBackendForecast(dash.forecast));
            setLiveGeneration(dash.current_generation);
          }
          const weather = await getCurrentWeather();
          if (weather && isMounted) {
            setLiveWeather(weather);
          }
        }
      } catch (err) {
        if (isMounted) setIsLiveBackend(false);
      }
    }
    initLiveBackend();
    return () => { isMounted = false; };
  }, [mapBackendForecast]);

  // What-If Simulator Inputs
  const [simulatorParams, setSimulatorParams] = useState({
    numEVs: 100,
    chargingStartTime: '19:00',
    energyPerEV: 50,
    scenario: 'Normal',
  });

  // Simulator Results
  const simulatorResult = useMemo(() => {
    return calculateSimulation(
      simulatorParams.numEVs,
      simulatorParams.chargingStartTime,
      simulatorParams.energyPerEV,
      simulatorParams.scenario
    );
  }, [simulatorParams]);

  const updateSimulatorParams = useCallback((updates) => {
    setSimulatorParams((prev) => ({ ...prev, ...updates }));
  }, []);

  // Smart Scheduler State & Optimization Engine
  const [schedulerState, setSchedulerState] = useState({
    loadType: 'EV Charging',
    energyRequired: 45000,
    currentSchedule: '18:00',
    earliestStart: '10:00',
    latestStart: '16:00',
    isOptimizing: false,
    hasOptimized: false,
    optimizationResult: null,
  });

  const runSchedulerOptimization = useCallback(async (params) => {
    const activeParams = { ...schedulerState, ...params };
    setSchedulerState((prev) => ({ ...prev, ...params, isOptimizing: true }));

    // Try calling real Google OR-Tools MILP backend
    let backendResult = null;
    try {
      backendResult = await runBackendOptimization({
        forecast_hours: 24,
        loads: [
          {
            id: 1,
            name: activeParams.loadType,
            power_kw: Math.round(activeParams.energyRequired / 300),
            duration_hours: 3,
            earliest_start: activeParams.earliestStart,
            latest_end: activeParams.latestStart,
            priority: 'highly_flexible',
            shiftable: true,
          },
          {
            id: 2,
            name: 'Critical Facility Circuit',
            power_kw: 180,
            duration_hours: 24,
            earliest_start: '00:00',
            latest_end: '23:00',
            priority: 'critical',
            shiftable: false,
          }
        ]
      });
    } catch (err) {
      // Backend unavailable
    }

    if (backendResult && backendResult.recommended_schedule) {
      const scheduledItem = backendResult.recommended_schedule.find((s) => s.priority !== 'critical') || backendResult.recommended_schedule[0];
      const recStartHour = parseInt(scheduledItem.start.split(':')[0], 10);
      const recEndHour = parseInt(scheduledItem.end.split(':')[0], 10);
      const startAmpm = recStartHour >= 12 ? 'PM' : 'AM';
      const endAmpm = recEndHour >= 12 ? 'PM' : 'AM';
      const start12 = recStartHour > 12 ? recStartHour - 12 : recStartHour === 0 ? 12 : recStartHour;
      const end12 = recEndHour > 12 ? recEndHour - 12 : recEndHour === 0 ? 12 : recEndHour;
      const recommendedWindowStr = `${start12}:00 ${startAmpm} – ${end12}:00 ${endAmpm}`;

      const currentHour = parseInt(activeParams.currentSchedule.split(':')[0], 10);
      const currentHour12 = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
      const currentAmpm = currentHour >= 12 ? 'PM' : 'AM';
      const currentFormattedStr = `${currentHour12}:00 ${currentAmpm}`;

      const result = {
        recommendedTime: recommendedWindowStr,
        recommendedWindow: recommendedWindowStr,
        currentScheduleStr: currentFormattedStr,
        renewableScore: 94,
        demandScore: 89,
        estimatedEnergyOptimization: `${backendResult.peak_reduction_percent}%`,
        estimatedCostImpact: `-$${backendResult.estimated_savings}`,
        costSavings: `-$${backendResult.estimated_savings}`,
        costSavingsINR: Math.round(backendResult.estimated_savings * 83),
        estimatedCarbonImpact: `-${backendResult.avoided_co2_kg} kg`,
        co2Avoided: `-${backendResult.avoided_co2_kg} kg`,
        co2AvoidedKg: backendResult.avoided_co2_kg,
        confidence: '96% (Google OR-Tools MILP)',
        explanation: `Google OR-Tools solver identified ${recommendedWindowStr} as the optimal window to consume surplus solar, mitigating peak demand by ${backendResult.peak_reduction_percent}%.`,
        beforeUtilization: 48,
        afterUtilization: 95,
        timestamp: new Date().toLocaleTimeString(),
        isBackendSolver: true,
      };

      setSchedulerState((prev) => ({
        ...prev,
        ...params,
        isOptimizing: false,
        hasOptimized: true,
        optimizationResult: result,
      }));
      return;
    }

    // Local deterministic fallback
    const engineDecision = optimizeLoadSchedule({
      hourlyData: hourlyEnergyData,
      loadFlexibility: activeParams.flexibility || 'High',
      currentSchedule: activeParams.currentSchedule,
      allowedTimeWindow: {
        earliest: activeParams.earliestStart,
        latest: activeParams.latestStart,
      },
      energyRequirement: activeParams.energyRequired,
      loadName: activeParams.loadType,
    });

    const currentHour = parseInt(activeParams.currentSchedule.split(':')[0], 10);
    const currentHour12 = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
    const currentAmpm = currentHour >= 12 ? 'PM' : 'AM';
    const currentFormattedStr = `${currentHour12}:00 ${currentAmpm}`;

    const result = {
      ...engineDecision,
      currentScheduleStr: currentFormattedStr,
      recommendedWindow: engineDecision.recommendedTime,
      beforeUtilization: 71,
      afterUtilization: 89,
      costSavings: engineDecision.estimatedCostImpact,
      costSavingsINR: engineDecision.costSavingsINR,
      co2Avoided: engineDecision.estimatedCarbonImpact,
      co2AvoidedKg: engineDecision.co2AvoidedKg,
      bestDataPoint: engineDecision.bestSlotDataPoint,
      timestamp: new Date().toLocaleTimeString(),
      isBackendSolver: false,
    };

    setSchedulerState((prev) => ({
      ...prev,
      ...params,
      isOptimizing: false,
      hasOptimized: true,
      optimizationResult: result,
    }));
  }, [schedulerState, hourlyEnergyData]);

  // Telemetry Refresh Handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const dash = await getDashboardData();
      if (dash && dash.forecast) {
        setIsLiveBackend(true);
        setHourlyEnergyData(mapBackendForecast(dash.forecast));
        setLiveGeneration(dash.current_generation);
      }
      const weather = await getCurrentWeather();
      if (weather) {
        setLiveWeather(weather);
      }
    } catch (err) {
      // Keep existing
    } finally {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [mapBackendForecast]);

  // Shared Impact Metrics
  const latestImpactMetrics = useMemo(() => {
    const hasSchedulerRun = schedulerState.hasOptimized && schedulerState.optimizationResult;
    
    const costSaving = hasSchedulerRun
      ? schedulerState.optimizationResult.costSavings
      : `₹${simulatorResult.netSavingsINR.toLocaleString()}`;

    const co2Avoided = hasSchedulerRun
      ? schedulerState.optimizationResult.co2Avoided
      : `${simulatorResult.netCO2SavedKg} kg`;

    const energyOptimized = hasSchedulerRun
      ? (schedulerState.optimizationResult.estimatedEnergyOptimization || '18%')
      : `${simulatorResult.peakShavedPercent}%`;

    const renewableUtil = hasSchedulerRun
      ? '+23%'
      : `+${simulatorResult.raw.withRenewableChange}%`;

    return {
      energyOptimized,
      costSaving,
      co2Avoided,
      renewableUtil,
      source: hasSchedulerRun ? (schedulerState.optimizationResult.isBackendSolver ? 'Google OR-Tools MILP Solver' : 'Smart Scheduler AI Dispatch') : 'What-If Dynamic Simulation',
    };
  }, [simulatorResult, schedulerState]);

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);

  const createDemoSchedulerResult = useCallback(() => {
    const engineDecision = optimizeLoadSchedule({
      hourlyData: defaultHourlyEnergyData,
      loadFlexibility: 'Very High',
      currentSchedule: '18:00',
      allowedTimeWindow: {
        earliest: '13:00',
        latest: '16:00',
      },
      energyRequirement: 50000,
      loadName: '100 EV Fleet Charging',
    });

    return {
      ...engineDecision,
      currentScheduleStr: '6:00 PM',
      recommendedWindow: engineDecision.recommendedTime,
      beforeUtilization: 41,
      afterUtilization: 96,
      costSavings: engineDecision.estimatedCostImpact,
      costSavingsINR: engineDecision.costSavingsINR,
      co2Avoided: engineDecision.estimatedCarbonImpact,
      co2AvoidedKg: engineDecision.co2AvoidedKg,
      bestDataPoint: engineDecision.bestSlotDataPoint,
      timestamp: 'Demo Preset Active',
    };
  }, []);

  const activateDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setSimulatorParams({
      numEVs: 100,
      chargingStartTime: '18:00',
      energyPerEV: 50,
      scenario: 'High EV Demand',
    });

    const demoResult = createDemoSchedulerResult();
    setSchedulerState({
      loadType: 'EV Charging',
      energyRequired: 50000,
      currentSchedule: '18:00',
      earliestStart: '13:00',
      latestStart: '16:00',
      flexibility: 'Very High',
      isOptimizing: false,
      hasOptimized: true,
      optimizationResult: demoResult,
    });
  }, [createDemoSchedulerResult]);

  const deactivateDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setSimulatorParams({
      numEVs: 100,
      chargingStartTime: '19:00',
      energyPerEV: 50,
      scenario: 'Normal',
    });
    setSchedulerState({
      loadType: 'EV Charging',
      energyRequired: 45000,
      currentSchedule: '18:00',
      earliestStart: '10:00',
      latestStart: '16:00',
      flexibility: 'High',
      isOptimizing: false,
      hasOptimized: false,
      optimizationResult: null,
    });
  }, []);

  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) {
      deactivateDemoMode();
    } else {
      activateDemoMode();
    }
  }, [isDemoMode, activateDemoMode, deactivateDemoMode]);

  const value = {
    activeTab,
    setActiveTab,
    isRefreshing,
    handleRefresh,
    lastUpdated,

    // Live backend connection
    isLiveBackend,
    liveWeather,
    liveGeneration,

    isDemoMode,
    activateDemoMode,
    deactivateDemoMode,
    toggleDemoMode,

    hourlyEnergyData,
    simulatedLoads,
    simulationMetadata,

    simulatorParams,
    simulatorResult,
    updateSimulatorParams,

    schedulerState,
    setSchedulerState,
    runSchedulerOptimization,

    latestImpactMetrics,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
