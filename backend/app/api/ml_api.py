from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.core.config import settings
from app.schemas.ml import (
    MLModelMetrics,
    MLForecastResponse,
    AnomalyResponse,
    AICopilotQuery,
    AICopilotResponse,
    MLRetrainRequest,
    MLRetrainResponse,
    LocationOption,
)
from app.services.ml_service import MLService
from app.services.anomaly_service import AnomalyService
from app.services.ai_copilot_service import AICopilotService

router = APIRouter(prefix="/ml", tags=["Machine Learning & AI Engine"])



@router.get("/locations", response_model=List[LocationOption])
def get_clean_energy_locations():
    """
    Returns high-profile national Clean Tech & Mega Renewable Parks
    (Gandhinagar, Khavda 30GW, Bhadla 2.25GW, Pavagada) for live model retraining and evaluation.
    """
    return MLService.SUPPORTED_LOCATIONS


@router.post("/retrain", response_model=MLRetrainResponse)
async def retrain_model_on_real_data(payload: MLRetrainRequest = MLRetrainRequest()):
    """
    Triggers on-demand machine learning model training directly on real satellite
    and meteorological observations fetched from Open-Meteo archive/surface feeds.
    """
    lat = payload.latitude or settings.DEFAULT_LATITUDE
    lon = payload.longitude or settings.DEFAULT_LONGITUDE
    return await MLService.get_instance().retrain_on_real_data(
        latitude=lat,
        longitude=lon,
        past_days=payload.past_days or 14,
        location_name=payload.location_name or "Gandhinagar Clean Tech Corridor",
    )



@router.get("/metrics", response_model=MLModelMetrics)
def get_ml_metrics():
    """
    Returns active ML model validation metrics, R² accuracy scores,
    Mean Absolute Error (MAE), sample counts, and feature importances.
    """
    return MLService.get_instance().get_metrics()


@router.get("/forecast", response_model=MLForecastResponse)
async def get_ml_forecast(
    latitude: float = Query(settings.DEFAULT_LATITUDE, description="Latitude coordinates"),
    longitude: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude coordinates"),
    date: Optional[str] = Query(None, description="Target forecast date in YYYY-MM-DD format (from current date to +15 days)"),
    days: int = Query(16, ge=1, le=16, description="Forecast horizon in days (1 to 16 days, max +15 days from today)"),
    hours: Optional[int] = Query(None, ge=1, le=384, description="Forecast horizon in hours (up to 384 hours / 16 days)"),
):
    """
    Executes real-time inference using the trained ML model with live Open-Meteo weather.
    Provides predicted generation & demand along with 90% confidence interval bands (P10 - P90),
    explicit date field on every point, and date selection up to 15 days ahead.
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

    return await MLService.get_instance().predict_forecast(
        latitude=latitude,
        longitude=longitude,
        hours=hours,
        days=days,
        target_date=date,
    )



@router.get("/anomalies", response_model=AnomalyResponse)
async def get_ml_anomalies(
    hours: int = Query(24, ge=12, le=72, description="Monitoring window in hours"),
):
    """
    Runs real-time anomaly detection to identify peak demand surges,
    renewable generation dips, and duck curve cliff vulnerabilities.
    """
    return await AnomalyService.detect_anomalies(hours=hours)


@router.post("/ask", response_model=AICopilotResponse)
async def query_ai_copilot(payload: AICopilotQuery):
    """
    Explainable AI (XAI) interactive assistant.
    Provides natural language explanations for optimization decisions,
    model metrics, risk assessments, and financial trade-offs.
    """
    return await AICopilotService.answer_query(
        query=payload.query,
        context=payload.context,
    )


@router.get("/explain", response_model=AICopilotResponse)
async def get_schedule_explanation():
    """
    Generates an executive summary explaining why the current load schedule
    was optimized and how it leverages the predicted solar window.
    """
    return await AICopilotService.answer_query(
        query="Why was the schedule optimized and how does it reduce cost and carbon emissions?"
    )
