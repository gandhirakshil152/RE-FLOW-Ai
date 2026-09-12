from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.init_db import init_db
from app.api.weather import router as weather_router
from app.api.renewable import router as renewable_router
from app.api.demand import router as demand_router
from app.api.loads import router as loads_router
from app.api.forecast import router as forecast_router
from app.api.optimization import router as optimization_router
from app.api.recommendation import router as recommendation_router
from app.api.simulator import router as simulator_router
from app.api.energy_score import router as energy_score_router
from app.api.impact import router as impact_router
from app.api.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed baseline loads on startup
    init_db()
    yield


app = FastAPI(
    title="RE-FLOW AI — Backend API",
    description=(
        "AI-Powered Renewable Energy Optimization Platform API. "
        "Predicts clean energy generation, models facility demand, identifies flexible loads, "
        "solves optimal operating schedules using Google OR-Tools MILP, and provides "
        "human-actionable recommendations that reduce electricity cost, peak demand, and CO₂ emissions."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Health Check
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "online",
    }


# Include all modular API routers under /api
api_prefix = settings.API_V1_STR

app.include_router(weather_router, prefix=api_prefix)
app.include_router(renewable_router, prefix=api_prefix)
app.include_router(demand_router, prefix=api_prefix)
app.include_router(loads_router, prefix=api_prefix)
app.include_router(forecast_router, prefix=api_prefix)
app.include_router(optimization_router, prefix=api_prefix)
app.include_router(recommendation_router, prefix=api_prefix)
app.include_router(simulator_router, prefix=api_prefix)
app.include_router(energy_score_router, prefix=api_prefix)
app.include_router(impact_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)


# Root welcome endpoint
@app.get("/", tags=["System Health"])
def root():
    return {
        "project": "RE-FLOW AI",
        "description": "Renewable Energy Optimization & Decision Platform",
        "documentation": "/docs",
        "health": "/health",
        "api_v1": api_prefix,
    }
