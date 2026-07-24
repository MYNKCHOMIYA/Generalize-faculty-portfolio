from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.models.faculty_profile import FacultyProfile
from app.models.publication import Publication
from app.schemas.publication import (
    PublicationCreate,
    PublicationResponse,
)

router = APIRouter()


def get_current_faculty_profile(session: Session, user_id: str) -> FacultyProfile:
    """Helper function to ensure the user has a profile before adding publications."""
    profile = (
        session.query(FacultyProfile).filter(FacultyProfile.user_id == user_id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a faculty profile before adding publications.",
        )
    return profile


@router.post(
    "/", response_model=PublicationResponse, status_code=status.HTTP_201_CREATED
)
def create_publication(
    *,
    session: SessionDep,
    pub_in: PublicationCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new publication for the current user."""
    profile = get_current_faculty_profile(session, current_user.id)

    db_pub = Publication(**pub_in.model_dump(), faculty_id=profile.id)
    session.add(db_pub)
    session.commit()
    session.refresh(db_pub)
    return db_pub


@router.get("/me", response_model=List[PublicationResponse])
def read_my_publications(
    session: SessionDep, current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve all publications for the currently logged-in user."""
    profile = get_current_faculty_profile(session, current_user.id)

    publications = (
        session.query(Publication).filter(Publication.faculty_id == profile.id).all()
    )
    return publications


@router.put("/{id}", response_model=PublicationResponse)
def update_publication(
    *,
    session: SessionDep,
    id: str,
    pub_in: PublicationCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update a specific publication."""
    profile = get_current_faculty_profile(session, current_user.id)

    publication = (
        session.query(Publication)
        .filter(Publication.id == id, Publication.faculty_id == profile.id)
        .first()
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    update_data = pub_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(publication, field, value)

    session.add(publication)
    session.commit()
    session.refresh(publication)
    return publication


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_publication(
    *,
    session: SessionDep,
    id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific publication."""
    profile = get_current_faculty_profile(session, current_user.id)

    publication = (
        session.query(Publication)
        .filter(Publication.id == id, Publication.faculty_id == profile.id)
        .first()
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    session.delete(publication)
    session.commit()
