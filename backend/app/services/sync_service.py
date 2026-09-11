import uuid
import logging
import datetime
from sqlalchemy.orm import Session
from app.models.models import FieldReport, Alert
from app.services.weather_service import WeatherService
from app.services.prediction_service import prediction_service
from app.services.websocket_manager import websocket_manager

logger = logging.getLogger("LandGuard.SyncService")

class SyncService:
    def __init__(self):
        self.weather_service = WeatherService()

    async def process_sync_payload(self, db: Session, pending_reports: list, client_timestamp: str = None) -> dict:
        """
        Process batch of offline field reports uploaded during synchronization.
        """
        synced_count = 0
        now = datetime.datetime.utcnow()
        new_alerts = []

        for item in pending_reports:
            data = item if isinstance(item, dict) else item.dict()
            report_id = data.get("report_id") or f"REP-OFFLINE-{uuid.uuid4().hex[:8]}"

            # Deduplicate by report_id
            existing = db.query(FieldReport).filter(FieldReport.report_id == report_id).first()
            if not existing:
                report = FieldReport(
                    report_id=report_id,
                    officer_id=data.get("officer_id", "OFFICER-01"),
                    road_id=data.get("road_id", "NER_ROAD"),
                    state=data.get("state", "Assam"),
                    latitude=float(data.get("latitude", 25.5788)),
                    longitude=float(data.get("longitude", 91.8933)),
                    description=data.get("description", "Field verification report"),
                    observed_condition=data.get("observed_condition", "Normal"),
                    rainfall_observation=data.get("rainfall_observation", "Moderate Rain"),
                    road_blocked=bool(data.get("road_blocked", False)),
                    landslide_observed=bool(data.get("landslide_observed", False)),
                    photo=data.get("photo", None),
                    sync_status="synced",
                    timestamp=data.get("timestamp") or now,
                    created_at=now
                )
                db.add(report)
                synced_count += 1

                # If field officer observed an active landslide or road blockage, emit alert
                if report.landslide_observed or report.road_blocked:
                    risk_lvl = "Critical" if report.road_blocked else "High"
                    alert_id = f"ALT-FIELD-{report.road_id}-{int(now.timestamp())}"
                    
                    alert = Alert(
                        alert_id=alert_id,
                        road_id=report.road_id,
                        location_name=f"Field Observed: {report.road_id}",
                        state=report.state,
                        latitude=report.latitude,
                        longitude=report.longitude,
                        probability=0.92 if report.road_blocked else 0.78,
                        risk_level=risk_lvl,
                        alert_level=risk_lvl.upper(),
                        hazard_type="LANDSLIDE" if report.landslide_observed else "ROAD_BLOCKAGE",
                        title=f"FIELD VERIFIED {risk_lvl.upper()} HAZARD: {report.road_id}",
                        message=f"Field Officer {report.officer_id} verified active hazard on {report.road_id}. Observed: {report.observed_condition}. {report.description}",
                        alert_message=f"FIELD ADVISORY: {report.road_id} ({report.state}). Road Blocked: {report.road_blocked}. Hazard: {report.observed_condition}.",
                        recommended_action=f"Avoid {report.road_id}. Emergency teams dispatched. Follow regional detour.",
                        source="field_report",
                        status="ACTIVE",
                        is_active=True,
                        created_at=now,
                        broadcast_channels="SMS, Push, Siren, NDMA Hub, WebSocket"
                    )
                    db.add(alert)
                    new_alerts.append(alert)

        if synced_count > 0 or len(new_alerts) > 0:
            db.commit()

        # Broadcast any field-generated alerts in real-time
        for alt in new_alerts:
            try:
                await websocket_manager.broadcast_alert({
                    "alert_id": alt.alert_id,
                    "road_id": alt.road_id,
                    "state": alt.state,
                    "latitude": alt.latitude,
                    "longitude": alt.longitude,
                    "probability": alt.probability,
                    "risk_level": alt.risk_level,
                    "title": alt.title,
                    "alert_message": alt.alert_message,
                    "recommended_action": alt.recommended_action,
                    "source": "field_report",
                    "created_at": alt.created_at.isoformat(),
                    "status": alt.status
                })
            except Exception as ws_e:
                logger.warning(f"WebSocket broadcast error during sync: {ws_e}")

        # Fetch latest weather telemetry snapshot for client local cache
        weather_snapshot = self.weather_service.fetch_live_weather(25.5788, 91.8933)

        return {
            "status": "SUCCESS",
            "synced_reports_count": synced_count,
            "server_timestamp": now.isoformat(),
            "latest_weather": weather_snapshot,
            "latest_road_risks_count": 30,
            "message": f"Successfully synchronized {synced_count} offline field reports."
        }

sync_service = SyncService()
