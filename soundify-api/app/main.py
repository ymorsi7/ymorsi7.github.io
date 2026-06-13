from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Callable

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.jobs import (
    MAX_JOBS_PER_HOUR,
    check_rate_limit,
    cleanup_expired_jobs,
    get_job,
    new_job,
    update_job,
)

MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}

SpawnFn = Callable[[str, bytes, str], Any]


def create_app(
    jobs_store: dict,
    spawn_processor: SpawnFn,
    data_dir: str = "/data",
    volume_commit: Callable[[], None] | None = None,
) -> FastAPI:
    app = FastAPI(title="Soundify API", version="1.0.0")
    data_root = Path(data_dir)

    origins = [
        "https://ymorsi.com",
        "http://localhost:3000",
        "http://localhost:8888",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ]
    extra_origin = os.environ.get("CORS_ORIGIN")
    if extra_origin:
        origins.append(extra_origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"http://localhost:\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def commit() -> None:
        if volume_commit:
            volume_commit()

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/jobs")
    async def create_job(request: Request, file: UploadFile = File(...)) -> JSONResponse:
        cleanup_expired_jobs(jobs_store)

        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(jobs_store, client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")

        if not file.filename:
            raise HTTPException(status_code=400, detail="Missing filename")

        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        audio_bytes = await file.read()
        if len(audio_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 50MB)")
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty file")

        job = new_job(file.filename)
        job["client_ip"] = client_ip
        jobs_store[job["job_id"]] = job
        commit()

        spawn_processor(job["job_id"], audio_bytes, file.filename)
        return JSONResponse({"job_id": job["job_id"]})

    @app.get("/jobs/{job_id}")
    def read_job(job_id: str) -> JSONResponse:
        job = get_job(jobs_store, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        payload = {
            "job_id": job["job_id"],
            "status": job["status"],
            "progress": job.get("progress", 0),
            "error": job.get("error"),
            "result": job.get("result"),
        }
        return JSONResponse(payload)

    @app.get("/jobs/{job_id}/download")
    def download_job(job_id: str) -> FileResponse:
        job = get_job(jobs_store, job_id)
        if not job or job.get("status") != "done":
            raise HTTPException(status_code=404, detail="Processed file not ready")

        output_path = data_root / job_id / "output.mp3"
        if not output_path.exists():
            raise HTTPException(status_code=404, detail="Output file missing")

        stem = Path(job.get("filename", "soundify")).stem
        return FileResponse(
            output_path,
            media_type="audio/mpeg",
            filename=f"{stem}_soundify_vocals.mp3",
        )

    return app
