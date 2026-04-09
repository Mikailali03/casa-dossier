import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    // This forces Vite to look for the browser-ready version of Supabase
    alias: {
      '@supabase/supabase-js': '@supabase/supabase-js/dist/main/index.js',
    },
  },
  build: {
    rollupOptions: {
      // This ensures Supabase is bundled into your app and not left out
      external: [],
    },
  },
})