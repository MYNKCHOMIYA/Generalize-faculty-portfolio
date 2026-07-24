from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status


from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.models.faculty_profile import FacultyProfile
from app.schemas.faculty_profile import (
    FacultyProfileCreate,
    FacultyProfileUpdate,
    FacultyProfileResponse,
)
from fastapi import UploadFile, File
from app.utils.cloudinary_handler import upload_image
from app.utils.activity import log_system_activity

router = APIRouter()


@router.post(
    "/", response_model=FacultyProfileResponse, status_code=status.HTTP_201_CREATED
)
def create_profile(
    *,
    session: SessionDep,
    profile_in: FacultyProfileCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new faculty profile for the currently logged-in user.
    """
    # 1. Check if the user already has a profile (One-to-One relationship)
    existing_profile = (
        session.query(FacultyProfile)
        .filter(FacultyProfile.user_id == current_user.id)
        .first()
    )
    if existing_profile:
        raise HTTPException(
            status_code=400, detail="A profile already exists for this user."
        )

    # 2. Create the profile, securely attaching it to the token's user_id
    db_profile = FacultyProfile(**profile_in.model_dump(), user_id=current_user.id)
    session.add(db_profile)
    session.commit()
    session.refresh(db_profile)
    # --- NEW: Log the action securely ---
    log_system_activity(
        session, current_user.id, "Created Faculty Profile", "FacultyProfile"
    )
    return db_profile


@router.get("/me", response_model=FacultyProfileResponse)
def read_profile_me(
    session: SessionDep, current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get the profile of the currently logged-in user.
    """
    profile = (
        session.query(FacultyProfile)
        .filter(FacultyProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me", response_model=FacultyProfileResponse)
def update_profile_me(
    *,
    session: SessionDep,
    profile_in: FacultyProfileUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update the profile of the currently logged-in user.
    """
    profile = (
        session.query(FacultyProfile)
        .filter(FacultyProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Exclude unset fields so we only update what the frontend actually sent
    update_data = profile_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    session.add(profile)
    session.commit()
    session.refresh(profile)

    # --- NEW: Log the action securely ---
    log_system_activity(
        session, current_user.id, "Updated Faculty Profile", "FacultyProfile"
    )

    return profile


@router.post("/me/image", response_model=FacultyProfileResponse)
def upload_profile_image(
    *,
    session: SessionDep,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Upload a profile picture and save the Cloudinary URL to the database.
    """
    # Verify the user actually has a profile first
    profile = (
        session.query(FacultyProfile)
        .filter(FacultyProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Faculty profile not found. Please create one first.",
        )

    # FIXED: Check if it exists at all OR if it doesn't start with image/
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload an image."
        )

    # Send the file to Cloudinary
    image_url = upload_image(file.file, folder_name=f"gfpms/profiles/{current_user.id}")

    if not image_url:
        raise HTTPException(
            status_code=500, detail="Failed to upload image to Cloudinary."
        )

    # Update the database record with the new secure URL
    profile.profile_image_url = image_url
    session.add(profile)
    session.commit()
    session.refresh(profile)

    return profile
