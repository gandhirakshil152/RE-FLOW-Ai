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
    hours: int = Query(24, ge=1, le=168, description="Forecast horizon in hours"),
):
    """
    Retrieve predicted future electricity demand profile for the facility.
    """
    return DemandService.get_demand_forecast(hours=hours)
