import re
from typing import List

# Patterns for non-technical boilerplate fluff in Company Job Descriptions
BOILERPLATE_PATTERNS = [
    r"equal\s+opportunity\s+employer",
    r"race,\s*color,\s*religion,\s*sex,\s*national\s+origin",
    r"sexual\s+orientation,\s*gender\s+identity",
    r"competitive\s+salary(?:\s+and\s+benefits)?",
    r"401\(k\)(?:\s+matching)?",
    r"unlimited\s+pto",
    r"health,\s*dental,\s*and\s*vision\s+insurance",
    r"dog-friendly\s+office",
    r"free\s+snacks\s+and\s+coffee",
    r"flexible\s+working\s+hours",
    r"hybrid\s+work\s+model",
    r"join\s+our\s+passionate\s+team",
    r"we\s+are\s+looking\s+for\s+an?\s+energetic",
    r"about\s+the\s+company",
    r"who\s+we\s+are",
    r"what\s+we\s+offer",
    r"perks\s+&\s+benefits"
]

class JDCleaner:
    """
    Utility class to sanitize Job Description text before ATS TF-IDF Vectorization.
    Removes HR boilerplate, EEO disclaimers, and compensation filler to ensure 
    that only core technical requirements and responsibilities are evaluated.
    """

    @classmethod
    def clean_job_description(cls, raw_jd: str) -> str:
        if not raw_jd or not raw_jd.strip():
            return ""

        lines = raw_jd.split("\n")
        cleaned_lines: List[str] = []

        for line in lines:
            line_str = line.strip()
            line_lower = line_str.lower()

            # Skip lines matching company boilerplate noise
            if any(re.search(pat, line_lower) for pat in BOILERPLATE_PATTERNS):
                continue

            # Skip ultra-generic short filler lines
            if len(line_str) < 3:
                continue

            cleaned_lines.append(line_str)

        cleaned_text = "\n".join(cleaned_lines)
        return cleaned_text.strip() if cleaned_text.strip() else raw_jd.strip()
