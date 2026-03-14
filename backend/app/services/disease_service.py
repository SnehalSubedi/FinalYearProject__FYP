import numpy as np
from PIL import Image
import io
import os
import json
import tensorflow as tf  # type: ignore
from app.core.config import settings

# ─────────────────────────────────────────
# Class Labels - loaded from training output
# ─────────────────────────────────────────
CLASS_LABELS_FILE = "class_names.json"
DISEASE_INFO_FILE = "disease_info.json"

_disease_info_cache = None

def get_disease_info() -> dict:
    """Load disease info (cause/cure) from JSON file."""
    global _disease_info_cache
    if _disease_info_cache is None:
        if os.path.exists(DISEASE_INFO_FILE):
            with open(DISEASE_INFO_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                _disease_info_cache = {item["name"]: item for item in data}
        else:
            _disease_info_cache = {}
    return _disease_info_cache

def get_class_labels() -> list:
    """Load class labels from JSON file generated during training."""
    if os.path.exists(CLASS_LABELS_FILE):
        with open(CLASS_LABELS_FILE, "r") as f:
            return json.load(f)
    # Fallback to default labels if file not found
    return [
        "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
        "Blueberry___healthy", "Cherry_(including_sour)___healthy", "Cherry_(including_sour)___Powdery_mildew",
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
        "Corn_(maize)___healthy", "Corn_(maize)___Northern_Leaf_Blight", "Grape___Black_rot",
        "Grape___Esca_(Black_Measles)", "Grape___healthy", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
        "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
        "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
        "Potato___healthy", "Potato___Late_blight", "Raspberry___healthy", "Soybean___healthy",
        "Squash___Powdery_mildew", "Strawberry___healthy", "Strawberry___Leaf_scorch",
        "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___healthy", "Tomato___Late_blight",
        "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
        "Tomato___Target_Spot", "Tomato___Tomato_mosaic_virus", "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    ]


# ─────────────────────────────────────────
# Model Loader — Singleton Pattern
# Model is loaded once and reused for all requests
# ─────────────────────────────────────────
_model = None


def load_model():
    global _model
    if _model is None:
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at '{settings.MODEL_PATH}'. "
                f"Please place '{settings.MODEL_PATH}' in the backend/ root folder."
            )
        _model = tf.keras.models.load_model(settings.MODEL_PATH)  # type: ignore[attr-defined]
    return _model


# ─────────────────────────────────────────
# Image Preprocessing
# ─────────────────────────────────────────

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes into a model-ready numpy array:
    - Convert to RGB
    - Resize to model input size (default 224x224)
    - Normalize pixel values to [0, 1]
    - Add batch dimension → shape: (1, H, W, 3)
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE))
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)


# ─────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────

def predict_disease(image_bytes: bytes) -> dict:
    """
    Run inference on a leaf image.
    Returns disease name, confidence score, and healthy status.
    """
    model = load_model()
    processed = preprocess_image(image_bytes)
    predictions = model.predict(processed)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))
    
    class_labels = get_class_labels()
    disease_name = (
        class_labels[predicted_index]
        if predicted_index < len(class_labels)
        else f"Unknown Class ({predicted_index})"
    )
    
    # Format the disease name nicely
    formatted_name = disease_name.replace("___", " - ").replace("_", " ")
    
    # Get cause and cure info
    disease_info = get_disease_info()
    info = disease_info.get(disease_name, {})
    cause = info.get("cause", "Information not available.")
    cure = info.get("cure", "Information not available.")

    return {
        "disease_name": formatted_name,
        "confidence": round(confidence, 4),
        "confidence_percentage": f"{round(confidence * 100, 2)}%",
        "is_healthy": "healthy" in disease_name.lower(),
        "cause": cause,
        "cure": cure,
    }