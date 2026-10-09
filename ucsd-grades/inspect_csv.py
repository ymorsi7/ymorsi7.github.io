#!/usr/bin/env python3
"""Fetch the public UCSD grade-distribution Google Sheet and print its shape."""

from __future__ import annotations

import csv
import io
import re
import urllib.request
from collections import Counter

CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vQ6KhjyiPM-rof6fqjBcmp7ygy4Dqr1LQ8uJiAOtR2IoihzQEumx-SHX_KKxLpmYGZksN6QsPPk0DNb"
    "/pub?single=true&output=csv"
)

GRADE_TOKEN = re.compile(r"\s*([^:,]+)\s*:\s*([^,]+)\s*")


def fetch_csv(url: str = CSV_URL) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "ucsd-grades-inspect/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
    return raw.decode("utf-8-sig")


def parse_grade_blob(blob: str) -> dict[str, str]:
    if not blob or not blob.strip():
        return {}
    return {key.strip(): value.strip() for key, value in GRADE_TOKEN.findall(blob)}


def main() -> None:
    text = fetch_csv()
    reader = csv.DictReader(io.StringIO(text))
    raw_fields = reader.fieldnames or []
    fields = [name.strip() for name in raw_fields]

    print("=== fetch ===")
    print(f"url: {CSV_URL}")
    print(f"bytes: {len(text.encode('utf-8')):,}")
    print(f"raw header columns ({len(raw_fields)}):")
    for i, name in enumerate(raw_fields):
        visible = repr(name)
        print(f"  [{i}] {visible}")

    rows = []
    empty_counts = Counter()
    terms = Counter()
    depts = Counter()
    grade_keys = Counter()
    gpa_present = 0
    enrollment_present = 0
    parse_failures = 0
    recommend_values = Counter()

    for row in reader:
        cleaned = {k.strip(): (v or "").strip() for k, v in row.items() if k is not None}
        rows.append(cleaned)
        for field in fields:
            if not cleaned.get(field):
                empty_counts[field] += 1

        term = cleaned.get("Term", "")
        if term:
            terms[term] += 1

        course = cleaned.get("Course", "")
        if course:
            depts[course.split()[0]] += 1

        rec = cleaned.get("Recommend professor?", "")
        recommend_values[rec if rec else "(empty)"] += 1

        blob = cleaned.get("Grade distribution", "")
        parsed = parse_grade_blob(blob)
        if blob and not parsed:
            parse_failures += 1
        for key in parsed:
            grade_keys[key] += 1
        if "Class GPA" in parsed:
            gpa_present += 1
        if "Total Students" in parsed:
            enrollment_present += 1

    print("\n=== rows ===")
    print(f"data rows: {len(rows):,}")
    print("empty / missing per column:")
    for field in fields:
        n = empty_counts[field]
        pct = (100 * n / len(rows)) if rows else 0
        print(f"  {field}: {n:,} ({pct:.1f}%)")

    print("\n=== terms ===")
    for term, n in terms.most_common():
        print(f"  {n:5,}  {term}")

    print("\n=== departments (from Course) ===")
    print(f"unique depts: {len(depts)}")
    print("top 15:")
    for dept, n in depts.most_common(15):
        print(f"  {n:5,}  {dept}")

    print("\n=== recommend professor? ===")
    for value, n in recommend_values.most_common():
        print(f"  {n:5,}  {value!r}")

    print("\n=== grade distribution blob ===")
    print(f"blobs that failed to parse: {parse_failures}")
    print(f"rows with Class GPA: {gpa_present:,}")
    print(f"rows with Total Students: {enrollment_present:,}")
    print("keys found inside Grade distribution:")
    for key, n in grade_keys.most_common():
        print(f"  {n:5,}  {key}")

    print("\n=== sample rows ===")
    for row in rows[:3]:
        print(
            f"  {row.get('Term')} | {row.get('Course')} | {row.get('Professor')} | "
            f"gpa={parse_grade_blob(row.get('Grade distribution', '')).get('Class GPA')} | "
            f"n={parse_grade_blob(row.get('Grade distribution', '')).get('Total Students')}"
        )


if __name__ == "__main__":
    main()
