# RE-FLOW AI — Backend API Layer

AI-Powered Renewable Energy Optimization Platform Backend built with **Python 3.11/3.12**, **FastAPI**, **Pydantic v2**, **Google OR-Tools (MILP)**, **SQLAlchemy**, and **Open-Meteo**.

---

## ⚡ Core Flow

$$\text{Weather + Renewable Data} \longrightarrow \text{Forecasting} \longrightarrow \text{Demand Prediction} \longrightarrow \text{Load Classification} \longrightarrow \text{MILP Optimization} \longrightarrow \text{Recommendation} \longrightarrow \text{Impact Tracking}$$

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- Python 3.11 or 3.12 installed.
- (Optional) PostgreSQL 15+ / TimescaleDB. If not present, the backend automatically uses an embedded SQLite database (`reflow.db`) for zero-friction setup.

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Initialize Database
The database automatically creates all tables and seeds demo baseline loads on server startup, or you can run:
```bash
python -m app.database.init_db
```

### 4. Start Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📁 Architecture Overview

```
backend/
├── app/
│   ├── main.py                     # FastAPI entry point, CORS, routers, /health
│   ├── core/
│   │   └── config.py               # Pydantic BaseSettings & environment parsing
│   ├── database/
│   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   ├── session.py              # Session factory with SQLite/PostgreSQL support
│   │   └── init_db.py              # DB schema creation and seed baseline loads
│   ├── models/
│   │   └── models.py               # SQLAlchemy models (User, Facility, Loads, etc.)
│   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── weather.py
│   │   ├── renewable.py
│   │   ├── demand.py
│   │   ├── loads.py
│   │   ├── forecast.py
│   │   ├── optimization.py
│   │   ├── recommendation.py
│   │   ├── simulator.py
│   │   ├── energy_score.py
│   │   ├── impact.py
│   │   └── dashboard.py
│   ├── services/                   # Modular domain logic
│   │   ├── weather_service.py      # HTTPX async client for Open-Meteo
│   │   ├── renewable_service.py    # Solar & Wind physical power curves
│   │   ├── demand_service.py       # Diurnal commercial facility demand
│   │   ├── forecast_service.py     # Aggregated 24-72h multi-horizon forecasting
│   │   ├── optimization_service.py # Google OR-Tools MILP solver
│   │   ├── recommendation_service.py # Executive human guidance generator
│   │   ├── simulation_service.py   # What-if scenario analysis
│   │   └── energy_score_service.py # 4-pillar score calculation
│   ├── api/                        # REST API endpoints
│   │   ├── weather.py
│   │   ├── renewable.py
│   │   ├── demand.py
│   │   ├── loads.py
│   │   ├── forecast.py
│   │   ├── optimization.py
│   │   ├── recommendation.py
│   │   ├── simulator.py
│   │   ├── energy_score.py
│   │   ├── impact.py
│   │   └── dashboard.py
│   └── utils/
│       └── helpers.py              # Tariffs, CO2 conversions, hour formatting
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

---

## 📡 API Endpoints & Sample Requests

### 1. Weather Integration (Open-Meteo)
#### `GET /api/weather/current`
```bash
curl -X GET "http://localhost:8000/api/weather/current?latitude=23.2156&longitude=72.6369"
```
*Response:*
```json
{
  "timestamp": "2026-09-12T10:00:00",
  "latitude": 23.2156,
  "longitude": 72.6369,
  "temperature_c": 31.4,
  "cloud_cover_percent": 12.0,
  "solar_radiation_w_m2": 820.0,
  "wind_speed_m_s": 5.4,
  "weather_description": "Clear sky",
  "is_simulated": false
}
```

#### `GET /api/weather/forecast`
```bash
curl -X GET "http://localhost:8000/api/weather/forecast?latitude=23.2156&longitude=72.6369&hours=24"
```

---

### 2. Renewable Generation API
#### `GET /api/renewable/solar`
```bash
curl -X GET "http://localhost:8000/api/renewable/solar"
```

#### `GET /api/renewable/wind`
```bash
curl -X GET "http://localhost:8000/api/renewable/wind"
```

#### `GET /api/renewable/forecast`
```bash
curl -X GET "http://localhost:8000/api/renewable/forecast"
```
*Response:*
```json
{
  "total_current_kw": 980.0,
  "peak_forecast_kw": 1050.0,
  "solar_capacity_kw": 1200.0,
  "wind_capacity_kw": 200.0,
  "forecast": [
    {
      "timestamp": "2026-09-12T13:00:00",
      "time": "13:00",
      "solar_generation_kw": 920.0,
      "wind_generation_kw": 80.0,
      "total_renewable_kw": 1000.0
    }
  ]
}
```

---

### 3. Facility Demand API
#### `GET /api/demand/current`
```bash
curl -X GET "http://localhost:8000/api/demand/current"
```

#### `GET /api/demand/history`
```bash
curl -X GET "http://localhost:8000/api/demand/history?hours=24"
```

#### `GET /api/demand/forecast`
```bash
curl -X GET "http://localhost:8000/api/demand/forecast?hours=24"
```

---

### 4. Flexible Load API (CRUD)
#### `GET /api/loads`
```bash
curl -X GET "http://localhost:8000/api/loads"
```

#### `POST /api/loads`
```bash
curl -X POST "http://localhost:8000/api/loads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "EV Fleet Depot Charging",
    "power_kw": 150,
    "duration_hours": 3,
    "earliest_start": "11:00",
    "latest_end": "16:00",
    "priority": "highly_flexible",
    "shiftable": true
  }'
```

#### `PUT /api/loads/{load_id}`
```bash
curl -X PUT "http://localhost:8000/api/loads/1" \
  -H "Content-Type: application/json" \
  -d '{"power_kw": 160}'
```

#### `DELETE /api/loads/{load_id}`
```bash
curl -X DELETE "http://localhost:8000/api/loads/1"
```

> [!IMPORTANT]
> **Safety Guarantee**: Loads with priority `"critical"` (e.g. Critical Server Room) are automatically enforced with `shiftable: false` and are **NEVER** shifted by the optimization engine.

---

### 5. Multi-Horizon Forecast API
#### `GET /api/forecast`
```bash
curl -X GET "http://localhost:8000/api/forecast?hours=24"
```
*Response:*
```json
{
  "forecast_hours": 24,
  "forecast": [
    {
      "time": "11:00",
      "timestamp": "2026-09-12T11:00:00",
      "solar_kw": 750.0,
      "wind_kw": 60.0,
      "total_renewable_kw": 810.0,
      "demand_kw": 620.0,
      "net_grid_kw": 0.0,
      "surplus_renewable_kw": 190.0,
      "temperature_c": 31.0,
      "cloud_cover_percent": 15.0,
      "solar_radiation_w_m2": 780.0,
      "wind_speed_m_s": 5.2
    }
  ]
}
```

---

### 6. Optimization API (Google OR-Tools MILP)
#### `POST /api/optimize`
```bash
curl -X POST "http://localhost:8000/api/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "forecast_hours": 24,
    "peak_demand_weight": 1.0,
    "renewable_weight": 2.0,
    "cost_weight": 1.5
  }'
```
*Response:*
```json
{
  "recommended_schedule": [
    {
      "load": "EV Fleet Charging",
      "start": "11:00",
      "end": "14:00",
      "power_kw": 150.0,
      "duration_hours": 3,
      "priority": "highly_flexible",
      "reason": "Aligned with peak solar surplus between 11:00 and 14:00."
    },
    {
      "load": "Critical Server Room & Life Safety",
      "start": "00:00",
      "end": "24:00",
      "power_kw": 180.0,
      "duration_hours": 24,
      "priority": "critical",
      "reason": "Critical facility load: Maintained without shift to protect uptime."
    }
  ],
  "estimated_savings": 420.0,
  "peak_reduction_percent": 30.0,
  "avoided_co2_kg": 650.0,
  "solver_status": "OPTIMAL"
}
```

---

### 7. AI Recommendation API
#### `POST /api/recommendation`
```bash
curl -X POST "http://localhost:8000/api/recommendation" \
  -H "Content-Type: application/json" \
  -d '{}'
```
*Response:*
```json
{
  "message": "Move EV fleet charging from 6:00 PM to 1:00 PM to use the predicted solar peak.",
  "reason": "Solar generation is highest between 11:00 AM and 3:00 PM, allowing up to 150 kW of zero-marginal-cost clean energy self-consumption.",
  "estimated_savings": 420.0,
  "avoided_co2_kg": 650.0,
  "confidence_score": 0.94,
  "action_items": [
    "Pre-cool HVAC buffer prior to 12:00 PM to shave peak afternoon demand.",
    "Schedule EV fleet depot charging window between 11:00 and 14:00.",
    "Ensure critical life safety and server room circuits remain isolated from automated load shifts."
  ]
}
```

---

### 8. What-If Energy Simulator
#### `POST /api/simulator`
```bash
curl -X POST "http://localhost:8000/api/simulator" \
  -H "Content-Type: application/json" \
  -d '{
    "additional_load_kw": 700,
    "start_time": "19:00",
    "duration_hours": 2
  }'
```
*Response:*
```json
{
  "original_peak_kw": 850.0,
  "new_peak_kw": 1550.0,
  "peak_increase_percent": 82.35,
  "renewable_availability_at_start_kw": 40.0,
  "recommended_window": "11:30-14:30",
  "estimated_savings": 1850.0,
  "original_scenario_cost": 492.0,
  "optimal_scenario_cost": 84.0,
  "estimated_co2_kg": 1008.0,
  "co2_reduction_kg": 850.0,
  "explanation": "Scheduling 700 kW at 19:00 surges peak demand by 82.4%. Relocating to 11:30-14:30 leverages on-site solar surplus, mitigating peak demand charges."
}
```

---

### 9. Energy Intelligence Score
#### `GET /api/energy-score`
```bash
curl -X GET "http://localhost:8000/api/energy-score?renewable_alignment=78&peak_demand_clipping=85&scheduling_efficiency=80&constraint_compliance=100"
```
*Response:*
```json
{
  "score": 82,
  "renewable_alignment": 78,
  "peak_demand_clipping": 85,
  "scheduling_efficiency": 80,
  "constraint_compliance": 100,
  "rating": "Optimal",
  "summary": "Superior renewable alignment and peak demand mitigation across all shiftable circuits."
}
```

---

### 10. Impact Tracking API
#### `GET /api/impact`
```bash
curl -X GET "http://localhost:8000/api/impact"
```
*Response:*
```json
{
  "cost_saving_percent": 28.0,
  "peak_reduction_percent": 30.0,
  "renewable_self_consumption_before": 12.0,
  "renewable_self_consumption_after": 88.0,
  "avoided_co2_kg": 650.0,
  "estimated_annual_savings_usd": 15420.0
}
```

---

### 11. Consolidated Dashboard API
#### `GET /api/dashboard`
```bash
curl -X GET "http://localhost:8000/api/dashboard"
```
*Returns the complete aggregated single-shot payload for the React/Next.js frontend:*
```json
{
  "current_generation": {
    "solar_kw": 920.0,
    "wind_kw": 80.0,
    "total_renewable_kw": 1000.0
  },
  "current_demand": {
    "current_demand_kw": 640.0,
    "baseline_demand_kw": 350.0,
    "peak_demand_kw": 850.0
  },
  "forecast": [...],
  "active_loads": [...],
  "recommended_actions": [...],
  "energy_score": {...},
  "impact": {...}
}
```

---

## 🐳 Docker Deployment

```bash
docker build -t reflow-backend .
docker run -p 8000:8000 reflow-backend
```
