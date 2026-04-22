# GitHub Pages Deployment

The simulator now runs entirely in the browser — no backend, no secrets,
no hosting costs. You just need GitHub Pages enabled.

## One-time setup

1. **Push the repo to GitHub** (if it isn't already).
2. **Enable GitHub Pages**:
   - Go to your repo's `Settings` → `Pages`.
   - Source: `Deploy from a branch`.
   - Branch: `gh-pages` → `/ (root)`. (The branch will be created the
     first time the workflow runs.)
   - Save.
3. **Confirm the base path**:
   - `frontend/vite.config.js` has `base: '/naturalselectionsim/'`.
   - This must match your repo name. If your repo is named differently
     (e.g. `evolution-sim`), change `base` to `/evolution-sim/`.

## Deploying

Two options — pick one.

### Option A: Push to `main` (automatic)

Every push to `main` that touches `frontend/**` triggers
`.github/workflows/deploy-frontend.yml`, which builds and publishes to the
`gh-pages` branch.

```bash
git add .
git commit -m "Update simulator"
git push origin main
```

Watch progress at `https://github.com/<you>/<repo>/actions`.

### Option B: Manual deploy from your laptop

```bash
cd frontend
npm install     # only the first time, after the package.json changes
npm run deploy  # builds and pushes dist/ to the gh-pages branch
```

## Live URL

After the first successful deploy, the site is live at:

```
https://<your-github-user>.github.io/naturalselectionsim/
```

Linking it from your personal site is just an anchor tag — no API keys,
no CORS, nothing fancy.

## Troubleshooting

- **Blank page / 404 on assets**: the `base` path in `vite.config.js`
  doesn't match your repo name.
- **Workflow fails on `npm ci`**: commit `frontend/package-lock.json` so
  CI has something deterministic to install from.
- **Old version still showing**: GitHub Pages caches aggressively; a hard
  refresh (Cmd-Shift-R) usually fixes it.
