from app.ml.risk_engine import risk_engine

def predict_landslide_risk(location, reading, horizon: str = 'Now') -> dict:
    eval_result = risk_engine.evaluate_risk(location, reading, horizon=horizon)
    score = eval_result['risk_score']
    
    if score >= 80.0:
        level = 'CRITICAL'
    elif score >= 60.0:
        level = 'HIGH'
    elif score >= 30.0:
        level = 'MEDIUM'
    else:
        level = 'LOW'

    return {
        'hazard_type': 'landslide',
        'risk_probability': score,
        'risk_level': level,
        'forecast_horizon': horizon,
        'confidence': eval_result['confidence'],
        'model_version': eval_result['model_version'],
        'primary_driver': eval_result['primary_driver'],
        'factor_contributions': eval_result['factor_contributions']
    }