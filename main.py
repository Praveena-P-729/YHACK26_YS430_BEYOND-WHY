
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import json


# ---------------------------------------
# Load ML models
# ---------------------------------------

rf_model = joblib.load(
    "/content/random_forest_landslide.pkl"
)

xgb_model = joblib.load(
    "/content/xgboost_landslide.pkl"
)

features = joblib.load(
    "/content/landslide_features.pkl"
)


# ---------------------------------------
# Load GIS predictions
# ---------------------------------------

with open(
    "/content/gis_predictions.json",
    "r"
) as file:
    gis_predictions = json.load(file)


# ---------------------------------------
# FastAPI application
# ---------------------------------------

app = FastAPI(
    title="NER Landslide Risk Prediction API",
    description="AI-powered landslide risk prediction for Northeast India",
    version="1.0"
)


# ---------------------------------------
# Prediction request
# ---------------------------------------

class PredictionRequest(BaseModel):

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


# ---------------------------------------
# Risk classification
# ---------------------------------------

def classify_risk(probability):

    if probability < 0.25:
        return "Low"

    elif probability < 0.50:
        return "Medium"

    elif probability < 0.75:
        return "High"

    else:
        return "Critical"


# ---------------------------------------
# Health check
# ---------------------------------------

@app.get("/")
def home():

    return {
        "message": "NER Landslide Risk Prediction API is running",
        "status": "active"
    }


# ---------------------------------------
# Predict risk
# ---------------------------------------

@app.post("/predict")
def predict(request: PredictionRequest):

    data = request.model_dump()

    input_data = pd.DataFrame(
        [data],
        columns=features
    )

    rf_probability = rf_model.predict_proba(
        input_data
    )[0][1]

    xgb_probability = xgb_model.predict_proba(
        input_data
    )[0][1]

    final_probability = (
        0.5 * rf_probability +
        0.5 * xgb_probability
    )

    risk_level = classify_risk(
        final_probability
    )

    return {
        "rf_probability": round(
            float(rf_probability), 4
        ),
        "xgb_probability": round(
            float(xgb_probability), 4
        ),
        "landslide_probability": round(
            float(final_probability), 4
        ),
        "risk_level": risk_level
    }


# ---------------------------------------
# GIS road predictions
# ---------------------------------------

@app.get("/roads")
def get_roads():

    return {
        "count": len(gis_predictions),
        "roads": gis_predictions
    }
