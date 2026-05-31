import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite-only template. Do not use this for Asymmetric-al/core Next apps;
// they use @tailwindcss/postcss through app postcss.config.js files.

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
