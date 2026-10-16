/**
 * Persistent Client-side Media Cache Manager
 * Uses the Web CacheStorage API (`window.caches`) to permanently store media assets
 * (images, videos, 3D GLB models, audio) in the browser across page reloads.
 *
 * Media is cached once and never deleted unless explicitly requested by the user.
 */

export const CACHE_NAME = 'tdv-media-cache-v1'

const ALL_TDV_CACHES = [
  CACHE_NAME,
  'tdv-media-cloudinary',
  'tdv-media-r2',
  'tdv-media-local',
  'tdv-media-assets',
  'cloudinary-media-q7b4kjd9',
]

/**
 * Checks if a media asset URL is already stored in persistent CacheStorage.
 */
export async function isMediaCachedInStorage(url) {
  if (typeof window === 'undefined' || !('caches' in window) || !url) return false
  try {
    for (const name of ALL_TDV_CACHES) {
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
 */
export async function cacheMediaResponse(url, response) {
  if (typeof window === 'undefined' || !('caches' in window) || !url || !response) return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(url, response.clone())
  } catch (err) {
    // Fail silently without blocking UI
  }
}

/**
 * Prefetches and persistently caches a media asset in the background.
 */
export async function precacheMediaAsset(url) {
  if (typeof window === 'undefined' || !('caches' in window) || !url) return
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
