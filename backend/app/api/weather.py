from typing import Optional
from fastapi import APIRouter, Query
from app.core.config import settings
from app.schemas.weather import WeatherCurrent, WeatherForecastResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current", response_model=WeatherCurrent)
async def get_current_weather(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude in decimal degrees"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude in decimal degrees"),
):
    """
    Retrieve real-time meteorological observations:
    temperature, cloud cover, solar radiation, and wind speed via Open-Meteo API.
    """
    return await WeatherService.get_current_weather(latitude, longitude)


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_weather_forecast(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude in decimal degrees"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude in decimal degrees"),
    date: Optional[str] = Query(None, description="Target forecast date in YYYY-MM-DD format (from current date to +15 days)"),
    days: int = Query(16, ge=1, le=16, description="Forecast horizon in days (1 to 16 days)"),
    hours: Optional[int] = Query(None, ge=1, le=384, description="Forecast horizon in hours (up to 384 hours)"),
):
    """
    Retrieve hourly weather forecast including solar irradiance, wind speed,
    cloud cover, and temperature for up to 16 days (current date to +15 days).
    """
    return await WeatherService.get_weather_forecast(
        latitude, longitude, hours=hours, days=days, target_date=date
    )

