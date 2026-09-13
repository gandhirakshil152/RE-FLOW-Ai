from typing import List, Tuple, Optional
from app.core.config import settings
from app.schemas.weather import WeatherHourlyPoint
from app.schemas.renewable import (
    RenewablePoint,
    SolarGenerationResponse,
    WindGenerationResponse,
    RenewableForecastResponse,
)
from app.services.weather_service import WeatherService


class RenewableService:
    SOLAR_CAPACITY_KW = settings.FACILITY_SOLAR_CAPACITY_KW  # 1200 kW peak
    WIND_CAPACITY_KW = settings.FACILITY_WIND_CAPACITY_KW    # 200 kW peak

    @classmethod
    def calculate_solar_output(
        cls,
        irradiance_w_m2: float,
        temperature_c: float,
        cloud_cover_percent: float,
        capacity_kw: float = None,
    ) -> float:
        """
        Photovoltaic output model based on solar irradiance (G), cell temperature derating,
        and cloud attenuation.
        """
        capacity = capacity_kw or cls.SOLAR_CAPACITY_KW
        if irradiance_w_m2 <= 1.0:
            return 0.0

        # Effective cell temperature
        t_cell = temperature_c + (irradiance_w_m2 / 800.0) * 28.0
        # Temperature coefficient: ~ -0.4% per °C above 25°C
        temp_derate = max(0.75, 1.0 - 0.004 * (t_cell - 25.0))

        # Solar PV system efficiency & inverter clipping
        ratio = min(1.1, irradiance_w_m2 / 1000.0)
        output_kw = capacity * ratio * temp_derate * 0.95

        return round(max(0.0, output_kw), 1)

    @classmethod
    def calculate_wind_output(
        cls, wind_speed_m_s: float, capacity_kw: float = None
    ) -> float:
        """
        Wind turbine power curve:
        Cut-in: 3.0 m/s
        Rated: 12.0 m/s
        Cut-out: 25.0 m/s
        """
        capacity = capacity_kw or cls.WIND_CAPACITY_KW
        v = max(0.0, wind_speed_m_s)

        v_in = 3.0
        v_rated = 12.0
        v_out = 25.0

        if v < v_in or v >= v_out:
            return 0.0
        elif v >= v_rated:
            return round(capacity, 1)
        else:
            # Cubic power relationship between cut-in and rated
            fraction = ((v - v_in) / (v_rated - v_in)) ** 2.5
            return round(capacity * fraction, 1)

    @classmethod
    async def get_renewable_forecast(
        cls,
        latitude: float = settings.DEFAULT_LATITUDE,
        longitude: float = settings.DEFAULT_LONGITUDE,
        hours: Optional[int] = None,
        days: int = 16,
        target_date: Optional[str] = None,
    ) -> RenewableForecastResponse:
        """Generates hourly solar and wind generation forecast up to 16 days with date specification."""
        weather_resp = await WeatherService.get_weather_forecast(
            latitude, longitude, hours=hours, days=days, target_date=target_date
        )
        hourly_weather: List[WeatherHourlyPoint] = weather_resp.hourly

        points: List[RenewablePoint] = []
        peak_forecast = 0.0

        for pt in hourly_weather:
            solar_kw = cls.calculate_solar_output(
                irradiance_w_m2=pt.solar_radiation_w_m2,
                temperature_c=pt.temperature_c,
                cloud_cover_percent=pt.cloud_cover_percent,
            )
            wind_kw = cls.calculate_wind_output(wind_speed_m_s=pt.wind_speed_m_s)
            total_kw = round(solar_kw + wind_kw, 1)

            if total_kw > peak_forecast:
                peak_forecast = total_kw

            points.append(
                RenewablePoint(
                    date=pt.date,
                    timestamp=pt.timestamp,
                    time=pt.time,
                    solar_generation_kw=solar_kw,
                    wind_generation_kw=wind_kw,
                    total_renewable_kw=total_kw,
                )
            )

        total_current = points[0].total_renewable_kw if points else 0.0

        return RenewableForecastResponse(
            total_current_kw=total_current,
            peak_forecast_kw=peak_forecast,
            solar_capacity_kw=cls.SOLAR_CAPACITY_KW,
            wind_capacity_kw=cls.WIND_CAPACITY_KW,
            forecast=points,
            selected_date=target_date,
            available_dates=weather_resp.available_dates,
        )

    @classmethod
    async def get_solar_generation(
        cls,
        latitude: float = settings.DEFAULT_LATITUDE,
        longitude: float = settings.DEFAULT_LONGITUDE,
        hours: Optional[int] = None,
        days: int = 16,
        target_date: Optional[str] = None,
    ) -> SolarGenerationResponse:
        forecast = await cls.get_renewable_forecast(
            latitude, longitude, hours=hours, days=days, target_date=target_date
        )
        current_solar = forecast.forecast[0].solar_generation_kw if forecast.forecast else 0.0
        peak_solar = max((p.solar_generation_kw for p in forecast.forecast), default=0.0)

        return SolarGenerationResponse(
            current_solar_kw=current_solar,
            peak_solar_kw=peak_solar,
            capacity_kw=cls.SOLAR_CAPACITY_KW,
            hourly=forecast.forecast,
            selected_date=target_date,
            available_dates=forecast.available_dates,
        )

    @classmethod
    async def get_wind_generation(
        cls,
        latitude: float = settings.DEFAULT_LATITUDE,
        longitude: float = settings.DEFAULT_LONGITUDE,
        hours: Optional[int] = None,
        days: int = 16,
        target_date: Optional[str] = None,
    ) -> WindGenerationResponse:
        forecast = await cls.get_renewable_forecast(
            latitude, longitude, hours=hours, days=days, target_date=target_date
        )
        current_wind = forecast.forecast[0].wind_generation_kw if forecast.forecast else 0.0
        avg_wind = (
            round(sum(p.wind_generation_kw for p in forecast.forecast) / len(forecast.forecast), 1)
            if forecast.forecast
            else 0.0
        )

        return WindGenerationResponse(
            current_wind_kw=current_wind,
            average_wind_kw=avg_wind,
            capacity_kw=cls.WIND_CAPACITY_KW,
            hourly=forecast.forecast,
            selected_date=target_date,
            available_dates=forecast.available_dates,
        )

