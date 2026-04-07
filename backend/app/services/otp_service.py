import random
import httpx
from datetime import datetime, timedelta
from app.core.config import settings

# In-memory OTP store: { phone: { "otp": "123456", "expires_at": datetime, "data": {...} } }
_otp_store: dict = {}


def generate_otp() -> str:
    """Generate a 6-digit OTP code."""
    return str(random.randint(100000, 999999))


async def send_otp_sms(phone: str, otp: str) -> dict:
    """Send OTP via Aakash SMS API. Phone should be 10-digit Nepali number."""
    message = f"Your PlantGuard verification code is: {otp}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes. Do not share this code."
    url = "https://sms.aakashsms.com/sms/v3/send"
    params = {
        "auth_token": settings.AAKASH_SMS_TOKEN,
        "to": phone,
        "text": message,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, params=params)
        return response.json()


def store_otp(phone: str, otp: str, registration_data: dict) -> None:
    """Store OTP with expiry and the registration data for later use."""
    _otp_store[phone] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        "data": registration_data,
    }


def verify_otp(phone: str, otp: str) -> dict | None:
    """
    Verify OTP for a phone number.
    Returns the stored registration data if valid, None otherwise.
    """
    entry = _otp_store.get(phone)
    if not entry:
        return None

    if datetime.utcnow() > entry["expires_at"]:
        # Expired — clean up
        _otp_store.pop(phone, None)
        return None

    if entry["otp"] != otp:
        return None

    # OTP is valid — remove from store and return registration data
    data = entry["data"]
    _otp_store.pop(phone, None)
    return data


def clear_otp(phone: str) -> None:
    """Remove OTP entry for a phone number."""
    _otp_store.pop(phone, None)
