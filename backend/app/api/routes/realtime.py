from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.services.yolo_service import stream_yolo_detections
from app.api.dependencies import get_current_user
from app.core.security import decode_token
import logging

router = APIRouter(prefix="/realtime", tags=["Real-Time Object Detection"])
logger = logging.getLogger(__name__)


@router.websocket("/detect")
async def websocket_realtime_detection(
    websocket: WebSocket,
    token: str = Query(...),
    confidence: float = Query(0.45, ge=0.1, le=0.95)
):
    """
    WebSocket endpoint for real-time object detection.
    
    Query params:
        - token: JWT access token for authentication
        - confidence: Detection confidence threshold (0.1 - 0.95)
    
    Message flow:
        1. Client connects with token
        2. Server validates token
        3. Server streams frames with YOLO detections
        4. Each frame sent as JSON metadata + binary JPEG
    """
    await websocket.accept()
    
    try:
        # Authenticate via token
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            await websocket.send_json({
                "type": "error",
                "message": "Invalid or expired token. Please log in again."
            })
            await websocket.close()
            return
        
        user_id = payload.get("sub")
        logger.info(f"WebSocket connected: user_id={user_id}, confidence={confidence}")
        
        # Start streaming
        await stream_yolo_detections(websocket, confidence)
        
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected by client.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_json({
            "type": "error",
            "message": "Stream error occurred."
        })
    finally:
        await websocket.close()
        logger.info("WebSocket closed.")