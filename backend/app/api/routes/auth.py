from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.schemas import (
    UserRegisterRequest,
    UserUpdateRequest,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    MessageResponse,
    SendOTPRequest,
    VerifyOTPRequest,
)
from app.services.user_service import (
    get_user_by_email,
    get_user_by_username,
    get_user_by_phone,
    create_user,
    update_user,
)
from app.services.otp_service import (
    generate_otp,
    send_otp_sms,
    store_otp,
    verify_otp,
)
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    is_token_blacklisted,
)
from app.api.dependencies import get_current_user, bearer_scheme

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─────────────────────────────────────────
# POST /auth/send-otp
# ─────────────────────────────────────────
@router.post(
    "/send-otp",
    response_model=MessageResponse,
    summary="Send OTP to phone number for registration",
)
async def send_otp(data: SendOTPRequest):
    # Check if email, username, or phone already exists
    if get_user_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if get_user_by_username(data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )
    if get_user_by_phone(data.phone):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this phone number already exists.",
        )

    # Generate and send OTP
    otp = generate_otp()
    registration_data = {
        "full_name": data.full_name,
        "email": data.email,
        "username": data.username,
        "password": data.password,
        "phone": data.phone,
    }

    try:
        result = await send_otp_sms(data.phone, otp)
        if result.get("error"):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to send SMS: {result.get('message', 'Unknown error')}",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send SMS. Please try again.",
        )

    # Store OTP with registration data
    store_otp(data.phone, otp, registration_data)

    return MessageResponse(
        message=f"OTP sent successfully to +977{data.phone}. Valid for 5 minutes.",
        success=True,
    )


# ─────────────────────────────────────────
# POST /auth/verify-otp
# ─────────────────────────────────────────
@router.post(
    "/verify-otp",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Verify OTP and complete registration",
)
def verify_otp_and_register(data: VerifyOTPRequest):
    registration_data = verify_otp(data.phone, data.otp)
    if registration_data is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please request a new one.",
        )

    # Re-check uniqueness (in case someone registered between send-otp and verify-otp)
    if get_user_by_email(registration_data["email"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if get_user_by_username(registration_data["username"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )
    if get_user_by_phone(registration_data["phone"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this phone number already exists.",
        )

    # Create user with validated registration data
    user_request = UserRegisterRequest(**registration_data)
    user = create_user(user_request)

    return UserResponse(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        username=user["username"],
        phone=user["phone"],
        is_active=user["is_active"],
    )


# ─────────────────────────────────────────
# POST /auth/register (kept for backward compatibility)
# ─────────────────────────────────────────
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(data: UserRegisterRequest):
    if get_user_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if get_user_by_username(data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )
    if get_user_by_phone(data.phone):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this phone number already exists.",
        )

    user = create_user(data)

    return UserResponse(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        username=user["username"],
        phone=user["phone"],
        is_active=user["is_active"],
    )


# ─────────────────────────────────────────
# POST /auth/login
# ─────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with username or email",
)
def login(data: LoginRequest):
    user = get_user_by_username(data.username) or get_user_by_email(data.username)

    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    token_data = {"sub": user["id"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            email=user["email"],
            username=user["username"],
            phone=user.get("phone", ""),
            is_active=user["is_active"],
        ),
    )


# ─────────────────────────────────────────
# POST /auth/logout
# ─────────────────────────────────────────
@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout and invalidate current token",
)
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current_user: dict = Depends(get_current_user),
):
    blacklist_token(credentials.credentials)
    return MessageResponse(
        message="You have been logged out successfully.",
        success=True,
    )


# ─────────────────────────────────────────
# POST /auth/refresh
# ─────────────────────────────────────────
@router.post(
    "/refresh",
    summary="Get a new access token using refresh token",
)
def refresh(data: RefreshTokenRequest):
    if is_token_blacklisted(data.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been invalidated.",
        )

    payload = decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    new_access_token = create_access_token({"sub": payload.get("sub")})
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


# ─────────────────────────────────────────
# PUT /auth/profile
# ─────────────────────────────────────────
@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user's profile",
)
def update_profile(
    data: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    updates = {}

    if data.full_name is not None:
        updates["full_name"] = data.full_name.strip()

    if data.email is not None:
        new_email = data.email.lower()
        if new_email != current_user["email"]:
            existing = get_user_by_email(new_email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists.",
                )
            updates["email"] = new_email

    if data.phone is not None:
        if data.phone != current_user.get("phone", ""):
            existing = get_user_by_phone(data.phone)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this phone number already exists.",
                )
            updates["phone"] = data.phone

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    updated = update_user(current_user["id"], updates)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return UserResponse(
        id=updated["id"],
        full_name=updated["full_name"],
        email=updated["email"],
        username=updated["username"],
        phone=updated.get("phone", ""),
        is_active=updated["is_active"],
    )


# ─────────────────────────────────────────
# GET /auth/me
# ─────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current logged-in user profile",
)
def me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        username=current_user["username"],
        phone=current_user.get("phone", ""),
        is_active=current_user["is_active"],
    )
