import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss' // <-- 1. Importa tailwindcss
import autoprefixer from 'autoprefixer'       // <-- 2. Importa autoprefixer

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  css: {
    postcss: {
      plugins: [
        tailwindcss,  // <-- 3. Pásalo como VARIABLE (sin comillas)
        autoprefixer, // <-- 4. Pásalo como VARIABLE (sin comillas)
      ],
    },
  },
})