from typing import List, Optional
from app.core.config import settings
from app.schemas.forecast import ForecastDataPoint, ForecastResponse
from app.services.weather_service import WeatherService
from app.services.renewable_service import RenewableService
from app.services.demand_service import DemandService


class MLForecastModelInterface:
    """
    Interface for integrating advanced ML forecast backends:
    XGBoost, LightGBM, and PyTorch/LSTM.
    """
    def predict(self, weather_features: List[dict]) -> List[float]:
        raise NotImplementedError


class ForecastService:
    @classmethod
    async def get_combined_forecast(
        cls,
        latitude: float = settings.DEFAULT_LATITUDE,
        longitude: float = settings.DEFAULT_LONGITUDE,
        hours: int = 24,
        ml_model: Optional[MLForecastModelInterface] = None,
    ) -> ForecastResponse:
        """
        Combines weather, solar generation, wind generation, and facility demand
        into an aligned multi-variable hourly forecast time series for 24-72 hours.
        """
        clamped_hours = min(max(hours, 12), 72)

        # 1. Weather forecast
        weather_resp = await WeatherService.get_weather_forecast(latitude, longitude, hours=clamped_hours)
        # 2. Renewable generation forecast
        renewable_resp = await RenewableService.get_renewable_forecast(latitude, longitude, hours=clamped_hours)
        # 3. Demand forecast
        demand_resp = DemandService.get_demand_forecast(hours=clamped_hours)

        weather_map = {p.time: p for p in weather_resp.hourly}
        renewable_map = {p.time: p for p in renewable_resp.forecast}

        combined_points: List[ForecastDataPoint] = []

        for d_pt in demand_resp.forecast:
            t = d_pt.time
            r_pt = renewable_map.get(t)
            w_pt = weather_map.get(t)

            solar_kw = r_pt.solar_generation_kw if r_pt else 0.0
            wind_kw = r_pt.wind_generation_kw if r_pt else 0.0
            total_ren_kw = r_pt.total_renewable_kw if r_pt else 0.0
            demand_kw = d_pt.demand_kw

            # Net grid imported vs surplus clean power
            net_grid_kw = round(max(0.0, demand_kw - total_ren_kw), 1)
            surplus_kw = round(max(0.0, total_ren_kw - demand_kw), 1)

            combined_points.append(
                ForecastDataPoint(
                    time=t,
                    timestamp=d_pt.timestamp,
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
                )
            )

        return ForecastResponse(
            forecast_hours=len(combined_points),
            forecast=combined_points,
        )
