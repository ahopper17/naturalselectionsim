# GitHub Pages Deployment Setup

## Quick Setup Steps

1. **Get your Render backend URL**
   - It should look like: `https://natural-selection-sim-xxxx.onrender.com`
   - Copy this URL

2. **Set GitHub Secret** (for automatic deployment):
   - Go to: https://github.com/ahopper17/naturalselectionsim/settings/secrets/actions
   - Click "New repository secret"
   - Name: `VITE_API_URL`
   - Value: Your Render backend URL (e.g., `https://natural-selection-sim-xxxx.onrender.com`)
   - Click "Add secret"

3. **Enable GitHub Pages**:
   - Go to: https://github.com/ahopper17/naturalselectionsim/settings/pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages` → `/ (root)`
   - Click "Save"

4. **Push your changes**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

5. **Wait for deployment**:
   - Go to: https://github.com/ahopper17/naturalselectionsim/actions
   - You should see a workflow running
   - Once it completes, your site will be live at:
     `https://ahopper17.github.io/naturalselectionsim/`

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
cd frontend
npm install
VITE_API_URL=https://your-backend.onrender.com npm run build
npx gh-pages -d dist
```

## Updating the Site

After the initial setup, just push to `main`:
- Any changes to `frontend/` will trigger automatic deployment
- The workflow will build and deploy to GitHub Pages
- Your site will update automatically (may take 1-2 minutes)

## Troubleshooting

- **404 errors**: Make sure GitHub Pages is enabled and using the `gh-pages` branch
- **API not connecting**: Check that `VITE_API_URL` secret is set correctly
- **Build fails**: Check the Actions tab for error messages
