import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: "/servicios/",
  plugins: [
    react(),
    tailwindcss(),

    // Agregar el plugin de PWA
    VitePWA({
      // Estrategia de actualización: se actualiza automáticamente
      registerType: 'autoUpdate',

      // Habilitar en desarrollo para probar
      devOptions: {
        enabled: true
      },

      // Configuración del Manifest (PWA)
      manifest: {
        name: 'Ahijuna Eventos',
        short_name: 'Ahijuna',
        description: 'Gestión de Ahijuna Eventos',
        theme_color: '#1F2937', // Color de la barra de estado (modo oscuro)
        background_color: '#ffffff', // Color de fondo al iniciar
        display: 'standalone',

        // Muy importante: Coincidir con tu config 'base'
        scope: '/servicios/',
        start_url: '/servicios/',

        // Iconos de la app (usa tu a.png de la carpeta public)
        icons: [
          {
            src: 'a.png', //
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'a.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})