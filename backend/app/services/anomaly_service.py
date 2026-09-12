import math
from typing import List
from app.schemas.ml import AnomalyItem, AnomalyResponse
from app.services.ml_service import MLService


class AnomalyService:
    @classmethod
    async def detect_anomalies(cls, hours: int = 24) -> AnomalyResponse:
        """
        Runs automated statistical and ML pattern detection across the forecast horizon.
        Flags grid stress, sudden generation dips, and peak demand deviations.
        """
        ml_service = MLService.get_instance()
        forecast_resp = await ml_service.predict_forecast(hours=hours)

        anomalies: List[AnomalyItem] = []
        stability_penalties = 0.0

        for pt in forecast_resp.forecast:
            hour_num = int(pt.time.split(":")[0])
            dem = pt.demand_predicted_kw
            ren = pt.total_renewable_predicted_kw
            is_evening_peak = 17 <= hour_num <= 21

            # 1. Evening Peak Tariff Surge Risk
            if is_evening_peak and dem >= 650.0:
                deviation = round(((dem - 500.0) / 500.0) * 100.0, 1)
                severity = "critical" if dem >= 720.0 else "high"
                score = round(min(0.95, 0.65 + (dem - 650.0) / 400.0), 2)
                anomalies.append(
                    AnomalyItem(
                        id=f"anomaly-surge-{pt.time}",
                        time=pt.time,
                        timestamp=pt.timestamp,
                        anomaly_type="SURGE_RISK",
                        severity=severity,
                        score=score,
                        metric="Facility Demand",
                        actual_or_projected_kw=dem,
                        expected_baseline_kw=500.0,
                        deviation_percent=deviation,
                        title=f"Coincident Peak Demand Surge ({pt.time})",
                        description=f"Predicted facility demand surges to {dem} kW during the evening grid peak (tariff rate at $0.28/kWh), driving excessive capacity charges.",
                        action_recommendation="Shift deferrable loads (BESS, EV fleet charging) out of the 17:00-21:00 window to the midday solar surplus window.",
                    )
                )
                stability_penalties += 4.5

            # 2. Midday Renewable Solar Dip (Cloud or Atmospheric Occlusion)
            if 11 <= hour_num <= 14 and ren < 450.0:
                expected_clear_sky = 750.0
                deviation = round(((expected_clear_sky - ren) / expected_clear_sky) * 100.0, 1)
                score = round(min(0.92, 0.55 + (deviation / 100.0) * 0.4), 2)
                anomalies.append(
                    AnomalyItem(
                        id=f"anomaly-ren-drop-{pt.time}",
                        time=pt.time,
                        timestamp=pt.timestamp,
                        anomaly_type="RENEWABLE_DROP",
                        severity="medium",
                        score=score,
                        metric="Total Renewable Output",
                        actual_or_projected_kw=ren,
                        expected_baseline_kw=expected_clear_sky,
                        deviation_percent=-deviation,
                        title=f"Solar Generation Deficit ({pt.time})",
                        description=f"Atmospheric cloud cover causes solar generation to underperform clear-sky potential by {deviation}%.",
                        action_recommendation="Throttle non-essential batch pumps and ramp BESS discharge buffer to prevent sudden grid drawdown.",
                    )
                )
                stability_penalties += 3.0

            # 3. Duck Curve Severe Deficit (Sudden Solar Sunset Cliff)
            if hour_num == 18 and ren < 80.0 and dem > 600.0:
                anomalies.append(
                    AnomalyItem(
                        id=f"anomaly-duck-{pt.time}",
                        time=pt.time,
                        timestamp=pt.timestamp,
                        anomaly_type="PEAK_MISMATCH",
                        severity="high",
                        score=0.88,
                        metric="Net Grid Import",
                        actual_or_projected_kw=dem - ren,
                        expected_baseline_kw=350.0,
                        deviation_percent=round(((dem - ren - 350.0) / 350.0) * 100.0, 1),
                        title="Duck Curve Ramp Cliff (18:00)",
                        description="Solar PV output drops precipitously as industrial shift demand remains elevated, causing a steep 550+ kW ramp on external grid supply.",
                        action_recommendation="Pre-cool industrial zones between 13:00-15:00 to reduce HVAC chiller load during this ramp hour.",
                    )
                )
                stability_penalties += 5.0

        critical_count = sum(1 for a in anomalies if a.severity == "critical")
        warning_count = sum(1 for a in anomalies if a.severity in ("high", "medium"))
        grid_stability = max(60.0, round(100.0 - stability_penalties, 1))

        return AnomalyResponse(
            total_anomalies=len(anomalies),
            critical_count=critical_count,
            warning_count=warning_count,
            anomalies=anomalies,
            grid_stability_index=grid_stability,
        )
