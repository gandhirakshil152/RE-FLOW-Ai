import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from app.core.config import settings
from app.schemas.demand import (
    DemandPoint,
    DemandCurrentResponse,
    DemandHistoryResponse,
    DemandForecastResponse,
)


class DemandService:
    BASE_LOAD_KW = settings.FACILITY_BASE_LOAD_KW  # 350.0 kW
    FACILITY_NAME = "Gandhinagar Clean Tech Industrial Campus"

    @classmethod
    def calculate_facility_demand(cls, hour_of_day: int, day_offset: int = 0) -> float:
        """
        Realistic commercial/industrial facility demand profile:
        - Baseline: 350 kW
        - Morning ramp (06:00-09:00): HVAC & workforce start
        - Afternoon peak (11:00-16:00): Full machinery & heavy HVAC cooling (up to ~780-820 kW)
        - Evening shift (17:00-21:00): Secondary operations
        - Night hours (22:00-06:00): Base load
        """
        # Diurnal pattern
        if 0 <= hour_of_day < 6:
            demand = cls.BASE_LOAD_KW + (hour_of_day * 4.0)
        elif 6 <= hour_of_day < 9:
            # Morning ramp
            progress = (hour_of_day - 6) / 3.0
            demand = cls.BASE_LOAD_KW + 50.0 + progress * 220.0
        elif 9 <= hour_of_day < 17:
            # High industrial activity
            peak_factor = math.sin((hour_of_day - 9) * math.pi / 8)
            demand = 620.0 + 170.0 * peak_factor
        elif 17 <= hour_of_day < 21:
            # Evening shift
            demand = 540.0 + (21 - hour_of_day) * 25.0
        else:
            # Night ramp-down
            demand = cls.BASE_LOAD_KW + 30.0

        # Subtle noise/day cycle variation
        variation = math.sin(day_offset * 1.5 + hour_of_day * 0.7) * 12.0
        return round(max(cls.BASE_LOAD_KW, demand + variation), 1)

    @classmethod
    @classmethod
    def get_demand_forecast(
        cls,
        hours: Optional[int] = None,
        days: int = 16,
        target_date: Optional[str] = None,
    ) -> DemandForecastResponse:
        """Generates future predicted demand up to 16 days (384 hours) with date specification and filtering."""
        now = datetime.now(timezone.utc)
        start_hour = now.replace(minute=0, second=0, microsecond=0)

        # Max 16 days (current date + 15 days) = 384 hours
        if hours is not None:
            total_hours = min(384, max(1, hours))
        else:
            total_hours = min(384, max(1, days * 24))

        points: List[DemandPoint] = []
        max_peak = 0.0

        for h in range(total_hours):
            t = start_hour + timedelta(hours=h)
            hour_of_day = t.hour
            predicted_kw = cls.calculate_facility_demand(hour_of_day, day_offset=h // 24)
            is_peak = (11 <= hour_of_day < 15) or (18 <= hour_of_day < 21)

            if predicted_kw > max_peak:
                max_peak = predicted_kw

            points.append(
                DemandPoint(
                    date=t.strftime("%Y-%m-%d"),
                    timestamp=t.strftime("%Y-%m-%dT%H:00"),
                    time=f"{hour_of_day:02d}:00",
                    demand_kw=predicted_kw,
                    baseline_kw=cls.BASE_LOAD_KW,
                    is_peak=is_peak,
                )
            )

        available_dates = sorted(list(dict.fromkeys(p.date for p in points)))[:16]
        valid_date_set = set(available_dates)
        points = [p for p in points if p.date in valid_date_set]

        if target_date:
            filtered_points = [p for p in points if p.date == target_date]
            selected_date = target_date
        else:
            filtered_points = points
            selected_date = None

        return DemandForecastResponse(
            facility_name=cls.FACILITY_NAME,
            forecast_hours=len(filtered_points),
            baseline_demand_kw=cls.BASE_LOAD_KW,
            predicted_peak_demand_kw=max((p.demand_kw for p in filtered_points), default=max_peak),
            forecast=filtered_points,
            selected_date=selected_date,
            available_dates=available_dates,
        )

    @classmethod
    def get_demand_history(cls, hours: int = 24) -> DemandHistoryResponse:
        """Generates past demand history for the last 24-72 hours."""
        now = datetime.now(timezone.utc)
        start_hour = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=hours)

        points: List[DemandPoint] = []
        total_demand = 0.0
        peak_demand = 0.0

        for h in range(hours):
            t = start_hour + timedelta(hours=h)
            hour_of_day = t.hour
            actual_kw = cls.calculate_facility_demand(hour_of_day, day_offset=h // 24)
            is_peak = (11 <= hour_of_day < 15) or (18 <= hour_of_day < 21)

            total_demand += actual_kw
            if actual_kw > peak_demand:
                peak_demand = actual_kw

            points.append(
                DemandPoint(
                    date=t.strftime("%Y-%m-%d"),
                    timestamp=t.strftime("%Y-%m-%dT%H:00"),
                    time=f"{hour_of_day:02d}:00",
                    demand_kw=actual_kw,
                    baseline_kw=cls.BASE_LOAD_KW,
                    is_peak=is_peak,
                )
            )

        avg_demand = round(total_demand / max(1, len(points)), 1)
        available_dates = sorted(list(dict.fromkeys(p.date for p in points)))

        return DemandHistoryResponse(
            facility_name=cls.FACILITY_NAME,
            period_hours=hours,
            average_demand_kw=avg_demand,
            peak_demand_kw=peak_demand,
            baseline_kw=cls.BASE_LOAD_KW,
            history=points,
            available_dates=available_dates,
        )


    @classmethod
    def get_current_demand(cls) -> DemandCurrentResponse:
        """Returns the current instant demand observation."""
        now = datetime.now(timezone.utc)
        hour_of_day = now.hour
        current_kw = cls.calculate_facility_demand(hour_of_day)
        is_peak = (11 <= hour_of_day < 15) or (18 <= hour_of_day < 21)

        forecast = cls.get_demand_forecast(hours=24)
        peak_kw = forecast.predicted_peak_demand_kw

        status = "Peak Demand Window" if is_peak else "Normal Operating Load"

        return DemandCurrentResponse(
            current_demand_kw=current_kw,
            baseline_demand_kw=cls.BASE_LOAD_KW,
            peak_demand_kw=peak_kw,
            is_peak_period=is_peak,
            status=status,
        )
