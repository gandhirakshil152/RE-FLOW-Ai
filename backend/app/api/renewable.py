from fastapi import APIRouter, Query
from app.core.config import settings
from app.schemas.renewable import (
    SolarGenerationResponse,
    WindGenerationResponse,
    RenewableForecastResponse,
)
from app.services.renewable_service import RenewableService

router = APIRouter(prefix="/renewable", tags=["Renewable Generation"])


@router.get("/solar", response_model=SolarGenerationResponse)
async def get_solar_generation(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
    hours: int = Query(24, ge=1, le=72, description="Hours"),
):
    """
    Retrieve solar PV generation output and hourly forecast derived from
    solar irradiance and cell temperature physics.
    """
    return await RenewableService.get_solar_generation(latitude, longitude, hours=hours)


@router.get("/wind", response_model=WindGenerationResponse)
async def get_wind_generation(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
    hours: int = Query(24, ge=1, le=72, description="Hours"),
):
    """
    Retrieve wind turbine power curve output and hourly generation forecast.
    """
    return await RenewableService.get_wind_generation(latitude, longitude, hours=hours)


@router.get("/forecast", response_model=RenewableForecastResponse)
async def get_renewable_forecast(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
    hours: int = Query(24, ge=1, le=72, description="Hours"),
):
    """
    Retrieve combined solar and wind generation forecast with hourly breakdown:
    {
      "timestamp": "2026-09-12T13:00:00",
      "solar_generation_kw": 920,
      "wind_generation_kw": 80,
      "total_renewable_kw": 1000
    }
    """
    return await RenewableService.get_renewable_forecast(latitude, longitude, hours=hours)
