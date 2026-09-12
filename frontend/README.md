# RE-FLOW AI — Frontend

The user interface for **RE-FLOW AI**, built with React 18, Vite 6, Tailwind CSS, Lucide React icons, and Recharts.

## Architecture

- **`src/pages/`**: Primary views (Dashboard, Solar & Wind Generation, Demand & Loads, Smart Scheduler, Recommendations, Scenario Simulator, Financial & Carbon Impact, AI Engine & Explainability, System Status).
- **`src/components/`**: Layout shell (Header, Sidebar), Notification center, and shared visual widgets.
- **`src/services/api.js`**: Backend API client with automatic fallback to high-fidelity simulated energy data if backend is offline.
- **`src/data/mockData.js`**: Default datasets and telemetry models.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
By default, the Vite dev server starts at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```
Build output is generated in `dist/`.

### 4. Environment Variables
Copy `.env.example` to `.env` if custom backend URL configuration is needed:
```bash
VITE_API_URL=http://localhost:8000
```
