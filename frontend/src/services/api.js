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

export async function getForecastData(params = 24) {
  try {
    let query = '';
    if (typeof params === 'number') {
      query = `?hours=${params}`;
    } else if (params && typeof params === 'object') {
      const q = new URLSearchParams();
      if (params.date) q.append('date', params.date);
      if (params.days) q.append('days', params.days);
      if (params.hours) q.append('hours', params.hours);
      if (params.latitude) q.append('latitude', params.latitude);
      if (params.longitude) q.append('longitude', params.longitude);
      const s = q.toString();
      if (s) query = `?${s}`;
    }
    const res = await fetch(`${API_BASE_URL}/api/forecast${query}`);
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

export async function getMLMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/metrics`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] ML Metrics API unreachable:', err.message);
  }
  return null;
}

export async function getMLForecast(params = 24) {
  try {
    let query = '';
    if (typeof params === 'number') {
      query = `?hours=${params}`;
    } else if (params && typeof params === 'object') {
      const q = new URLSearchParams();
      if (params.date) q.append('date', params.date);
      if (params.days) q.append('days', params.days);
      if (params.hours) q.append('hours', params.hours);
      if (params.latitude) q.append('latitude', params.latitude);
      if (params.longitude) q.append('longitude', params.longitude);
      const s = q.toString();
      if (s) query = `?${s}`;
    }
    const res = await fetch(`${API_BASE_URL}/api/ml/forecast${query}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] ML Forecast API unreachable:', err.message);
  }
  return null;
}


export async function getMLAnomalies(hours = 24) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/anomalies?hours=${hours}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] ML Anomalies API unreachable:', err.message);
  }
  return null;
}

export async function askAICopilot(query, context = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] AI Copilot API unreachable:', err.message);
  }
  return null;
}

export async function getScheduleExplanation() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/explain`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] AI Explanation API unreachable:', err.message);
  }
  return null;
}

export async function getCleanEnergyLocations() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/locations`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Clean Energy Locations API unreachable:', err.message);
  }
  return [];
}

export async function retrainMLModel(payload = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RE-FLOW API] Retrain ML API unreachable:', err.message);
  }
  return null;
}


