#!/usr/bin/env python3
"""Fetch UCSD General Catalog course lists and emit catalog-index.js + catalog-all.js."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX_URL = "https://catalog.ucsd.edu/front/courses.html"
COURSE_HEAD = re.compile(
    r"^([A-Z][A-Z0-9]{1,9})\s+([\d][\dA-Z]*[A-Z]?)\.\s+(.+?)\s*\((\d+)\)\s*$"
)
LINK_RE = re.compile(
    r'href="(?:\.\./|https://catalog\.ucsd\.edu/)?courses/([A-Za-z0-9_-]+)\.html"[^>]*>\s*courses\s*</a>',
    re.I,
)
NAME_BEFORE_LINK = re.compile(
    r"<p[^>]*>(?:<[^>]+>)*([^<\[]+?)\s*<span[^>]*class=\"courseFacLink\"[^>]*>\s*\[[^\]]*courses",
    re.I | re.S,
)
TITLE_RE = re.compile(r"<h[12][^>]*>([^<]+?)\s*\(([A-Z][A-Z0-9]{1,9})\)\s*</h", re.I)
ALT_LINK = re.compile(r'href="/courses/([A-Za-z0-9_-]+)\.html"', re.I)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "ucsd-tier-list-fetch/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def parse_courses_from_body(body: str, dept_code: str) -> list[dict]:
    lines = [ln.strip() for ln in body.splitlines()]
    courses: list[dict] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = COURSE_HEAD.match(line)
        if m:
            prefix, num, title, _units = m.groups()
            if prefix.upper() != dept_code.upper():
                i += 1
                continue
            num_norm = num.lstrip("0") or "0"
            code = f"{prefix.upper()} {num_norm}"
            if num != num_norm and num.startswith("0") and len(num) <= 2:
                code = f"{prefix.upper()} {num}"
            course_id = f"{prefix.upper()}-{num.upper()}"
            courses.append(
                {
                    "id": course_id,
                    "code": code,
                    "title": title.strip(),
                    "dept": prefix.upper(),
                }
            )
        i += 1
    return courses


def parse_dept_page(html: str, slug: str) -> tuple[str, str, list[dict]]:
    title_m = TITLE_RE.search(html)
    if title_m:
        name, code = title_m.group(1).strip(), title_m.group(2).upper()
    else:
        name, code = slug.replace("-", " ").title(), slug.upper()

    if "## Courses" in html:
        body = html.split("## Courses", 1)[1]
    elif "<h2>Courses</h2>" in html.lower():
        body = re.split(r"<h2>\s*Courses\s*</h2>", html, flags=re.I)[1]
    else:
        body = html

    body = strip_html(body) if "<p>" in body[:500] else body
    if "<" in body:
        body = re.sub(r"<script[\s\S]*?</script>", "", body, flags=re.I)
        body = re.sub(r"<style[\s\S]*?</style>", "", body, flags=re.I)
        paras = re.findall(r"<p[^>]*>([\s\S]*?)</p>", body, flags=re.I)
        text_lines: list[str] = []
        for p in paras:
            t = strip_html(p)
            if t:
                text_lines.append(t)
        body = "\n".join(text_lines)
    else:
        body = strip_html(body)

    courses = parse_courses_from_body(body, code)
    if not courses:
        courses = parse_courses_from_body(html, code)
    return name, code, courses


def parse_index(html: str) -> list[dict]:
    seen: set[str] = set()
    depts: list[dict] = []
    for m in LINK_RE.finditer(html):
        slug = m.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        name = slug.replace("-", " ").title()
        start = max(0, m.start() - 400)
        chunk = html[start : m.start()]
        nm = NAME_BEFORE_LINK.search(chunk + "<span class=\"courseFacLink\">[ courses")
        if nm:
            name = strip_html(nm.group(1))
        depts.append(
            {
                "slug": slug,
                "name": name,
                "url": f"https://catalog.ucsd.edu/courses/{slug}.html",
            }
        )
    if len(depts) < 10:
        for m in ALT_LINK.finditer(html):
            slug = m.group(1)
            if slug in seen:
                continue
            seen.add(slug)
            depts.append({"slug": slug, "url": f"https://catalog.ucsd.edu/courses/{slug}.html"})
    return sorted(depts, key=lambda d: d["slug"].lower())


def parse_local_file(path: Path) -> tuple[str, str, list[dict]]:
    html = path.read_text(encoding="utf-8")
    slug = path.stem.split("-")[0]
    return parse_dept_page(html, slug)


def emit_js(index: list[dict], by_dept: dict[str, list[dict]]) -> None:
    for entry in index:
        code = entry.get("code") or entry["slug"].upper()
        entry["code"] = code
        entry["courseCount"] = len(by_dept.get(code, []))

    index_path = ROOT / "catalog-index.js"
    all_path = ROOT / "catalog-all.js"

    index_path.write_text(
        "/** UCSD catalog departments (auto-generated). */\n"
        f"var CATALOG_INDEX = {json.dumps(index, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    all_path.write_text(
        "/** UCSD catalog courses by department prefix (auto-generated). */\n"
        f"var CATALOG_BY_DEPT = {json.dumps(by_dept, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    total = sum(len(v) for v in by_dept.values())
    print(f"Wrote {index_path.name} ({len(index)} depts), {all_path.name} ({total} courses)")


def main(argv: list[str]) -> int:
    local_only = "--local" in argv
    extra_files = [Path(a) for a in argv if a.endswith(".html")]

    by_dept: dict[str, list[dict]] = {}
    index: list[dict] = []

    if not local_only:
        print("Fetching catalog index…")
        index_html = fetch(INDEX_URL)
        index = parse_index(index_html)
        print(f"Found {len(index)} departments with course pages")

        for i, entry in enumerate(index):
            slug = entry["slug"]
            url = entry["url"]
            print(f"[{i + 1}/{len(index)}] {slug} …", flush=True)
            try:
                html = fetch(url)
                name, code, courses = parse_dept_page(html, slug)
                entry["name"] = name
                entry["code"] = code
                if courses:
                    by_dept[code] = courses
                    print(f"  {len(courses)} courses")
                else:
                    print("  (no courses parsed)")
            except Exception as e:
                print(f"  skip: {e}", file=sys.stderr)

    for path in extra_files:
        print(f"Local: {path}")
        name, code, courses = parse_local_file(path)
        if code not in by_dept or len(courses) > len(by_dept.get(code, [])):
            by_dept[code] = courses
        if not any(e.get("code") == code for e in index):
            index.append({"slug": path.stem, "name": name, "code": code, "url": ""})

    if not index:
        index = [
            {"slug": k.lower(), "name": k, "code": k, "url": "", "courseCount": len(v)}
            for k, v in sorted(by_dept.items())
        ]
    else:
        for entry in index:
            code = entry.get("code") or entry["slug"].upper()
            if code not in by_dept and entry["slug"]:
                try:
                    html = fetch(entry["url"])
                    name, code, courses = parse_dept_page(html, entry["slug"])
                    entry["name"] = name
                    entry["code"] = code
                    if courses:
                        by_dept[code] = courses
                except Exception:
                    pass

    emit_js(index, by_dept)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
