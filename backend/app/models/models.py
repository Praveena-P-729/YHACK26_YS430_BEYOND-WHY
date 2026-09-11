import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="citizen", nullable=False)  # citizen, field_officer, admin
    department = Column(String(150), nullable=True)
    badge_number = Column(String(50), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # Convenience alias for user_id
    @property
    def user_id(self):
        return self.id

    incidents_reported = relationship("Incident", back_populates="reported_by_user", foreign_keys="Incident.reported_by_id")

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    region = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, nullable=False)
    slope_angle = Column(Float, nullable=False)
    soil_type = Column(String(100), nullable=False)
    geology_type = Column(String(100), default="Gneiss / Schist Complex")
    vegetation_density = Column(Float, default=0.65)
    historical_event_count = Column(Integer, default=0)
    current_risk_level = Column(String(20), default="Low")  # Low, Moderate, High, Severe
    current_risk_score = Column(Float, default=15.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    readings = relationship("SensorReading", back_populates="location", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="location", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="location", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="location")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    rainfall_1h = Column(Float, default=0.0)      # mm/hr
    rainfall_24h = Column(Float, default=0.0)     # mm
    rainfall_72h = Column(Float, default=0.0)     # mm
    pore_pressure = Column(Float, default=12.0)   # kPa
    soil_moisture = Column(Float, default=25.0)   # %
    tilt_x = Column(Float, default=0.0)           # degrees
    tilt_y = Column(Float, default=0.0)           # degrees
    displacement_rate = Column(Float, default=0.0)# mm/day
    vibration_level = Column(Float, default=0.01) # g
    temperature = Column(Float, default=22.0)     # C
    humidity = Column(Float, default=65.0)        # %
    sensor_battery = Column(Float, default=98.5)  # %
    sensor_status = Column(String(20), default="NORMAL")

    location = relationship("Location", back_populates="readings")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    risk_score = Column(Float, nullable=False)       # 0 - 100
    risk_level = Column(String(20), nullable=False)  # Low, Moderate, High, Severe
    confidence = Column(Float, default=0.88)
    forecast_horizon = Column(String(20), default="Now") # Now, +6h, +12h, +24h
    model_version = Column(String(50), default="Ensemble-RF-XGB-v2.0")
    primary_driver = Column(String(100), default="Cumulative Rainfall (72h)")
    factor_contributions = Column(JSON, nullable=True) # SHAP-like breakdown

    location = relationship("Location", back_populates="predictions")

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(150), default="Guwahati Sector")
    rainfall = Column(Float, default=0.0)      # mm (current hour)
    rainfall_1h = Column(Float, default=0.0)
    rainfall_3h = Column(Float, default=0.0)
    rainfall_6h = Column(Float, default=0.0)
    rainfall_12h = Column(Float, default=0.0)
    rainfall_24h = Column(Float, default=0.0)
    rainfall_intensity = Column(Float, default=0.0) # mm/hr
    rainfall_trend = Column(String(20), default="STEADY") # RISING, STEADY, FALLING
    temperature = Column(Float, default=24.0)   # °C
    humidity = Column(Float, default=75.0)      # %
    wind_speed = Column(Float, default=12.0)    # km/h
    observed_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class HazardPrediction(Base):
    __tablename__ = "hazard_predictions"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    hazard_type = Column(String(50), nullable=False) # landslide, flash_flood, slope_failure, multi_hazard
    risk_probability = Column(Float, nullable=False) # 0 - 100
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    primary_driver = Column(String(150), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class RoadImpact(Base):
    __tablename__ = "road_impacts"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    road_name = Column(String(150), nullable=False) # e.g. NH-6, NH-27, NH-29
    road_type = Column(String(50), default="primary") # primary, secondary, rural_corridor
    distance_m = Column(Float, default=150.0)
    impact_level = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="OPEN")       # OPEN, RESTRICTED, BLOCKED
    closure_reason = Column(String(200), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class InfrastructureImpact(Base):
    __tablename__ = "infrastructure_impacts"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    roads_at_risk = Column(Integer, default=3)
    bridges_at_risk = Column(Integer, default=1)
    settlements_at_risk = Column(Integer, default=2)
    hospitals_at_risk = Column(Integer, default=1)
    schools_at_risk = Column(Integer, default=2)
    overall_impact = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    community_isolation_risk = Column(String(30), default="ACCESSIBLE") # ACCESSIBLE, THREATENED, ISOLATED
    details = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    location_name = Column(String(150), nullable=True)
    hazard_type = Column(String(50), default="LANDSLIDE") # LANDSLIDE, FLASH_FLOOD, SLOPE_FAILURE, ROAD_BLOCKAGE, COMMUNITY_ACCESS
    alert_level = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL, Warning, Evacuate
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=True)
    status = Column(String(30), default="ACTIVE") # ACTIVE, ACKNOWLEDGED, INVESTIGATING, RESOLVED
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
    broadcast_channels = Column(String(100), default="SMS, Push, Siren, NDMA Hub")

    location = relationship("Location", back_populates="alerts")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="Moderate") # Low, Moderate, Severe, Critical
    status = Column(String(30), default="INVESTIGATING") # PENDING, INVESTIGATING, VERIFIED, RESOLVED, REJECTED
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    casualties_reported = Column(Integer, default=0)
    infrastructure_damage = Column(Text, nullable=True)
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    location = relationship("Location", back_populates="incidents")
    reported_by_user = relationship("User", back_populates="incidents_reported", foreign_keys=[reported_by_id])

class EvacuationShelter(Base):
    __tablename__ = "evacuation_shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    region = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=45)
    contact_phone = Column(String(50), default="1077 / 0361-2237000")
    status = Column(String(20), default="OPEN") # OPEN, FULL, STANDBY
    medical_facility = Column(Boolean, default=True)
    food_supply_days = Column(Integer, default=7)

class HistoricalLandslide(Base):
    __tablename__ = "historical_landslides"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(150), nullable=False)
    location_name = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False)
    event_date = Column(DateTime, nullable=False)
    fatalities = Column(Integer, default=0)
    trigger_type = Column(String(100), default="Monsoon Torrential Rain")
    volume_m3 = Column(Float, nullable=True)
    rainfall_recorded_mm = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

class ThresholdConfig(Base):
    __tablename__ = "threshold_configs"

    id = Column(Integer, primary_key=True, index=True)
    parameter_name = Column(String(50), nullable=False, unique=True)
    unit = Column(String(20), nullable=False)
    advisory_threshold = Column(Float, nullable=False)
    watch_threshold = Column(Float, nullable=False)
    warning_threshold = Column(Float, nullable=False)
    evacuate_threshold = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
