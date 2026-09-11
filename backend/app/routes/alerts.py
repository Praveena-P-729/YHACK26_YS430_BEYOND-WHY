from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import get_db
from app.models.models import Alert
from app.services.alert_service import alert_service

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

class AlertCheckRequest(BaseModel):
    road_id: Optional[str] = None
    force_refresh: Optional[bool] = False

class AlertStatusUpdate(BaseModel):
    status: str  # ACTIVE, ACKNOWLEDGED, INVESTIGATING, RESOLVED
    notes: Optional[str] = None

@router.get("")
def get_alerts(
    hazard_type: Optional[str] = None,
    status: Optional[str] = None,
    state: Optional[str] = None,
    risk_level: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    GET /alerts: Fetch current and recent landslide and multi-hazard alerts.
    """
    query = db.query(Alert)
    
    if status and status.lower() != "all":
        query = query.filter(Alert.status == status.upper())
    elif not status:
        query = query.filter(Alert.status != "RESOLVED")

    if state:
        query = query.filter(Alert.state.ilike(f"%{state}%"))

    if risk_level:
        query = query.filter(Alert.risk_level.ilike(risk_level))

    if hazard_type:
        query = query.filter(Alert.hazard_type.ilike(hazard_type))

    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    return alerts

@router.get("/all")
def get_all_alerts(limit: int = 100, db: Session = Depends(get_db)):
    """
    GET /alerts/all: Return all historical alerts.
    """
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()

@router.get("/{road_id}")
def get_alerts_by_road(road_id: str, db: Session = Depends(get_db)):
    """
    GET /alerts/{road_id}: Retrieve alerts for a specific road ID or integer alert ID.
    """
    # Check if road_id matches road_id string or integer primary key
    query = db.query(Alert).filter(
        or_(
            Alert.road_id == road_id,
            Alert.alert_id == road_id
        )
    )
    if road_id.isdigit():
        query = db.query(Alert).filter(
            or_(
                Alert.road_id == road_id,
                Alert.alert_id == road_id,
                Alert.id == int(road_id)
            )
        )

    alerts = query.order_by(Alert.created_at.desc()).all()
    if not alerts:
        # If single alert ID search failed, also look for partial road segment name
        alerts = db.query(Alert).filter(Alert.road_id.ilike(f"%{road_id}%")).order_by(Alert.created_at.desc()).all()

    return alerts

@router.post("/check")
async def check_alerts(
    body: Optional[AlertCheckRequest] = None,
    db: Session = Depends(get_db)
):
    """
    POST /alerts/check: Trigger immediate on-demand weather fetch and 17-feature ensemble inference.
    Broadcasts any new alerts across connected WebSockets.
    """
    road_filter = body.road_id if body else None
    
    if road_filter:
        roads = alert_service.get_monitored_roads()
        matched = [r for r in roads if r.get("road_id") == road_filter or road_filter in r.get("road_name", "")]
        if not matched:
            raise HTTPException(status_code=404, detail=f"Road segment '{road_filter}' not found in monitoring registry.")
        
        alert_obj, eval_info = alert_service.evaluate_road_for_alert(db, matched[0])
        new_alert = None
        if alert_obj:
            new_alert = {
                "alert_id": alert_obj.alert_id,
                "road_id": alert_obj.road_id,
                "state": alert_obj.state,
                "latitude": alert_obj.latitude,
                "longitude": alert_obj.longitude,
                "probability": alert_obj.probability,
                "risk_level": alert_obj.risk_level,
                "title": alert_obj.title,
                "alert_message": alert_obj.alert_message,
                "recommended_action": alert_obj.recommended_action,
                "created_at": alert_obj.created_at.isoformat(),
                "status": alert_obj.status
            }
            from app.services.websocket_manager import websocket_manager
            await websocket_manager.broadcast_alert(new_alert)

        return {
            "status": "COMPLETED",
            "road_id": road_filter,
            "evaluation": eval_info,
            "new_alert": new_alert
        }

    # Run full check across all road segments
    summary = await alert_service.check_all_monitored_roads(db)
    return summary

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
