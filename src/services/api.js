/**
 * RE-FLOW AI - Backend API Integration Client
 * Connects the React/Vite Frontend with the FastAPI Backend Layer (port 8000).
 * Gracefully falls back to local data if the backend server is unreachable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend offline
  }
  return null;
}

export async function getDashboardData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Backend unreachable, using fallback dataset:', err.message);
  }
  return null;
}

export async function getCurrentWeather(lat = 23.2156, lon = 72.6369) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/weather/current?latitude=${lat}&longitude=${lon}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Weather API unreachable:', err.message);
  }
  return null;
}

export async function getForecastData(hours = 24) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/forecast?hours=${hours}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Forecast API unreachable:', err.message);
  }
  return null;
}

export async function getLoads() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/loads`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Loads API unreachable:', err.message);
  }
  return null;
}

export async function runBackendOptimization(payload = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] OR-Tools Optimization unreachable, using local solver:', err.message);
  }
  return null;
}

export async function runBackendSimulation(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/simulator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Simulator API unreachable:', err.message);
  }
  return null;
}

export async function getEnergyScore() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/energy-score`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Energy Score API unreachable:', err.message);
  }
  return null;
}

export async function getImpactData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/impact`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Impact API unreachable:', err.message);
  }
  return null;
}
