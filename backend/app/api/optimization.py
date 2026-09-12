from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Load, OptimizationResult
from app.schemas.optimization import OptimizationRequest, OptimizationResponse
from app.services.optimization_service import OptimizationService

router = APIRouter(prefix="/optimize", tags=["Optimization"])


@router.post("", response_model=OptimizationResponse)
async def run_optimization(
    request: OptimizationRequest = None,
    db: Session = Depends(get_db),
):
    """
    Core Optimization Engine:
    Applies Google OR-Tools Mixed Integer Linear Programming (MILP) to schedule
    flexible facility loads.
    Objectives:
    - Maximize renewable-energy self-consumption
    - Minimize electricity cost under Time-of-Use tariffs
    - Minimize facility peak demand
    - Respect earliest start and latest end constraints
    - NEVER shift critical loads
    """
    req = request or OptimizationRequest()

    # If specific loads were provided in the request body, use them; otherwise use database loads
    if req.loads and len(req.loads) > 0:
        loads_to_optimize = req.loads
    else:
        loads_to_optimize = db.query(Load).filter(Load.is_active == True).all()

    response = await OptimizationService.optimize_schedule(
        loads=loads_to_optimize,
        forecast_hours=req.forecast_hours,
        tariff_override=req.tariff_override,
        peak_demand_weight=req.peak_demand_weight,
        renewable_weight=req.renewable_weight,
        cost_weight=req.cost_weight,
    )

    # Persist optimization record to DB
    try:
        opt_record = OptimizationResult(
            solver_status=response.solver_status,
            recommended_schedule=[item.model_dump() for item in response.recommended_schedule],
            estimated_savings=response.estimated_savings,
            peak_reduction_percent=response.peak_reduction_percent,
            avoided_co2_kg=response.avoided_co2_kg,
        )
        db.add(opt_record)
        db.commit()
    except Exception:
        db.rollback()

    return response
