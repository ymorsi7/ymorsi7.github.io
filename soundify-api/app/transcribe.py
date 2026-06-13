from __future__ import annotations

from pathlib import Path
from typing import Any


def transcribe_audio(audio_path: Path, model_size: str = "medium") -> dict[str, Any]:
    from faster_whisper import WhisperModel

    model = WhisperModel(model_size, device="cuda", compute_type="float16")
    segments_iter, info = model.transcribe(
        str(audio_path),
        word_timestamps=True,
        vad_filter=True,
    )

    segments: list[dict[str, Any]] = []
    transcript_parts: list[str] = []

    for segment in segments_iter:
        text = (segment.text or "").strip()
        if not text:
            continue

        words = []
        if segment.words:
            for word in segment.words:
                words.append(
                    {
                        "word": word.word.strip(),
                        "start": float(word.start),
                        "end": float(word.end),
                    }
                )

        segments.append(
            {
                "text": text,
                "start": float(segment.start),
                "end": float(segment.end),
                "words": words,
            }
        )
        transcript_parts.append(text)

    return {
        "language": getattr(info, "language", None),
        "transcript": " ".join(transcript_parts).strip(),
        "segments": segments,
    }
