from fastapi import APIRouter
from app.schemas.impact import ImpactResponse, ImpactMetricComparison

router = APIRouter(prefix="/impact", tags=["Impact Tracking"])


@router.get("", response_model=ImpactResponse)
def get_impact():
    """
    Retrieve before vs after optimization impact metrics:
    - Cost saving percentage
    - Peak demand reduction
    - Renewable self-consumption improvement
    - Avoided CO2 emissions
    """
    breakdown = {
        "electricity_cost": ImpactMetricComparison(
            before=1850.0, after=1332.0, unit="USD", change_percent=-28.0
        ),
        "peak_demand": ImpactMetricComparison(
            before=1210.0, after=847.0, unit="kW", change_percent=-30.0
        ),
        "renewable_self_consumption": ImpactMetricComparison(
            before=12.0, after=88.0, unit="%", change_percent=+76.0
        ),
        "carbon_emissions": ImpactMetricComparison(
            before=928.0, after=278.0, unit="kg CO2", change_percent=-70.0
        ),
    }

    return ImpactResponse(
        cost_saving_percent=28.0,
        peak_reduction_percent=30.0,
        renewable_self_consumption_before=12.0,
        renewable_self_consumption_after=88.0,
        avoided_co2_kg=650.0,
        estimated_annual_savings_usd=15420.0,
        breakdown=breakdown,
    )
