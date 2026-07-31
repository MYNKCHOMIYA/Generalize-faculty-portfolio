"""
llm_service.py — Async Claude (Anthropic) integration for generating
a professional, third-person academic summary from structured faculty data.

Design decisions:
- Async to fit FastAPI's event loop without blocking.
- Strict prompt engineering: Claude returns ONLY the summary text.
- Graceful fallback: if the API is unavailable, returns a rule-based summary.
- API key loaded via os.getenv — never hardcoded.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import anthropic

logger = logging.getLogger(__name__)

# ── Client singleton ──────────────────────────────────────────────────────────
# Re-use a single client across requests (avoids repeated TCP handshakes).
_client: anthropic.AsyncAnthropic | None = None


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "ANTHROPIC_API_KEY environment variable is not set. "
                "Add it to your .env file."
            )
        _client = anthropic.AsyncAnthropic(api_key=api_key)
    return _client


# ── Prompt engineering ────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are an expert academic CV writer with 20 years of experience crafting \
high-impact faculty profiles for top-tier universities. You write in a formal, \
precise, third-person academic voice. Your summaries are always exactly 3 \
sentences long, data-driven, and highlight quantifiable achievements."""

_USER_PROMPT_TEMPLATE = """\
Generate a professional 3-sentence academic summary for the faculty member \
described below. Follow these strict rules:

RULES:
1. Write in the third person (e.g., "Dr. Smith is …").
2. Sentence 1: Introduce the faculty member — name, title, department, and \
primary research area.
3. Sentence 2: Highlight their most significant academic impact — total \
publications, citation count or H-index if available, top grants or funding, \
and research domain.
4. Sentence 3: Mention their current role contributions — teaching philosophy, \
mentorship, or active projects.
5. Use formal academic English. No hype, no marketing language.
6. Return ONLY the 3-sentence summary. No preamble, no explanation, no labels.

FACULTY DATA:
Name: {full_name}
Title/Designation: {designation}
Department: {department}
Specialization: {specialization}
Areas of Interest: {areas_of_interest}
Biography: {bio}
Total Publications: {pub_count}
Total Citations: {total_citations}
Most-Cited Publication: {top_publication}
Active Projects: {active_projects}
Awards & Achievements: {achievements}
Teaching Load: {teaching_count} courses
Students Mentored: {student_count}
"""


def _build_prompt(faculty_data: dict[str, Any]) -> str:
    """Interpolate faculty_data into the user prompt template."""
    profile = faculty_data.get("profile", {})
    publications: list[dict] = faculty_data.get("publications", [])
    projects: list[dict] = faculty_data.get("projects", [])
    achievements: list[dict] = faculty_data.get("achievements", [])

    # Compute aggregate metrics
    pub_count = len(publications)
    total_citations: int = sum(int(p.get("citations", 0) or 0) for p in publications)

    # Find the most-cited publication
    top_pub = max(
        publications, key=lambda p: int(p.get("citations", 0) or 0), default=None
    )
    top_pub_text = (
        f'"{top_pub["title"]}" ({top_pub.get("citations", 0)} citations)'
        if top_pub
        else "N/A"
    )

    active_projects = [
        p["title"] for p in projects if str(p.get("status", "")).lower() == "active"
    ]
    active_projects_text = (
        "; ".join(active_projects[:3]) if active_projects else "None listed"
    )

    achievement_titles = [
        a.get("title", "") for a in achievements[:3] if a.get("title")
    ]
    achievements_text = (
        "; ".join(achievement_titles) if achievement_titles else "None listed"
    )

    teaching_count = len(faculty_data.get("teaching", []))
    student_count = len(faculty_data.get("student_guidance", []))

    return _USER_PROMPT_TEMPLATE.format(
        full_name=f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip(),
        designation=profile.get("designation", "N/A"),
        department=profile.get("department", "N/A"),
        specialization=profile.get("specialization", "N/A"),
        areas_of_interest=profile.get("areas_of_interest", "N/A"),
        bio=(profile.get("bio") or "N/A")[:400],  # truncate to stay within token budget
        pub_count=pub_count,
        total_citations=total_citations,
        top_publication=top_pub_text,
        active_projects=active_projects_text,
        achievements=achievements_text,
        teaching_count=teaching_count,
        student_count=student_count,
    )


def _fallback_summary(faculty_data: dict[str, Any]) -> str:
    """
    Rule-based fallback summary used when the Anthropic API is unavailable.
    Guarantees the pipeline never fails completely due to an API outage.
    """
    profile = faculty_data.get("profile", {})
    publications = faculty_data.get("publications", [])

    full_name = (
        f"Dr. {profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
    )
    designation = profile.get("designation", "Academic")
    department = profile.get("department", "their department")
    specialization = profile.get("specialization", "their field")
    pub_count = len(publications)
    total_citations = sum(int(p.get("citations", 0) or 0) for p in publications)

    s1 = (
        f"{full_name} is a distinguished {designation} in the {department}, "
        f"specializing in {specialization}."
    )
    s2 = (
        f"With {pub_count} peer-reviewed publication{'s' if pub_count != 1 else ''} "
        f"and {total_citations} total citations, "
        f"{'they have' if pub_count > 0 else 'their'} "
        f"{'made significant contributions' if pub_count > 0 else 'research focuses on'} "
        f"advancing knowledge in {specialization}."
    )
    s3 = (
        f"{full_name} is committed to academic excellence through rigorous research, "
        f"innovative teaching, and dedicated mentorship of the next generation of scholars."
    )
    return f"{s1} {s2} {s3}"


# ── Public API ─────────────────────────────────────────────────────────────────


async def generate_academic_summary(faculty_data: dict[str, Any]) -> str:
    """
    Generate a professional 3-sentence third-person academic summary using
    Claude 3.5 Sonnet.

    Args:
        faculty_data: Structured dict containing keys:
            - "profile": dict of FacultyProfile fields
            - "publications": list of publication dicts
            - "projects": list of project dicts
            - "achievements": list of achievement dicts
            - "teaching": list of teaching records
            - "student_guidance": list of mentorship records

    Returns:
        A 3-sentence academic summary string.

    Raises:
        Falls back to a rule-based summary on API errors — never raises.
    """
    user_prompt = _build_prompt(faculty_data)

    try:
        client = _get_client()
        message = await client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=512,
            temperature=0.3,  # low temperature for deterministic, formal output
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )

        raw_text: str = message.content[0].text.strip()

        # Sanity check: ensure we got something meaningful
        if len(raw_text) < 50:
            logger.warning(
                "Claude returned suspiciously short summary; using fallback."
            )
            return _fallback_summary(faculty_data)

        logger.info(
            "Claude summary generated successfully (%d chars, %d input tokens, %d output tokens).",
            len(raw_text),
            message.usage.input_tokens,
            message.usage.output_tokens,
        )
        return raw_text

    except EnvironmentError as exc:
        logger.warning("Anthropic API key not configured: %s — using fallback.", exc)
        return _fallback_summary(faculty_data)
    except anthropic.APIStatusError as exc:
        logger.error(
            "Anthropic API error %d: %s — using fallback.", exc.status_code, exc.message
        )
        return _fallback_summary(faculty_data)
    except Exception as exc:
        logger.exception(
            "Unexpected error calling Claude API: %s — using fallback.", exc
        )
        return _fallback_summary(faculty_data)
