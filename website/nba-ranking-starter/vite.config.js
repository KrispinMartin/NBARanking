import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 5173,   // fixed port
    strictPort: true, // if 5173 is busy, it will error instead of changing
  },
});