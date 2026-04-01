// vite.config.ts — fix
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://sit.backend.nguyenbinh.info.vn',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})