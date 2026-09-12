from typing import Optional, List
from pydantic import BaseModel
from app.schemas.optimization import OptimizationResponse


class RecommendationRequest(BaseModel):
    optimization_result: Optional[OptimizationResponse] = None
    target_load_name: Optional[str] = None


class RecommendationResponse(BaseModel):
    message: str
    reason: str
    estimated_savings: float
    avoided_co2_kg: float
    confidence_score: float = 0.94
    action_items: List[str] = []
