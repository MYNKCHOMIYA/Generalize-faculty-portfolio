from typing import Annotated
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.core.config import settings
from app.models.user import User
from app.schemas.token import TokenPayload
from app.db.session import get_db  # Assuming you have a DB session generator

# This tells FastAPI where the frontend should send credentials to get a token
reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Type alias for cleaner code in route definitions
TokenDep = Annotated[str, Depends(reusable_oauth2)]
SessionDep = Annotated[Session, Depends(get_db)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    """Validates the JWT and retrieves the user from the database."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    # Retrieve user using SQLAlchemy 2.0 syntax
    user = session.query(User).filter(User.id == token_data.sub).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensures the user account is not deactivated."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_admin(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Ensures the user has admin privileges."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


def get_current_hod(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Ensures the user has HOD privileges."""
    if current_user.role != "hod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a Head of Department can access this resource",
        )
    return current_user


def get_current_admin_or_hod(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Ensures the user has admin or HOD privileges."""
    if current_user.role not in ("admin", "hod"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges. Admin or HOD role required.",
        )
    return current_user
