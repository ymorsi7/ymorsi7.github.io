# Soundify deployment checklist

## 1. Deploy backend (Modal)

```bash
cd soundify-api
pip install modal

# If `modal` is not found, use python3 -m modal (or add to PATH):
# export PATH="$HOME/Library/Python/3.13/bin:$PATH"

python3 -m modal token new          # one-time: opens browser to authenticate
python3 -m modal secret create soundify-secrets OPENAI_API_KEY=sk-... OPENAI_MODEL=gpt-4o-mini
python3 -m modal deploy modal_app.py
```

Copy the deployed URL (ends with `.modal.run`).

## 2. Configure frontend

Edit [`new/soundify/soundify-config.js`](../new/soundify/soundify-config.js):

```js
window.SOUNDIFY_API_URL = 'https://YOUR-WORKSPACE--soundify-api-fastapi-app.modal.run';
```

## 3. Deploy static site (Netlify)

Push to GitHub. Netlify publishes `new/` automatically.

- Page: https://ymorsi.com/soundify
- Redirect: `/soundify` → `soundify.html` (in `_redirects`)

## 4. Smoke test

1. Open https://ymorsi.com/soundify
2. Upload a short MP3
3. Confirm progress steps advance
4. Download cleaned vocals MP3
5. Verify muted segments appear in transcript panel

## 5. Optional analytics

GoatCounter events: `soundify_upload`, `soundify_complete` (via `window.trackEvent`).
