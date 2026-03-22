import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:5000',
      '/health': 'http://127.0.0.1:5000',
      '/customers': 'http://127.0.0.1:5000',
      // Use regex: proxy all /feed/ API paths (including /feed/create, /feed/saved, etc.)
      '^/feed/': 'http://127.0.0.1:5000',
      // Use regex: only proxy /salon/ and /barber/ API paths (with trailing slash)
      // This avoids catching frontend routes like /salon-dashboard or /barber-home
      '^/salon/': 'http://127.0.0.1:5000',
      '^/barber/': 'http://127.0.0.1:5000',
    },
  },
})
