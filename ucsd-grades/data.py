"""Fetch and parse the public UCSD grade-distribution Google Sheet."""

from __future__ import annotations

import csv
import io
import re
import urllib.request
from typing import Any

CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vQ6KhjyiPM-rof6fqjBcmp7ygy4Dqr1LQ8uJiAOtR2IoihzQEumx-SHX_KKxLpmYGZksN6QsPPk0DNb"
    "/pub?single=true&output=csv"
)

GRADE_TOKEN = re.compile(r"\s*([^:,]+)\s*:\s*([^,]+)\s*")
UNAVAILABLE_HINTS = (
    "not available",
    "temporarily unavailable",
)

LETTER_ORDER = [
    "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-",
    "D", "F", "P", "NP", "S", "U", "W", "I", "IP", "Blank",
]

SEASON_ORDER = {
    "Winter Qtr": 1,
    "Spring Qtr": 2,
    "Sum Ses I": 3,
    "SpecSumSes": 4,
    "Sum Ses II": 5,
    "Fall Qtr": 6,
}


def fetch_csv(url: str = CSV_URL) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "ucsd-grades/1.0"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        return resp.read().decode("utf-8-sig")


def parse_grade_blob(blob: str) -> dict[str, str]:
    if not blob or not blob.strip():
        return {}
    return {key.strip(): value.strip() for key, value in GRADE_TOKEN.findall(blob)}


def _to_float(value: str | None) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _to_int(value: str | None) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(float(value))
    except ValueError:
        return None


def parse_term_sort_key(term: str) -> tuple[int, int]:
    parts = term.rsplit(" ", 1)
    year = 0
    if parts and parts[-1].isdigit():
        year = int(parts[-1])
    season = term[: -len(parts[-1])].strip() if year else term
    return (year, SEASON_ORDER.get(season, 99))


def load_offerings(text: str | None = None) -> list[dict[str, Any]]:
    if text is None:
        text = fetch_csv()
    reader = csv.DictReader(io.StringIO(text))
    seen: set[tuple[str, str, str, str]] = set()
    offerings: list[dict[str, Any]] = []

    for raw in reader:
        row = {(k or "").strip(): (v or "").strip() for k, v in raw.items()}
        term = row.get("Term", "")
        course = row.get("Course", "")
        professor = row.get("Professor", "")
        blob = row.get("Grade distribution", "")
        key = (term, course, professor, blob)
        if not course or key in seen:
            continue
        seen.add(key)

        parsed = parse_grade_blob(blob)
        grades: dict[str, int] = {}
        notes: list[str] = []
        for label, value in parsed.items():
            if label in ("Class GPA", "Total Students"):
                continue
            count = _to_int(value)
            if count is None:
                notes.append(f"{label}: {value}")
            else:
                grades[label] = count
        low = blob.lower()
        if any(hint in low for hint in UNAVAILABLE_HINTS) and not grades:
            notes.append(blob)

        offerings.append({
            "term": term,
            "course": course,
            "dept": course.split()[0] if course else "",
            "professor": professor,
            "gpa": _to_float(parsed.get("Class GPA")),
            "enrollment": _to_int(parsed.get("Total Students")),
            "grades": grades,
            "notes": notes,
            "submitted_at": row.get("Submission time", ""),
        })

    offerings.sort(key=lambda o: (*parse_term_sort_key(o["term"]), o["course"], o["professor"]))
    return offerings


def normalize_query(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().casefold()


def course_matches(offering: dict[str, Any], query: str) -> bool:
    q = normalize_query(query)
    if not q:
        return True
    course = offering["course"].casefold()
    dept = offering["dept"].casefold()
    compact = course.replace(" ", "")
    q_compact = q.replace(" ", "")
    if q == dept or q_compact == dept:
        return True
    return q in course or q_compact in compact


def professor_matches(offering: dict[str, Any], query: str) -> bool:
    q = normalize_query(query)
    if not q:
        return True
    return q in offering["professor"].casefold()


def filter_offerings(
    offerings: list[dict[str, Any]],
    course_query: str = "",
    professor_query: str = "",
    terms: list[str] | None = None,
) -> list[dict[str, Any]]:
    selected = set(terms or [])
    out = []
    for row in offerings:
        if selected and row["term"] not in selected:
            continue
        if not course_matches(row, course_query):
            continue
        if not professor_matches(row, professor_query):
            continue
        out.append(row)
    return out


def summarize(offerings: list[dict[str, Any]]) -> dict[str, Any]:
    gpa_weight = 0.0
    gpa_n = 0.0
    enroll_sum = 0
    enroll_rows = 0
    grade_totals: dict[str, int] = {}
    for row in offerings:
        if row["gpa"] is not None and row["enrollment"]:
            gpa_weight += row["gpa"] * row["enrollment"]
            gpa_n += row["enrollment"]
        elif row["gpa"] is not None:
            gpa_weight += row["gpa"]
            gpa_n += 1
        if row["enrollment"] is not None:
            enroll_sum += row["enrollment"]
            enroll_rows += 1
        for letter, count in row["grades"].items():
            grade_totals[letter] = grade_totals.get(letter, 0) + count

    ordered_grades = [
        {"grade": letter, "count": grade_totals[letter]}
        for letter in LETTER_ORDER
        if letter in grade_totals
    ]
    extra = [
        {"grade": letter, "count": count}
        for letter, count in sorted(grade_totals.items())
        if letter not in LETTER_ORDER
    ]
    return {
        "offerings": len(offerings),
        "courses": len({row["course"] for row in offerings}),
        "professors": len({row["professor"] for row in offerings}),
        "avg_gpa": (gpa_weight / gpa_n) if gpa_n else None,
        "enrollment": enroll_sum if enroll_rows else None,
        "grade_totals": ordered_grades + extra,
    }
