import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
//
// `base` matters for GitHub Pages. The site is hosted at
//   https://<user>.github.io/<repo>/
// so all assets need to load from that subpath. Change this if you rename
// the repo. (For Vercel/Netlify root deploys, set `base: '/'`.)
//
// The dev-server proxy entries that used to forward /step, /state, /reset,
// /config to the Flask backend on :5001 are gone — the simulation is now
// in-browser, so there is no backend to proxy to.
export default defineConfig({
  plugins: [react()],
  base: '/naturalselectionsim/',
  server: {
    port: 5173,
  },
})
