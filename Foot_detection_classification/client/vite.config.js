// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,         // Keep your current port
    open: true,         // Automatically open in the browser
    proxy: {
      // Proxy all requests starting with /api to your Express server (localhost:4000)
      '/api': 'http://localhost:4000',
    },
  },
})
