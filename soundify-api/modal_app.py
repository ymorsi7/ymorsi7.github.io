from __future__ import annotations

import modal

APP_NAME = "soundify-api"
DATA_DIR = "/data"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install(
        "fastapi[standard]==0.115.6",
        "python-multipart==0.0.20",
        "demucs==4.0.1",
        "faster-whisper==1.1.0",
        "pydub==0.25.1",
        "openai==1.58.1",
        "torch==2.5.1",
        "torchaudio==2.5.1",
    )
)

app = modal.App(APP_NAME)
jobs = modal.Dict.from_name("soundify-jobs", create_if_missing=True)
files_volume = modal.Volume.from_name("soundify-files", create_if_missing=True)

try:
    secrets = [modal.Secret.from_name("soundify-secrets")]
except modal.exception.NotFoundError:
    secrets = []


@app.function(
    image=image,
    gpu="T4",
    volumes={DATA_DIR: files_volume},
    timeout=900,
    secrets=secrets,
)
def process_job(job_id: str, audio_bytes: bytes, filename: str) -> None:
    from pathlib import Path

    from app.jobs import update_job
    from app.pipeline import cleanup_work_dir, run_pipeline

    work_dir = Path(DATA_DIR) / job_id

    def on_update(**fields: object) -> None:
        update_job(jobs, job_id, **fields)
        files_volume.commit()

    try:
        work_dir.mkdir(parents=True, exist_ok=True)
        input_path = work_dir / filename
        input_path.write_bytes(audio_bytes)
        files_volume.commit()

        result = run_pipeline(work_dir, input_path, on_update)

        update_job(
            jobs,
            job_id,
            status="done",
            progress=100,
            result={
                "transcript": result["transcript"],
                "muted_segments": result["muted_segments"],
                "language": result.get("language"),
            },
        )
        files_volume.commit()
    except Exception as exc:
        update_job(jobs, job_id, status="failed", error=str(exc), progress=0)
        files_volume.commit()
        cleanup_work_dir(work_dir)


@app.function(
    image=image,
    volumes={DATA_DIR: files_volume},
    secrets=secrets,
)
@modal.asgi_app()
def fastapi_app():
    from app.main import create_app

    return create_app(
        jobs_store=jobs,
        spawn_processor=lambda job_id, audio_bytes, filename: process_job.spawn(
            job_id, audio_bytes, filename
        ),
        data_dir=DATA_DIR,
        volume_commit=files_volume.commit,
    )
