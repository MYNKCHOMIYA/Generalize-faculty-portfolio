from fastapi import APIRouter, Depends, HTTPException, Response


from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.models.faculty_profile import FacultyProfile
from app.models.education import Education
from app.models.experience import Experience
from app.models.publication import Publication
from app.models.project import Project
from app.utils.pdf_generator import generate_pdf_cv

router = APIRouter()


@router.get("/cv/{profile_id}")
def download_faculty_cv(
    profile_id: str,
    session: SessionDep,
    # We require an active user to download, but it doesn't have to be their own profile
    current_user: User = Depends(get_current_active_user),
):
    """
    Generates and downloads a PDF Curriculum Vitae for a specific faculty profile.
    """
    # 1. Fetch the main profile
    profile = (
        session.query(FacultyProfile).filter(FacultyProfile.id == profile_id).first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    # 2. Fetch all related data
    education = (
        session.query(Education)
        .filter(Education.faculty_id == profile_id)
        .order_by(Education.start_date.desc())
        .all()
    )
    experience = (
        session.query(Experience)
        .filter(Experience.faculty_id == profile_id)
        .order_by(Experience.start_date.desc())
        .all()
    )
    publications = (
        session.query(Publication)
        .filter(Publication.faculty_id == profile_id)
        .order_by(Publication.publication_year.desc())
        .all()
    )
    projects = (
        session.query(Project)
        .filter(Project.faculty_id == profile_id)
        .order_by(Project.start_date.desc())
        .all()
    )

    # 3. Generate the PDF bytes
    pdf_bytes = generate_pdf_cv(profile, education, experience, publications, projects)

    # 4. Return as a downloadable file stream
    # NOTE: fpdf2's pdf.output() returns a bytearray; Starlette expects bytes.
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{profile.first_name}_{profile.last_name}_CV.pdf"'
        },
    )
