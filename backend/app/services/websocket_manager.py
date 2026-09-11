import json
import logging
from typing import List
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("LandGuard.WebSocketManager")

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active clients: {len(self.active_connections)}")
        # Send initial connection acknowledgement
        try:
            await websocket.send_json({
                "type": "CONNECTION_ESTABLISHED",
                "message": "Connected to LandGuard Real-Time Northeast Landslide Alert Stream",
                "active_subscribers": len(self.active_connections)
            })
        except Exception as e:
            logger.warning(f"Error sending welcome packet: {e}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining active: {len(self.active_connections)}")

    async def broadcast_alert(self, alert_data: dict):
        """
        Broadcast a real-time alert payload to all connected frontend clients.
        """
        payload = {
            "type": "REALTIME_LANDSLIDE_ALERT",
            "data": alert_data
        }
        await self.broadcast_json(payload)

    async def broadcast_json(self, payload: dict):
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(payload)
            except Exception as e:
                logger.warning(f"Failed to send message to websocket client: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

websocket_manager = WebSocketManager()
