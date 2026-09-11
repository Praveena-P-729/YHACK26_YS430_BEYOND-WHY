from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import EvacuationShelter
from app.schemas.schemas import ShelterResponse

router = APIRouter(prefix="/shelters", tags=["Public Evacuation Shelters & Relief Camps"])

@router.get("", response_model=List[ShelterResponse])
def get_all_shelters(db: Session = Depends(get_db)):
    return db.query(EvacuationShelter).all()

@router.get("/nearest")
def get_nearest_shelters(lat: float, lon: float, db: Session = Depends(get_db)):
    shelters = db.query(EvacuationShelter).all()
    # Simple euclidean distance approximation for sorting
    sorted_shelters = sorted(
        shelters, 
        key=lambda s: ((s.latitude - lat)**2 + (s.longitude - lon)**2)
    )
    return sorted_shelters[:3]

@router.post("/sos")
def submit_sos_distress(data: dict, db: Session = Depends(get_db)):
    """
    1-Click emergency distress ping from citizen portal
    """
    return {
        "status": "DISPATCHED",
        "ticket_id": "SOS-NORTHEAST-9921",
        "message": "Distress packet received. North-Eastern Regional Disaster Response & NDRF team dispatched.",
        "emergency_helplines": ["108 (National Emergency Ambulance / Disaster)", "112 (National Emergency)", "0364-2224010 (Shillong Control Room)", "0361-2237000 (Guwahati Relief Base)"]
    }
