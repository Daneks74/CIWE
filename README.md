# CIWE · Theodore 4000

Mobile-first front-end mockup for the CIWE smart thaw line (The Theodore 4000).
Pure static HTML/CSS/JS — no build step, no backend, fake seeded state only.

## Files
- `index.html` — markup for the dashboard and device detail views
- `styles.css` — premium dark blue/teal theme, rounded cards, progress ring
- `app.js` — seed data, state, renderers, interactions, live thaw simulation
- `package.json` — optional start script for serving as a web service

## Run locally

Any static server works. A few options:

```bash
# 1) Node (no install required)
npx --yes serve@14 -s . -l 3000

# 2) Python
python3 -m http.server 3000

# 3) npm script (uses serve under the hood)
npm start
```

Open `http://localhost:3000` and resize the browser to a phone viewport
(~390×844) or use DevTools device mode.

## Deploy on Render

### Option A — Static Site (recommended, never sleeps)
- **Build command:** *(leave empty)*
- **Publish directory:** `.`
- **Rewrite rule:** `/* → /index.html (200)` (or keep the committed `_redirects` / `render.yaml`)

A `render.yaml` blueprint is included — connect the repo and Render will
pick it up automatically. Static Sites on Render do **not** spin down with
inactivity, so this is what you want for a long-lived demo URL.

### Option B — Web Service (Node)
Only use this if you specifically need a Node runtime.
- **Environment:** Node
- **Build command:** `npm install`
- **Start command:** `npm start`

`serve` is now a real dependency (installed at build time), so cold starts
don't depend on fetching it from npm. **Note:** Render's free Web Service
tier spins down after ~15 min of inactivity — the first request after sleep
may return a brief 502/"Not Found" for 30–60s while it wakes. If you see
that, either upgrade to a paid instance or switch to Option A.

## What's in the mockup

- **Dashboard** with 4 seeded Theodore 4000 devices (Kitchen · Garage · Pantry · Test Bench)
- **Status badges**, per-device mini progress rings, current/target temps, ETA, load info
- **Device detail view** with large animated circular thaw ring, temp readouts, meat/weight, and large rounded action button (styled after the reference)
- **Local-only interactions:** Activate, Stop, Hold Safe, Resume, Reconnect, notifications toggle, bottom nav
- **Live simulation tick** that advances the currently-thawing device's progress, updates ETA, and fires a completion notification
- **Activity feed** that updates as actions are performed

No real devices, no auth, no API. All state is in-memory.
