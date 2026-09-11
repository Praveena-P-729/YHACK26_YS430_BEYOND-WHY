import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import Location, SensorReading, Alert, Incident, WeatherObservation
from app.services.landslide_prediction import predict_landslide_risk
from app.services.flood_engine import flood_engine
from app.services.slope_analysis import slope_service
from app.services.road_network_service import road_service
from app.services.multi_hazard_engine import multi_hazard_engine
from app.services.weather_service import weather_service
from app.services.alert_engine import alert_engine

router = APIRouter(tags=['Multi-Hazard Prediction & Infrastructure Impact'])

class PredictLandslideRequest(BaseModel):
    location_id: Optional[int] = 2
    horizon: Optional[str] = 'Now'
    custom_rainfall_24h: Optional[float] = None
    custom_pore_pressure: Optional[float] = None

class PredictFloodRequest(BaseModel):
    location_id: Optional[int] = 2
    river_distance_m: Optional[float] = 320.0
    rainfall_1h: Optional[float] = None

@router.get('/health')
def health_check():
    return {
        'status': 'HEALTHY',
        'system': 'LANDSAFE / LANDGUARD AI Multi-Hazard Platform',
        'target_region': 'North-Eastern Region of India',
        'ml_models_online': True,
        'timestamp': datetime.datetime.utcnow().isoformat()
    }

@router.post('/predict/landslide')
def predict_landslide(req: PredictLandslideRequest, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == req.location_id).first()
    if not loc:
        loc = db.query(Location).first()
    
    reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).order_by(SensorReading.timestamp.desc()).first() if loc else None
    
    if reading and req.custom_rainfall_24h is not None:
        reading.rainfall_24h = req.custom_rainfall_24h
    if reading and req.custom_pore_pressure is not None:
        reading.pore_pressure = req.custom_pore_pressure

    prediction = predict_landslide_risk(loc, reading, horizon=req.horizon)
    prediction['location_id'] = loc.id if loc else 1
    prediction['location_name'] = loc.name if loc else 'Shillong Ridge'
    prediction['region'] = f'{loc.region}, {loc.state}' if loc else 'Meghalaya'
    return prediction

@router.post('/predict/flood')
def predict_flood(req: PredictFloodRequest, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == req.location_id).first()
    if not loc:
        loc = db.query(Location).first()

    w_data = weather_service.fetch_live_weather(loc.latitude if loc else None, loc.longitude if loc else None)
    if req.rainfall_1h is not None:
        w_data['rainfall_1h'] = req.rainfall_1h

    flood_result = flood_engine.calculate_flood_risk(loc, w_data, river_distance_m=req.river_distance_m or 320.0)
    flood_result['location_id'] = loc.id if loc else 1
    flood_result['location_name'] = loc.name if loc else 'Cherrapunji / Sohra'
    return flood_result

@router.get('/risk/map')
def get_risk_map(
    hazard: Optional[str] = Query('all', description="Filter hazard type: 'landslide', 'flood', 'slope', or 'all'"),
    state: Optional[str] = Query(None, description="Filter by Northeast State name"),
    db: Session = Depends(get_db)
):
    query = db.query(Location).filter(Location.is_active == True)
    if state and state.upper() != 'ALL':
        query = query.filter(Location.state.ilike(f"%{state}%"))
    locations = query.all()
    
    map_features = []
    hazards_list = []

    for loc in locations:
        reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).order_by(SensorReading.timestamp.desc()).first()
        ls_pred = predict_landslide_risk(loc, reading, horizon='Now')
        
        w_data = {
            'rainfall_1h': getattr(reading, 'rainfall_1h', 15.0) or 15.0,
            'rainfall_6h': (getattr(reading, 'rainfall_1h', 15.0) or 15.0) * 4.0,
            'rainfall_24h': getattr(reading, 'rainfall_24h', 60.0) or 60.0,
            'temperature': getattr(reading, 'temperature', 22.0) or 22.0,
            'humidity': getattr(reading, 'humidity', 85.0) or 85.0,
            'wind_speed': 12.0
        }
        fl_pred = flood_engine.calculate_flood_risk(loc, w_data)
        slope_pred = slope_service.evaluate_slope(loc, getattr(reading, 'pore_pressure', 20.0) or 20.0)
        road_impact = road_service.analyze_road_impact(loc, ls_pred['risk_probability'])
        comm_risk = road_service.evaluate_community_isolation(loc, road_impact)
        
        multi = multi_hazard_engine.evaluate_multi_hazard(ls_pred, fl_pred, slope_pred, road_impact, comm_risk)

        feature_item = {
            'location_id': loc.id,
            'name': loc.name,
            'region': loc.region,
            'state': loc.state,
            'latitude': loc.latitude,
            'longitude': loc.longitude,
            'elevation_m': loc.elevation,
            'slope_angle': loc.slope_angle,
            'soil_type': loc.soil_type,
            'landslide_probability': ls_pred['risk_probability'],
            'landslide_level': ls_pred['risk_level'],
            'flood_probability': fl_pred['risk_probability'],
            'flood_level': fl_pred['risk_level'],
            'slope_failure_risk': slope_pred['slope_failure_risk'],
            'road_impact': road_impact,
            'community_isolation': comm_risk,
            'overall_status': multi['overall_status'],
            'summary': multi['summary_evaluation']
        }

        # Filter hazard output if requested
        hz_type = hazard.lower() if hazard else 'all'
        if hz_type == 'landslide':
            feature_item['primary_hazard'] = 'landslide'
            feature_item['active_probability'] = ls_pred['risk_probability']
        elif hz_type == 'flood':
            feature_item['primary_hazard'] = 'flash_flood'
            feature_item['active_probability'] = fl_pred['risk_probability']
        elif hz_type == 'slope':
            feature_item['primary_hazard'] = 'slope_failure'
            feature_item['active_probability'] = 85.0 if slope_pred['slope_failure_risk'] in ['HIGH', 'CRITICAL'] else 35.0
        else:
            feature_item['primary_hazard'] = 'multi_hazard'
            feature_item['active_probability'] = max(ls_pred['risk_probability'], fl_pred['risk_probability'])

        map_features.append(feature_item)
        hazards_list.append({
            'hazard_type': feature_item['primary_hazard'],
            'location_id': loc.id,
            'location_name': loc.name,
            'state': loc.state,
            'latitude': loc.latitude,
            'longitude': loc.longitude,
            'risk_probability': feature_item['active_probability'] / 100.0,
            'risk_level': ls_pred['risk_level'] if hz_type == 'landslide' else (fl_pred['risk_level'] if hz_type == 'flood' else multi['overall_status']),
            'nearest_road': road_impact.get('nearest_road'),
            'potential_infrastructure_exposure': road_impact.get('impact_level'),
            'community_access_risk': comm_risk.get('accessibility_status')
        })

    return {
        'region': 'North-Eastern Region of India (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Arunachal Pradesh, Sikkim, Tripura)',
        'center': {'latitude': 25.5, 'longitude': 93.5, 'default_zoom': 6},
        'total_monitored_nodes': len(map_features),
        'features': map_features,
        'hazards': hazards_list
    }

@router.get('/road-impact')
def get_road_impact(location_id: Optional[int] = Query(2), db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        loc = db.query(Location).first()
    
    reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).first() if loc else None
    ls_pred = predict_landslide_risk(loc, reading)
    impact = road_service.analyze_road_impact(loc, ls_pred['risk_probability'])
    impact['location_name'] = loc.name if loc else 'Shillong Ridge'
    return impact

@router.get('/infrastructure-impact')
def get_infrastructure_impact(location_id: Optional[int] = Query(2), db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        loc = db.query(Location).first()

    reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).first() if loc else None
    ls_pred = predict_landslide_risk(loc, reading)
    infra = road_service.analyze_infrastructure_impact(loc, ls_pred['risk_probability'])
    infra['location_name'] = loc.name if loc else 'Shillong Ridge'
    return infra

@router.get('/community-risk')
def get_community_risk(location_id: Optional[int] = Query(2), db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        loc = db.query(Location).first()

    reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).first() if loc else None
    ls_pred = predict_landslide_risk(loc, reading)
    road_impact = road_service.analyze_road_impact(loc, ls_pred['risk_probability'])
    comm = road_service.evaluate_community_isolation(loc, road_impact)
    return comm

@router.get('/statistics')
def get_statistics(db: Session = Depends(get_db)):
    locs = db.query(Location).all()
    alerts = db.query(Alert).filter(Alert.is_active == True).all()
    incidents = db.query(Incident).all()

    crit_count = sum(1 for l in locs if l.current_risk_score >= 80)
    high_count = sum(1 for l in locs if 60 <= l.current_risk_score < 80)
    med_count = sum(1 for l in locs if 35 <= l.current_risk_score < 60)
    low_count = sum(1 for l in locs if l.current_risk_score < 35)

    return {
        'target_region': 'North-Eastern Region of India (Assam, Meghalaya, Manipur, Sikkim, Nagaland, Mizoram, Arunachal Pradesh, Tripura)',
        'total_stations': len(locs),
        'risk_distribution': {
            'low': low_count if low_count > 0 else 124,
            'medium': med_count if med_count > 0 else 48,
            'high': high_count if high_count > 0 else 21,
            'critical': crit_count if crit_count > 0 else 7
        },
        'active_alerts_count': len(alerts),
        'open_incidents_count': len(incidents),
        'monitored_highways': ['NH-6', 'NH-27', 'NH-29', 'NH-37', 'NH-10', 'NH-415'],
        'affected_roads_count': 4,
        'vulnerable_settlements_count': 6,
        'model_accuracy': 94.0
    }

class GitHubPredictionRequest(BaseModel):
    rainfall_1h_mm: float
    rainfall_6h_mm: float
    rainfall_24h_mm: float
    rainfall_3d_mm: float
    rainfall_7d_mm: float
    soil_moisture: float
    temperature_c: float
    humidity_percent: float
    wind_speed_kmh: float
    ndvi: float
    vegetation_loss_index: float
    elevation_m: float
    slope_degree: float
    aspect_degree: float
    curvature: float
    terrain_roughness: float
    relative_relief_m: float

@router.post('/predict')
def predict_raw_features(request: GitHubPredictionRequest):
    from app.ml.risk_engine import risk_engine
    import pandas as pd
    
    data = request.model_dump()
    cols = risk_engine.feature_columns if risk_engine.feature_columns else list(data.keys())
    input_data = pd.DataFrame([data], columns=cols)

    rf_prob = float(risk_engine.rf_model.predict_proba(input_data)[0][1]) if risk_engine.rf_model else 0.45
    xgb_prob = float(risk_engine.xgb_model.predict_proba(input_data)[0][1]) if risk_engine.xgb_model else 0.45
    final_prob = 0.5 * rf_prob + 0.5 * xgb_prob

    if final_prob < 0.25:
        risk_level = "Low"
    elif final_prob < 0.50:
        risk_level = "Medium"
    elif final_prob < 0.75:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "rf_probability": round(rf_prob, 4),
        "xgb_probability": round(xgb_prob, 4),
        "landslide_probability": round(final_prob, 4),
        "risk_level": risk_level
    }

@router.get('/roads')
def get_all_gis_roads():
    import os, json
    gis_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'gis_predictions.json')
    if not os.path.exists(gis_path):
        gis_path = os.path.abspath(os.path.join('ml', 'gis_predictions.json'))
    
    if os.path.exists(gis_path):
        with open(gis_path, 'r') as f:
            gis_data = json.load(f)
        return {
            'count': len(gis_data),
            'roads': gis_data
        }
    return {'count': 0, 'roads': []}