import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        secure: true
      },
      '/rest': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})