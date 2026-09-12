from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator


class LoadBase(BaseModel):
    name: str = Field(..., example="EV Fleet Charging")
    power_kw: float = Field(..., gt=0, example=150.0)
    duration_hours: int = Field(..., ge=1, le=24, example=3)
    earliest_start: str = Field(..., example="11:00")
    latest_end: str = Field(..., example="16:00")
    priority: Literal["critical", "flexible", "highly_flexible"] = Field(
        ..., example="highly_flexible"
    )
    shiftable: bool = Field(..., example=True)

    @field_validator("shiftable")
    @classmethod
    def validate_critical_shiftable(cls, v: bool, info) -> bool:
        """Enforce rule: Critical loads must NEVER be shiftable."""
        if info.data.get("priority") == "critical" and v is True:
            # Force critical loads to be unshiftable
            return False
        return v


class LoadCreate(LoadBase):
    pass


class LoadUpdate(BaseModel):
    name: Optional[str] = None
    power_kw: Optional[float] = Field(None, gt=0)
    duration_hours: Optional[int] = Field(None, ge=1, le=24)
    earliest_start: Optional[str] = None
    latest_end: Optional[str] = None
    priority: Optional[Literal["critical", "flexible", "highly_flexible"]] = None
    shiftable: Optional[bool] = None

    @field_validator("shiftable")
    @classmethod
    def validate_critical_update(cls, v: Optional[bool], info) -> Optional[bool]:
        if v is True and info.data.get("priority") == "critical":
            return False
        return v


class LoadResponse(LoadBase):
    id: int

    class Config:
        from_attributes = True
