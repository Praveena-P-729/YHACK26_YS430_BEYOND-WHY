import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import FieldReport
from app.schemas.schemas import FieldReportCreate, FieldReportResponse
from app.services.sync_service import sync_service

router = APIRouter(prefix="/field-reports", tags=["Field Reports"])

@router.post("", response_model=FieldReportResponse, status_code=status.HTTP_201_CREATED)
async def create_field_report(report_in: FieldReportCreate, db: Session = Depends(get_db)):
    """
    POST /field-reports: Submit a field officer report (online or synced from offline).
    """
    now = datetime.datetime.utcnow()
    report_id = report_in.report_id or f"REP-{int(now.timestamp())}-{uuid.uuid4().hex[:4]}"

    # Check duplicate
    existing = db.query(FieldReport).filter(FieldReport.report_id == report_id).first()
    if existing:
        return existing

    report = FieldReport(
        report_id=report_id,
        officer_id=report_in.officer_id or "OFFICER-01",
        road_id=report_in.road_id,
        state=report_in.state or "Assam",
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        description=report_in.description,
        observed_condition=report_in.observed_condition or "Normal",
        rainfall_observation=report_in.rainfall_observation or "Moderate Rain",
        road_blocked=bool(report_in.road_blocked),
        landslide_observed=bool(report_in.landslide_observed),
        photo=report_in.photo,
        sync_status="synced",
        timestamp=report_in.timestamp or now,
        created_at=now
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Trigger potential alert broadcast if hazard observed
    if report.landslide_observed or report.road_blocked:
        await sync_service.process_sync_payload(db, [report_in.dict()])

    return report

@router.get("", response_model=List[FieldReportResponse])
def get_field_reports(
    road_id: Optional[str] = None,
    officer_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    GET /field-reports: Retrieve all field reports.
    """
    query = db.query(FieldReport)
    if road_id:
        query = query.filter(FieldReport.road_id.ilike(f"%{road_id}%"))
    if officer_id:
        query = query.filter(FieldReport.officer_id == officer_id)

    return query.order_by(FieldReport.created_at.desc()).limit(limit).all()
