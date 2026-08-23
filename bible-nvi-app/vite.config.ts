import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'Verbo — Bíblia NVI Inteligente',
        short_name: 'Verbo',
        description:
          'Bíblia NVI com leitura online e offline, memorização, planos de leitura e explicações por IA.',
        theme_color: '#1c1917',
        background_color: '#1c1917',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          { src: '/icons/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Texto bíblico e metadados: cache-first, com atualização em segundo plano.
            // Uma vez que um capítulo é aberto online, fica disponível offline.
            urlPattern: ({ url }: { url: URL }) =>
              url.hostname === 'www.abibliadigital.com.br',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'bible-api-cache',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 4000,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
