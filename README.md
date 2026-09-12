# RE-FLOW AI — Renewable Energy Intelligence Platform

RE-FLOW AI is an intelligent optimization platform that aligns industrial and commercial power demand with dynamic solar and wind availability using machine learning forecasting, Google OR-Tools MILP optimization, and human-in-the-loop recommendations.

---

## Project Structure

The project is cleanly decoupled into standalone frontend and backend modules:

```
re-flow-ai/
├── frontend/                 # React 18 + Vite 6 UI Application
│   ├── src/                  # Components, Pages, State, API service
│   ├── index.html            # Vite HTML entry point
│   ├── vite.config.js        # Vite configuration & bundle chunking
│   ├── package.json          # Frontend dependencies & scripts
│   └── README.md             # Frontend guide
│
├── backend/                  # FastAPI 0.110+ Python REST API
│   ├── app/                  # Routes, SQLAlchemy models, MILP solver
│   │   ├── api/              # Endpoints (weather, generation, demand, scheduler)
│   │   ├── core/             # Configuration and settings
│   │   ├── database/         # SQLite/PostgreSQL engine & seeds
│   │   ├── models/           # DB tables (FlexibleLoad, EnergyTariff, etc.)
│   │   ├── schemas/          # Pydantic models
│   │   └── services/         # OR-Tools MILP optimizer, ML forecasting
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Container build
│   └── README.md             # Backend guide & API documentation
│
├── package.json              # Root convenience scripts
├── FEATURES_AND_LOGIC.md     # Platform architecture & feature specs
└── .gitignore                # Git exclusions
```

---

## Quick Start

### 1. Run Frontend (React + Vite)
From the root directory:
```bash
npm run dev
```
Or directly within the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

### 2. Run Backend (FastAPI)
From the `backend` folder:
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
FastAPI Interactive Swagger Docs: **http://localhost:8000/docs**
API Health Check: **http://localhost:8000/health**

---

## Key Features

1. **Clean Generation Forecasting**: Real-time solar and wind power generation models based on ambient weather and irradiance.
2. **Facility Demand & Baseline Profiling**: Time-of-Use (TOU) tariff tracking with peak period alerts.
3. **Flexible Load Management**: Track curtailable, deferrable, and thermal energy loads with prioritized flexibility scores.
4. **MILP Smart Scheduler**: Mixed Integer Linear Programming powered by Google OR-Tools to maximize self-consumption and minimize grid tariffs.
5. **Human-Actionable Recommendations**: Clear, confidence-scored actions with one-click approval workflows.
6. **Scenario Simulator**: What-if analysis for solar capacity upgrades, BESS addition, and tariff changes.
