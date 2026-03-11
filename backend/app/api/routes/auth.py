from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.schemas import (
    UserRegisterRequest,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    MessageResponse,
)
from app.services.user_service import (
    get_user_by_email,
    get_user_by_username,
    create_user,
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
# POST /auth/register
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

    user = create_user(data)

    return UserResponse(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        username=user["username"],
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
    # Support login by username or email
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
        is_active=current_user["is_active"],
    )