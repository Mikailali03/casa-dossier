import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // This forces Vite to use the modern ESM version of Supabase
      '@supabase/supabase-js': path.resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/main/index.js'),
    },
  },
  build: {
    // This helps Vercel handle the dependency tree better
    rollupOptions: {
      external: [],
    },
  },
})