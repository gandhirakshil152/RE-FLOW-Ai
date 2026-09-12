from typing import List, Dict, Optional, Any
from pydantic import BaseModel


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class MLModelMetrics(BaseModel):
    model_name: str
    algorithm: str
    solar_r2: float
    wind_r2: float
    demand_r2: float
    overall_r2: float
    mae_kw: float
    rmse_kw: float
    trained_samples: int
    validation_samples: int
    feature_importances: List[FeatureImportance]
    training_status: str
    last_trained_timestamp: str


class MLForecastPoint(BaseModel):
    time: str
    timestamp: str
    solar_predicted_kw: float
    solar_p10_kw: float
    solar_p90_kw: float
    wind_predicted_kw: float
    wind_p10_kw: float
    wind_p90_kw: float
    total_renewable_predicted_kw: float
    renewable_p10_kw: float
    renewable_p90_kw: float
    demand_predicted_kw: float
    demand_p10_kw: float
    demand_p90_kw: float
    net_grid_predicted_kw: float
    uncertainty_percent: float


class MLForecastResponse(BaseModel):
    model_name: str
    algorithm: str
    overall_r2: float
    forecast_hours: int
    forecast: List[MLForecastPoint]
    peak_renewable_predicted_kw: float
    peak_renewable_hour: str
    peak_demand_predicted_kw: float
    peak_demand_hour: str
    surplus_window: str


class AnomalyItem(BaseModel):
    id: str
    time: str
    timestamp: str
    anomaly_type: str  # SURGE_RISK | RENEWABLE_DROP | PEAK_MISMATCH | EFFICIENCY_LOSS
    severity: str      # low | medium | high | critical
    score: float       # 0.0 - 1.0 anomaly confidence score
    metric: str
    actual_or_projected_kw: float
    expected_baseline_kw: float
    deviation_percent: float
    title: str
    description: str
    action_recommendation: str


class AnomalyResponse(BaseModel):
    total_anomalies: int
    critical_count: int
    warning_count: int
    anomalies: List[AnomalyItem]
    grid_stability_index: float  # 0.0 - 100.0


class AICopilotQuery(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class AICopilotResponse(BaseModel):
    answer: str
    insights: List[str]
    suggested_actions: List[str]
    model_confidence: float
    source: str


class MLRetrainRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    past_days: Optional[int] = 14
    location_name: Optional[str] = "Gandhinagar Clean Tech Corridor"


class MLRetrainResponse(BaseModel):
    status: str
    data_source: str
    samples_used: int
    training_duration_ms: float
    solar_r2: float
    wind_r2: float
    demand_r2: float
    overall_r2: float
    mae_kw: float
    rmse_kw: float
    loss_history: List[float]
    message: str


class LocationOption(BaseModel):
    id: str
    name: str
    region: str
    latitude: float
    longitude: float
    solar_capacity_kw: float
    wind_capacity_kw: float
    description: str

