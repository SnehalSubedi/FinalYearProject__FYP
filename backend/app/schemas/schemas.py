from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re


# ─────────────────────────────────────────
# User Schemas
# ─────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    username: str
    password: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return v

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if not re.match(r"^[a-z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number.")
        return v


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    username: str
    is_active: bool


# ─────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str
    success: bool = True


# ─────────────────────────────────────────
# Plant Disease Schemas
# ─────────────────────────────────────────

class DiseasePredictionResponse(BaseModel):
    disease_name: str
    confidence: float
    confidence_percentage: str
    is_healthy: bool
    cause: Optional[str] = None
    cure: Optional[str] = None


# ─────────────────────────────────────────
# Insect & Pest Detection Schemas
# ─────────────────────────────────────────

class InsectPredictionResponse(BaseModel):
    insect_name: str
    confidence: float
    confidence_percentage: str
    description: Optional[str] = None
    affected_crops: Optional[str] = None
    damage: Optional[str] = None
    prevention: Optional[str] = None
    treatment: Optional[str] = None


# ─────────────────────────────────────────
# Crop & Weed Detection Schemas
# ─────────────────────────────────────────

class WeedBoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float
    class_id: str
    label: str
    color: str


class WeedSummary(BaseModel):
    total: int
    weeds: int
    crops: int
    weed_percentage: float


class WeedPredictionResponse(BaseModel):
    predictions: list[WeedBoundingBox]
    summary: WeedSummary