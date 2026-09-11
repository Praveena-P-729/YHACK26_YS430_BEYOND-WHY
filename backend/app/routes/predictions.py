from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Location, SensorReading, Prediction
from app.schemas.schemas import PredictionResponse
from app.ml.risk_engine import risk_engine

router = APIRouter(prefix="/predictions", tags=["AI Landslide Risk Predictions"])

@router.get("/latest", response_model=List[PredictionResponse])
def get_latest_predictions(db: Session = Depends(get_db)):
    locations = db.query(Location).filter(Location.is_active == True).all()
    predictions = []
    for loc in locations:
        pred = db.query(Prediction).filter(Prediction.location_id == loc.id).order_by(Prediction.timestamp.desc()).first()
        if pred:
            predictions.append(pred)
    return predictions

@router.get("/horizons/{location_id}")
def get_prediction_horizons(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    
    latest_reading = db.query(SensorReading).filter(SensorReading.location_id == loc.id).order_by(SensorReading.timestamp.desc()).first()
    
    horizons = ["Now", "+6h", "+12h", "+24h"]
    results = []
    for h in horizons:
        res = risk_engine.evaluate_risk(loc, latest_reading, horizon=h)
        results.append({
            "horizon": h,
            "risk_score": res["risk_score"],
            "risk_level": res["risk_level"],
            "confidence": res["confidence"],
            "primary_driver": res["primary_driver"],
            "factor_contributions": res["factor_contributions"]
        })
    return {"location_id": location_id, "location_name": loc.name, "forecasts": results}
