from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RE-FLOW AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./reflow.db"

    # Default Coordinates (Gandhinagar / Gujarat Clean Tech Corridor)
    DEFAULT_LATITUDE: float = 23.2156
    DEFAULT_LONGITUDE: float = 72.6369

    # Energy Simulation Defaults
    FACILITY_BASE_LOAD_KW: float = 350.0
    FACILITY_SOLAR_CAPACITY_KW: float = 1200.0
    FACILITY_WIND_CAPACITY_KW: float = 200.0

    # Carbon intensity (kg CO2 per kWh grid mix)
    GRID_EMISSION_FACTOR_KG_PER_KWH: float = 0.72

    # Time of Use Tariffs ($/kWh)
    TARIFF_OFF_PEAK: float = 0.08  # 22:00 - 06:00
    TARIFF_MID_PEAK: float = 0.14  # 06:00 - 11:00, 15:00 - 18:00, 21:00 - 22:00
    TARIFF_PEAK: float = 0.28      # 11:00 - 15:00 (peak daytime), 18:00 - 21:00 (evening peak)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
