import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import cesium from "vite-plugin-cesium";
export default defineConfig({
  plugins: [react(), cesium()],
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
