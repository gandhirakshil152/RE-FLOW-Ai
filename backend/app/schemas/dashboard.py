from typing import List, Dict, Any
from pydantic import BaseModel
from app.schemas.loads import LoadResponse
from app.schemas.forecast import ForecastDataPoint
from app.schemas.energy_score import EnergyScoreResponse
from app.schemas.impact import ImpactResponse


class DashboardResponse(BaseModel):
    current_generation: Dict[str, Any]
    current_demand: Dict[str, Any]
    forecast: List[ForecastDataPoint]
    active_loads: List[LoadResponse]
    recommended_actions: List[Dict[str, Any]]
    energy_score: EnergyScoreResponse
    impact: ImpactResponse
