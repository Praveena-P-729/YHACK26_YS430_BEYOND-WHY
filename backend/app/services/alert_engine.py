import datetime
from sqlalchemy.orm import Session
from app.models.models import Alert, Location

class AlertEngine:
    def __init__(self):
        pass

    def evaluate_and_create_alerts(self, db: Session, location: Location, multi_hazard: dict) -> list[Alert]:
        alerts_created = []
        loc_name = location.name if location else 'North-Eastern Regional Corridor'
        loc_id = location.id if location else None

        ls_risk = multi_hazard.get('landslide_risk', 0.0)
        fl_risk = multi_hazard.get('flood_risk', 0.0)
        slope_risk = multi_hazard.get('slope_risk', 'LOW')
        road_impact = multi_hazard.get('road_impact', 'LOW')
        community_risk = multi_hazard.get('community_risk', 'ACCESSIBLE')

        # 1. Landslide Alert
        if ls_risk >= 80.0:
            existing = db.query(Alert).filter(Alert.location_id == loc_id, Alert.hazard_type == 'LANDSLIDE', Alert.status == 'ACTIVE').first()
            if not existing:
                a = Alert(
                    location_id=loc_id,
                    location_name=loc_name,
                    hazard_type='LANDSLIDE',
                    alert_level='CRITICAL',
                    title=f'STAGE-3 LANDSLIDE WARNING: {loc_name}',
                    message=f'Ensemble probability reached {ls_risk}%. Immediate danger of catastrophic debris movement and slope failure.',
                    recommended_action='Enforce complete traffic embargo and evacuate vulnerable hillside settlements.',
                    status='ACTIVE',
                    is_active=True
                )
                db.add(a)
                alerts_created.append(a)

        # 2. Flash Flood Alert
        if fl_risk >= 75.0:
            existing = db.query(Alert).filter(Alert.location_id == loc_id, Alert.hazard_type == 'FLASH_FLOOD', Alert.status == 'ACTIVE').first()
            if not existing:
                a = Alert(
                    location_id=loc_id,
                    location_name=loc_name,
                    hazard_type='FLASH_FLOOD',
                    alert_level='HIGH',
                    title=f'FLASH FLOOD WARNING: {loc_name} River Basin',
                    message=f'Hydrological runoff index at {fl_risk}%. Stream water levels rising rapidly past danger mark.',
                    recommended_action='Move residents to upper elevation shelters and keep riverfront bridges clear.',
                    status='ACTIVE',
                    is_active=True
                )
                db.add(a)
                alerts_created.append(a)

        # 3. Road Blockage Alert
        if road_impact in ['CRITICAL', 'HIGH']:
            existing = db.query(Alert).filter(Alert.location_id == loc_id, Alert.hazard_type == 'ROAD_BLOCKAGE', Alert.status == 'ACTIVE').first()
            if not existing:
                a = Alert(
                    location_id=loc_id,
                    location_name=loc_name,
                    hazard_type='ROAD_BLOCKAGE',
                    alert_level='HIGH',
                    title=f'ROAD BLOCKAGE RISK: {loc_name} Arterial',
                    message='Debris accumulation and slope slump threatening primary transit corridor.',
                    recommended_action='Deploy heavy earth-movers and divert traffic through cleared bypass routes.',
                    status='ACTIVE',
                    is_active=True
                )
                db.add(a)
                alerts_created.append(a)

        if alerts_created:
            db.commit()

        return alerts_created

alert_engine = AlertEngine()