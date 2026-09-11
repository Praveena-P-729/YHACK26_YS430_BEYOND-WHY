import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# User & Auth Schemas
class UserBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str = "citizen"
    department: Optional[str] = None
    badge_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str # Can be email or phone
    password: str

class UserResponse(UserBase):
    id: int
    user_id: int
    is_active: bool
    created_at: Optional[datetime.datetime] = None
    last_login_at: Optional[datetime.datetime] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    name: Optional[str] = None
    exp: Optional[int] = None

# Location Schemas
class LocationBase(BaseModel):
    name: str
    region: str
    state: str
    latitude: float
    longitude: float
    elevation: float
    slope_angle: float
    soil_type: str
    geology_type: Optional[str] = "Gneiss / Schist Complex"
    vegetation_density: Optional[float] = 0.65
    current_risk_level: Optional[str] = "Low"
    current_risk_score: Optional[float] = 15.0

class LocationResponse(LocationBase):
    id: int
    historical_event_count: int
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Sensor Reading Schemas
class ReadingBase(BaseModel):
    location_id: int
    rainfall_1h: float
    rainfall_24h: float
    rainfall_72h: float
    pore_pressure: float
    soil_moisture: float
    tilt_x: float
    tilt_y: float
    displacement_rate: float
    vibration_level: float
    temperature: float
    humidity: float

class ReadingResponse(ReadingBase):
    id: int
    timestamp: datetime.datetime
    sensor_battery: float
    sensor_status: str

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionBase(BaseModel):
    location_id: int
    risk_score: float
    risk_level: str
    confidence: float
    forecast_horizon: str
    primary_driver: str
    factor_contributions: Optional[Dict[str, float]] = None

class PredictionResponse(PredictionBase):
    id: int
    timestamp: datetime.datetime
    model_version: str

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    location_id: Optional[int] = None
    alert_id: Optional[str] = None
    road_id: Optional[str] = None
    state: Optional[str] = "Assam"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    probability: Optional[float] = 0.0
    risk_level: Optional[str] = "Low"
    alert_level: Optional[str] = "LOW"
    title: Optional[str] = None
    message: Optional[str] = None
    alert_message: Optional[str] = None
    recommended_action: Optional[str] = None
    source: Optional[str] = "weather_prediction"
    status: Optional[str] = "ACTIVE"
    broadcast_channels: Optional[str] = "SMS, Push, Siren, NDMA Hub, WebSocket"

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    is_active: bool = True
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    location: Optional[LocationResponse] = None

    class Config:
        from_attributes = True

# Field Report Schemas (Offline-First)
class FieldReportBase(BaseModel):
    report_id: Optional[str] = None
    officer_id: Optional[str] = "OFFICER-01"
    road_id: str
    state: Optional[str] = "Assam"
    latitude: float
    longitude: float
    description: str
    observed_condition: Optional[str] = "Normal"
    rainfall_observation: Optional[str] = "Moderate Rain"
    road_blocked: Optional[bool] = False
    landslide_observed: Optional[bool] = False
    photo: Optional[str] = None
    sync_status: Optional[str] = "synced"
    timestamp: Optional[datetime.datetime] = None

class FieldReportCreate(FieldReportBase):
    pass

class FieldReportResponse(FieldReportBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SyncPayload(BaseModel):
    pending_reports: List[FieldReportCreate] = []
    last_sync_timestamp: Optional[str] = None
    client_version: Optional[str] = "2.0.0"

class SyncResponse(BaseModel):
    status: str
    synced_reports_count: int
    server_timestamp: str
    latest_weather: Optional[dict] = None
    latest_road_risks_count: int = 0
    message: str


# Incident Schemas
class IncidentCreate(BaseModel):
    location_id: Optional[int] = None
    title: str
    description: str
    severity: str = "Moderate"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    casualties_reported: int = 0
    infrastructure_damage: Optional[str] = None

class IncidentResponse(IncidentCreate):
    id: int
    status: str
    reported_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    reported_by_id: Optional[int] = None

    class Config:
        from_attributes = True

# Shelter Schemas
class ShelterBase(BaseModel):
    name: str
    region: str
    address: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    contact_phone: str
    status: str
    medical_facility: bool
    food_supply_days: int

class ShelterResponse(ShelterBase):
    id: int

    class Config:
        from_attributes = True
