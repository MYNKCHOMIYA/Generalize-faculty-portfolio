from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import joinedload
import time
from threading import Lock

from app.api.deps import SessionDep
from app.models.faculty_profile import FacultyProfile

router = APIRouter()

# ── In-memory TTL cache (no Redis needed) ─────────────────────────────────────
_cache: Dict[str, dict] = {}
_cache_ts: Dict[str, float] = {}
_cache_lock = Lock()
CACHE_TTL = 300  # 5 minutes


def _get_cached(key: str):
    with _cache_lock:
        if key in _cache and (time.time() - _cache_ts.get(key, 0)) < CACHE_TTL:
            return _cache[key]
    return None


def _set_cached(key: str, value: dict):
    with _cache_lock:
        _cache[key] = value
        _cache_ts[key] = time.time()


# ── Public endpoint — no authentication required ───────────────────────────────
@router.get("/{faculty_id}", tags=["Public Portfolio"])
def get_public_portfolio(faculty_id: str, session: SessionDep) -> Any:
    """
    Public endpoint — returns all portfolio data for a faculty member.
    No authentication required. Results are cached for 5 minutes.
    """
    cache_key = f"portfolio:{faculty_id}"
    cached = _get_cached(cache_key)
    if cached:
        return cached

    # Eagerly load all relationships in one query
    profile = (
        session.query(FacultyProfile)
        .options(
            joinedload(FacultyProfile.publications),
            joinedload(FacultyProfile.projects),
            joinedload(FacultyProfile.education),
            joinedload(FacultyProfile.experience),
            joinedload(FacultyProfile.achievements),
            joinedload(FacultyProfile.patents),
            joinedload(FacultyProfile.certifications),
            joinedload(FacultyProfile.teaching),
            joinedload(FacultyProfile.workshops),
        )
        .filter(FacultyProfile.id == faculty_id)
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    def safe_list(items, fields):
        result = []
        for item in items or []:
            row = {}
            for f in fields:
                row[f] = getattr(item, f, None)
            result.append(row)
        return result

    data = {
        "id": profile.id,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "designation": profile.designation,
        "department": profile.department,
        "bio": profile.bio,
        "skills": profile.skills,
        "profile_image_url": profile.profile_image_url,
        "employee_id": profile.employee_id,
        "website": profile.website,
        "linkedin": profile.linkedin,
        "google_scholar": profile.google_scholar,
        "orcid": profile.orcid,
        "office_location": profile.office_location,
        "specialization": profile.specialization,
        "areas_of_interest": profile.areas_of_interest,
        "publications": safe_list(
            profile.publications,
            [
                "id",
                "title",
                "journal_name",
                "year_published",
                "doi",
                "publication_type",
                "abstract",
            ],
        ),
        "projects": safe_list(
            profile.projects,
            [
                "id",
                "title",
                "description",
                "status",
                "start_date",
                "end_date",
                "funding_agency",
                "funding_amount",
            ],
        ),
        "education": safe_list(
            profile.education,
            ["id", "degree", "institution", "field_of_study", "start_year", "end_year"],
        ),
        "experience": safe_list(
            profile.experience,
            [
                "id",
                "job_title",
                "institution",
                "start_date",
                "end_date",
                "description",
                "is_current",
            ],
        ),
        "achievements": safe_list(
            profile.achievements, ["id", "title", "description", "year", "award_body"]
        ),
        "patents": safe_list(
            profile.patents,
            ["id", "title", "patent_number", "filing_date", "status", "description"],
        ),
        "certifications": safe_list(
            profile.certifications,
            [
                "id",
                "name",
                "issuing_organization",
                "issue_date",
                "expiry_date",
                "credential_url",
            ],
        ),
    }

    _set_cached(cache_key, data)
    return data
