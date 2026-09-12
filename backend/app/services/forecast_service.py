from typing import List, Optional
from app.core.config import settings
from app.schemas.forecast import ForecastDataPoint, ForecastResponse
from app.services.weather_service import WeatherService
from app.services.renewable_service import RenewableService
from app.services.demand_service import DemandService
from app.services.ml_service import MLService


class ForecastService:
    @classmethod
    async def get_combined_forecast(
        cls,
        latitude: float = settings.DEFAULT_LATITUDE,
        longitude: float = settings.DEFAULT_LONGITUDE,
        hours: Optional[int] = None,
        days: int = 16,
        target_date: Optional[str] = None,
    ) -> ForecastResponse:
        """
        Combines weather, solar generation, wind generation, and facility demand
        into an aligned multi-variable hourly forecast time series for up to 16 days (384 hours),
        starting from current date through +15 days, with date specified on every data point
        and support for interactive target_date filtering.
        """
        if hours is not None:
            clamped_hours = min(max(hours, 1), 384)
        else:
            clamped_hours = None

        clamped_days = min(max(days, 1), 16)

        # 1. Weather forecast
        weather_resp = await WeatherService.get_weather_forecast(
            latitude, longitude, hours=clamped_hours, days=clamped_days, target_date=target_date
        )
        # 2. Renewable generation forecast
        renewable_resp = await RenewableService.get_renewable_forecast(
            latitude, longitude, hours=clamped_hours, days=clamped_days, target_date=target_date
        )
        # 3. Demand forecast
        demand_resp = DemandService.get_demand_forecast(
            hours=clamped_hours, days=clamped_days, target_date=target_date
        )
        # 4. ML probabilistic forecast
        ml_service = MLService.get_instance()
        ml_forecast = await ml_service.predict_forecast(
            latitude, longitude, hours=clamped_hours, days=clamped_days, target_date=target_date
        )

        # Map by unique timestamp to support multi-day time series seamlessly
        ml_map = {p.timestamp: p for p in ml_forecast.forecast}
        weather_map = {p.timestamp: p for p in weather_resp.hourly}
        renewable_map = {p.timestamp: p for p in renewable_resp.forecast}

        combined_points: List[ForecastDataPoint] = []

        for d_pt in demand_resp.forecast:
            ts = d_pt.timestamp
            t = d_pt.time
            d_date = d_pt.date
            r_pt = renewable_map.get(ts)
            w_pt = weather_map.get(ts)
            m_pt = ml_map.get(ts)

            solar_kw = r_pt.solar_generation_kw if r_pt else (m_pt.solar_predicted_kw if m_pt else 0.0)
            wind_kw = r_pt.wind_generation_kw if r_pt else (m_pt.wind_predicted_kw if m_pt else 0.0)
            total_ren_kw = r_pt.total_renewable_kw if r_pt else (m_pt.total_renewable_predicted_kw if m_pt else 0.0)
            demand_kw = d_pt.demand_kw

            # Net grid imported vs surplus clean power
            net_grid_kw = round(max(0.0, demand_kw - total_ren_kw), 1)
            surplus_kw = round(max(0.0, total_ren_kw - demand_kw), 1)

            combined_points.append(
                ForecastDataPoint(
                    date=d_date,
                    time=t,
                    timestamp=ts,
                    solar_kw=solar_kw,
                    wind_kw=wind_kw,
                    total_renewable_kw=total_ren_kw,
                    demand_kw=demand_kw,
                    net_grid_kw=net_grid_kw,
                    surplus_renewable_kw=surplus_kw,
                    temperature_c=w_pt.temperature_c if w_pt else 25.0,
                    cloud_cover_percent=w_pt.cloud_cover_percent if w_pt else 10.0,
                    solar_radiation_w_m2=w_pt.solar_radiation_w_m2 if w_pt else 0.0,
                    wind_speed_m_s=w_pt.wind_speed_m_s if w_pt else 4.0,
                    confidence_p10_kw=m_pt.renewable_p10_kw if m_pt else round(total_ren_kw * 0.85, 1),
                    confidence_p90_kw=m_pt.renewable_p90_kw if m_pt else round(total_ren_kw * 1.15, 1),
                    demand_p10_kw=m_pt.demand_p10_kw if m_pt else round(demand_kw * 0.92, 1),
                    demand_p90_kw=m_pt.demand_p90_kw if m_pt else round(demand_kw * 1.08, 1),
                )
            )

        available_dates = weather_resp.available_dates or sorted(list(dict.fromkeys(p.date for p in combined_points)))[:16]
        start_date = available_dates[0] if available_dates else None
        end_date = available_dates[-1] if available_dates else None

        metrics = ml_service.get_metrics()
        return ForecastResponse(
            forecast_hours=len(combined_points),
            forecast=combined_points,
            model_name=metrics.model_name,
            r2_score=metrics.overall_r2,
            mae_kw=metrics.mae_kw,
            start_date=start_date,
            end_date=end_date,
            selected_date=target_date,
            available_dates=available_dates,
        )


