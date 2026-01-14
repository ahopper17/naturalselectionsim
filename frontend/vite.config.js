import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - change if your repo name is different
  base: '/naturalselectionsim/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/step': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/state': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/reset': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/config': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
