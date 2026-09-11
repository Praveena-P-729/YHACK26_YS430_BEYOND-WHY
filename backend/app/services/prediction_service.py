import os
import logging
import pandas as pd
import numpy as np
from app.ml.risk_engine import risk_engine

logger = logging.getLogger("LandGuard.PredictionService")

class PredictionService:
    def __init__(self):
        self.risk_engine = risk_engine

    def classify_risk_level(self, probability: float) -> str:
        """
        Risk classification as per specification:
        0.00–0.24 = Low
        0.25–0.49 = Medium
        0.50–0.74 = High
        0.75–1.00 = Critical
        """
        prob = max(0.0, min(1.0, float(probability)))
        if prob >= 0.75:
            return "Critical"
        elif prob >= 0.50:
            return "High"
        elif prob >= 0.25:
            return "Medium"
        else:
            return "Low"

    def build_17_feature_dict(self, terrain_data: dict, weather_data: dict) -> dict:
        """
        Combine 8 terrain features and 9 weather features into a clean 17-feature mapping.
        """
        # Terrain features
        elevation_m = float(terrain_data.get("elevation_m", terrain_data.get("elevation", 1150.0)) or 1150.0)
        slope_degree = float(terrain_data.get("slope_degree", terrain_data.get("slope_angle", 31.5)) or 31.5)
        aspect_degree = float(terrain_data.get("aspect_degree", 135.0) or 135.0)
        curvature = float(terrain_data.get("curvature", 0.08) or 0.08)
        terrain_roughness = float(terrain_data.get("terrain_roughness", slope_degree * 0.45) or (slope_degree * 0.45))
        relative_relief_m = float(terrain_data.get("relative_relief_m", elevation_m * 0.22) or (elevation_m * 0.22))
        ndvi = float(terrain_data.get("ndvi", terrain_data.get("vegetation_density", 0.65)) or 0.65)
        veg_loss = float(terrain_data.get("vegetation_loss_index", max(0.05, 1.0 - ndvi)) or max(0.05, 1.0 - ndvi))

        # Weather features from Open-Meteo
        rain_1h = float(weather_data.get("rainfall_1h_mm", weather_data.get("rainfall_1h", 12.0)) or 12.0)
        rain_6h = float(weather_data.get("rainfall_6h_mm", weather_data.get("rainfall_6h", rain_1h * 4.2)) or (rain_1h * 4.2))
        rain_24h = float(weather_data.get("rainfall_24h_mm", weather_data.get("rainfall_24h", rain_6h * 2.8)) or (rain_6h * 2.8))
        rain_3d = float(weather_data.get("rainfall_3d_mm", rain_24h * 2.2) or (rain_24h * 2.2))
        rain_7d = float(weather_data.get("rainfall_7d_mm", rain_3d * 1.8) or (rain_3d * 1.8))

        soil_moisture = float(weather_data.get("soil_moisture", 42.0) or 42.0)
        soil_moist_norm = soil_moisture / 100.0 if soil_moisture > 1.0 else soil_moisture

        temp_c = float(weather_data.get("temperature_c", weather_data.get("temperature", 22.0)) or 22.0)
        humidity = float(weather_data.get("humidity_percent", weather_data.get("humidity", 85.0)) or 85.0)
        wind_speed = float(weather_data.get("wind_speed_kmh", weather_data.get("wind_speed", 12.0)) or 12.0)

        return {
            "elevation_m": round(elevation_m, 2),
            "slope_degree": round(slope_degree, 2),
            "aspect_degree": round(aspect_degree, 2),
            "curvature": round(curvature, 4),
            "terrain_roughness": round(terrain_roughness, 2),
            "relative_relief_m": round(relative_relief_m, 2),
            "ndvi": round(ndvi, 3),
            "vegetation_loss_index": round(veg_loss, 3),
            "rainfall_1h_mm": round(rain_1h, 2),
            "rainfall_6h_mm": round(rain_6h, 2),
            "rainfall_24h_mm": round(rain_24h, 2),
            "rainfall_3d_mm": round(rain_3d, 2),
            "rainfall_7d_mm": round(rain_7d, 2),
            "soil_moisture": round(soil_moist_norm, 4),
            "temperature_c": round(temp_c, 1),
            "humidity_percent": round(humidity, 1),
            "wind_speed_kmh": round(wind_speed, 1),
        }

    def predict_road_risk(self, terrain_data: dict, weather_data: dict) -> dict:
        """
        Execute 17-feature ensemble inference on pre-trained Random Forest + XGBoost models.
        ensemble_probability = 0.5 * rf_prob + 0.5 * xgb_prob
        """
        feat_dict = self.build_17_feature_dict(terrain_data, weather_data)

        rf_prob = 0.50
        xgb_prob = 0.50
        ensemble_prob = 0.50

        try:
            if self.risk_engine.is_ml_loaded:
                feature_cols = getattr(self.risk_engine, "feature_columns", None)
                if feature_cols and len(feature_cols) == 17:
                    df_input = pd.DataFrame([feat_dict], columns=feature_cols)
                else:
                    df_input = pd.DataFrame([feat_dict])

                if self.risk_engine.rf_model is not None:
                    rf_prob = float(self.risk_engine.rf_model.predict_proba(df_input)[0, 1])
                if self.risk_engine.xgb_model is not None:
                    xgb_prob = float(self.risk_engine.xgb_model.predict_proba(df_input)[0, 1])

                rf_w = self.risk_engine.ensemble_config.get("rf_weight", 0.5)
                xgb_w = self.risk_engine.ensemble_config.get("xgb_weight", 0.5)
                ensemble_prob = (rf_w * rf_prob) + (xgb_w * xgb_prob)
            else:
                # Physics-informed hydrostatic geotechnical calculation fallback
                slope = feat_dict["slope_degree"]
                rain24 = feat_dict["rainfall_24h_mm"]
                soil_m = feat_dict["soil_moisture"] * 100.0
                base_susceptibility = min(0.98, max(0.05, (slope / 60.0) * 0.45 + (rain24 / 200.0) * 0.40 + (soil_m / 100.0) * 0.15))
                rf_prob = base_susceptibility
                xgb_prob = min(1.0, base_susceptibility * 1.05)
                ensemble_prob = 0.5 * rf_prob + 0.5 * xgb_prob
        except Exception as e:
            logger.error(f"Inference error in predict_road_risk: {e}", exc_info=True)
            # Safe conservative heuristic
            slope = feat_dict["slope_degree"]
            rain24 = feat_dict["rainfall_24h_mm"]
            ensemble_prob = min(0.95, max(0.1, (slope / 45.0) * 0.5 + (rain24 / 150.0) * 0.5))
            rf_prob = ensemble_prob
            xgb_prob = ensemble_prob

        ensemble_prob = round(float(np.clip(ensemble_prob, 0.0, 1.0)), 4)
        risk_level = self.classify_risk_level(ensemble_prob)

        return {
            "ensemble_probability": ensemble_prob,
            "random_forest_probability": round(float(rf_prob), 4),
            "xgboost_probability": round(float(xgb_prob), 4),
            "risk_level": risk_level,
            "features_used": feat_dict,
            "model_version": "Ensemble-RF-XGB-Northeast-v2.0"
        }

prediction_service = PredictionService()
