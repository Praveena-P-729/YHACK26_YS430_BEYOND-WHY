from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Location
from app.schemas.schemas import LocationResponse

router = APIRouter(prefix="/locations", tags=["Monitoring Locations"])

@router.get("", response_model=List[LocationResponse])
def get_all_locations(db: Session = Depends(get_db)):
    return db.query(Location).filter(Location.is_active == True).all()

@router.get("/{location_id}", response_model=LocationResponse)
def get_location_by_id(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc
