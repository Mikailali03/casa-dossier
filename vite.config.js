import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // This tells Vite 8 to properly bundle these specific libraries
    // instead of treating them as "external" dependencies
    rollupOptions: {
      external: [], 
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
})