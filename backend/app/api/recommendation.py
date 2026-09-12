from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Load, Recommendation as RecommendationModel
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.optimization_service import OptimizationService
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendation", tags=["AI Recommendation"])


@router.post("", response_model=RecommendationResponse)
async def get_recommendation(
    request: RecommendationRequest = None,
    db: Session = Depends(get_db),
):
    """
    Converts optimization results into executive, clear, actionable human recommendations.
    Never shows raw data without an immediate actionable next step.
    """
    req = request or RecommendationRequest()

    if req.optimization_result:
        opt_res = req.optimization_result
    else:
        # Run optimization on current active loads
        active_loads = db.query(Load).filter(Load.is_active == True).all()
        opt_res = await OptimizationService.optimize_schedule(loads=active_loads)

    recommendation = RecommendationService.generate_recommendation(
        opt_result=opt_res,
        target_load_name=req.target_load_name,
    )

    # Persist recommendation
    try:
        rec_record = RecommendationModel(
            message=recommendation.message,
            reason=recommendation.reason,
            estimated_savings=recommendation.estimated_savings,
            avoided_co2_kg=recommendation.avoided_co2_kg,
            confidence_score=recommendation.confidence_score,
        )
        db.add(rec_record)
        db.commit()
    except Exception:
        db.rollback()

    return recommendation
