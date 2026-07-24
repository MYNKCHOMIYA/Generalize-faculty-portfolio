from fpdf import FPDF, XPos, YPos

# ---------------------------------------------------------------------------
# Unicode → Latin-1 safe sanitiser
# fpdf's built-in core fonts (helvetica, times, courier) only support Latin-1.
# This function replaces common Unicode characters that appear in academic text
# with their closest ASCII / Latin-1 equivalents so the PDF never crashes.
# ---------------------------------------------------------------------------
_UNICODE_MAP = {
    "\u2022": "-",  # bullet  •  -> -
    "\u2023": "-",  # triangular bullet
    "\u2043": "-",  # hyphen bullet
    "\u25cf": "-",  # black circle
    "\u2013": "-",  # en-dash  –  -> -
    "\u2014": "--",  # em-dash  —  -> --
    "\u2018": "'",  # left single quote  '
    "\u2019": "'",  # right single quote  '
    "\u201c": '"',  # left double quote  "
    "\u201d": '"',  # right double quote  "
    "\u2026": "...",  # ellipsis  …
    "\u00a0": " ",  # non-breaking space
    "\u00b7": "-",  # middle dot  ·
    "\u2212": "-",  # minus sign  −
    "\u00d7": "x",  # multiplication sign  ×
    "\u00ae": "(R)",  # registered  ®
    "\u2122": "(TM)",  # trade mark  ™
}


def _safe(text: str) -> str:
    """Return a Latin-1 safe version of *text*."""
    if not text:
        return ""
    for char, replacement in _UNICODE_MAP.items():
        text = text.replace(char, replacement)
    # Final pass: drop any remaining non-latin-1 characters
    return text.encode("latin-1", errors="replace").decode("latin-1")


# ---------------------------------------------------------------------------
# PDF class
# ---------------------------------------------------------------------------


class FacultyCV(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 15)
        self.set_text_color(41, 128, 185)
        self.cell(
            0,
            10,
            "Curriculum Vitae",
            border=0,
            align="C",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")


def generate_pdf_cv(profile, education, experience, publications, projects) -> bytes:
    """Generates a PDF CV from database records and returns it as raw bytes."""
    pdf = FacultyCV()
    pdf.add_page()

    # --- 1. Personal Information ---
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(44, 62, 80)
    pdf.cell(
        0,
        10,
        _safe(f"{profile.first_name} {profile.last_name}"),
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.set_font("helvetica", "", 12)
    pdf.set_text_color(127, 140, 141)
    pdf.cell(0, 8, _safe(f"{profile.designation}"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if profile.phone_number:
        pdf.cell(
            0,
            8,
            _safe(f"Phone: {profile.phone_number}"),
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
    pdf.ln(5)

    if profile.bio:
        pdf.set_font("helvetica", "", 11)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(0, 6, _safe(profile.bio))
        pdf.ln(10)

    # --- Helper function for section titles ---
    def section_title(title: str):
        pdf.set_font("helvetica", "B", 16)
        pdf.set_text_color(41, 128, 185)
        pdf.cell(0, 10, _safe(title), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 190, pdf.get_y())
        pdf.ln(5)

    # --- 2. Education ---
    if education:
        section_title("Education")
        for edu in education:
            pdf.set_font("helvetica", "B", 12)
            pdf.set_text_color(44, 62, 80)
            pdf.cell(
                0,
                6,
                _safe(f"{edu.degree} in {edu.field_of_study}"),
                new_x=XPos.LMARGIN,
                new_y=YPos.NEXT,
            )

            pdf.set_font("helvetica", "", 11)
            pdf.set_text_color(0, 0, 0)
            start = edu.start_date.strftime("%Y") if edu.start_date else "?"
            end = edu.end_date.strftime("%Y") if edu.end_date else "Present"
            date_str = f"{start} - {end}"
            pdf.cell(
                0,
                6,
                _safe(f"{edu.institution} | {date_str}"),
                new_x=XPos.LMARGIN,
                new_y=YPos.NEXT,
            )
            pdf.ln(4)

    # --- 3. Experience ---
    if experience:
        section_title("Professional Experience")
        for exp in experience:
            pdf.set_font("helvetica", "B", 12)
            pdf.set_text_color(44, 62, 80)
            pdf.cell(
                0,
                6,
                _safe(f"{exp.job_title} at {exp.organization}"),
                new_x=XPos.LMARGIN,
                new_y=YPos.NEXT,
            )

            pdf.set_font("helvetica", "I", 11)
            pdf.set_text_color(127, 140, 141)
            start = exp.start_date.strftime("%b %Y") if exp.start_date else "?"
            end = exp.end_date.strftime("%b %Y") if exp.end_date else "Present"
            date_str = f"{start} - {end}"
            pdf.cell(0, 6, _safe(date_str), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(4)

    # --- 4. Publications ---
    if publications:
        section_title("Selected Publications")
        for pub in publications:
            pdf.set_font("helvetica", "", 11)
            pdf.set_text_color(0, 0, 0)
            publisher = f" {pub.publisher} -" if pub.publisher else ""
            # Use ASCII dash instead of bullet to stay Latin-1 safe
            pub_text = f"- {pub.title} ({pub.publication_year}).{publisher} {pub.publication_type}."
            pdf.multi_cell(0, 6, _safe(pub_text))
            pdf.ln(2)

    # --- 5. Projects ---
    if projects:
        section_title("Projects")
        for proj in projects:
            pdf.set_font("helvetica", "B", 12)
            pdf.set_text_color(44, 62, 80)
            pdf.cell(
                0,
                6,
                _safe(proj.title),
                new_x=XPos.LMARGIN,
                new_y=YPos.NEXT,
            )
            if proj.description:
                pdf.set_font("helvetica", "", 10)
                pdf.set_text_color(0, 0, 0)
                pdf.multi_cell(0, 5, _safe(proj.description))
            pdf.ln(4)

    return pdf.output()
