from fastapi import APIRouter, Query
from app.schemas.energy_score import EnergyScoreResponse
from app.services.energy_score_service import EnergyScoreService

router = APIRouter(prefix="/energy-score", tags=["Energy Intelligence Score"])


@router.get("", response_model=EnergyScoreResponse)
def get_energy_score(
    renewable_alignment: int = Query(78, ge=0, le=100, description="Renewable alignment subscore"),
    peak_demand_clipping: int = Query(85, ge=0, le=100, description="Peak demand clipping subscore"),
    scheduling_efficiency: int = Query(80, ge=0, le=100, description="Scheduling efficiency subscore"),
    constraint_compliance: int = Query(100, ge=0, le=100, description="Constraint compliance subscore"),
):
    """
    Computes facility Energy Intelligence Score (0–100):
    - Renewable Alignment: 35%
    - Peak Demand Clipping: 25%
    - Scheduling Efficiency: 20%
    - Constraint Compliance: 20%
    """
    return EnergyScoreService.calculate_score(
        renewable_alignment=renewable_alignment,
        peak_demand_clipping=peak_demand_clipping,
        scheduling_efficiency=scheduling_efficiency,
        constraint_compliance=constraint_compliance,
    )
