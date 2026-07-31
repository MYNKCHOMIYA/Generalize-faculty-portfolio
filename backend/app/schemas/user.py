from enum import Enum
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional


# 1. Lock down the exact roles allowed in the system
class UserRole(str, Enum):
    FACULTY = "faculty"
    HOD = "hod"
    ADMIN = "admin"


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    # 2. Intercept and validate the email domain before it hits the database
    @field_validator("email")
    @classmethod
    def validate_skit_domain(cls, value: str):
        if not value.endswith("@skit.ac.in"):
            raise ValueError(
                "Unauthorized domain. Only @skit.ac.in emails are permitted."
            )
        return value


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    role: UserRole
    department_id: Optional[str]

    # Required to read data from SQLAlchemy model instances
    model_config = ConfigDict(from_attributes=True)


class UserAdminResponse(BaseModel):
    """Extended user response for admin endpoints — includes department name."""

    id: str
    email: EmailStr
    is_active: bool
    role: UserRole
    department_id: Optional[str]
    department_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    """Schema for admin to update a user's role and department assignment."""

    role: UserRole
    department_id: Optional[str] = None

    @field_validator("department_id")
    @classmethod
    def department_required_for_hod(cls, v, info):
        role = info.data.get("role")
        if role == UserRole.HOD and not v:
            raise ValueError("department_id is required when assigning the HOD role")
        return v
