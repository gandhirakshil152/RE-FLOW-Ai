from typing import List, Optional
from pydantic import BaseModel, Field


class WeatherCurrent(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    temperature_c: float
    cloud_cover_percent: float
    solar_radiation_w_m2: float
    wind_speed_m_s: float
    weather_description: str
    is_simulated: bool = False


class WeatherHourlyPoint(BaseModel):
    time: str
    timestamp: str
    temperature_c: float
    cloud_cover_percent: float
    solar_radiation_w_m2: float
    wind_speed_m_s: float


class WeatherForecastResponse(BaseModel):
    latitude: float
    longitude: float
    timezone: str = "UTC"
    elevation: Optional[float] = None
    current: WeatherCurrent
    hourly: List[WeatherHourlyPoint]
    forecast_hours: int = 24
