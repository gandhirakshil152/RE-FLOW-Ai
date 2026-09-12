from pydantic import BaseModel, Field


class EnergyScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100, example=82)
    renewable_alignment: int = Field(..., ge=0, le=100, example=78)
    peak_demand_clipping: int = Field(..., ge=0, le=100, example=85)
    scheduling_efficiency: int = Field(..., ge=0, le=100, example=80)
    constraint_compliance: int = Field(..., ge=0, le=100, example=100)
    rating: str = "Optimal"
    summary: str = "High renewable alignment with active peak clipping across all scheduled loads."
