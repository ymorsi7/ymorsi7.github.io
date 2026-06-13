from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any, Callable

from app.filter import detect_haram_segments
from app.mute import mute_segments
from app.separate import separate_vocals
from app.transcribe import transcribe_audio

UpdateFn = Callable[..., None]


def run_pipeline(
    work_dir: Path,
    input_path: Path,
    on_update: UpdateFn,
) -> dict[str, Any]:
    work_dir.mkdir(parents=True, exist_ok=True)

    on_update(status="separating", progress=20)
    vocals_path = separate_vocals(input_path, work_dir / "demucs")

    on_update(status="transcribing", progress=45)
    transcription = transcribe_audio(vocals_path)

    on_update(status="filtering", progress=70)
    muted_segments = detect_haram_segments(transcription["segments"])

    on_update(status="muting", progress=85)
    output_path = work_dir / "output.mp3"
    mute_segments(vocals_path, output_path, muted_segments)

    return {
        "transcript": transcription["transcript"],
        "muted_segments": muted_segments,
        "language": transcription.get("language"),
        "output_path": output_path,
    }


def cleanup_work_dir(work_dir: Path) -> None:
    if work_dir.exists():
        shutil.rmtree(work_dir, ignore_errors=True)
