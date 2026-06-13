from __future__ import annotations

import time
import uuid
from typing import Any

JOB_TTL_SECONDS = 3600
MAX_JOBS_PER_HOUR = 5

STATUSES = (
    "queued",
    "separating",
    "transcribing",
    "filtering",
    "muting",
    "done",
    "failed",
)


def new_job(filename: str) -> dict[str, Any]:
    return {
        "job_id": str(uuid.uuid4()),
        "filename": filename,
        "status": "queued",
        "progress": 5,
        "error": None,
        "result": None,
        "created_at": time.time(),
        "updated_at": time.time(),
    }


def update_job(store: dict, job_id: str, **fields: Any) -> dict[str, Any] | None:
    job = store.get(job_id)
    if not job:
        return None
    job.update(fields)
    job["updated_at"] = time.time()
    store[job_id] = job
    return job


def get_job(store: dict, job_id: str) -> dict[str, Any] | None:
    job = store.get(job_id)
    if not job:
        return None
    if job["status"] != "done" and time.time() - job["created_at"] > JOB_TTL_SECONDS:
        return None
    return job


def check_rate_limit(store: dict, ip: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    rate_key = f"rate:{ip}"
    now = time.time()
    entry = store.get(rate_key, {"count": 0, "window_start": now})

    if now - entry.get("window_start", now) >= 3600:
        entry = {"count": 0, "window_start": now}

    if entry["count"] >= MAX_JOBS_PER_HOUR:
        return False

    entry["count"] += 1
    store[rate_key] = entry
    return True


def count_recent_jobs_for_ip(store: dict, ip: str) -> int:
    """Legacy helper — prefer check_rate_limit for Modal Dict stores."""
    rate_key = f"rate:{ip}"
    entry = store.get(rate_key)
    if not entry:
        return 0
    if time.time() - entry.get("window_start", 0) >= 3600:
        return 0
    return entry.get("count", 0)


def cleanup_expired_jobs(store: dict) -> None:
    # TTL is enforced in get_job(). Modal Dict does not support efficient
    # full-store scans, so bulk cleanup is skipped.
    return
