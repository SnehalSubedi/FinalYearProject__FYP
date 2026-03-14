from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.schemas.schemas import InsectPredictionResponse
from app.services.insect_service import predict_insect
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/insect", tags=["Insect & Pest Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE  = 10 * 1024 * 1024  # 10 MB


# ─────────────────────────────────────────
# POST /insect/predict
# ─────────────────────────────────────────
@router.post(
    "/predict",
    response_model=InsectPredictionResponse,
    summary="Detect farm insect or pest from an image",
    description=(
        "Upload a clear photo of a farm insect or pest. "
        "Returns the predicted insect name, confidence score, and detailed information "
        "including affected crops, damage, prevention, and treatment. "
        "Requires a valid Bearer token."
    ),
)
async def predict(
    file: UploadFile = File(..., description="Insect image — JPEG, PNG, or WebP"),
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
        result = predict_insect(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insect prediction failed: {str(e)}",
        )

    return InsectPredictionResponse(**result)
