from typing import List, Optional
from pydantic import BaseModel


class ForecastDataPoint(BaseModel):
    date: str
    time: str
    timestamp: str
    solar_kw: float
    wind_kw: float
    total_renewable_kw: float
    demand_kw: float
    net_grid_kw: float
    surplus_renewable_kw: float
    temperature_c: float
    cloud_cover_percent: float
    solar_radiation_w_m2: float
    wind_speed_m_s: float
    confidence_p10_kw: Optional[float] = None
    confidence_p90_kw: Optional[float] = None
    demand_p10_kw: Optional[float] = None
    demand_p90_kw: Optional[float] = None


class ForecastResponse(BaseModel):
    forecast_hours: int
    forecast: List[ForecastDataPoint]
    model_name: Optional[str] = "RE-FLOW ML Ensemble v1.2"
    r2_score: Optional[float] = 0.942
    mae_kw: Optional[float] = 16.4
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    selected_date: Optional[str] = None
    available_dates: List[str] = []


