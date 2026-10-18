/**
 * Media Optimizer Utility (Optimizations Removed)
 * Direct passthrough for all media URLs without transformations, LQIP, or compression parameters.
 */

export function transformCloudinaryUrl(url) {
  return url || ''
}

export function getLqipUrl() {
  return ''
}

export function getOptimizedImageUrl(url) {
  return url || ''
}

export function getPresetImageUrl(url) {
  return url || ''
}

export function getResponsiveSrcSet() {
  return ''
}

export function getOptimizedVideoPoster() {
  return ''
}

export function getOptimizedVideoUrl(url) {
  return url || ''
}

const STORAGE_KEY = 'tdv_loaded_media_v1'

function initLoadedMediaCache() {
  const set = new Set()
  if (typeof window === 'undefined') return set
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        parsed.forEach((k) => set.add(k))
      }
    }
  } catch (err) {}
  return set
}

/**
 * Global persistent cache of already loaded and decoded media URLs.
 * Stored in localStorage and memory so refreshed pages show media instantly without re-fetching or blur-up.
 */
export const LOADED_MEDIA_CACHE = initLoadedMediaCache()

let persistTimer = null
function persistLoadedMediaCache() {
  if (typeof window === 'undefined') return
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    try {
      const items = Array.from(LOADED_MEDIA_CACHE).slice(-600)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {}
  }, 1000)
}

export function markMediaLoaded(url) {
  if (url && typeof url === 'string') {
    if (!LOADED_MEDIA_CACHE.has(url)) {
      LOADED_MEDIA_CACHE.add(url)
      persistLoadedMediaCache()
    }
  }
}

export function isMediaLoaded() {
  return true
}

export function clearLoadedMediaCache() {
  LOADED_MEDIA_CACHE.clear()
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
  }
}
