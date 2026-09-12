from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.core.config import settings
from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecast", tags=["Combined Forecast"])


@router.get("", response_model=ForecastResponse)
async def get_forecast(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
    date: Optional[str] = Query(None, description="Target forecast date in YYYY-MM-DD format (from current date to +15 days)"),
    days: int = Query(16, ge=1, le=16, description="Forecast horizon in days (1 to 16 days, max +15 days from today)"),
    hours: Optional[int] = Query(None, ge=1, le=384, description="Forecast horizon in hours (up to 384 hours / 16 days)"),
):
    """
    Unified multi-variable forecast combining meteorological data,
    predicted solar PV generation, wind generation, and facility baseline/peak demand.
    Spans from current date to after 15 days (16 days total / up to 384 hours).
    Each data point includes an explicit date field. Users can query by specific date.
    """
    if date:
        try:
            target_dt = datetime.strptime(date, "%Y-%m-%d").date()
            today = datetime.now(timezone.utc).date()
            max_dt = today + timedelta(days=15)
            if target_dt < today or target_dt > max_dt:
                raise HTTPException(
                    status_code=400,
                    detail=f"Requested date {date} is outside the allowed forecast window. "
                           f"Date must be between {today} and {max_dt} (up to 15 days ahead; no further feature prediction)."
                )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")

    return await ForecastService.get_combined_forecast(
        latitude=latitude,
        longitude=longitude,
        hours=hours,
        days=days,
        target_date=date,
    )

