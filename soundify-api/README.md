# Soundify API

Backend for [Soundify](https://ymorsi.com/soundify) — isolates vocals with Demucs, transcribes with faster-whisper, detects Shariah-noncompliant lyrics, and returns a cleaned vocals-only MP3.

Deployed on [Modal](https://modal.com) (serverless GPU). The static frontend lives in the parent repo under `new/soundify.html`.

## Pipeline

1. **POST /jobs** — upload audio (max 50MB)
2. **Demucs** (`htdemucs`) — extract vocal stem
3. **faster-whisper** — transcribe with segment timestamps
4. **Filter** — Tier-1 keyword rules + Tier-2 OpenAI classification
5. **Mute** — silence flagged ranges in vocal stem, export MP3
6. **GET /jobs/{id}** — poll status; **GET /jobs/{id}/download** — fetch result

## Prerequisites

- [Modal](https://modal.com) account
- Python 3.11+
- Modal CLI: `pip install modal` then `python3 -m modal token new`

## Secrets (Modal)

Create a Modal secret named `soundify-secrets`:

```bash
python3 -m modal secret create soundify-secrets \
  OPENAI_API_KEY=sk-... \
  OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_API_KEY` powers Tier-2 LLM filtering. Tier-1 rules still run without it.

Optional:

```bash
CORS_ORIGIN=https://your-preview.netlify.app
```

## Deploy

```bash
cd soundify-api
python3 -m modal token new    # first time only
python3 -m modal deploy modal_app.py
```

Modal prints a URL like:

```
https://<workspace>--soundify-api-fastapi-app.modal.run
```

Set that URL in the frontend config:

[`new/soundify/soundify-config.js`](../new/soundify/soundify-config.js)

```js
window.SOUNDIFY_API_URL = 'https://<workspace>--soundify-api-fastapi-app.modal.run';
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/jobs` | Upload `file` (multipart), returns `{ job_id }` |
| GET | `/jobs/{id}` | Job status, progress, result metadata |
| GET | `/jobs/{id}/download` | MP3 download when `status` is `done` |

### Job statuses

`queued` → `separating` → `transcribing` → `filtering` → `muting` → `done` | `failed`

### Result payload

```json
{
  "transcript": "full lyrics text",
  "muted_segments": [
    {
      "start": 12.4,
      "end": 15.1,
      "text": "flagged lyric line",
      "reason": "romance_love",
      "tier": "llm"
    }
  ],
  "language": "en"
}
```

## Haram filter categories

Rules live in [`app/rules/`](app/rules/):

- `profanity`
- `romance_love`
- `kufr_disbelief`
- `negative_allah_god`
- `alcohol_intoxicants`
- `other_haram_themes`

Tier-2 LLM review uses a conservative Islamic-content prompt. When unsure, segments are muted.

## Limits

- Max upload: **50MB**
- Rate limit: **5 jobs/hour per IP**
- Job TTL: **1 hour** (files deleted after expiry)
- Processing timeout: **15 minutes** per job

## Local development

Modal is required for GPU processing. To test the API shell locally without Demucs:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

For full pipeline testing, use `modal run modal_app.py` or deploy to a dev Modal workspace.

## Cost estimate

Roughly **$0.02–0.10 per song** on Modal T4 GPU plus **< $0.01** for OpenAI Tier-2 pass.

## Privacy

Uploaded audio and outputs are stored temporarily on Modal Volume, deleted after the job TTL. No long-term storage.
