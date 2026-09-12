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

__all__ = [
    "weather_router",
    "renewable_router",
    "demand_router",
    "loads_router",
    "forecast_router",
    "optimization_router",
    "recommendation_router",
    "simulator_router",
    "energy_score_router",
    "impact_router",
    "dashboard_router",
]
