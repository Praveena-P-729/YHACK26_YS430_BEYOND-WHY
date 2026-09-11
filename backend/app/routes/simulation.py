from fastapi import APIRouter
import random

router = APIRouter(prefix="/simulation", tags=["Disaster Simulation"])

@router.post("/run")
def run_simulation(data: dict):
    rainfall = data.get("rainfall", 100)
    pore_pressure = data.get("pore_pressure", 30)
    slope = data.get("slope", 35)

    risk = min(99.0, (rainfall * 0.35 + pore_pressure * 1.2 + slope * 0.8))
    level = "Severe" if risk > 75 else "High" if risk > 50 else "Moderate" if risk > 25 else "Low"

    return {
        "simulated_risk_score": round(risk, 1),
        "simulated_risk_level": level,
        "estimated_lead_time_hours": max(2, int(24 - (risk / 4))),
        "evacuation_recommended": risk > 65
    }
