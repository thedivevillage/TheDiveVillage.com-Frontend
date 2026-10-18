import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

function missingAssetFallbackPlugin() {
  const assetRegex = /\.(png|jpe?g|gif|svg|webp|avif|mp4|mov|mp3|mpeg|wav|ogg|webm|glb|gltf|ttf|otf|woff2?)(\?.*)?$/i

  let assetMap = new Map()

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else {
        assetMap.set(entry.name.toLowerCase(), fullPath)
      }
    }
  }

  return {
    name: 'missing-asset-fallback',
    enforce: 'pre',
    buildStart() {
      assetMap.clear()
      const assetsRoot = fileURLToPath(new URL('./src/assets', import.meta.url))
      scanDir(assetsRoot)
    },
    resolveId(source, importer) {
      if (!assetRegex.test(source)) return null

      const cleanSource = source.split('?')[0]
      const query = source.includes('?') ? source.slice(source.indexOf('?')) : ''

      if (importer && (cleanSource.startsWith('.') || cleanSource.startsWith('/') || cleanSource.startsWith('@/'))) {
        let directPath
        if (cleanSource.startsWith('@/')) {
          directPath = fileURLToPath(new URL(`./src/${cleanSource.slice(2)}`, import.meta.url))
        } else if (cleanSource.startsWith('/')) {
          directPath = fileURLToPath(new URL(`./public${cleanSource}`, import.meta.url))
        } else {
          directPath = path.resolve(path.dirname(importer), cleanSource)
        }

        if (fs.existsSync(directPath)) {
          return null
        }

        // Check if matching file exists by filename in assets
        const basename = path.basename(cleanSource).toLowerCase()
        if (assetMap.has(basename)) {
          return assetMap.get(basename) + query
        }

        // If missing completely, resolve to virtual blank asset
        return `\0virtual:blank-asset:${cleanSource}`
      }

      return null
    },
    load(id) {
      if (id.startsWith('\0virtual:blank-asset:')) {
        return 'export default "";'
      }
      return null
    }
  }
}

function firebaseMessagingPlugin() {
  return {
    name: 'firebase-messaging-sw-builder',
    generateBundle() {
      const apiKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDVj-lZlrZP7ccmP0YdfkBhddei2pj6UMU'
      const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || 'the-dive-village-ffed3.firebaseapp.com'
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'the-dive-village-ffed3'
      const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || 'the-dive-village-ffed3.firebasestorage.app'
      const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '298649884006'
      const appId = process.env.VITE_FIREBASE_APP_ID || '1:298649884006:web:b2f393b8b8fdebdf19a4a7'

      const swContent = `/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker for thedivevillage.com
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get('apiKey') || ${JSON.stringify(apiKey)},
  authDomain: params.get('authDomain') || ${JSON.stringify(authDomain)},
  projectId: params.get('projectId') || ${JSON.stringify(projectId)},
  storageBucket: params.get('storageBucket') || ${JSON.stringify(storageBucket)},
  messagingSenderId: params.get('messagingSenderId') || ${JSON.stringify(messagingSenderId)},
  appId: params.get('appId') || ${JSON.stringify(appId)},
};

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'placeholder' && firebaseConfig.projectId) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw] Received background message:', payload);
      const notificationTitle = payload.notification?.title || payload.data?.title || 'The Dive Village';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        data: payload.data || {},
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.warn('[firebase-messaging-sw] Initialization error:', err);
  }
}
`
      this.emitFile({
        type: 'asset',
        fileName: 'firebase-messaging-sw.js',
        source: swContent,
      })
    },
  }
}

function r2PagesOutputFilterPlugin() {
  return {
    name: 'r2-pages-output-filter',
    closeBundle() {
      const distDir = fileURLToPath(new URL('./dist', import.meta.url))
      if (!fs.existsSync(distDir)) return

      function filterDirectory(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            filterDirectory(fullPath)
            try {
              if (fs.readdirSync(fullPath).length === 0) {
                fs.rmdirSync(fullPath)
              }
            } catch (_) {}
          } else if (entry.isFile()) {
            const relPath = path.relative(distDir, fullPath).replace(/\\/g, '/')
            const size = fs.statSync(fullPath).size
            const ext = path.extname(entry.name).toLowerCase()
            const isVideo = ['.mp4', '.mov', '.webm'].includes(ext)
            const isPreview = entry.name.toLowerCase().includes('_preview.')

            // Exclude already-R2-hosted master videos or files >= 25 MiB from Pages static output
            const isR2MasterVideo = relPath.startsWith('media/TDV-Media/') && isVideo && !isPreview
            const exceedsPagesLimit = size >= 25 * 1024 * 1024

            if (isR2MasterVideo || exceedsPagesLimit) {
              fs.unlinkSync(fullPath)
              console.log(`🧹 [R2 Pages Output Filter] Excluded from Pages static output: ${relPath} (${(size / (1024 * 1024)).toFixed(2)} MB)`)
            }
          }
        }
      }

      filterDirectory(distDir)
    }
  }
}

import { VitePWA } from 'vite-plugin-pwa'
import { r2DevMediaPlugin } from './scripts/r2DevMiddleware.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    missingAssetFallbackPlugin(), 
    r2DevMediaPlugin(),
    firebaseMessagingPlugin(),
    r2PagesOutputFilterPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'The Dive Village',
        short_name: 'DiveVillage',
        description: 'Scuba Diving & Ocean Exploration',
        theme_color: '#001e3d',
        background_color: '#001e3d',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/firebase-messaging-sw.js'],
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/],
        runtimeCaching: [
          {
            // 1. Cloudinary Media Assets (Images, Posters, Videos)
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tdv-media-cloudinary',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 Year / Permanent
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              rangeRequests: true
            }
          },
          {
            // 2. Cloudflare R2 Media & Streaming (HLS, MP4, WebM, Posters)
            urlPattern: /^https:\/\/.*\.r2\.(?:cloudflarestorage\.com|dev)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tdv-media-r2',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 Year / Permanent
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              rangeRequests: true
            }
          },
          {
            // 3. Local Media route (/media/** - videos, audio, 3D assets)
            urlPattern: /^\/media\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tdv-media-local',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 Year / Permanent
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              rangeRequests: true
            }
          },
          {
            // 4. All static media extensions (mp4, webm, mov, mp3, ogg, wav, glb, gltf, png, jpg, webp, svg)
            urlPattern: /\.(?:mp4|webm|mov|mp3|ogg|wav|glb|gltf|png|jpe?g|webp|avif|svg)(?:\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tdv-media-assets',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 Year / Permanent
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              rangeRequests: true
            }
          },
          {
            // 5. Google Fonts & CDNs
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tdv-google-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 6. OpenFreeMap Vector Map Tiles, Sprites, and Glyphs
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tdv-map-tiles',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  assetsInclude: [
    '**/*.mp3',
    '**/*.mpeg',
    '**/*.mp4',
    '**/*.MP4',
    '**/*.mov',
    '**/*.MOV',
    '**/*.wav',
    '**/*.webm',
    '**/*.glb',
    '**/*.GLB'
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['three', 'react', 'react-dom'],
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three'
            }
            if (id.includes('maplibre-gl')) {
              return 'vendor-maps'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react'
            }
            if (id.includes('papaparse') || id.includes('canvas-confetti') || id.includes('lucide-react')) {
              return 'vendor-ui-utils'
            }
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ['**/dist/**', '**/node_modules/**']
    }
  },
})
