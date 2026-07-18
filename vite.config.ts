import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/workout-me/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? base : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png'],
      manifest: {
        name: 'Workout Me — Workout Tracker',
        short_name: 'Workout Me',
        description: 'Push / Pull / Legs workout tracker with Google sync.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf7f3',
        theme_color: '#f2543d',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,gif,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/hasaneyldrm\/exercises-dataset\/.*\.(?:jpg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-dataset-media',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
}));
