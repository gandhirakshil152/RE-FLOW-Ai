from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.demand import (
    DemandCurrentResponse,
    DemandHistoryResponse,
    DemandForecastResponse,
)
from app.services.demand_service import DemandService

router = APIRouter(prefix="/demand", tags=["Facility Demand"])


@router.get("/current", response_model=DemandCurrentResponse)
def get_current_demand():
    """
    Retrieve real-time facility electricity demand, baseline load, and peak status.
    """
    return DemandService.get_current_demand()


@router.get("/history", response_model=DemandHistoryResponse)
def get_demand_history(
    hours: int = Query(24, ge=1, le=168, description="Historical hours to fetch"),
):
    """
    Retrieve past facility demand time series for trend analysis.
    """
    return DemandService.get_demand_history(hours=hours)


@router.get("/forecast", response_model=DemandForecastResponse)
def get_demand_forecast(
    date: Optional[str] = Query(None, description="Target forecast date in YYYY-MM-DD format (from current date to +15 days)"),
    days: int = Query(16, ge=1, le=16, description="Forecast horizon in days (1 to 16 days)"),
    hours: Optional[int] = Query(None, ge=1, le=384, description="Forecast horizon in hours (up to 384 hours)"),
):
    """
    Retrieve predicted future electricity demand profile for the facility up to 16 days.
    """
    return DemandService.get_demand_forecast(hours=hours, days=days, target_date=date)

