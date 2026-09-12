from app.schemas.weather import WeatherCurrent, WeatherHourlyPoint, WeatherForecastResponse
from app.schemas.renewable import RenewablePoint, SolarGenerationResponse, WindGenerationResponse, RenewableForecastResponse
from app.schemas.demand import DemandPoint, DemandCurrentResponse, DemandHistoryResponse, DemandForecastResponse
from app.schemas.loads import LoadBase, LoadCreate, LoadUpdate, LoadResponse
from app.schemas.forecast import ForecastDataPoint, ForecastResponse
from app.schemas.optimization import OptimizationRequest, OptimizationResponse, RecommendedScheduleItem
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.schemas.simulator import SimulatorRequest, SimulatorResponse
from app.schemas.energy_score import EnergyScoreResponse
from app.schemas.impact import ImpactResponse, ImpactMetricComparison
from app.schemas.dashboard import DashboardResponse

__all__ = [
    "WeatherCurrent",
    "WeatherHourlyPoint",
    "WeatherForecastResponse",
    "RenewablePoint",
    "SolarGenerationResponse",
    "WindGenerationResponse",
    "RenewableForecastResponse",
    "DemandPoint",
    "DemandCurrentResponse",
    "DemandHistoryResponse",
    "DemandForecastResponse",
    "LoadBase",
    "LoadCreate",
    "LoadUpdate",
    "LoadResponse",
    "ForecastDataPoint",
    "ForecastResponse",
    "OptimizationRequest",
    "OptimizationResponse",
    "RecommendedScheduleItem",
    "RecommendationRequest",
    "RecommendationResponse",
    "SimulatorRequest",
    "SimulatorResponse",
    "EnergyScoreResponse",
    "ImpactResponse",
    "ImpactMetricComparison",
    "DashboardResponse",
]
