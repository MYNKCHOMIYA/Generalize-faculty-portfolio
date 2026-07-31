from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.faculty_profile import FacultyProfile
from app.models.publication import Publication

router = APIRouter()


@router.get("/", response_model=List[dict])
def search_faculty(
    department: Optional[str] = Query(None, description="Filter by department"),
    designation: Optional[str] = Query(None, description="Filter by designation"),
    skill: Optional[str] = Query(None, description="Search within skills text"),
    min_publications: Optional[int] = Query(
        None, description="Minimum number of publications"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Search faculty profiles with role-based visibility:
    - admin: sees ALL faculty profiles
    - hod: sees only faculty in their assigned department
    - faculty: sees only their OWN profile
    """
    # ── Role-based base query ──────────────────────────────────────────────────
    if current_user.role == "faculty":
        # Faculty can only see themselves
        query = db.query(FacultyProfile).filter(
            FacultyProfile.user_id == current_user.id
        )
    elif current_user.role == "hod":
        # HOD sees only faculty in their department (matched via department_id on User)
        if not current_user.department_id:
            return []  # HOD with no assigned dept sees nothing
        query = (
            db.query(FacultyProfile)
            .join(User, FacultyProfile.user_id == User.id)
            .filter(User.department_id == current_user.department_id)
        )
    else:
        # Admin sees everyone
        query = db.query(FacultyProfile)

    # ── Apply optional text filters ────────────────────────────────────────────
    if department:
        query = query.filter(FacultyProfile.department.ilike(f"%{department}%"))  # type: ignore
    if designation:
        query = query.filter(FacultyProfile.designation.ilike(f"%{designation}%"))  # type: ignore
    if skill:
        query = query.filter(FacultyProfile.skills.ilike(f"%{skill}%"))  # type: ignore

    # ── Apply publication count filter ─────────────────────────────────────────
    if min_publications is not None and min_publications > 0:
        query = (
            query.outerjoin(Publication, FacultyProfile.id == Publication.faculty_id)
            .group_by(FacultyProfile.id)
            .having(func.count(Publication.id) >= min_publications)
        )  # type: ignore

    results = query.all()

    # ── Format response ────────────────────────────────────────────────────────
    formatted_results = []
    for profile in results:
        formatted_results.append(
            {
                "id": profile.id,
                "user_id": str(profile.user_id),
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "department": profile.department or "N/A",
                "designation": profile.designation,
                "total_publications": (
                    len(profile.publications) if profile.publications else 0
                ),
                "total_projects": (
                    len(profile.projects)
                    if hasattr(profile, "projects") and profile.projects
                    else 0
                ),
            }
        )

    return formatted_results
