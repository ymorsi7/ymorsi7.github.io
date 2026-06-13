from __future__ import annotations

from pathlib import Path
from typing import Any


def mute_segments(input_path: Path, output_path: Path, muted_segments: list[dict[str, Any]]) -> Path:
    from pydub import AudioSegment

    audio = AudioSegment.from_file(input_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for segment in sorted(muted_segments, key=lambda s: s["start"], reverse=True):
        start_ms = max(0, int(float(segment["start"]) * 1000))
        end_ms = min(len(audio), int(float(segment["end"]) * 1000))
        if end_ms <= start_ms:
            continue

        silence = AudioSegment.silent(duration=end_ms - start_ms)
        audio = audio[:start_ms] + silence + audio[end_ms:]

    audio.export(output_path, format="mp3", bitrate="192k")
    return output_path
