from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any


RULES_DIR = Path(__file__).parent / "rules"

LLM_SYSTEM_PROMPT = """You are an Islamic content reviewer for song lyrics.
Flag any lyric segment that is Shariah-noncompliant, including but not limited to:
- romantic love, lust, dating, desire, intimacy
- profanity or vulgar language
- kufr, disbelief, blasphemy, shirk, mocking Islam or prophets
- negative or disrespectful references to Allah or God
- alcohol, intoxicants, drugs, gambling, idolatry, explicit immorality

Be conservative: when unsure, flag it for muting.
Return JSON only with this shape:
{"flagged": [{"index": 0, "reason": "romance_love"}]}
Use reason codes: profanity, romance_love, kufr_disbelief, negative_allah_god, alcohol_intoxicants, other_haram_themes.
Only include segments that should be muted."""


def _load_rules() -> dict[str, dict[str, list[str]]]:
    rules: dict[str, dict[str, list[str]]] = {}
    for path in RULES_DIR.glob("*.json"):
        with path.open(encoding="utf-8") as f:
            rules[path.stem] = json.load(f)
    return rules


def _compile_patterns(rules: dict[str, dict[str, list[str]]]) -> dict[str, list[re.Pattern[str]]]:
    compiled: dict[str, list[re.Pattern[str]]] = {}
    for category, data in rules.items():
        patterns = [re.compile(p, re.IGNORECASE) for p in data.get("patterns", [])]
        compiled[category] = patterns
    return compiled


RULES = _load_rules()
COMPILED_PATTERNS = _compile_patterns(RULES)


def tier1_flag_segments(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    flagged: list[dict[str, Any]] = []

    for segment in segments:
        text = segment.get("text", "")
        lower = text.lower()
        reason = _match_tier1(lower)
        if reason:
            flagged.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": text,
                    "reason": reason,
                    "tier": "rule",
                }
            )

    return flagged


def _match_tier1(lower_text: str) -> str | None:
    for category, data in RULES.items():
        for term in data.get("terms", []):
            if term.lower() in lower_text:
                return category

        for pattern in COMPILED_PATTERNS.get(category, []):
            if pattern.search(lower_text):
                return category

    return None


def tier2_flag_segments(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key or not segments:
        return []

    try:
        from openai import OpenAI
    except ImportError:
        return []

    client = OpenAI(api_key=api_key)
    payload = [
        {"index": i, "text": seg.get("text", ""), "start": seg["start"], "end": seg["end"]}
        for i, seg in enumerate(segments)
    ]

    try:
        response = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": LLM_SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps({"segments": payload})},
            ],
        )
        content = response.choices[0].message.content or "{}"
        data = json.loads(content)
    except Exception:
        return []

    flagged: list[dict[str, Any]] = []
    for item in data.get("flagged", []):
        index = item.get("index")
        if index is None or index < 0 or index >= len(segments):
            continue
        seg = segments[index]
        flagged.append(
            {
                "start": seg["start"],
                "end": seg["end"],
                "text": seg.get("text", ""),
                "reason": item.get("reason", "other_haram_themes"),
                "tier": "llm",
            }
        )

    return flagged


def merge_flagged_segments(*lists: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[tuple[float, float], dict[str, Any]] = {}

    for items in lists:
        for item in items:
            key = (round(item["start"], 2), round(item["end"], 2))
            if key not in merged:
                merged[key] = item
            elif merged[key]["tier"] == "rule" and item["tier"] == "llm":
                merged[key] = item

    return sorted(merged.values(), key=lambda x: x["start"])


def detect_haram_segments(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    tier1 = tier1_flag_segments(segments)
    tier2 = tier2_flag_segments(segments)
    return merge_flagged_segments(tier1, tier2)
