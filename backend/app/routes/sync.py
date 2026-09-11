import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import SyncPayload, SyncResponse
from app.services.sync_service import sync_service

router = APIRouter(prefix="/sync", tags=["Offline Data Synchronization"])

@router.post("", response_model=SyncResponse)
async def sync_offline_data(payload: SyncPayload, db: Session = Depends(get_db)):
    """
    POST /sync: Synchronize offline field reports with the central PostgreSQL/PostGIS database,
    and receive latest weather snapshots and updated road risks.
    """
    try:
        result = await sync_service.process_sync_payload(
            db=db,
            pending_reports=payload.pending_reports,
            client_timestamp=payload.last_sync_timestamp
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Synchronization failed: {str(e)}"
        )
