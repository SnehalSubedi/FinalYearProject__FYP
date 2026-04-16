
import cv2
import asyncio
import logging
import torch
from typing import Optional, Union
from ultralytics import YOLO
from app.core.config import settings
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)

# Global YOLO model instance (loaded once)
_yolo_model = None


def load_yolo_model():
    """Load YOLOv8 model once and cache it."""
    global _yolo_model
    if _yolo_model is None:
        logger.info(f"Loading YOLO model: {settings.YOLO_MODEL_PATH}")
        # PyTorch 2.6+ changed weights_only default to True, which blocks
        # ultralytics model classes. Temporarily patch torch.load so YOLO()
        # can load the trusted local model file.
        original_load = torch.load
        torch.load = lambda *args, **kwargs: original_load(
            *args, **{**kwargs, "weights_only": False}
        )
        try:
            _yolo_model = YOLO(settings.YOLO_MODEL_PATH)
        finally:
            torch.load = original_load
        logger.info("YOLO model loaded successfully.")
    return _yolo_model


def _parse_camera_source(cam_url: Optional[str]) -> Union[int, str]:
    """Convert cam_url to the right type for cv2.VideoCapture.

    - "0", "1", etc. → int (device webcam index)
    - Any other string → kept as URL string (auto-append /video for IP Webcam app)
    - None → falls back to settings.IP_CAM_URL
    """
    source = cam_url if cam_url else settings.IP_CAM_URL
    if isinstance(source, str):
        source = source.strip()
        if source.isdigit():
            return int(source)
        # Auto-append /video for IP Webcam Android app if user only gave host:port
        if source.startswith("http") and "/" not in source.split("://", 1)[1]:
            source = source.rstrip("/") + "/video"
    return source


class IPCameraStream:
    """Manages connection to IP webcam or local device camera with auto-reconnect."""

    def __init__(self, source: Union[int, str]):
        """source can be an int (device index, e.g. 0) or a string (IP camera URL)."""
        self.source = source
        self.cap = None
        self.connected = False

    def connect(self) -> bool:
        """Connect to the camera stream."""
        if self.cap:
            self.cap.release()

        logger.info(f"Connecting to camera: {self.source}")
        self.cap = cv2.VideoCapture(self.source)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce latency

        if self.cap.isOpened():
            self.connected = True
            logger.info("Camera connected successfully.")
            return True

        self.connected = False
        logger.error(f"Failed to connect to camera: {self.source}")
        return False

    def read_frame(self):
        """Read a single frame from the stream."""
        if not self.cap or not self.connected:
            return None

        ret, frame = self.cap.read()
        if not ret:
            self.connected = False
            return None

        return frame

    def release(self):
        """Release the camera stream."""
        if self.cap:
            self.cap.release()
            self.connected = False


def _ws_is_connected(websocket) -> bool:
    """Check if a WebSocket is still connected."""
    try:
        return websocket.client_state == WebSocketState.CONNECTED
    except Exception:
        return False


async def stream_yolo_detections(websocket, confidence: Optional[float] = None, cam_url: Optional[str] = None):
    """
    Stream YOLO detections to a WebSocket client.

    Args:
        websocket: FastAPI WebSocket connection
        confidence: Detection confidence threshold (0.0-1.0)
        cam_url: Camera URL or "0" for device webcam. Falls back to settings.IP_CAM_URL.
    """
    if confidence is None:
        confidence = settings.YOLO_CONFIDENCE

    # Load model
    model = load_yolo_model()

    # Determine camera source
    source = _parse_camera_source(cam_url)
    camera = IPCameraStream(source)

    if not camera.connect():
        await websocket.send_json({
            "type": "error",
            "message": f"Failed to connect to camera ({source}). Check the camera source."
        })
        return

    # Send initial connection success
    await websocket.send_json({
        "type": "connected",
        "message": "Stream started",
        "confidence": confidence
    })

    frame_delay = 1.0 / settings.YOLO_TARGET_FPS
    frame_count = 0

    try:
        while _ws_is_connected(websocket):
            # Read frame
            frame = camera.read_frame()

            if frame is None:
                # Try to reconnect, but only if client is still connected
                if not _ws_is_connected(websocket):
                    break

                logger.warning("Stream lost, attempting reconnect...")
                await websocket.send_json({
                    "type": "warning",
                    "message": "Stream lost, reconnecting..."
                })

                await asyncio.sleep(2)

                if not _ws_is_connected(websocket):
                    break

                if not camera.connect():
                    await websocket.send_json({
                        "type": "error",
                        "message": "Could not reconnect to camera."
                    })
                    break
                continue

            # Run YOLO detection
            results = model(frame, conf=confidence, verbose=False)[0]

            # Draw boxes and labels
            annotated_frame = results.plot()

            # Encode frame as JPEG
            _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame_bytes = buffer.tobytes()

            # Check connection before sending
            if not _ws_is_connected(websocket):
                break

            # Build per-class detection counts
            class_counts = {}
            if results.boxes is not None and len(results.boxes) > 0:
                for box in results.boxes:
                    cls_id = int(box.cls[0])
                    cls_name = model.names.get(cls_id, f"class_{cls_id}")
                    class_counts[cls_name] = class_counts.get(cls_name, 0) + 1

            # Send frame info + image data
            await websocket.send_json({
                "type": "frame",
                "frame_id": frame_count,
                "detections": len(results.boxes),
                "class_counts": class_counts,
                "size": len(frame_bytes)
            })

            # Send binary image data
            await websocket.send_bytes(frame_bytes)

            frame_count += 1

            # FPS control
            await asyncio.sleep(frame_delay)

    except Exception as e:
        logger.error(f"Streaming error: {e}")
        if _ws_is_connected(websocket):
            try:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
            except Exception:
                pass
    finally:
        camera.release()
        logger.info("Stream ended, camera released.")
