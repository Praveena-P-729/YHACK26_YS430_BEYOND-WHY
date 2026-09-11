from fastapi import APIRouter
import datetime

router = APIRouter(prefix="/notifications", tags=["System Notifications"])

@router.get("")
def get_notifications():
    return [
        {
            "id": 1,
            "type": "WARNING",
            "title": "High Rainfall Alert - East Khasi Hills (Meghalaya)",
            "message": "Rainfall exceeded 45mm/hr in Shillong Ridge (NH-6) and Cherrapunji (SH-12) corridor.",
            "time": "5 mins ago",
            "read": False
        },
        {
            "id": 2,
            "type": "INFO",
            "title": "Satellite InSAR Pass Completed",
            "message": "Sentinel-1 displacement telemetry updated for 12 monitored sectors.",
            "time": "22 mins ago",
            "read": True
        }
    ]
