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

### Option A — Static Site (recommended)
- **Build command:** *(leave empty)* or `echo skip`
- **Publish directory:** `.`

That's it — Render serves the three static files directly. Fastest, cheapest.

### Option B — Web Service (Node)
If you'd rather use a web service:
- **Environment:** Node
- **Build command:** `npm install`
- **Start command:** `npm start`

`npm start` launches `serve` on Render's `$PORT`.

## What's in the mockup

- **Dashboard** with 4 seeded Theodore 4000 devices (Kitchen · Garage · Pantry · Test Bench)
- **Status badges**, per-device mini progress rings, current/target temps, ETA, load info
- **Device detail view** with large animated circular thaw ring, temp readouts, meat/weight, and large rounded action button (styled after the reference)
- **Local-only interactions:** Activate, Stop, Hold Safe, Resume, Reconnect, notifications toggle, bottom nav
- **Live simulation tick** that advances the currently-thawing device's progress, updates ETA, and fires a completion notification
- **Activity feed** that updates as actions are performed

No real devices, no auth, no API. All state is in-memory.
