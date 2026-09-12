from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="facility_manager")
    created_at = Column(DateTime, default=datetime.utcnow)

    facilities = relationship("Facility", back_populates="owner")


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), default="Gandhinagar, Gujarat")
    latitude = Column(Float, default=23.2156)
    longitude = Column(Float, default=72.6369)
    base_load_kw = Column(Float, default=350.0)
    solar_capacity_kw = Column(Float, default=1200.0)
    wind_capacity_kw = Column(Float, default=200.0)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="facilities")
    loads = relationship("Load", back_populates="facility", cascade="all, delete-orphan")


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    cloud_cover_percent = Column(Float, nullable=False)
    solar_radiation_w_m2 = Column(Float, nullable=False)
    wind_speed_m_s = Column(Float, nullable=False)
    weather_code = Column(Integer, default=0)
    is_forecast = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_weather_location_time", "latitude", "longitude", "timestamp"),
    )


class RenewableGeneration(Base):
    __tablename__ = "renewable_generation"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    solar_generation_kw = Column(Float, nullable=False)
    wind_generation_kw = Column(Float, nullable=False)
    total_renewable_kw = Column(Float, nullable=False)
    is_forecast = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_renewable_time_forecast", "timestamp", "is_forecast"),
    )


class DemandData(Base):
    __tablename__ = "demand_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    baseline_demand_kw = Column(Float, nullable=False)
    actual_demand_kw = Column(Float, nullable=True)
    predicted_demand_kw = Column(Float, nullable=True)
    is_peak = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Load(Base):
    __tablename__ = "loads"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    name = Column(String(255), nullable=False)
    power_kw = Column(Float, nullable=False)
    duration_hours = Column(Integer, nullable=False)
    earliest_start = Column(String(10), nullable=False, default="08:00")
    latest_end = Column(String(10), nullable=False, default="18:00")
    priority = Column(String(50), nullable=False, default="flexible")  # critical, flexible, highly_flexible
    shiftable = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    facility = relationship("Facility", back_populates="loads")
    schedules = relationship("LoadSchedule", back_populates="load", cascade="all, delete-orphan")


class LoadSchedule(Base):
    __tablename__ = "load_schedules"

    id = Column(Integer, primary_key=True, index=True)
    load_id = Column(Integer, ForeignKey("loads.id"), nullable=False)
    scheduled_start = Column(String(10), nullable=False)
    scheduled_end = Column(String(10), nullable=False)
    power_kw = Column(Float, nullable=False)
    status = Column(String(50), default="recommended")  # recommended, active, completed, skipped
    created_at = Column(DateTime, default=datetime.utcnow)

    load = relationship("Load", back_populates="schedules")


class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    solver_status = Column(String(50), default="OPTIMAL")
    recommended_schedule = Column(JSON, nullable=False)
    estimated_savings = Column(Float, nullable=False)
    peak_reduction_percent = Column(Float, nullable=False)
    avoided_co2_kg = Column(Float, nullable=False)
    renewable_utilization_percent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    message = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    estimated_savings = Column(Float, nullable=False)
    avoided_co2_kg = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.92)
    created_at = Column(DateTime, default=datetime.utcnow)


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    additional_load_kw = Column(Float, nullable=False)
    start_time = Column(String(10), nullable=False)
    duration_hours = Column(Integer, nullable=False)
    original_peak_kw = Column(Float, nullable=False)
    new_peak_kw = Column(Float, nullable=False)
    peak_increase_percent = Column(Float, nullable=False)
    recommended_window = Column(String(50), nullable=False)
    estimated_savings = Column(Float, nullable=False)
    estimated_cost = Column(Float, default=0.0)
    estimated_co2_kg = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ImpactMetric(Base):
    __tablename__ = "impact_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    cost_saving_percent = Column(Float, nullable=False)
    peak_reduction_percent = Column(Float, nullable=False)
    renewable_self_consumption_before = Column(Float, nullable=False)
    renewable_self_consumption_after = Column(Float, nullable=False)
    avoided_co2_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
