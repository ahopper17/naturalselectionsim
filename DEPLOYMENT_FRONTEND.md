# Frontend Deployment Guide

## Quick Answer: Yes, deploy the frontend the same way you've done before!

The React frontend deploys exactly like any other Vite/React app.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Connect GitHub repo** to Vercel
2. **Root Directory**: Set to `frontend/`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Environment Variables**:
   - `VITE_API_URL` = `https://your-backend.onrender.com` (your Render backend URL)
6. **Deploy** - That's it!

Vercel will auto-deploy on every push to your repo.

### Option 2: Netlify

1. **Connect GitHub repo** to Netlify
2. **Base directory**: `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `frontend/dist`
5. **Environment Variables**:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
6. **Deploy**

### Option 3: GitHub Pages

1. Update `vite.config.js` to set `base: '/your-repo-name/'`
2. Build: `npm run build`
3. Deploy `dist/` folder to `gh-pages` branch

## Environment Variables

**Important**: Set `VITE_API_URL` in your deployment platform to point to your backend:

- **Development**: Uses `http://localhost:5001` (automatic)
- **Production**: Set `VITE_API_URL=https://your-backend.onrender.com`

## Workflow

1. **Backend**: Deploy once to Render (or keep it running)
2. **Frontend**: Deploy to Vercel/Netlify (same as before!)
   - Every push to `main` = automatic deployment
   - Same workflow you're used to

## Updating the Site

Just like before:
1. Make changes
2. Commit and push to GitHub
3. Vercel/Netlify auto-deploys
4. Done!

The only difference is you also have a backend running on Render, but that only needs to be deployed once (or when you change backend code).
