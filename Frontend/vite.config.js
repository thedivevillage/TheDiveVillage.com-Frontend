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

import { VitePWA } from 'vite-plugin-pwa'
import { r2DevMediaPlugin } from './scripts/r2DevMiddleware.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    missingAssetFallbackPlugin(), 
    r2DevMediaPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
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
                statuses: [0, 200, 206]
              }
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
                statuses: [0, 200, 206]
              }
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
                statuses: [0, 200, 206]
              }
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
                statuses: [0, 200, 206]
              }
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
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ['**/dist/**', '**/node_modules/**']
    }
  },
})
