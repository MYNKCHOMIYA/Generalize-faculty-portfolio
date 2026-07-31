"""
ai_pipeline.py — NLP/ML pipeline for keyword extraction, research classification,
and ATS compatibility scoring.

Models are loaded ONCE at module import time (global singletons) to avoid
cold-start latency on every request.
"""

from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Any

import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# ── Global model singletons ────────────────────────────────────────────────────
# Loaded once at module import; reused across all requests.

_nlp: spacy.language.Language | None = None
_embedder: SentenceTransformer | None = None

# Research domain corpus — label → representative sentences used for
# zero-shot classification via semantic similarity.
_RESEARCH_DOMAINS: dict[str, list[str]] = {
    "Machine Learning & AI": [
        "deep learning neural networks model training",
        "artificial intelligence machine learning algorithms",
        "natural language processing computer vision transformer",
    ],
    "Bioinformatics & Genomics": [
        "genomics proteomics sequence alignment bioinformatics",
        "gene expression DNA RNA protein structure analysis",
        "computational biology molecular simulation",
    ],
    "Cybersecurity & Networks": [
        "network security cryptography intrusion detection",
        "vulnerability assessment penetration testing encryption",
        "distributed systems blockchain protocol design",
    ],
    "Renewable Energy & Sustainability": [
        "solar photovoltaic wind energy grid storage",
        "sustainable energy carbon footprint climate change",
        "battery efficiency fuel cell electrochemical",
    ],
    "Education Technology": [
        "e-learning online education pedagogy curriculum",
        "student learning outcomes assessment blended learning",
        "educational technology adaptive learning platform",
    ],
    "Medical & Health Sciences": [
        "clinical trial drug discovery patient outcomes",
        "epidemiology public health disease prevention",
        "medical imaging radiology diagnosis prognosis",
    ],
    "Materials Science": [
        "nanomaterials composite polymer thin film",
        "structural material mechanical thermal properties",
        "semiconductor fabrication crystal lattice",
    ],
    "Economics & Social Sciences": [
        "economic policy fiscal monetary market analysis",
        "social inequality governance public administration",
        "behavioural economics game theory decision making",
    ],
}

# ATS keyword bank — terms that ATS systems frequently look for in academic CVs.
_ATS_KEYWORDS: set[str] = {
    "research",
    "publication",
    "journal",
    "grant",
    "funding",
    "teaching",
    "mentoring",
    "collaboration",
    "award",
    "conference",
    "h-index",
    "citations",
    "patent",
    "innovation",
    "project",
    "leadership",
    "analysis",
    "developed",
    "implemented",
    "designed",
    "evaluated",
    "authored",
    "presented",
    "supervised",
    "coordinated",
}

# Strong action verbs prized by academic ATS systems.
_ACTION_VERBS: set[str] = {
    "authored",
    "developed",
    "designed",
    "implemented",
    "led",
    "managed",
    "published",
    "presented",
    "supervised",
    "mentored",
    "collaborated",
    "analyzed",
    "evaluated",
    "established",
    "founded",
    "coordinated",
    "awarded",
    "secured",
    "delivered",
    "pioneered",
}


def _get_nlp() -> spacy.language.Language:
    """Return the spaCy model, loading it on first call."""
    global _nlp
    if _nlp is None:
        logger.info("Loading spaCy model en_core_web_sm …")
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def _get_embedder() -> SentenceTransformer:
    """Return the SentenceTransformer model, loading it on first call."""
    global _embedder
    if _embedder is None:
        logger.info("Loading SentenceTransformer all-MiniLM-L6-v2 …")
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


# Pre-encode domain corpus once so we never re-encode on every request.
@lru_cache(maxsize=1)
def _get_domain_embeddings() -> dict[str, np.ndarray]:
    """
    Return a mapping of domain → mean embedding vector.
    Cached via lru_cache so encoding only happens once per process lifetime.
    """
    embedder = _get_embedder()
    domain_vecs: dict[str, np.ndarray] = {}
    for domain, sentences in _RESEARCH_DOMAINS.items():
        vecs = embedder.encode(
            sentences, convert_to_numpy=True, show_progress_bar=False
        )
        domain_vecs[domain] = vecs.mean(axis=0)
    return domain_vecs


# ── Public API ─────────────────────────────────────────────────────────────────


def extract_keywords(text: str) -> list[str]:
    """
    Extract meaningful keywords from *text* using spaCy.

    Strategy:
    - Keep NOUN, PROPN, and VERB tokens that are not stop-words or punctuation.
    - Also surface named entities (ORG, PRODUCT, WORK_OF_ART, GPE) as-is.
    - Deduplicate, lowercase, and return sorted list.

    Args:
        text: Raw input string (may contain HTML or newlines).

    Returns:
        Deduplicated list of keyword strings.
    """
    if not text or not text.strip():
        return []

    # Strip basic HTML tags and normalise whitespace.
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = re.sub(r"\s+", " ", clean).strip()

    nlp = _get_nlp()
    doc = nlp(clean[:100_000])  # spaCy has memory limits; cap at 100 k chars

    keyword_set: set[str] = set()

    # Token-level extraction: nouns and meaningful verbs
    for token in doc:
        if (
            token.pos_ in {"NOUN", "PROPN", "VERB"}
            and not token.is_stop
            and not token.is_punct
            and not token.is_space
            and len(token.lemma_) > 2
        ):
            keyword_set.add(token.lemma_.lower())

    # Entity-level extraction: retain multi-word entities
    for ent in doc.ents:
        if ent.label_ in {"ORG", "PRODUCT", "WORK_OF_ART", "GPE", "PERSON"}:
            keyword_set.add(ent.text.lower().strip())

    return sorted(keyword_set)


def classify_research(abstract: str) -> str:
    """
    Classify a research abstract into one of the pre-defined domain labels
    using zero-shot semantic similarity.

    Args:
        abstract: Research paper abstract or summary text.

    Returns:
        The best-matching domain label string.
    """
    if not abstract or not abstract.strip():
        return "General Research"

    embedder = _get_embedder()
    domain_vecs = _get_domain_embeddings()

    # Encode the query abstract
    query_vec: np.ndarray = embedder.encode(
        [abstract], convert_to_numpy=True, show_progress_bar=False
    )  # shape: (1, D)

    best_domain = "General Research"
    best_score = -1.0

    for domain, domain_vec in domain_vecs.items():
        # cosine_similarity expects 2-D arrays
        score: float = cosine_similarity(query_vec, domain_vec.reshape(1, -1))[0][0]
        if score > best_score:
            best_score = score
            best_domain = domain

    logger.debug("Research classified as '%s' (score=%.4f)", best_domain, best_score)
    return best_domain


def calculate_ats_score(
    profile_data: dict[str, Any], extracted_text: str
) -> dict[str, Any]:
    """
    Compute a deterministic ATS Compatibility Score (0–100) broken down into
    four weighted sub-scores, each with actionable improvement suggestions.

    Sub-scores and weights:
    ┌──────────────────────────────┬────────┐
    │ Component                    │ Weight │
    ├──────────────────────────────┼────────┤
    │ Profile Completeness         │  30 %  │
    │ ATS Keyword Match            │  30 %  │
    │ Action Verb Density          │  20 %  │
    │ Impact Metrics (citations…)  │  20 %  │
    └──────────────────────────────┴────────┘

    Args:
        profile_data: Dict of faculty profile fields (mirrors FacultyProfile model).
        extracted_text: All text fields concatenated for keyword scanning.

    Returns:
        {
          "overall_score": int,          # 0-100
          "breakdown": {...},            # per-component scores
          "grade": str,                  # A/B/C/D
          "suggestions": [str, ...]      # actionable improvement tips
        }
    """
    suggestions: list[str] = []

    # ── 1. Profile Completeness (30 points) ───────────────────────────────────
    completeness_fields: dict[str, str] = {
        "first_name": "First name",
        "last_name": "Last name",
        "designation": "Designation / Job title",
        "department": "Department",
        "bio": "Professional biography",
        "skills": "Skills",
        "email": "Email address",
        "phone_number": "Phone number",
        "office_location": "Office location",
        "website": "Personal/academic website",
        "linkedin": "LinkedIn profile URL",
        "google_scholar": "Google Scholar profile",
        "orcid": "ORCID iD",
        "specialization": "Specialization",
        "areas_of_interest": "Areas of interest",
    }

    filled = sum(
        1
        for key in completeness_fields
        if profile_data.get(key) and str(profile_data[key]).strip()
    )
    completeness_score = round((filled / len(completeness_fields)) * 30)

    missing_fields = [
        label
        for key, label in completeness_fields.items()
        if not (profile_data.get(key) and str(profile_data[key]).strip())
    ]
    if missing_fields:
        suggestions.append(
            f"Complete missing profile fields to improve visibility: "
            f"{', '.join(missing_fields[:5])}"
            + ("…" if len(missing_fields) > 5 else ".")
        )

    # ── 2. ATS Keyword Match (30 points) ──────────────────────────────────────
    text_lower = extracted_text.lower()
    matched_keywords = {kw for kw in _ATS_KEYWORDS if kw in text_lower}
    keyword_ratio = len(matched_keywords) / len(_ATS_KEYWORDS)
    keyword_score = round(keyword_ratio * 30)

    missing_keywords = _ATS_KEYWORDS - matched_keywords
    if missing_keywords:
        sample = sorted(missing_keywords)[:6]
        suggestions.append(
            f"Add high-value ATS keywords to your profile/bio: " f"{', '.join(sample)}."
        )

    # ── 3. Action Verb Density (20 points) ────────────────────────────────────
    words_in_text = set(re.findall(r"\b\w+\b", text_lower))
    matched_verbs = _ACTION_VERBS & words_in_text
    verb_ratio = min(len(matched_verbs) / max(len(_ACTION_VERBS) * 0.4, 1), 1.0)
    verb_score = round(verb_ratio * 20)

    if len(matched_verbs) < 5:
        missing_verbs = sorted(_ACTION_VERBS - matched_verbs)[:5]
        suggestions.append(
            f"Strengthen your bio/descriptions with action verbs: "
            f"{', '.join(missing_verbs)}."
        )

    # ── 4. Impact Metrics (20 points) ─────────────────────────────────────────
    impact_score = 0
    publications: list[dict] = profile_data.get("publications", [])
    projects: list[dict] = profile_data.get("projects", [])

    # Publications count
    pub_count = len(publications)
    if pub_count >= 10:
        impact_score += 8
    elif pub_count >= 5:
        impact_score += 5
    elif pub_count >= 1:
        impact_score += 2
    else:
        suggestions.append(
            "Add your academic publications to significantly boost your ATS score."
        )

    # Citations
    total_citations: int = sum(int(p.get("citations", 0) or 0) for p in publications)
    if total_citations >= 100:
        impact_score += 6
    elif total_citations >= 20:
        impact_score += 4
    elif total_citations >= 1:
        impact_score += 2
    else:
        suggestions.append(
            "Include citation counts on your publications to demonstrate research impact."
        )

    # Active projects
    active_projects = [
        p for p in projects if str(p.get("status", "")).lower() == "active"
    ]
    if len(active_projects) >= 3:
        impact_score += 6
    elif len(active_projects) >= 1:
        impact_score += 3
    else:
        suggestions.append(
            "Add active research projects to demonstrate ongoing academic engagement."
        )

    impact_score = min(impact_score, 20)  # cap at 20

    # ── Aggregate ──────────────────────────────────────────────────────────────
    overall = completeness_score + keyword_score + verb_score + impact_score

    grade: str
    if overall >= 85:
        grade = "A"
    elif overall >= 70:
        grade = "B"
    elif overall >= 55:
        grade = "C"
    else:
        grade = "D"

    return {
        "overall_score": overall,
        "grade": grade,
        "breakdown": {
            "completeness": completeness_score,
            "keyword_match": keyword_score,
            "action_verbs": verb_score,
            "impact_metrics": impact_score,
        },
        "matched_keywords": sorted(matched_keywords),
        "matched_verbs": sorted(matched_verbs),
        "suggestions": suggestions,
    }
