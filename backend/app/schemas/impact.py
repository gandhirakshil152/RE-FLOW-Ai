from typing import Dict, Any, Optional
from pydantic import BaseModel


class ImpactMetricComparison(BaseModel):
    before: float
    after: float
    unit: str
    change_percent: float


class ImpactResponse(BaseModel):
    cost_saving_percent: float
    peak_reduction_percent: float
    renewable_self_consumption_before: float
    renewable_self_consumption_after: float
    avoided_co2_kg: float
    estimated_annual_savings_usd: float
    breakdown: Optional[Dict[str, ImpactMetricComparison]] = None
