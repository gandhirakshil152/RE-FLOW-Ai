from typing import List, Optional
from pydantic import BaseModel


class DemandPoint(BaseModel):
    date: str
    timestamp: str
    time: str
    demand_kw: float
    baseline_kw: float
    is_peak: bool = False


class DemandCurrentResponse(BaseModel):
    current_demand_kw: float
    baseline_demand_kw: float
    peak_demand_kw: float
    is_peak_period: bool
    status: str = "Normal Operating Load"


class DemandHistoryResponse(BaseModel):
    facility_name: str
    period_hours: int
    average_demand_kw: float
    peak_demand_kw: float
    baseline_kw: float
    history: List[DemandPoint]
    selected_date: Optional[str] = None
    available_dates: List[str] = []


class DemandForecastResponse(BaseModel):
    facility_name: str
    forecast_hours: int
    baseline_demand_kw: float
    predicted_peak_demand_kw: float
    forecast: List[DemandPoint]
    selected_date: Optional[str] = None
    available_dates: List[str] = []

