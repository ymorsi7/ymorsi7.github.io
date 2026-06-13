from __future__ import annotations

import subprocess
from pathlib import Path


def separate_vocals(input_path: Path, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "python",
        "-m",
        "demucs",
        "--two-stems",
        "vocals",
        "-n",
        "htdemucs",
        "-o",
        str(output_dir),
        str(input_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Demucs failed: {result.stderr or result.stdout}")

    stem_name = input_path.stem
    vocals_path = output_dir / "htdemucs" / stem_name / "vocals.wav"
    if not vocals_path.exists():
        candidates = list(output_dir.rglob("vocals.wav"))
        if not candidates:
            raise FileNotFoundError("Vocals stem not found after separation")
        vocals_path = candidates[0]

    return vocals_path
