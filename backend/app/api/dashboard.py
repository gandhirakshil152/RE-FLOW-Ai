from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Load
from app.schemas.dashboard import DashboardResponse
from app.schemas.loads import LoadResponse
from app.services.renewable_service import RenewableService
from app.services.demand_service import DemandService
from app.services.forecast_service import ForecastService
from app.services.optimization_service import OptimizationService
from app.services.recommendation_service import RecommendationService
from app.services.energy_score_service import EnergyScoreService
from app.services.weather_service import WeatherService
from app.api.impact import get_impact

router = APIRouter(prefix="/dashboard", tags=["Consolidated Dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(db: Session = Depends(get_db)):
    """
    Combined dashboard payload:
    Fetches generation, demand, 24h forecast, active loads, recommendations,
    energy intelligence score, and impact metrics in a single high-performance request.
    """
    # 1. Active loads from DB
    db_loads = db.query(Load).filter(Load.is_active == True).all()
    loads_pydantic = [LoadResponse.model_validate(ld) for ld in db_loads]

    # 2. Renewable generation
    ren_forecast = await RenewableService.get_renewable_forecast(hours=24)
    curr_solar = ren_forecast.forecast[0].solar_generation_kw if ren_forecast.forecast else 0.0
    curr_wind = ren_forecast.forecast[0].wind_generation_kw if ren_forecast.forecast else 0.0
    curr_total = ren_forecast.forecast[0].total_renewable_kw if ren_forecast.forecast else 0.0

    current_generation = {
        "solar_kw": curr_solar,
        "wind_kw": curr_wind,
        "total_renewable_kw": curr_total,
        "solar_capacity_kw": RenewableService.SOLAR_CAPACITY_KW,
        "wind_capacity_kw": RenewableService.WIND_CAPACITY_KW,
        "peak_forecast_kw": ren_forecast.peak_forecast_kw,
    }

    # 3. Demand
    curr_demand_obj = DemandService.get_current_demand()
    current_demand = {
        "current_demand_kw": curr_demand_obj.current_demand_kw,
        "baseline_demand_kw": curr_demand_obj.baseline_demand_kw,
        "peak_demand_kw": curr_demand_obj.peak_demand_kw,
        "is_peak_period": curr_demand_obj.is_peak_period,
        "status": curr_demand_obj.status,
    }

    # 4. 24h Combined Forecast
    combined_forecast_resp = await ForecastService.get_combined_forecast(hours=24)

    # 5. Optimization & Recommendations
    opt_result = await OptimizationService.optimize_schedule(loads=db_loads, forecast_hours=24)
    rec_obj = RecommendationService.generate_recommendation(opt_result)

    recommended_actions = [
        {
            "id": 1,
            "title": "Optimize High-Capacity EV Fleet",
            "message": rec_obj.message,
            "reason": rec_obj.reason,
            "savings": rec_obj.estimated_savings,
            "co2_avoided_kg": rec_obj.avoided_co2_kg,
            "priority": "high",
        },
        {
            "id": 2,
            "title": "Pre-Cool HVAC Thermal Storage",
            "message": "Shift HVAC chiller sequence to 10:30 AM before peak grid tariff sets in.",
            "reason": "Stores 180 kWh of thermal cooling using on-site solar surplus.",
            "savings": 145.0,
            "co2_avoided_kg": 180.0,
            "priority": "medium",
        }
    ]

    # 6. Energy Score
    energy_score = EnergyScoreService.calculate_score(
        renewable_alignment=78,
        peak_demand_clipping=85,
        scheduling_efficiency=80,
        constraint_compliance=100,
    )

    # 7. Impact
    impact_data = get_impact()

    return DashboardResponse(
        current_generation=current_generation,
        current_demand=current_demand,
        forecast=combined_forecast_resp.forecast,
        active_loads=loads_pydantic,
        recommended_actions=recommended_actions,
        energy_score=energy_score,
        impact=impact_data,
    )
