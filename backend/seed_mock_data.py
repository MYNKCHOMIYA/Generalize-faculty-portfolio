import datetime
from app.db.session import SessionLocal
from app.models.faculty_profile import FacultyProfile
from app.models.publication import Publication
from app.models.project import Project
from app.models.experience import Experience
from app.models.education import Education
from app.models.achievement import Achievement
from app.models.patent import Patent
from app.models.teaching import Teaching
from app.models.student_guidance import StudentGuidance
from app.models.workshop import Workshop


def seed_data():
    db = SessionLocal()

    # Get the first profile
    profile = db.query(FacultyProfile).first()
    if not profile:
        print("No profile found. Please create one first.")
        return

    faculty_id = profile.id
    print(f"Seeding data for faculty ID: {faculty_id}")

    # 1. Publications
    pub1 = Publication(
        faculty_id=faculty_id,
        title="Deep Learning Approaches for Dynamic Resume Generation",
        authors="Dr. John Doe, Jane Smith",
        journal="IEEE Transactions on Artificial Intelligence",
        publication_year=2025,
        doi="10.1109/TAI.2025.1234567",
        publication_type="Journal",
        pdf_url="https://doi.org/10.1109/TAI.2025.1234567",
    )
    db.add(pub1)

    # 2. Projects
    proj1 = Project(
        faculty_id=faculty_id,
        title="AI-Powered Faculty Portfolio System",
        funding_agency="National Science Foundation (NSF)",
        budget=500000.00,
        start_date=datetime.date(2023, 1, 15),
        end_date=datetime.date(2026, 12, 31),
        status="Ongoing",
        description="Development of a generalized platform for managing academic profiles and dynamically generating customized resumes.",
    )
    db.add(proj1)

    # 3. Experience
    exp1 = Experience(
        faculty_id=faculty_id,
        job_title="Associate Professor",
        organization="University of Advanced Technologies",
        start_date=datetime.date(2018, 8, 1),
        end_date=None,
        is_current=True,
        description="Teaching advanced machine learning courses and leading the AI research lab.",
    )
    db.add(exp1)

    # 4. Education
    edu1 = Education(
        faculty_id=faculty_id,
        degree="Ph.D. in Computer Science",
        institution="Massachusetts Institute of Technology (MIT)",
        field_of_study="Artificial Intelligence & Machine Learning",
        start_date=datetime.date(2010, 8, 1),
        end_date=datetime.date(2015, 5, 30),
        grade="4.0",
    )
    db.add(edu1)

    # 5. Achievements
    ach1 = Achievement(
        faculty_id=faculty_id,
        title="Best Paper Award",
        category="Award",
        achievement_date=datetime.date(2024, 7, 20),
        description="Awarded for the paper on LLM Context Windows at the International Conference on Machine Learning (ICML).",
    )
    db.add(ach1)

    # 6. Patents
    pat1 = Patent(
        faculty_profile_id=faculty_id,
        title="Method and System for Automated Document Formatting via LLMs",
        patent_number="US10987654B2",
        status="GRANTED",
        filing_date=datetime.date(2021, 3, 15),
        inventors="John Doe, Jane Smith",
        link_url="https://patents.google.com/patent/US10987654B2",
    )
    db.add(pat1)

    # 7. Teaching
    teach1 = Teaching(
        faculty_profile_id=faculty_id,
        course_name="CS 452: Deep Learning",
        subject_code="CS452",
        semester="Fall 2025",
        academic_year="2025-2026",
        credits=4,
    )
    db.add(teach1)

    # 8. Student Guidance
    guide1 = StudentGuidance(
        faculty_profile_id=faculty_id,
        student_name="Alice Johnson",
        project_title="Optimization of Retrieval-Augmented Generation",
        degree="Ph.D.",
        year=2024,
        status="ONGOING",
    )
    db.add(guide1)

    # 9. Workshops
    work1 = Workshop(
        faculty_profile_id=faculty_id,
        event_name="Generative AI for Academic Researchers",
        organizer="Global Tech Symposium",
        event_date=datetime.date(2025, 9, 1),
    )
    db.add(work1)

    # Commit all
    try:
        db.commit()
        print("Successfully seeded all mock data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
