from typing import List, Optional
from pydantic import BaseModel


class ForecastDataPoint(BaseModel):
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


class ForecastResponse(BaseModel):
    forecast_hours: int
    forecast: List[ForecastDataPoint]
