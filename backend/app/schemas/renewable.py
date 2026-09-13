from typing import List, Optional
from pydantic import BaseModel


class RenewablePoint(BaseModel):
    date: str
    timestamp: str
    time: str
    solar_generation_kw: float
    wind_generation_kw: float
    total_renewable_kw: float


class SolarGenerationResponse(BaseModel):
    current_solar_kw: float
    peak_solar_kw: float
    capacity_kw: float
    hourly: List[RenewablePoint]
    selected_date: Optional[str] = None
    available_dates: List[str] = []


class WindGenerationResponse(BaseModel):
    current_wind_kw: float
    average_wind_kw: float
    capacity_kw: float
    hourly: List[RenewablePoint]
    selected_date: Optional[str] = None
    available_dates: List[str] = []


class RenewableForecastResponse(BaseModel):
    total_current_kw: float
    peak_forecast_kw: float
    solar_capacity_kw: float
    wind_capacity_kw: float
    forecast: List[RenewablePoint]
    selected_date: Optional[str] = None
    available_dates: List[str] = []

