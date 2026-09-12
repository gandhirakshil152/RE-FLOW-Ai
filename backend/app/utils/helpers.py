from datetime import datetime, time
from typing import Union
from app.core.config import settings


def get_tariff_for_hour(hour: int) -> float:
    """
    Returns Time-of-Use electricity tariff ($/kWh) based on the hour of day (0-23).
    - Off-peak: 22:00 - 06:00
    - Mid-peak: 06:00 - 11:00, 15:00 - 18:00, 21:00 - 22:00
    - Peak: 11:00 - 15:00, 18:00 - 21:00
    """
    if 22 <= hour or hour < 6:
        return settings.TARIFF_OFF_PEAK
    elif (11 <= hour < 15) or (18 <= hour < 21):
        return settings.TARIFF_PEAK
    else:
        return settings.TARIFF_MID_PEAK


def calculate_co2_kg(kwh_grid_imported: float) -> float:
    """Calculates avoided or consumed CO2 emissions in kg from grid kWh."""
    return round(max(0.0, kwh_grid_imported) * settings.GRID_EMISSION_FACTOR_KG_PER_KWH, 2)


def parse_time_str(time_str: str) -> int:
    """Parses a time string like '11:00' or '11:00:00' into hour integer (0-23)."""
    try:
        parts = time_str.strip().split(":")
        return int(parts[0]) % 24
    except Exception:
        return 0


def format_hour_str(hour: int) -> str:
    """Formats an hour (0-23) into 'HH:00' format."""
    return f"{hour % 24:02d}:00"
