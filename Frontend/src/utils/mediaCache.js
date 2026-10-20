/**
 * Persistent Client-side Media Cache Manager
 * Uses the Web CacheStorage API (`window.caches`) to permanently store media assets
 * (images, videos, 3D GLB models, audio) in the browser across page reloads.
 *
 * Media is cached once and never deleted unless explicitly requested by the user.
 */

export const CACHE_NAME = 'tdv-media-cache-v1'

const ACTIVE_TDV_CACHES = [
  CACHE_NAME,
  'tdv-media-cloudinary-v3',
  'tdv-media-r2-v3',
  'tdv-media-local-v3',
  'tdv-media-assets-v3',
]

const LEGACY_VIDEO_CACHES = [
  'tdv-media-assets',
  'tdv-media-assets-v2',
  'tdv-media-r2',
  'tdv-media-r2-v2',
  'tdv-media-cloudinary',
  'tdv-media-cloudinary-v2',
  'tdv-media-local',
  'tdv-media-local-v2',
  'cloudinary-media-q7b4kjd9',
]

/**
 * Checks if a URL is a streaming media asset that must bypass client CacheStorage.
 */
export function isStreamingMediaUrl(url) {
  if (!url || typeof url !== 'string') return false
  const clean = url.split('?')[0].toLowerCase()
  return (
    /\.(mp4|webm|mov|m4v|m3u8|ts|m4s)$/.test(clean) ||
    clean.includes('/hls/')
  )
}

/**
 * Checks if a media asset URL is already stored in persistent CacheStorage.
 */
export async function isMediaCachedInStorage(url) {
  if (typeof window === 'undefined' || !('caches' in window) || !url) return false
  if (isStreamingMediaUrl(url)) return false
  try {
    for (const name of ACTIVE_TDV_CACHES) {
      const cache = await caches.open(name)
      const match = await cache.match(url)
      if (match) return true
    }
  } catch (err) {
    // CacheStorage might be restricted in some private modes
  }
  return false
}

/**
 * Saves a media asset response directly into the persistent cache.
 * Strictly excludes streaming media (MP4, HLS) and payloads larger than 10MB.
 */
export async function cacheMediaResponse(url, response) {
  if (typeof window === 'undefined' || !('caches' in window) || !url || !response) return
  if (isStreamingMediaUrl(url)) return

  // Prevent caching large payloads into CacheStorage
  try {
    const contentLength = response.headers?.get?.('content-length')
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      return
    }
  } catch (_) {}

  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(url, response.clone())
  } catch (err) {
    // Fail silently without blocking UI
  }
}

/**
 * Prefetches and persistently caches a media asset in the background.
 * Excludes streaming media files to avoid competing bandwidth and byte-range aborts.
 */
export async function precacheMediaAsset(url) {
  if (typeof window === 'undefined' || !('caches' in window) || !url) return
  if (isStreamingMediaUrl(url)) return
  try {
    const already = await isMediaCachedInStorage(url)
    if (already) return

    const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
    if (res && (res.status === 200 || res.status === 0)) {
      await cacheMediaResponse(url, res)
    }
  } catch (err) {
    // Ignore fetch errors during idle prefetch
  }
}

/**
 * Safely purges ONLY legacy video caches left over from previous site versions.
 * Leaves regular PWA offline caches, Google fonts, vector maps, and user storage untouched.
 */
export async function purgeLegacyVideoCaches() {
  if (typeof window === 'undefined' || !('caches' in window)) return
  try {
    const keys = await caches.keys()
    for (const key of keys) {
      if (LEGACY_VIDEO_CACHES.includes(key)) {
        await caches.delete(key)
        console.log(`[TDV-Cache] Cleaned legacy video cache store: ${key}`)
      }
    }
  } catch (err) {
    console.warn('[TDV-Cache] Legacy cache cleanup notice:', err)
  }
}

// Automatically purge old video caches on startup without touching PWA app shell
if (typeof window !== 'undefined') {
  purgeLegacyVideoCaches()
}

/**
 * Permanently clears all media caches upon explicit user request.
 */
export async function clearAllMediaCache() {
  let clearedCount = 0
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys()
      for (const key of keys) {
        if (key.includes('tdv') || key.includes('cloudinary') || key.includes('workbox')) {
          await caches.delete(key)
          clearedCount++
        }
      }
    } catch (err) {
      console.warn('[TDV Cache] Error deleting caches:', err)
    }
  }

  // Clear localStorage media tracking
  try {
    localStorage.removeItem('tdv_loaded_media_v1')
  } catch (e) {}

  console.log(`[TDV Cache] All media caches successfully cleared (${clearedCount} stores). Next load will fetch fresh assets.`)
  return true
}

// Expose on window for easy developer & user console access
if (typeof window !== 'undefined') {
  window.__tdvClearMediaCache = async () => {
    const ok = await clearAllMediaCache()
    if (ok) {
      alert('The Dive Village: Media cache has been completely cleared. Reloading page...')
      window.location.reload()
    }
  }
}
