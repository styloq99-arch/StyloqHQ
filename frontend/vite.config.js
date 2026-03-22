import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/feed': 'http://127.0.0.1:5000',
      '/auth': 'http://127.0.0.1:5000',
      '/health': 'http://127.0.0.1:5000',
      '/customers': 'http://127.0.0.1:5000',
      '/messages': 'http://127.0.0.1:5000',
      '/ai': 'http://127.0.0.1:5000',
      '/barber/': 'http://127.0.0.1:5000',
      '/salon/': 'http://127.0.0.1:5000',
    },
  },
})
