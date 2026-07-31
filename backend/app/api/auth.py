from datetime import timedelta
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import SessionDep, get_current_active_user, get_current_admin
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.models.department import Department
from app.schemas.user import UserCreate, UserResponse, UserAdminResponse, UserRoleUpdate
from app.schemas.token import Token

router = APIRouter()


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register_user(user_in: UserCreate, session: SessionDep) -> Any:
    """
    Register a new user. Role is always set to 'faculty' regardless of input.
    Roles can only be elevated by an administrator after registration.
    """
    # Check if user already exists
    user = session.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    # Always force role to 'faculty' — no self-elevation allowed
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="faculty",
        department_id=None,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
def login_access_token(
    session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Verify user exists
    user = session.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify user is active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Generate JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Get current user. This endpoint acts as a test to verify the JWT token works.
    """
    return current_user


@router.get("/users", response_model=List[UserAdminResponse])
def read_all_users(
    session: SessionDep,
    current_admin: User = Depends(get_current_admin),
):
    """
    ADMIN ONLY: Retrieve a list of all registered users with their department info.
    """
    users = session.query(User).all()
    result = []
    for u in users:
        dept_name = u.department.name if u.department else None
        result.append(
            UserAdminResponse(
                id=u.id,
                email=u.email,
                is_active=u.is_active,
                role=u.role,
                department_id=u.department_id,
                department_name=dept_name,
            )
        )
    return result


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    session: SessionDep,
    current_admin: User = Depends(get_current_admin),
) -> Any:
    """
    ADMIN ONLY: Update a user's role and department assignment.
    - Setting role to 'hod' requires a department_id.
    - Setting role to 'faculty' clears their department assignment.
    """
    target_user = session.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from demoting themselves
    if target_user.id == current_admin.id:
        raise HTTPException(
            status_code=400, detail="Administrators cannot change their own role"
        )

    # Validate department exists when assigning HOD
    if role_update.role == "hod" and role_update.department_id:
        dept = (
            session.query(Department)
            .filter(Department.id == role_update.department_id)
            .first()
        )
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

    target_user.role = role_update.role
    # Clear department if demoting to faculty, otherwise assign the department
    if role_update.role == "faculty":
        target_user.department_id = None
    else:
        target_user.department_id = role_update.department_id

    session.commit()
    session.refresh(target_user)
    return target_user


@router.get("/departments", response_model=List[dict])
def list_departments(
    session: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    List all departments. Used by admin UI for the role-assignment dropdown.
    """
    departments = session.query(Department).all()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in departments]
