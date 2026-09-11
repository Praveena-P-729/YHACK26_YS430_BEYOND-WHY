import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import (
    auth, locations, monitoring, predictions, alerts, 
    incidents, shelters, analytics, reports, simulation, notifications,
    routes_risk, officer_ops, weather, multi_hazard, field_reports, sync
)
from app.seed import seed_database

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LANDSAFE / LANDGUARD AI - Early Warning, Route Risk Checker & Multi-Hazard Command HUD (North-Eastern Region of India)"
)

# Enable CORS for React frontend (Local, Vercel, and custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(monitoring.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(shelters.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(routes_risk.router, prefix=settings.API_V1_STR)
app.include_router(officer_ops.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(multi_hazard.router, prefix=settings.API_V1_STR)
app.include_router(field_reports.router, prefix=settings.API_V1_STR)
app.include_router(sync.router, prefix=settings.API_V1_STR)

# Also mount routes at root level for direct endpoint compatibility
app.include_router(weather.router)
app.include_router(multi_hazard.router)
app.include_router(alerts.router)
app.include_router(field_reports.router)
app.include_router(sync.router)

from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import websocket_manager
from app.services.scheduler_service import scheduler_service

# WebSocket endpoint for real-time alerts stream (Requirement 9 & 12)
@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Maintain active connection and listen for client heartbeats
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "PONG", "timestamp": datetime.datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception:
        websocket_manager.disconnect(websocket)

@app.on_event("startup")
async def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    # Start 30-minute background weather check & inference scheduler (Requirement 13)
    try:
        scheduler_service.start()
    except Exception as e:
        print(f"Scheduler start notice: {e}")

@app.on_event("shutdown")
def on_shutdown():
    try:
        scheduler_service.stop()
    except Exception as e:
        print(f"Scheduler shutdown notice: {e}")

# Mount React frontend static assets if dist exists
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dist"))
if os.path.exists(dist_dir) and os.path.exists(os.path.join(dist_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "health", "roads", "predict"]:
            return {"detail": "Not found"}
        target_file = os.path.join(dist_dir, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "system": "LANDSAFE / LANDGUARD AI Multi-Hazard Platform",
            "challenge": "Challenge 24: AI-Powered Landslide Early Warning & Monitoring System",
            "target_region": "North-Eastern Region of India",
            "status": "ONLINE",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "api_docs": "/docs",
            "rbac_support": ["citizen", "field_officer", "admin"]
        }
