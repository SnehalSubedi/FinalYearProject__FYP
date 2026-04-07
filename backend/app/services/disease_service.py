from PIL import Image
import io
import os
import json
from transformers import pipeline, MobileNetV2ImageProcessor, MobileNetV2ForImageClassification

# ─────────────────────────────────────────
# Disease Info — loaded from JSON
# ─────────────────────────────────────────
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


# ─────────────────────────────────────────
# Label Mapping — HuggingFace label → disease_info key
# ─────────────────────────────────────────
HF_LABEL_TO_DISEASE_KEY = {
    "Apple Scab": "Apple___Apple_scab",
    "Apple with Black Rot": "Apple___Black_rot",
    "Cedar Apple Rust": "Apple___Cedar_apple_rust",
    "Healthy Apple": "Apple___healthy",
    "Healthy Blueberry Plant": "Blueberry___healthy",
    "Cherry with Powdery Mildew": "Cherry_(including_sour)___Powdery_mildew",
    "Healthy Cherry Plant": "Cherry_(including_sour)___healthy",
    "Corn (Maize) with Cercospora and Gray Leaf Spot": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn (Maize) with Common Rust": "Corn_(maize)___Common_rust_",
    "Corn (Maize) with Northern Leaf Blight": "Corn_(maize)___Northern_Leaf_Blight",
    "Healthy Corn (Maize) Plant": "Corn_(maize)___healthy",
    "Grape with Black Rot": "Grape___Black_rot",
    "Grape with Esca (Black Measles)": "Grape___Esca_(Black_Measles)",
    "Grape with Isariopsis Leaf Spot": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Healthy Grape Plant": "Grape___healthy",
    "Orange with Citrus Greening": "Orange___Haunglongbing_(Citrus_greening)",
    "Peach with Bacterial Spot": "Peach___Bacterial_spot",
    "Healthy Peach Plant": "Peach___healthy",
    "Bell Pepper with Bacterial Spot": "Pepper,_bell___Bacterial_spot",
    "Healthy Bell Pepper Plant": "Pepper,_bell___healthy",
    "Potato with Early Blight": "Potato___Early_blight",
    "Potato with Late Blight": "Potato___Late_blight",
    "Healthy Potato Plant": "Potato___healthy",
    "Healthy Raspberry Plant": "Raspberry___healthy",
    "Healthy Soybean Plant": "Soybean___healthy",
    "Squash with Powdery Mildew": "Squash___Powdery_mildew",
    "Strawberry with Leaf Scorch": "Strawberry___Leaf_scorch",
    "Healthy Strawberry Plant": "Strawberry___healthy",
    "Tomato with Bacterial Spot": "Tomato___Bacterial_spot",
    "Tomato with Early Blight": "Tomato___Early_blight",
    "Tomato with Late Blight": "Tomato___Late_blight",
    "Tomato with Leaf Mold": "Tomato___Leaf_Mold",
    "Tomato with Septoria Leaf Spot": "Tomato___Septoria_leaf_spot",
    "Tomato with Spider Mites or Two-spotted Spider Mite": "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato with Target Spot": "Tomato___Target_Spot",
    "Tomato Yellow Leaf Curl Virus": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato Mosaic Virus": "Tomato___Tomato_mosaic_virus",
    "Healthy Tomato Plant": "Tomato___healthy",
}


# ─────────────────────────────────────────
# Model Loader — Singleton Pattern
# Downloads from HuggingFace on first use, then cached
# ─────────────────────────────────────────
HF_MODEL_NAME = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

_classifier = None


def load_model():
    global _classifier
    if _classifier is None:
        image_processor = MobileNetV2ImageProcessor.from_pretrained(HF_MODEL_NAME)
        model = MobileNetV2ForImageClassification.from_pretrained(HF_MODEL_NAME)
        _classifier = pipeline(
            "image-classification",
            model=model,
            image_processor=image_processor,
            top_k=1,
        )
    return _classifier


# ─────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────

def predict_disease(image_bytes: bytes) -> dict:
    """
    Run inference on a leaf image using HuggingFace model.
    Returns disease name, confidence score, cause, and cure.
    """
    classifier = load_model()

    # Open image and convert to RGB
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Run prediction
    results = classifier(image)
    top_result = results[0]

    hf_label = top_result["label"]
    confidence = top_result["score"]

    # Map HuggingFace label to disease_info key
    disease_key = HF_LABEL_TO_DISEASE_KEY.get(hf_label, "")

    # Get cause and cure info
    disease_info = get_disease_info()
    info = disease_info.get(disease_key, {})
    cause = info.get("cause", "Information not available.")
    cure = info.get("cure", "Information not available.")

    return {
        "disease_name": hf_label,
        "confidence": round(confidence, 4),
        "confidence_percentage": f"{round(confidence * 100, 2)}%",
        "is_healthy": "healthy" in hf_label.lower(),
        "cause": cause,
        "cure": cure,
    }
