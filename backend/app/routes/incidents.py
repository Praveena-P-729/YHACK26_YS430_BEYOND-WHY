from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Incident
from app.schemas.schemas import IncidentCreate, IncidentResponse
from app.services.auth_service import get_current_user
from app.models.models import User

router = APIRouter(prefix="/incidents", tags=["Incident Dispatch & Management"])

@router.get("", response_model=List[IncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.reported_at.desc()).all()

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(incident_in: IncidentCreate, db: Session = Depends(get_db)):
    new_inc = Incident(
        location_id=incident_in.location_id,
        title=incident_in.title,
        description=incident_in.description,
        severity=incident_in.severity,
        status="INVESTIGATING",
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        casualties_reported=incident_in.casualties_reported,
        infrastructure_damage=incident_in.infrastructure_damage
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    return new_inc
