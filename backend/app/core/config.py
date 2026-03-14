from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Plant Disease Detection API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Model
    MODEL_PATH: str = "plant_disease_recog_model_pwp.keras"
    IMAGE_SIZE: int = 224
    DISEASE_INFO_PATH: str = "disease_info.json"

    # Hugging Face — Insect Detection
    HUGGINGFACEHUB_ACCESS_TOKEN: str = ""
    INSECT_INFO_PATH: str = "insect_info.json"

    # Roboflow — Weed Detection
    ROBOFLOW_API_KEY: str = "3kdalezU6SoaRmHmvmAG"
    WEED_TARGET_FPS: int = 2

    # YOLOv8 Real-Time Detection
    YOLO_MODEL_PATH: str = "yolov8n.pt"
    IP_CAM_URL: str = "http://10.64.50.165:8080/video"
    YOLO_CONFIDENCE: float = 0.45
    YOLO_TARGET_FPS: int = 15

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()