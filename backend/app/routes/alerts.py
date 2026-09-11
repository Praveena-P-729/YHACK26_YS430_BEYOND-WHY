from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import get_db
from app.models.models import Alert

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

class AlertStatusUpdate(BaseModel):
    status: str # ACTIVE, ACKNOWLEDGED, INVESTIGATING, RESOLVED
    notes: Optional[str] = None

@router.get("")
def get_alerts(
    hazard_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status.upper())
    elif status != "all":
        query = query.filter(Alert.status != "RESOLVED")
    
    if hazard_type:
        query = query.filter(Alert.hazard_type == hazard_type.upper())

    return query.order_by(Alert.created_at.desc()).all()

@router.get("/all")
def get_all_alerts(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()

@router.patch("/{alert_id}/status")
def update_alert_status(alert_id: int, update: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = update.status.upper()
    if update.status.upper() == "RESOLVED":
        alert.is_active = False
        alert.resolved_at = datetime.datetime.utcnow()
    else:
        alert.is_active = True

    db.commit()
    db.refresh(alert)
    return {
        "message": f"Alert #{alert_id} status updated to {alert.status}",
        "alert": alert
    }
