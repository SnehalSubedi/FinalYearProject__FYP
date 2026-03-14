"""
🌿 Weed Detection Service
==========================
Uses Roboflow crop-and-weed-detection-gacus/1 model via inference_sdk.
Supports: image upload + real-time IP cam streaming via WebSocket.

Classes:
    0 = Crop (desired plant)
    1 = Weed (unwanted plant)
"""

import os
import io
import asyncio
import tempfile
from typing import Any
import cv2  # type: ignore
import numpy as np
from PIL import Image
from inference_sdk import InferenceHTTPClient  # type: ignore
from app.core.config import settings

# ─────────────────────────────────────────
# Roboflow Client Configuration
# ─────────────────────────────────────────
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", settings.ROBOFLOW_API_KEY)
MODEL_ID = "crop-and-weed-detection-gacus/1"

_client = None


def get_client() -> InferenceHTTPClient:
    global _client
    if _client is None:
        _client = InferenceHTTPClient(
            api_url="https://serverless.roboflow.com",
            api_key=ROBOFLOW_API_KEY,
        )
    return _client


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
    client = get_client()

    # Save to temp file for inference_sdk
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image.save(tmp, format="JPEG")
        tmp_path = tmp.name

    try:
        result = client.infer(tmp_path, model_id=MODEL_ID)
        return parse_predictions(result)  # type: ignore[arg-type]
    finally:
        os.unlink(tmp_path)


# ─────────────────────────────────────────
# Real-Time IP Camera Stream
# ─────────────────────────────────────────
async def stream_weed_detections(websocket, confidence_threshold: float = 0.3):
    """
    Stream weed detections from IP camera over WebSocket.
    Sends JSON metadata + annotated JPEG frames.
    """
    client = get_client()
    cam_url = settings.IP_CAM_URL
    target_fps = settings.WEED_TARGET_FPS
    frame_delay = 1.0 / target_fps

    cap = cv2.VideoCapture(cam_url)
    if not cap.isOpened():
        await websocket.send_json({"error": "Could not connect to IP camera."})
        return

    frame_id = 0
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                # Try reconnect
                cap.release()
                await asyncio.sleep(1)
                cap = cv2.VideoCapture(cam_url)
                if not cap.isOpened():
                    await websocket.send_json({"error": "Lost connection to IP camera."})
                    break
                continue

            frame_id += 1

            # Save frame to temp file for inference
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                cv2.imwrite(tmp.name, frame)
                tmp_path = tmp.name

            try:
                result = await asyncio.to_thread(client.infer, tmp_path, model_id=MODEL_ID)
                parsed = parse_predictions(result)  # type: ignore[arg-type]
            finally:
                os.unlink(tmp_path)

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
