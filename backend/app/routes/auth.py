import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import (
    verify_password, get_password_hash, create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Creates a new user profile with securely hashed password and assigned RBAC role.
    """
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user_in.email.strip().lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Check if phone exists (if provided)
    if user_in.phone:
        existing_phone = db.query(User).filter(User.phone == user_in.phone.strip()).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this phone number already exists."
            )

    # Validate & normalize role
    valid_roles = ["citizen", "field_officer", "admin"]
    role = user_in.role.lower().strip() if user_in.role else "citizen"
    if role not in valid_roles:
        role = "citizen"

    # Set appropriate default department
    default_department = "North-Eastern Resident Community & Hill Panchayat" if role == "citizen" else "North-Eastern Regional Disaster Management Authority (NER-SDMA)"

    new_user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.strip().lower(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=get_password_hash(user_in.password),
        role=role,
        department=user_in.department.strip() if user_in.department else default_department,
        badge_number=user_in.badge_number.strip() if user_in.badge_number else None,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        is_active=True,
        created_at=datetime.datetime.utcnow(),
        last_login_at=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    1. Validates login credentials (by email or phone)
    2. Retrieves user from PostgreSQL/SQLite database
    3. Verifies Bcrypt hashed password
    4. Checks account is_active status
    5. Updates last_login_at timestamp
    6. Generates JWT access token with user_id and role
    7. Returns token and user profile
    """
    identifier = login_data.email.strip()

    # Find user by email or phone
    user = db.query(User).filter(
        (User.email == identifier.lower()) | (User.phone == identifier)
    ).first()

    # Verify password hash securely
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Check is_active status
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently suspended or inactive. Please contact the administrator."
        )

    # Update last_login_at timestamp
    user.last_login_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Generate JWT with user_id and role
    token_payload = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "name": user.full_name
    }
    access_token = create_access_token(data=token_payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile based on the JWT bearer token.
    """
    return current_user
