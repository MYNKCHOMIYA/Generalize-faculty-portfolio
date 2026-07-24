import pandas as pd
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.faculty_profile import FacultyProfile
from app.models.publication import Publication
from app.schemas.analytics import DashboardAnalytics, DepartmentStat, SkillCount

router = APIRouter()


# --- Schemas specifically for this file ---
class TrendData(BaseModel):
    year: int
    count: int


# --- Helpers ---


def _extract_terms(text: str) -> list:
    """Split a comma/semicolon-separated string and return clean Title Case terms."""
    if not text or not text.strip():
        return []
    # Support both comma and semicolon separators
    for sep in [",", ";"]:
        if sep in text:
            return [t.strip().title() for t in text.split(sep) if t.strip()]
    return [text.strip().title()] if text.strip() else []


# --- Endpoints ---


@router.get("/dashboard", response_model=DashboardAnalytics)
def get_system_analytics(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    """Aggregates system-wide academic metrics for the admin dashboard."""
    total_faculty = db.query(FacultyProfile).count()
    total_pubs = db.query(Publication).count()

    dept_stats_query = (
        db.query(
            FacultyProfile.department,
            func.count(func.distinct(FacultyProfile.id)).label("faculty_count"),
            func.count(func.distinct(Publication.id)).label("pub_count"),
        )
        .outerjoin(Publication, FacultyProfile.id == Publication.faculty_id)
        .group_by(FacultyProfile.department)
        .all()
    )

    dept_stats = []
    for dept, f_count, p_count in dept_stats_query:
        dept_name = dept if dept else "Unassigned"
        dept_stats.append(
            DepartmentStat(
                department=dept_name, faculty_count=f_count, publication_count=p_count
            )
        )

    return DashboardAnalytics(
        total_faculty=total_faculty,
        total_publications=total_pubs,
        department_stats=dept_stats,
    )


@router.get("/trends/publications", response_model=List[TrendData])
def get_publication_trends(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    """Analyzes publication output over time using Pandas to fill missing years."""
    pubs = (
        db.query(Publication.publication_year)
        .filter(Publication.publication_year.isnot(None))
        .all()
    )

    if not pubs:
        return []

    df = pd.DataFrame(pubs, columns=["year"])
    trend_df = df.groupby("year").size().reset_index(name="count")

    min_year = int(trend_df["year"].min())
    max_year = int(trend_df["year"].max())

    all_years = pd.DataFrame({"year": range(min_year, max_year + 1)})
    final_df = pd.merge(all_years, trend_df, on="year", how="left").fillna(0)
    final_df["count"] = final_df["count"].astype(int)

    return final_df.to_dict(orient="records")


@router.get("/skills/top", response_model=List[SkillCount])
def get_top_skills(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Extracts and ranks the most in-demand skills/expertise across all profiles.
    Reads from skills, areas_of_interest, and specialization fields.
    """
    profiles = db.query(
        FacultyProfile.skills,
        FacultyProfile.areas_of_interest,
        FacultyProfile.specialization,
    ).all()

    if not profiles:
        return []

    all_skills = []

    for skills_str, areas_str, spec_str in profiles:
        # Skills field — primary source
        all_skills.extend(_extract_terms(skills_str or ""))
        # Areas of interest — secondary source (also expertise)
        all_skills.extend(_extract_terms(areas_str or ""))
        # Specialization — weighted higher (×2) since it's the core focus
        for term in _extract_terms(spec_str or ""):
            all_skills.extend([term, term])

    if not all_skills:
        return []

    skill_counts = Counter(all_skills)
    top_skills = skill_counts.most_common(limit)
    return [{"skill": name, "count": count} for name, count in top_skills]


@router.get("/research-focus", response_model=List[SkillCount])
def get_research_focus(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Aggregates areas_of_interest and specialization across all profiles
    to power the Research Focus Distribution chart.
    """
    profiles = db.query(
        FacultyProfile.areas_of_interest,
        FacultyProfile.specialization,
    ).all()

    if not profiles:
        return []

    all_terms = []
    for areas_str, spec_str in profiles:
        all_terms.extend(_extract_terms(areas_str or ""))
        # Specialization weighted ×2
        for t in _extract_terms(spec_str or ""):
            all_terms.extend([t, t])

    if not all_terms:
        return []

    counts = Counter(all_terms)
    top = counts.most_common(limit)
    return [{"skill": name, "count": count} for name, count in top]
