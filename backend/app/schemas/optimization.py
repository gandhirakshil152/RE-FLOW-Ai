from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.schemas.loads import LoadBase, LoadResponse


class RecommendedScheduleItem(BaseModel):
    load: str
    start: str
    end: str
    power_kw: float
    duration_hours: int
    priority: str = "flexible"
    reason: Optional[str] = None


class OptimizationRequest(BaseModel):
    loads: Optional[List[LoadResponse]] = None
    forecast_hours: int = Field(24, ge=12, le=72)
    tariff_override: Optional[Dict[str, float]] = None
    peak_demand_weight: float = Field(1.0, ge=0.0, le=5.0)
    renewable_weight: float = Field(2.0, ge=0.0, le=5.0)
    cost_weight: float = Field(1.5, ge=0.0, le=5.0)


class OptimizationResponse(BaseModel):
    recommended_schedule: List[RecommendedScheduleItem]
    estimated_savings: float
    peak_reduction_percent: float
    avoided_co2_kg: float
    solver_status: str = "OPTIMAL"
    unmodified_cost: float
    optimized_cost: float
    original_peak_kw: float
    optimized_peak_kw: float
