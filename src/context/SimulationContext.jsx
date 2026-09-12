import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { hourlyEnergyData, simulatedLoads, simulationMetadata } from '../data/energyData';
import { optimizeLoadSchedule } from '../data/aiEngine';

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

  // What-If Simulator Inputs
  const [simulatorParams, setSimulatorParams] = useState({
    numEVs: 100,
    chargingStartTime: '19:00',
    energyPerEV: 50,
    scenario: 'Normal',
  });

  // Simulator Results: Update immediately whenever user changes any simulator inputs
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

  const runSchedulerOptimization = useCallback((params) => {
    const activeParams = { ...schedulerState, ...params };
    setSchedulerState((prev) => ({ ...prev, ...params, isOptimizing: true }));

    // Run local deterministic RE-FLOW AI Decision Engine
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
    };

    setSchedulerState((prev) => ({
      ...prev,
      ...params,
      isOptimizing: false,
      hasOptimized: true,
      optimizationResult: result,
    }));
  }, [schedulerState]);

  // Telemetry Refresh Handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 600);
  }, []);

  // Shared Impact Metrics (Requirement 10: Impact Center should use latest simulated results when possible)
  const latestImpactMetrics = useMemo(() => {
    // If scheduler has optimized, use scheduler or simulator values harmoniously
    const hasSchedulerRun = schedulerState.hasOptimized && schedulerState.optimizationResult;
    
    // Dynamic cost saving: if simulator was adjusted or scheduler was run
    const costSaving = hasSchedulerRun
      ? schedulerState.optimizationResult.costSavings
      : `₹${simulatorResult.netSavingsINR.toLocaleString()}`;

    const co2Avoided = hasSchedulerRun
      ? schedulerState.optimizationResult.co2Avoided
      : `${simulatorResult.netCO2SavedKg} kg`;

    const energyOptimized = hasSchedulerRun
      ? '18%'
      : `${simulatorResult.peakShavedPercent}%`;

    const renewableUtil = hasSchedulerRun
      ? '+23%'
      : `+${simulatorResult.raw.withRenewableChange}%`;

    return {
      energyOptimized,
      costSaving,
      co2Avoided,
      renewableUtil,
      source: hasSchedulerRun ? 'Smart Scheduler AI Dispatch' : 'What-If Dynamic Simulation',
    };
  }, [simulatorResult, schedulerState]);

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper to generate the predefined optimal demo scenario for scheduler
  const createDemoSchedulerResult = useCallback(() => {
    const engineDecision = optimizeLoadSchedule({
      hourlyData: hourlyEnergyData,
      loadFlexibility: 'Very High',
      currentSchedule: '18:00',
      allowedTimeWindow: {
        earliest: '13:00',
        latest: '16:00',
      },
      energyRequirement: 50000, // 100 EVs * 50 kWh
      loadName: '100 EV Fleet Charging',
    });

    return {
      ...engineDecision,
      currentScheduleStr: '6:00 PM',
      recommendedWindow: engineDecision.recommendedTime, // 1:00 PM – 2:00 PM
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

  // Activate predefined impressive demo scenario
  const activateDemoMode = useCallback(() => {
    setIsDemoMode(true);
    // 1. Set EV charging scenario to 100 EVs, 6:00 PM, 50 kWh, High EV Demand
    setSimulatorParams({
      numEVs: 100,
      chargingStartTime: '18:00',
      energyPerEV: 50,
      scenario: 'High EV Demand',
    });

    // 2. Set scheduler state to 100 EV fleet, 6:00 PM current, 1:00 PM optimal, immediate recommendation
    const demoResult = createDemoSchedulerResult();
    setSchedulerState({
      loadType: 'EV Charging',
      energyRequired: 50000,
      currentSchedule: '18:00',
      earliestStart: '13:00',
      latestStart: '16:00',
      flexibility: 'Very High',
      isOptimizing: false,
      hasOptimized: true, // Recommendation visible immediately
      optimizationResult: demoResult,
    });
  }, [createDemoSchedulerResult]);

  // Deactivate and cleanly restore standard behavior
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

  // Toggle between demo mode and normal mode
  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) {
      deactivateDemoMode();
    } else {
      activateDemoMode();
    }
  }, [isDemoMode, activateDemoMode, deactivateDemoMode]);

  const value = {
    // Navigation
    activeTab,
    setActiveTab,
    isRefreshing,
    handleRefresh,
    lastUpdated,

    // Demo Mode
    isDemoMode,
    activateDemoMode,
    deactivateDemoMode,
    toggleDemoMode,

    // Data layer
    hourlyEnergyData,
    simulatedLoads,
    simulationMetadata,

    // Simulator
    simulatorParams,
    simulatorResult,
    updateSimulatorParams,

    // Scheduler
    schedulerState,
    setSchedulerState,
    runSchedulerOptimization,

    // Impact
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
