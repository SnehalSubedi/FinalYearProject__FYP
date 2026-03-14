from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Query, status
from app.schemas.schemas import WeedPredictionResponse
from app.services.weed_service import predict_weed_from_image, stream_weed_detections
from app.api.dependencies import get_current_user
from app.core.security import decode_token, is_token_blacklisted

router = APIRouter(prefix="/weed", tags=["Crop & Weed Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE  = 10 * 1024 * 1024  # 10 MB


# ─────────────────────────────────────────
# POST /weed/predict — Image Upload Detection
# ─────────────────────────────────────────
@router.post(
    "/predict",
    response_model=WeedPredictionResponse,
    summary="Detect crops and weeds from a field image",
    description=(
        "Upload a clear photo of a crop field. "
        "Returns bounding box predictions with crop/weed classification, "
        "confidence scores, and a summary with weed percentage. "
        "Requires a valid Bearer token."
    ),
)
async def predict(
    file: UploadFile = File(..., description="Field image — JPEG, PNG, or WebP"),
    current_user: dict = Depends(get_current_user),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Upload a JPEG, PNG, or WebP image.",
        )

    # Read and validate file size
    image_bytes = await file.read()

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 10MB size limit.",
        )

    try:
        result = predict_weed_from_image(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weed detection failed: {str(e)}",
        )

    return WeedPredictionResponse(**result)


# ─────────────────────────────────────────
# WebSocket /weed/stream — Real-Time IP Cam Detection
# ─────────────────────────────────────────
@router.websocket("/stream")
async def weed_realtime_stream(
    websocket: WebSocket,
    token: str = Query(...),
    confidence: float = Query(default=0.3, ge=0.1, le=0.95),
):
    """
    Real-time weed detection from IP camera via WebSocket.
    Sends alternating JSON metadata + binary JPEG frames.
    """
    # ── Authenticate via token query param ──
    if is_token_blacklisted(token):
        await websocket.close(code=4001, reason="Token blacklisted")
        return

    payload = decode_token(token)
    if payload is None:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    await websocket.accept()

    try:
        await stream_weed_detections(websocket, confidence_threshold=confidence)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass
