import math

class FlashFloodRiskEngine:
    def __init__(self):
        self.engine_version = 'Hydrological-Runoff-v2.1'

    def calculate_flood_risk(self, location, weather_data: dict, river_distance_m: float = 350.0) -> dict:
        rainfall_1h = float(weather_data.get('rainfall_1h', weather_data.get('rainfall', 15.0)) or 15.0)
        rainfall_6h = float(weather_data.get('rainfall_6h', rainfall_1h * 4.0) or 60.0)
        rainfall_24h = float(weather_data.get('rainfall_24h', rainfall_1h * 8.0) or 120.0)
        slope = getattr(location, 'slope_angle', 25.0) or 25.0
        elevation = getattr(location, 'elevation', 500.0) or 500.0

        # Runoff generation component (heavy rain on steep upstream terrain)
        rain_score = min(100.0, (rainfall_1h / 40.0) * 40.0 + (rainfall_6h / 100.0) * 35.0 + (rainfall_24h / 200.0) * 25.0)

        # Proximity score (closer to river channel = higher vulnerability)
        prox_score = max(10.0, 100.0 - (river_distance_m / 10.0))

        # Topographic accumulation (low slope valley = pooling, steep = rapid flush)
        if slope < 15.0:
            topo_mult = 1.35 # Valley ponding
            drainage = 'POOR (Ponding Vulnerable)'
        elif slope < 30.0:
            topo_mult = 1.10 # Rolling terrain
            drainage = 'MODERATE'
        else:
            topo_mult = 0.85 # Rapid drainage upstream, but severe downstream surge
            drainage = 'RAPID RUNOFF CHUTE'

        raw_probability = (rain_score * 0.55 + prox_score * 0.45) * topo_mult
        risk_probability = min(99.0, max(5.0, round(raw_probability, 1)))

        if risk_probability >= 80.0:
            level = 'CRITICAL'
        elif risk_probability >= 60.0:
            level = 'HIGH'
        elif risk_probability >= 35.0:
            level = 'MEDIUM'
        else:
            level = 'LOW'

        return {
            'hazard_type': 'flash_flood',
            'risk_probability': risk_probability,
            'risk_level': level,
            'engine_version': self.engine_version,
            'river_proximity_m': river_distance_m,
            'drainage_status': drainage,
            'elevation_m': elevation,
            'contributing_factors': {
                'Rainfall Intensity (1h & 6h)': round(rain_score * 0.5, 1),
                'River Channel Proximity': round(prox_score * 0.3, 1),
                'Topographic Drainage Capacity': round((100 - slope * 2) * 0.2, 1)
            }
        }

flood_engine = FlashFloodRiskEngine()