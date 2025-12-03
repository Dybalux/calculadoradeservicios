import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: "/calculadoradeservicios/",
  plugins: [
    react(),
    tailwindcss(),

    // 👇 2. Agregar el plugin de PWA
    VitePWA({
      // Estrategia de actualización: se actualiza automáticamente
      registerType: 'autoUpdate',

      // Habilitar en desarrollo para probar
      devOptions: {
        enabled: true
      },

      // Configuración del Manifest (el "ADN" de tu PWA)
      manifest: {
        name: 'Calculadora de Servicios',
        short_name: 'Calculadora',
        description: 'Una app para calcular presupuestos de servicios.',
        theme_color: '#1F2937', // Color de la barra de estado (modo oscuro)
        background_color: '#ffffff', // Color de fondo al iniciar
        display: 'standalone',

        // 👇 Muy importante: Coincidir con tu config 'base'
        scope: '/calculadoradeservicios/',
        start_url: '/calculadoradeservicios/',

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