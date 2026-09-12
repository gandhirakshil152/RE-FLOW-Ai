from app.schemas.energy_score import EnergyScoreResponse


class EnergyScoreService:
    @classmethod
    def calculate_score(
        cls,
        renewable_alignment: int = 78,
        peak_demand_clipping: int = 85,
        scheduling_efficiency: int = 80,
        constraint_compliance: int = 100,
    ) -> EnergyScoreResponse:
        """
        Calculates 0-100 Energy Intelligence Score:
        - Renewable Alignment (35%)
        - Peak Demand Clipping (25%)
        - Scheduling Efficiency (20%)
        - Constraint Compliance (20%)
        """
        # Weighted calculation
        total_score = round(
            0.35 * renewable_alignment
            + 0.25 * peak_demand_clipping
            + 0.20 * scheduling_efficiency
            + 0.20 * constraint_compliance
        )

        # Rating label
        if total_score >= 80:
            rating = "Optimal"
            summary = "Superior renewable alignment and peak demand mitigation across all shiftable circuits."
        elif total_score >= 60:
            rating = "Good"
            summary = "Moderate clean energy synchronization with room for further peak shaving."
        else:
            rating = "Needs Optimization"
            summary = "Heavy reliance on grid peak hours with high carbon intensity."

        return EnergyScoreResponse(
            score=total_score,
            renewable_alignment=renewable_alignment,
            peak_demand_clipping=peak_demand_clipping,
            scheduling_efficiency=scheduling_efficiency,
            constraint_compliance=constraint_compliance,
            rating=rating,
            summary=summary,
        )
