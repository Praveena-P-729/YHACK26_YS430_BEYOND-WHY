from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
import datetime

router = APIRouter(prefix="/reports", tags=["Situation Reports"])

@router.get("/latest")
def get_latest_sitrep(db: Session = Depends(get_db)):
    return {
        "report_id": f"SITREP-{datetime.datetime.utcnow().strftime('%Y%m%d')}-01",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "title": "National Landslide Early Warning Daily Situation Summary",
        "executive_summary": "Intense monsoon precipitation across North-Eastern Region mountain corridors (Meghalaya, Assam, Manipur, Sikkim) has raised pore water pressure. All 12 radar stations operating normally.",
        "priority_actions": [
            "Maintain Stage-2 Watch in Shillong Ridge (NH-6) and Cherrapunji Escarpment (SH-12).",
            "Pre-position 2 NDRF quick-response teams at Noney NH-37 staging base.",
            "Verify backup telemetry link for Kohima Zubza Pass (NH-29) and Gangtok Deorali (NH-10) array."
        ]
    }
