from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import SensorReading, Location
from app.schemas.schemas import ReadingResponse

router = APIRouter(prefix="/monitoring", tags=["Live Sensor Monitoring"])

@router.get("/latest", response_model=List[ReadingResponse])
def get_latest_readings(db: Session = Depends(get_db)):
    # Get latest reading for each active location
    locations = db.query(Location).filter(Location.is_active == True).all()
    latest_readings = []
    for loc in locations:
        reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).order_by(SensorReading.timestamp.desc()).first()
        if reading:
            latest_readings.append(reading)
    return latest_readings

@router.get("/history/{location_id}", response_model=List[ReadingResponse])
def get_location_history(location_id: int, limit: int = 24, db: Session = Depends(get_db)):
    return db.query(SensorReading).filter(
        SensorReading.location_id == location_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()
