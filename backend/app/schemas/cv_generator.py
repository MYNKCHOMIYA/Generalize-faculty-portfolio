from pydantic import BaseModel, Field


class CVGenerateRequest(BaseModel):
    html_template: str = Field(
        ..., description="The Jinja2 HTML template string to use for CV generation."
    )
