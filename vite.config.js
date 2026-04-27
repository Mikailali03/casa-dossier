import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  ssr: {
    // This forces Vite to process the Supabase library 
    noExternal: ['@supabase/supabase-js']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})