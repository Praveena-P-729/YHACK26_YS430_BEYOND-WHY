import os
import json
import uuid
import logging
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import Alert
from app.services.prediction_service import prediction_service
from app.services.weather_service import WeatherService
from app.services.websocket_manager import websocket_manager

logger = logging.getLogger("LandGuard.AlertService")

RISK_RANKS = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Critical": 4
}

class AlertService:
    def __init__(self):
        self.weather_service = WeatherService()
        self.cooldown_seconds = 21600 # 6 hours default cooldown for identical alert levels
        self._cached_roads = None

    def get_monitored_roads(self) -> list:
        """
        Load monitored Northeast India road segments with terrain characteristics.
        """
        if self._cached_roads is not None:
            return self._cached_roads

        # Look for gis_predictions.json or fallback list
        possible_paths = [
            os.path.abspath("gis_predictions.json"),
            os.path.abspath(os.path.join("ml", "gis_predictions.json")),
            os.path.abspath(os.path.join("..", "ml", "gis_predictions.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "gis_predictions.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "gis_predictions.json"))
        ]

        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list) and len(data) > 0:
                            # Prioritize high/medium risk key arterial segments (up to 30 segments per cycle)
                            priority_roads = sorted(data, key=lambda x: float(x.get("landslide_prob", x.get("probability", 0.5))), reverse=True)[:30]
                            self._cached_roads = priority_roads
                            logger.info(f"Loaded {len(priority_roads)} high-priority monitored arterial road segments from {p}")
                            return self._cached_roads
                except Exception as e:
                    logger.warning(f"Error loading road data from {p}: {e}")

        # Comprehensive pre-defined Northeast India arterial highway corridors
        self._cached_roads = [
            {
                "road_id": "NH-27-SEC-04",
                "road_name": "NH-27 East-West Corridor (Guwahati-Nagaon)",
                "state": "Assam",
                "latitude": 26.1445,
                "longitude": 91.7362,
                "elevation_m": 580.0,
                "slope_degree": 34.2,
                "aspect_degree": 142.0,
                "curvature": 0.082,
                "terrain_roughness": 15.4,
                "relative_relief_m": 130.0,
                "ndvi": 0.58,
                "vegetation_loss_index": 0.42
            },
            {
                "road_id": "NH-206-SEC-02",
                "road_name": "NH-206 Shillong Peak Pass Bypass",
                "state": "Meghalaya",
                "latitude": 25.5788,
                "longitude": 91.8933,
                "elevation_m": 1520.0,
                "slope_degree": 44.8,
                "aspect_degree": 165.0,
                "curvature": 0.145,
                "terrain_roughness": 22.8,
                "relative_relief_m": 340.0,
                "ndvi": 0.48,
                "vegetation_loss_index": 0.52
            },
            {
                "road_id": "NH-10-SEC-08",
                "road_name": "NH-10 Gangtok-Siliguri Mountain Lifeline",
                "state": "Sikkim",
                "latitude": 27.3389,
                "longitude": 88.6065,
                "elevation_m": 1780.0,
                "slope_degree": 48.6,
                "aspect_degree": 180.0,
                "curvature": 0.180,
                "terrain_roughness": 28.5,
                "relative_relief_m": 420.0,
                "ndvi": 0.42,
                "vegetation_loss_index": 0.58
            },
            {
                "road_id": "NH-29-SEC-03",
                "road_name": "NH-29 Dimapur-Kohima Ghat Highway",
                "state": "Nagaland",
                "latitude": 25.6751,
                "longitude": 94.1086,
                "elevation_m": 1440.0,
                "slope_degree": 41.2,
                "aspect_degree": 125.0,
                "curvature": 0.112,
                "terrain_roughness": 19.6,
                "relative_relief_m": 310.0,
                "ndvi": 0.54,
                "vegetation_loss_index": 0.46
            },
            {
                "road_id": "NH-102-SEC-01",
                "road_name": "NH-102 Imphal-Moreh Border Lifeline",
                "state": "Manipur",
                "latitude": 24.8170,
                "longitude": 93.9368,
                "elevation_m": 890.0,
                "slope_degree": 36.5,
                "aspect_degree": 150.0,
                "curvature": 0.095,
                "terrain_roughness": 16.8,
                "relative_relief_m": 210.0,
                "ndvi": 0.62,
                "vegetation_loss_index": 0.38
            },
            {
                "road_id": "NH-54-SEC-06",
                "road_name": "NH-54 Aizawl-Lunglei Ridge Expressway",
                "state": "Mizoram",
                "latitude": 23.7271,
                "longitude": 92.7176,
                "elevation_m": 1130.0,
                "slope_degree": 42.0,
                "aspect_degree": 170.0,
                "curvature": 0.130,
                "terrain_roughness": 20.4,
                "relative_relief_m": 280.0,
                "ndvi": 0.51,
                "vegetation_loss_index": 0.49
            },
            {
                "road_id": "NH-13-SEC-05",
                "road_name": "NH-13 Trans-Arunachal Highway (Itanagar-Tawang)",
                "state": "Arunachal Pradesh",
                "latitude": 27.0844,
                "longitude": 93.6053,
                "elevation_m": 1960.0,
                "slope_degree": 52.1,
                "aspect_degree": 195.0,
                "curvature": 0.210,
                "terrain_roughness": 31.2,
                "relative_relief_m": 490.0,
                "ndvi": 0.39,
                "vegetation_loss_index": 0.61
            },
            {
                "road_id": "NH-8-SEC-02",
                "road_name": "NH-8 Agartala-Udaipur Hill Connector",
                "state": "Tripura",
                "latitude": 23.8315,
                "longitude": 91.2868,
                "elevation_m": 210.0,
                "slope_degree": 22.4,
                "aspect_degree": 110.0,
                "curvature": 0.045,
                "terrain_roughness": 8.6,
                "relative_relief_m": 60.0,
                "ndvi": 0.72,
                "vegetation_loss_index": 0.28
            }
        ]
        return self._cached_roads

    def evaluate_road_for_alert(self, db: Session, road_item: dict, weather_data: dict = None) -> tuple:
        """
        Evaluate a road segment.
        Returns (alert_object_or_none, evaluation_dict)
        """
        road_id = str(road_item.get("road_id", road_item.get("id", "ROAD-NE-01")))
        state = road_item.get("state", "Assam")
        road_name = road_item.get("road_name", f"Road {road_id}")
        lat = float(road_item.get("latitude", 25.5788))
        lon = float(road_item.get("longitude", 91.8933))

        if not weather_data:
            weather_data = self.weather_service.fetch_live_weather(lat, lon)

        pred = prediction_service.predict_road_risk(road_item, weather_data)
        probability = float(pred["ensemble_probability"])
        risk_level = pred["risk_level"] # Low, Medium, High, Critical
        current_rank = RISK_RANKS.get(risk_level, 1)

        # Check existing alerts for this road to evaluate de-duplication & risk escalation
        last_alert = db.query(Alert).filter(Alert.road_id == road_id).order_by(desc(Alert.created_at)).first()
        prev_risk_level = last_alert.risk_level if last_alert else "Low"
        prev_rank = RISK_RANKS.get(prev_risk_level, 1)

        now = datetime.datetime.utcnow()
        should_alert = False
        reason = ""

        # Condition 1: Risk is High or Critical
        if risk_level in ["High", "Critical"]:
            should_alert = True
            reason = f"Risk is {risk_level} (probability {probability * 100:.1f}%)"

        # Condition 2: Risk increased from previous level (e.g. Low -> Medium)
        if current_rank > prev_rank:
            should_alert = True
            reason = f"Risk escalated from {prev_risk_level} to {risk_level}"

        # De-duplication check: If last alert is active and identical risk level
        if should_alert and last_alert and last_alert.status == "ACTIVE" and last_alert.risk_level == risk_level:
            time_since_last = (now - last_alert.created_at).total_seconds()
            if time_since_last < self.cooldown_seconds:
                # Suppress duplicate alert
                logger.info(f"Alert suppressed for {road_id}: Identical {risk_level} alert active within cooldown window ({int(time_since_last)}s / {self.cooldown_seconds}s)")
                return None, {
                    "road_id": road_id,
                    "road_name": road_name,
                    "state": state,
                    "latitude": lat,
                    "longitude": lon,
                    "probability": probability,
                    "risk_level": risk_level,
                    "alert_generated": False,
                    "suppressed_due_to_cooldown": True,
                    "evaluation_time": now.isoformat()
                }

        created_alert = None
        if should_alert:
            # Build specific actionable alert message (Req 8 & 11)
            if risk_level == "Critical":
                title = f"CRITICAL LANDSLIDE HAZARD: {road_id} ({road_name})"
                alert_message = (
                    f"CRITICAL LANDSLIDE HAZARD on {road_id} - {road_name} ({state}) at coordinates [{lat:.4f}, {lon:.4f}]. "
                    f"AI ensemble probability is {probability * 100:.1f}%. "
                    f"EMERGENCY ADVISORY: IMMEDIATELY AVOID THIS ROAD CORRIDOR. "
                    f"High probability of catastrophic slope failure, rockfall, and road blockage. "
                    f"Traffic is being halted; seek alternate disaster evacuation corridors."
                )
                recommended_action = f"Avoid {road_id}. Do not travel along {road_name}. Follow emergency bypass routes and dial 108 for assistance."
            elif risk_level == "High":
                title = f"HIGH LANDSLIDE WARNING: {road_id} ({road_name})"
                alert_message = (
                    f"HIGH LANDSLIDE WARNING on {road_id} - {road_name} ({state}) at coordinates [{lat:.4f}, {lon:.4f}]. "
                    f"AI ensemble probability is {probability * 100:.1f}%. "
                    f"ADVISORY: Restrict non-essential travel along this road. "
                    f"Significant threat of slope slump, surface fissures, and debris accumulation."
                )
                recommended_action = f"Exercise extreme caution on {road_id}. Heavy vehicles should divert to secondary bypass corridors."
            else:
                title = f"ELEVATED RISK NOTICE: {road_id} ({road_name})"
                alert_message = (
                    f"ELEVATED RISK on {road_id} - {road_name} ({state}). "
                    f"Risk level escalated to {risk_level} with probability {probability * 100:.1f}%. "
                    f"Continuous monitoring enabled."
                )
                recommended_action = f"Monitor road sensor telemetry and stay alert for updates on {road_id}."

            unique_alert_id = f"ALT-{road_id}-{int(now.timestamp())}"

            created_alert = Alert(
                alert_id=unique_alert_id,
                road_id=road_id,
                location_name=road_name,
                state=state,
                latitude=lat,
                longitude=lon,
                probability=probability,
                risk_level=risk_level,
                alert_level=risk_level.upper(),
                hazard_type="LANDSLIDE",
                title=title,
                message=alert_message,
                alert_message=alert_message,
                recommended_action=recommended_action,
                status="ACTIVE",
                is_active=True,
                created_at=now,
                broadcast_channels="SMS, Push, Siren, NDMA Hub, WebSocket"
            )
            db.add(created_alert)
            db.commit()
            db.refresh(created_alert)
            logger.info(f"Generated alert {unique_alert_id} for {road_id} [{risk_level} - {probability * 100:.1f}%]")

        eval_summary = {
            "road_id": road_id,
            "road_name": road_name,
            "state": state,
            "latitude": lat,
            "longitude": lon,
            "probability": probability,
            "risk_level": risk_level,
            "alert_generated": created_alert is not None,
            "alert_id": created_alert.alert_id if created_alert else None,
            "evaluation_time": now.isoformat()
        }

        return created_alert, eval_summary

    async def check_all_monitored_roads(self, db: Session) -> dict:
        """
        Execute full check cycle across all monitored Northeast roads.
        Broadcasts any newly generated alerts immediately via WebSockets.
        """
        roads = self.get_monitored_roads()
        results = []
        alerts_generated = []

        for r in roads:
            try:
                alert_obj, eval_info = self.evaluate_road_for_alert(db, r)
                results.append(eval_info)
                if alert_obj:
                    alert_dict = {
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
                        "created_at": alert_obj.created_at.isoformat() if alert_obj.created_at else datetime.datetime.utcnow().isoformat(),
                        "status": alert_obj.status
                    }
                    alerts_generated.append(alert_dict)
                    # Broadcast in real-time over WebSockets (Req 9 & 10)
                    try:
                        await websocket_manager.broadcast_alert(alert_dict)
                    except Exception as ws_err:
                        logger.warning(f"WebSocket broadcast error: {ws_err}")
            except Exception as e:
                logger.error(f"Error evaluating road {r.get('road_id')}: {e}", exc_info=True)

        return {
            "status": "COMPLETED",
            "total_roads_checked": len(roads),
            "new_alerts_count": len(alerts_generated),
            "alerts": alerts_generated,
            "road_evaluations": results,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

alert_service = AlertService()
