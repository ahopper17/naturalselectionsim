# Deployment (quick reference)

The site is a static Vite/React build — no backend, no env vars. It
deploys cleanly to any static host.

GitHub Pages is the primary path; see [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md)
for the detailed walkthrough.

## Vercel

1. Connect the repo to Vercel.
2. Framework preset: **Vite** (auto-detected).
3. Root directory: repo root (no override needed).
4. Build command: `npm run build`. Output: `dist`.
5. Deploy. **Important**: set the Vite `base` in `vite.config.js` back to
   `'/'` for a Vercel root deploy — GitHub Pages needs `/naturalselectionsim/`,
   Vercel does not.

## Netlify

1. Connect the repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Same `base` caveat as Vercel — use `'/'` for Netlify.

## GitHub Pages

Set up once, then every push to `main` auto-deploys via the workflow at
`.github/workflows/deploy-frontend.yml`. See
[GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md).
