from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# This single line forces SQLAlchemy to load all models from __init__.py at startup
import app.models

from app.api.auth import router as auth_router
from app.core.config import settings
from app.api.faculty_profile import router as profile_router
from app.api.publication import router as publication_router
from app.api.education import router as education_router
from app.api.experience import router as experience_router
from app.api.project import router as project_router
from app.api.achievement import router as achievement_router
from app.api.export import router as export_router
from app.api import (
    patent,
    certification,
    teaching,
    student_guidance,
    workshop,
    upload,
    search,
    analytics,
)
from app.api import notifications
from app.api import activity
from app.api import public_portfolio
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://generalized-faculty-portfolio-syste-ten.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(
    auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"]
)
app.include_router(
    profile_router, prefix=f"{settings.API_V1_STR}/profile", tags=["Faculty Profile"]
)
app.include_router(
    publication_router,
    prefix=f"{settings.API_V1_STR}/publications",
    tags=["Publications"],
)
app.include_router(
    education_router, prefix=f"{settings.API_V1_STR}/education", tags=["Education"]
)
app.include_router(
    experience_router, prefix=f"{settings.API_V1_STR}/experience", tags=["Experience"]
)
app.include_router(
    project_router, prefix=f"{settings.API_V1_STR}/projects", tags=["Projects"]
)
app.include_router(
    achievement_router,
    prefix=f"{settings.API_V1_STR}/achievements",
    tags=["Achievements"],
)
app.include_router(
    export_router, prefix=f"{settings.API_V1_STR}/export", tags=["Data Export"]
)

# Public portfolio — no auth required
app.include_router(
    public_portfolio.router,
    prefix=f"{settings.API_V1_STR}/portfolio/public",
    tags=["Public Portfolio"],
)

app.include_router(patent.router, prefix="/api/patents", tags=["Patents"])
app.include_router(
    certification.router, prefix="/api/certifications", tags=["Certifications"]
)
app.include_router(teaching.router, prefix="/api/teaching", tags=["Teaching"])
app.include_router(
    student_guidance.router, prefix="/api/student-guidance", tags=["Student Guidance"]
)
app.include_router(workshop.router, prefix="/api/workshops", tags=["Workshops & FDP"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Uploads"])
app.include_router(search.router, prefix="/api/search", tags=["Search & Filter"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Data & Analytics"])
app.include_router(notifications.router, prefix="/api")
app.include_router(activity.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Welcome to the GFPMS API"}
