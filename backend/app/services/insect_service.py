import numpy as np
from PIL import Image
import io
import os
import json
from transformers import ViTForImageClassification, ViTImageProcessor  # type: ignore
import torch  # type: ignore
from app.core.config import settings

# ─────────────────────────────────────────
# Hugging Face Model Configuration
# ─────────────────────────────────────────
HF_MODEL_NAME = "dima806/farm_insects_image_detection"
INSECT_INFO_FILE = "insect_info.json"

CLASS_LABELS = [
    "Fall Armyworms",
    "Western Corn Rootworms",
    "Colorado Potato Beetles",
    "Thrips",
    "Corn Earworms",
    "Cabbage Loopers",
    "Armyworms",
    "Brown Marmorated Stink Bugs",
    "Tomato Hornworms",
    "Citrus Canker",
    "Aphids",
    "Corn Borers",
    "Fruit Flies",
    "Africanized Honey Bees (Killer Bees)",
    "Spider Mites",
]

# ─────────────────────────────────────────
# Insect Info Cache
# ─────────────────────────────────────────
_insect_info_cache = None


def get_insect_info() -> dict:
    """Load insect info (description, damage, prevention, treatment) from JSON file."""
    global _insect_info_cache
    if _insect_info_cache is None:
        if os.path.exists(INSECT_INFO_FILE):
            with open(INSECT_INFO_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                _insect_info_cache = {item["name"]: item for item in data}
        else:
            _insect_info_cache = {}
    return _insect_info_cache


# ─────────────────────────────────────────
# Model Loader — Singleton Pattern
# ─────────────────────────────────────────
_model = None
_processor = None


def load_model():
    global _model, _processor
    if _model is None or _processor is None:
        hf_token = settings.HUGGINGFACEHUB_ACCESS_TOKEN or os.environ.get("HUGGINGFACEHUB_ACCESS_TOKEN")
        _processor = ViTImageProcessor.from_pretrained(
            HF_MODEL_NAME, token=hf_token
        )
        _model = ViTForImageClassification.from_pretrained(
            HF_MODEL_NAME, token=hf_token
        )
        _model.eval()
    return _model, _processor


# ─────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────

def predict_insect(image_bytes: bytes) -> dict:
    """
    Run inference on an insect image using the Hugging Face ViT model.
    Returns insect name, confidence, and detailed info.
    """
    model, processor = load_model()

    # Open and preprocess the image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    # Run inference
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)

    predicted_index = int(torch.argmax(probabilities, dim=-1).item())
    confidence = float(probabilities[0][predicted_index].item())

    # Map to class label — use model's own id2label if available, else fallback
    id2label: dict | None = getattr(model.config, "id2label", None)  # type: ignore[assignment]
    if id2label is not None and predicted_index in id2label:
        insect_name = str(id2label[predicted_index])
    elif predicted_index < len(CLASS_LABELS):
        insect_name = CLASS_LABELS[predicted_index]
    else:
        insect_name = f"Unknown Insect ({predicted_index})"

    # Get detailed info
    insect_info = get_insect_info()
    info = insect_info.get(insect_name, {})

    return {
        "insect_name": insect_name,
        "confidence": round(confidence, 4),
        "confidence_percentage": f"{round(confidence * 100, 2)}%",
        "description": info.get("description", "Information not available."),
        "affected_crops": info.get("affected_crops", "Information not available."),
        "damage": info.get("damage", "Information not available."),
        "prevention": info.get("prevention", "Information not available."),
        "treatment": info.get("treatment", "Information not available."),
    }
