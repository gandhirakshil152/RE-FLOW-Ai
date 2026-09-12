from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SimulationResult
from app.schemas.simulator import SimulatorRequest, SimulatorResponse
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulator", tags=["What-If Simulator"])


@router.post("", response_model=SimulatorResponse)
async def simulate_scenario(
    request: SimulatorRequest,
    db: Session = Depends(get_db),
):
    """
    Run a What-If Energy Scenario:
    Simulates introducing large un-optimized industrial equipment or EV charging
    at a specific time, calculating peak demand expansion, cost surge, and discovering
    the optimal alternative window to capture renewable surplus.
    """
    result = await SimulationService.simulate_scenario(request)

    # Persist simulation result
    try:
        sim_record = SimulationResult(
            additional_load_kw=request.additional_load_kw,
            start_time=request.start_time,
            duration_hours=request.duration_hours,
            original_peak_kw=result.original_peak_kw,
            new_peak_kw=result.new_peak_kw,
            peak_increase_percent=result.peak_increase_percent,
            recommended_window=result.recommended_window,
            estimated_savings=result.estimated_savings,
            estimated_cost=result.original_scenario_cost,
            estimated_co2_kg=result.estimated_co2_kg,
        )
        db.add(sim_record)
        db.commit()
    except Exception:
        db.rollback()

    return result
