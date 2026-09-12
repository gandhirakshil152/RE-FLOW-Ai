from fastapi import APIRouter, Query
from app.core.config import settings
from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecast", tags=["Combined Forecast"])


@router.get("", response_model=ForecastResponse)
async def get_forecast(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
    hours: int = Query(24, ge=12, le=72, description="Forecast horizon in hours (24 to 72)"),
):
    """
    Unified multi-variable forecast combining meteorological data,
    predicted solar PV generation, wind generation, and facility baseline/peak demand.
    """
    return await ForecastService.get_combined_forecast(
        latitude=latitude, longitude=longitude, hours=hours
    )
