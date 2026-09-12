from pydantic import BaseModel, Field


class SimulatorRequest(BaseModel):
    additional_load_kw: float = Field(..., gt=0, example=700.0)
    start_time: str = Field(..., example="19:00")
    duration_hours: int = Field(..., ge=1, le=12, example=2)


class SimulatorResponse(BaseModel):
    original_peak_kw: float
    new_peak_kw: float
    peak_increase_percent: float
    renewable_availability_at_start_kw: float
    recommended_window: str
    estimated_savings: float
    original_scenario_cost: float
    optimal_scenario_cost: float
    estimated_co2_kg: float
    co2_reduction_kg: float
    explanation: str
