import json
import uuid
import os
from typing import Optional
from app.schemas.schemas import UserRegisterRequest
from app.core.security import hash_password

# Path to the JSON file acting as our user store
USERS_FILE = "users.json"


# ─────────────────────────────────────────
# File Read / Write Helpers
# ─────────────────────────────────────────

def _read_users() -> list:
    """Read all users from the JSON file."""
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def _write_users(users: list) -> None:
    """Write the full users list back to the JSON file."""
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


# ─────────────────────────────────────────
# User Lookup Functions
# ─────────────────────────────────────────

def get_user_by_email(email: str) -> Optional[dict]:
    """Find a user by their email address."""
    users = _read_users()
    for user in users:
        if user["email"] == email.lower():
            return user
    return None


def get_user_by_username(username: str) -> Optional[dict]:
    """Find a user by their username."""
    users = _read_users()
    for user in users:
        if user["username"] == username.lower():
            return user
    return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Find a user by their unique ID."""
    users = _read_users()
    for user in users:
        if user["id"] == user_id:
            return user
    return None


# ─────────────────────────────────────────
# User Creation
# ─────────────────────────────────────────

def create_user(data: UserRegisterRequest) -> dict:
    """
    Create a new user and save to users.json.
    Password is hashed before storing.
    """
    users = _read_users()

    new_user = {
        "id": str(uuid.uuid4()),
        "full_name": data.full_name.strip(),
        "email": data.email.lower(),
        "username": data.username.lower(),
        "hashed_password": hash_password(data.password),
        "is_active": True,
    }

    users.append(new_user)
    _write_users(users)

    return new_user