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
    hours: int = Query(24, ge=1, le=168, description="Forecast horizon in hours (24-168)"),
):
    """
    Retrieve hourly weather forecast including solar irradiance, wind speed,
    cloud cover, and temperature for up to 7 days.
    """
    return await WeatherService.get_weather_forecast(latitude, longitude, hours=hours)
