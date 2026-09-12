from fastapi import APIRouter, Query
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
from typing import List

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
    hours: int = Query(24, ge=12, le=72, description="Forecast horizon in hours"),
):
    """
    Executes real-time inference using the trained ML model with live Open-Meteo weather.
    Provides predicted generation & demand along with 90% confidence interval bands (P10 - P90).
    """
    return await MLService.get_instance().predict_forecast(
        latitude=latitude,
        longitude=longitude,
        hours=hours,
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
        query="Why was the schedule optimized and how does it reduce cost and carbon emissions?"
    )
