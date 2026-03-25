import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/feed': 'https://styloq-backend.onrender.com',
      '/auth': 'https://styloq-backend.onrender.com',
      '/health': 'https://styloq-backend.onrender.com',
      '/customers': 'https://styloq-backend.onrender.com',
      '/messages': 'https://styloq-backend.onrender.com',
      '/ai': 'https://styloq-backend.onrender.com',
      '/barber/': 'https://styloq-backend.onrender.com',
      '/salon/': 'https://styloq-backend.onrender.com',
    },
  },
})
