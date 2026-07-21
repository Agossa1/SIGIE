import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      // Ne génère le SW qu'en production (en dev, il peut interférer avec le proxy HMR)
      devOptions: {
        enabled: false,
      },
      workbox: {
        // Cache les assets statiques (JS, CSS, HTML, images)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache réseau-d'abord pour les appels GET aux missions et signalements
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/missions(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sigie-missions-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24h
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/reports(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sigie-reports-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24h
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'SIGIE — Système d\'Intervention',
        short_name: 'SIGIE',
        description: 'Gestion des signalements et missions d\'intervention terrain',
        theme_color: '#059669',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
