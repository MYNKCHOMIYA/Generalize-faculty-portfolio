from pydantic import BaseModel
from datetime import datetime


class SavedResumeBase(BaseModel):
    resume_name: str
    file_url: str


class SavedResumeCreate(SavedResumeBase):
    pass


class SavedResumeResponse(SavedResumeBase):
    id: str
    faculty_id: str
    created_at: datetime

    class Config:
        from_attributes = True
