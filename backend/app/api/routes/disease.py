from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.schemas.schemas import DiseasePredictionResponse
from app.services.disease_service import predict_disease
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/disease", tags=["Plant Disease Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE  = 10 * 1024 * 1024  # 10 MB


# ─────────────────────────────────────────
# POST /disease/predict
# ─────────────────────────────────────────
@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    summary="Detect plant disease from a leaf image",
    description=(
        "Upload a clear photo of a plant leaf. "
        "Returns the predicted disease name and confidence score. "
        "Requires a valid Bearer token."
    ),
)
async def predict(
    file: UploadFile = File(..., description="Leaf image — JPEG, PNG, or WebP"),
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

    # Run prediction
    try:
        result = predict_disease(image_bytes)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )

    return DiseasePredictionResponse(**result)