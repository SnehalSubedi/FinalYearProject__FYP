"""
🌿 Weed Detection Service
==========================
Uses Roboflow crop-and-weed-detection-gacus/1 model via direct HTTP API.
Supports: image upload + real-time IP cam streaming via WebSocket.

Classes:
    0 = Crop (desired plant)
    1 = Weed (unwanted plant)
"""

import os
import io
import base64
import asyncio
from typing import Any
import cv2  # type: ignore
import numpy as np
from PIL import Image
import requests  # type: ignore
from app.core.config import settings

# ─────────────────────────────────────────
# Roboflow API Configuration
# ─────────────────────────────────────────
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", settings.ROBOFLOW_API_KEY)
MODEL_ID = "crop-and-weed-detection-gacus/1"
ROBOFLOW_API_URL = f"https://serverless.roboflow.com/{MODEL_ID}"


def _infer_image_bytes(image_bytes: bytes) -> dict:
    """Send image bytes to Roboflow inference API and return raw result."""
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")
    response = requests.post(
        ROBOFLOW_API_URL,
        params={"api_key": ROBOFLOW_API_KEY},
        data=img_b64,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    response.raise_for_status()
    return response.json()


CLASS_LABELS = {
    "0": "Crop",
    "1": "Weed",
}

CLASS_COLORS = {
    "0": "#22c55e",  # green for crop
    "1": "#ef4444",  # red for weed
}


# ─────────────────────────────────────────
# Parse Roboflow Predictions
# ─────────────────────────────────────────
def parse_predictions(result: Any) -> dict:
    """Parse Roboflow predictions into a clean format."""
    predictions = []

    if isinstance(result, list):
        raw_preds = result
    else:
        raw_preds = result.get("predictions", [])

    for pred in raw_preds:
        class_id = str(pred.get("class_id", pred.get("class", "1")))
        label = CLASS_LABELS.get(class_id, f"Class {class_id}")
        color = CLASS_COLORS.get(class_id, "#ffffff")

        predictions.append({
            "x": pred.get("x", 0),
            "y": pred.get("y", 0),
            "width": pred.get("width", 0),
            "height": pred.get("height", 0),
            "confidence": round(pred.get("confidence", 0) * 100, 1),
            "class_id": class_id,
            "label": label,
            "color": color,
        })

    weed_count = sum(1 for p in predictions if p["class_id"] == "1")
    crop_count = sum(1 for p in predictions if p["class_id"] == "0")

    return {
        "predictions": predictions,
        "summary": {
            "total": len(predictions),
            "weeds": weed_count,
            "crops": crop_count,
            "weed_percentage": round(
                (weed_count / len(predictions) * 100) if predictions else 0, 1
            ),
        },
    }


# ─────────────────────────────────────────
# Image Upload Prediction
# ─────────────────────────────────────────
def predict_weed_from_image(image_bytes: bytes) -> dict:
    """Run weed detection on uploaded image bytes."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    result = _infer_image_bytes(buf.getvalue())
    return parse_predictions(result)


# ─────────────────────────────────────────
# Real-Time IP Camera Stream
# ─────────────────────────────────────────
async def stream_weed_detections(websocket, confidence_threshold: float = 0.3, cam_url: str | None = None):
    """
    Stream weed detections from IP camera over WebSocket.
    Sends JSON metadata + annotated JPEG frames.
    """
    from starlette.websockets import WebSocketState

    cam_url = cam_url or settings.IP_CAM_URL
    target_fps = settings.WEED_TARGET_FPS
    frame_delay = 1.0 / target_fps

    def ws_connected():
        try:
            return websocket.client_state == WebSocketState.CONNECTED
        except Exception:
            return False

    cap = cv2.VideoCapture(cam_url)
    if not cap.isOpened():
        await websocket.send_json({"error": "Could not connect to IP camera."})
        return

    frame_id = 0
    try:
        while ws_connected():
            ret, frame = cap.read()
            if not ret:
                if not ws_connected():
                    break
                # Try reconnect
                cap.release()
                await asyncio.sleep(1)
                if not ws_connected():
                    break
                cap = cv2.VideoCapture(cam_url)
                if not cap.isOpened():
                    if ws_connected():
                        await websocket.send_json({"error": "Lost connection to IP camera."})
                    break
                continue

            frame_id += 1

            # Encode frame to JPEG bytes for inference
            _, jpeg_bytes = cv2.imencode(".jpg", frame)
            result = await asyncio.to_thread(_infer_image_bytes, jpeg_bytes.tobytes())
            parsed = parse_predictions(result)

            # Filter by confidence threshold
            filtered_preds = [
                p for p in parsed["predictions"]
                if p["confidence"] >= confidence_threshold * 100
            ]
            weed_count = sum(1 for p in filtered_preds if p["class_id"] == "1")
            crop_count = sum(1 for p in filtered_preds if p["class_id"] == "0")
            parsed["predictions"] = filtered_preds
            parsed["summary"] = {
                "total": len(filtered_preds),
                "weeds": weed_count,
                "crops": crop_count,
                "weed_percentage": round(
                    (weed_count / len(filtered_preds) * 100) if filtered_preds else 0, 1
                ),
            }

            # Draw bounding boxes on frame
            for pred in filtered_preds:
                x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
                x1, y1 = int(x - w / 2), int(y - h / 2)
                x2, y2 = int(x + w / 2), int(y + h / 2)
                color_hex = pred["color"]
                bgr = tuple(int(color_hex.lstrip("#")[i:i+2], 16) for i in (4, 2, 0))
                cv2.rectangle(frame, (x1, y1), (x2, y2), bgr, 2)
                label_text = f"{pred['label']} {pred['confidence']}%"
                cv2.putText(frame, label_text, (x1, y1 - 8),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, bgr, 2)

            # Encode annotated frame to JPEG
            _, jpeg_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])

            if not ws_connected():
                break

            # Send JSON metadata
            await websocket.send_json({
                "frame_id": frame_id,
                "detections": len(filtered_preds),
                "summary": parsed["summary"],
                "predictions": filtered_preds,
            })

            # Send binary JPEG frame
            await websocket.send_bytes(jpeg_buf.tobytes())

            await asyncio.sleep(frame_delay)

    finally:
        cap.release()
