"""
resume_template.html — Jinja2 template for academic CV PDF export.

Render with WeasyPrint. Supports both light (default) and print media.
Context variables expected (all optional — template handles missing gracefully):
  - profile:        dict (FacultyProfile fields)
  - summary:        str  (AI-generated academic summary)
  - publications:   list[dict]
  - projects:       list[dict]
  - experience:     list[dict]
  - education:      list[dict]
  - achievements:   list[dict]
  - patents:        list[dict]
  - teaching:       list[dict]
  - ats:            dict (ATS score breakdown)
  - generated_date: str  (ISO date string)
"""

RESUME_HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Academic CV — {{ profile.first_name }} {{ profile.last_name }}</title>
  <style>
    /* ── Reset & Base ───────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #888;
      }
    }

    body {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1a1a1a;
      background: #fff;
    }

    /* ── Header ──────────────────────────────────────────────────── */
    .cv-header {
      border-bottom: 2.5pt solid #1a1a1a;
      padding-bottom: 10pt;
      margin-bottom: 12pt;
    }
    .cv-header h1 {
      font-size: 22pt;
      font-weight: 700;
      letter-spacing: 0.5pt;
      line-height: 1.2;
    }
    .cv-header .designation {
      font-size: 11pt;
      color: #444;
      margin-top: 2pt;
    }
    .cv-header .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 14pt;
      margin-top: 6pt;
      font-size: 9pt;
      color: #555;
    }
    .cv-header .meta span::before {
      content: "▸ ";
      color: #999;
    }

    /* ── ATS Badge ───────────────────────────────────────────────── */
    .ats-badge {
      float: right;
      margin-top: -38pt;
      text-align: center;
      border: 1.5pt solid #1a1a1a;
      border-radius: 6pt;
      padding: 6pt 10pt;
      font-size: 8pt;
      line-height: 1.3;
    }
    .ats-badge .score { font-size: 18pt; font-weight: 700; }
    .ats-badge .grade { font-size: 10pt; color: #555; }

    /* ── Sections ─────────────────────────────────────────────────── */
    .section { margin-top: 14pt; }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1pt;
      border-bottom: 0.75pt solid #888;
      padding-bottom: 2pt;
      margin-bottom: 8pt;
    }

    /* ── Summary ─────────────────────────────────────────────────── */
    .summary-text {
      font-style: italic;
      color: #333;
      background: #f9f9f9;
      border-left: 3pt solid #1a1a1a;
      padding: 8pt 10pt;
      margin-bottom: 4pt;
    }

    /* ── Publication entry ──────────────────────────────────────── */
    .pub-entry {
      margin-bottom: 7pt;
      padding-left: 12pt;
      position: relative;
    }
    .pub-entry::before {
      content: "•";
      position: absolute;
      left: 0;
      top: 0;
    }
    .pub-entry .pub-title { font-weight: bold; }
    .pub-entry .pub-meta  { font-size: 9pt; color: #555; }
    .pub-entry .pub-badge {
      display: inline-block;
      font-size: 7.5pt;
      border: 0.5pt solid #888;
      border-radius: 3pt;
      padding: 0 3pt;
      margin-left: 4pt;
      color: #555;
    }

    /* ── Generic entry (experience, education, project) ─────────── */
    .entry { margin-bottom: 9pt; }
    .entry .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .entry .entry-title { font-weight: bold; font-size: 10.5pt; }
    .entry .entry-sub   { font-size: 9.5pt; color: #444; }
    .entry .entry-date  { font-size: 9pt; color: #888; white-space: nowrap; }
    .entry .entry-desc  { font-size: 9.5pt; color: #333; margin-top: 2pt; }

    /* ── Skills / keywords ──────────────────────────────────────── */
    .pill-group { display: flex; flex-wrap: wrap; gap: 5pt; margin-top: 4pt; }
    .pill {
      font-size: 8.5pt;
      border: 0.5pt solid #bbb;
      border-radius: 10pt;
      padding: 1.5pt 7pt;
      color: #333;
    }

    /* ── Two-column layout for compact sections ──────────────────── */
    .two-col { display: flex; gap: 20pt; }
    .two-col > * { flex: 1; }

    /* ── Footer ──────────────────────────────────────────────────── */
    .cv-footer {
      margin-top: 20pt;
      padding-top: 8pt;
      border-top: 0.5pt solid #ccc;
      font-size: 8pt;
      color: #aaa;
      text-align: center;
    }

    /* ── Page break control ──────────────────────────────────────── */
    .page-break { page-break-before: always; }
    .no-break   { page-break-inside: avoid; }
  </style>
</head>
<body>

{# ── Header ──────────────────────────────────────────────────────────────── #}
<header class="cv-header">
  {% if ats %}
  <div class="ats-badge">
    <div class="score">{{ ats.overall_score }}</div>
    <div class="grade">ATS Grade {{ ats.grade }}</div>
    <div style="font-size:7.5pt; color:#aaa;">/100</div>
  </div>
  {% endif %}

  <h1>{{ profile.first_name }} {{ profile.last_name }}</h1>
  <div class="designation">
    {{ profile.designation }}
    {% if profile.department %} · {{ profile.department }}{% endif %}
  </div>

  <div class="meta">
    {% if profile.email %}<span>{{ profile.email }}</span>{% endif %}
    {% if profile.phone_number %}<span>{{ profile.phone_number }}</span>{% endif %}
    {% if profile.office_location %}<span>{{ profile.office_location }}</span>{% endif %}
    {% if profile.website %}<span>{{ profile.website }}</span>{% endif %}
    {% if profile.linkedin %}<span>LinkedIn: {{ profile.linkedin }}</span>{% endif %}
    {% if profile.orcid %}<span>ORCID: {{ profile.orcid }}</span>{% endif %}
    {% if profile.google_scholar %}<span>Scholar: {{ profile.google_scholar }}</span>{% endif %}
  </div>
</header>

{# ── AI Summary ──────────────────────────────────────────────────────────── #}
{% if summary %}
<section class="section no-break">
  <div class="section-title">Professional Summary</div>
  <div class="summary-text">{{ summary }}</div>
</section>
{% endif %}

{# ── Research Areas & Skills ─────────────────────────────────────────────── #}
{% set skills_list = profile.skills.split(',') if profile.skills else [] %}
{% set areas_list  = profile.areas_of_interest.split(',') if profile.areas_of_interest else [] %}
{% if skills_list or areas_list %}
<section class="section no-break">
  <div class="section-title">Research Interests &amp; Skills</div>
  <div class="two-col">
    {% if areas_list %}
    <div>
      <div style="font-size:9pt; font-weight:bold; color:#555; margin-bottom:4pt;">AREAS OF INTEREST</div>
      <div class="pill-group">
        {% for area in areas_list %}
          <span class="pill">{{ area.strip() }}</span>
        {% endfor %}
      </div>
    </div>
    {% endif %}
    {% if skills_list %}
    <div>
      <div style="font-size:9pt; font-weight:bold; color:#555; margin-bottom:4pt;">TECHNICAL SKILLS</div>
      <div class="pill-group">
        {% for skill in skills_list %}
          <span class="pill">{{ skill.strip() }}</span>
        {% endfor %}
      </div>
    </div>
    {% endif %}
  </div>
</section>
{% endif %}

{# ── Publications ────────────────────────────────────────────────────────── #}
{% if publications %}
<section class="section">
  <div class="section-title">Publications ({{ publications | length }})</div>
  {% for pub in publications %}
  <div class="pub-entry no-break">
    <span class="pub-title">{{ pub.title }}</span>
    {% if pub.authors %}
    <br/><span class="pub-meta">{{ pub.authors }}</span>
    {% endif %}
    <br/>
    <span class="pub-meta">
      {% if pub.journal %}{{ pub.journal }}{% elif pub.publisher %}{{ pub.publisher }}{% endif %}
      {% if pub.publication_year %}, {{ pub.publication_year }}{% endif %}
      {% if pub.doi %} · DOI: {{ pub.doi }}{% endif %}
    </span>
    {% if pub.citations %}<span class="pub-badge">{{ pub.citations }} citations</span>{% endif %}
    {% if pub.indexed_in %}<span class="pub-badge">{{ pub.indexed_in }}</span>{% endif %}
    {% if pub.publication_type %}<span class="pub-badge">{{ pub.publication_type }}</span>{% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}

{# ── Projects ────────────────────────────────────────────────────────────── #}
{% if projects %}
<section class="section">
  <div class="section-title">Research Projects ({{ projects | length }})</div>
  {% for proj in projects %}
  <div class="entry no-break">
    <div class="entry-header">
      <span class="entry-title">{{ proj.title }}</span>
      <span class="entry-date">{{ proj.status | default('') | title }}</span>
    </div>
    {% if proj.funding_agency %}
    <div class="entry-sub">Funded by: {{ proj.funding_agency }}</div>
    {% endif %}
    {% if proj.description %}
    <div class="entry-desc">{{ proj.description }}</div>
    {% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}

{# ── Experience ──────────────────────────────────────────────────────────── #}
{% if experience %}
<section class="section">
  <div class="section-title">Academic &amp; Professional Experience</div>
  {% for exp in experience %}
  <div class="entry no-break">
    <div class="entry-header">
      <span class="entry-title">{{ exp.job_title }}</span>
      <span class="entry-date">
        {{ exp.start_date | default('') }}
        {% if exp.is_current %} – Present{% elif exp.end_date %} – {{ exp.end_date }}{% endif %}
      </span>
    </div>
    <div class="entry-sub">{{ exp.institution }}</div>
    {% if exp.description %}
    <div class="entry-desc">{{ exp.description }}</div>
    {% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}

{# ── Education ──────────────────────────────────────────────────────────── #}
{% if education %}
<section class="section">
  <div class="section-title">Education</div>
  {% for edu in education %}
  <div class="entry no-break">
    <div class="entry-header">
      <span class="entry-title">
        {{ edu.degree }}{% if edu.field_of_study %} in {{ edu.field_of_study }}{% endif %}
      </span>
      <span class="entry-date">
        {{ edu.start_year | default('') }}{% if edu.end_year %} – {{ edu.end_year }}{% endif %}
      </span>
    </div>
    <div class="entry-sub">{{ edu.institution }}</div>
  </div>
  {% endfor %}
</section>
{% endif %}

{# ── Achievements ────────────────────────────────────────────────────────── #}
{% if achievements %}
<section class="section">
  <div class="section-title">Awards &amp; Achievements</div>
  {% for ach in achievements %}
  <div class="entry no-break">
    <div class="entry-header">
      <span class="entry-title">{{ ach.title }}</span>
      {% if ach.year %}<span class="entry-date">{{ ach.year }}</span>{% endif %}
    </div>
    {% if ach.award_body %}<div class="entry-sub">{{ ach.award_body }}</div>{% endif %}
    {% if ach.description %}<div class="entry-desc">{{ ach.description }}</div>{% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}

{# ── Patents ─────────────────────────────────────────────────────────────── #}
{% if patents %}
<section class="section">
  <div class="section-title">Patents</div>
  {% for pat in patents %}
  <div class="entry no-break">
    <div class="entry-header">
      <span class="entry-title">{{ pat.title }}</span>
      {% if pat.status %}<span class="entry-date">{{ pat.status }}</span>{% endif %}
    </div>
    {% if pat.patent_number %}<div class="entry-sub">Patent No: {{ pat.patent_number }}</div>{% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}

{# ── Teaching ─────────────────────────────────────────────────────────────── #}
{% if teaching %}
<section class="section">
  <div class="section-title">Teaching</div>
  <div class="pill-group">
    {% for t in teaching %}
      <span class="pill">{{ t.course_name | default(t.subject | default('Course')) }}</span>
    {% endfor %}
  </div>
</section>
{% endif %}

{# ── Footer ──────────────────────────────────────────────────────────────── #}
<div class="cv-footer">
  Generated by Faculty Portfolio OS · {{ generated_date }}
  {% if ats %}
   · ATS Score: {{ ats.overall_score }}/100 ({{ ats.grade }})
  {% endif %}
</div>

</body>
</html>
"""
