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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    missingAssetFallbackPlugin(), 
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/assets/*.{mp4,MP4,webm,mov,MOV,mp3,wav,ogg,glb,GLB}'],
        navigateFallbackDenylist: [/^\/assets\/.*\.(mp4|webm|mov|mp3|ogg|glb)$/i],
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp4|webm|mov|mp3|ogg|glb)$/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-media-qvbunv8y',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200, 206]
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
  },
})
