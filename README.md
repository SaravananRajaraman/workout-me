# Workout Me

A Push / Pull / Legs workout tracker PWA built in React + TypeScript + Vite, with optional Google Drive + Sheets sync. You choose which activity (Push, Pull, Legs or Rest) happens on each day of the week.

Implements the design in `gym-workout-tracker-pwa/project/Slam PPL App.dc.html` (a Claude Design handoff bundle) as a real, installable app.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL — the app is a single-column mobile layout, so it's easiest to view with your browser's device toolbar/responsive mode.

## Google Sign-In + Drive/Sheets sync (optional)

The app works fully offline with local storage if you skip sign-in. To enable Google sync:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create (or pick) a project.
2. Enable the **Google Drive API** and **Google Sheets API** for that project (APIs & Services → Library).
3. Configure the **OAuth consent screen** (External is fine for personal use; add yourself as a test user if it stays in "Testing" mode).
4. Create an **OAuth 2.0 Client ID** of type **Web application**.
   - Add `http://localhost:5173` **and** `https://saravananrajaraman.github.io` under **Authorized JavaScript origins** (the GitHub Pages site needs its own origin listed, not just localhost).
5. Copy `.env.example` to `.env.local` and set:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
6. Restart `npm run dev`.

Once connected, the app creates a "Workout Me Data" spreadsheet in the signed-in user's Google Drive (visible only to your app, via the `drive.file` scope) with tabs for Profile, Plan, Sessions, and Bodyweight, and keeps it in sync with local data. (A spreadsheet created by an older version under the name "Slam PPL Data" is automatically renamed and reused.)

## Deploying to GitHub Pages

This repo is set up to deploy `https://saravananrajaraman.github.io/workout-me/` automatically via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.

One-time setup on GitHub:

1. Push this repo to `github.com/SaravananRajaraman/workout-me`.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. If you want Google sync to work on the deployed site, go to **Settings → Secrets and variables → Actions** and add a repository secret named `VITE_GOOGLE_CLIENT_ID` with your OAuth client ID (the workflow reads it at build time). Without it, the deployed app still works fully offline — it just shows sign-in as unavailable.
4. Push to `main` — the workflow builds and publishes automatically. Check the **Actions** tab for progress and the deployed URL.

The Vite `base` is already hardcoded to `/workout-me/` in `vite.config.ts` to match this repo name — if you ever rename the repo, update `base` there too.

## Project structure

- `src/data/` — exercise library and PPL program data, plus the default weekly schedule.
- `src/state/store.tsx` — app state (screens, workout plan, logs, sessions, sync) as a single React context/hook.
- `src/screens/` — one component per app screen (Today, Exercise, Progress, Profile, Config, Sync, Sign-in).
- `src/lib/google/` — Google Identity Services auth + Drive/Sheets REST helpers.
- `src/lib/analytics.ts` — derives real Progress-tab stats (streak, weekly volume, PRs, bodyweight trend) from logged workout history.
- `gym-workout-tracker-pwa/` — the original Claude Design handoff bundle (reference only, not used at build time).

## Building

```bash
npm run build
```

Outputs a static PWA bundle to `dist/` (installable, works offline thanks to `vite-plugin-pwa`).
