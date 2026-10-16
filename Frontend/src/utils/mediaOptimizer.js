/**
 * Media Optimizer Utility for The Dive Village (.com)
 * Standardized across Cloudinary (Images/GLB) and Cloudflare R2 (Videos/HLS).
 * Implements Low-Quality Image Placeholders (LQIP), responsive srcset, and perceptual quality tuning.
 */

import { MEDIA_CONFIG } from '../config/mediaConfig'

/**
 * Normalizes and inserts Cloudinary transformation parameters cleanly
 * into any Cloudinary image or video URL, preserving versions (v1234) and public IDs.
 */
export function transformCloudinaryUrl(url, transformString) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url
  }

  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  const prefix = parts[0] + '/upload/'
  const suffix = parts[1]

  const segments = suffix.split('/')
  let assetPathIndex = 0
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (/^v\d+$/.test(seg) || seg.startsWith('TDV-Media') || seg.includes('.')) {
      assetPathIndex = i
      break
    }
  }

  const existingTransforms = segments.slice(0, assetPathIndex).filter(Boolean)
  const assetPath = segments.slice(assetPathIndex).join('/')

  if (existingTransforms.length > 0) {
    return `${prefix}${existingTransforms.join('/')}/${transformString}/${assetPath}`
  }

  return `${prefix}${transformString}/${assetPath}`
}

/**
 * Generates an ultra-lightweight Low Quality Image Placeholder (LQIP) URL
 * (~300 - 500 bytes) that loads in under 10ms to give an instant "fully loaded" appearance.
 */
export function getLqipUrl(url, { isVideo = false } = {}) {
  if (!url || typeof url !== 'string') return ''

  if (url.includes('res.cloudinary.com')) {
    const isVid = isVideo || url.includes('/video/upload/') || /\.(mp4|mov|webm)$/i.test(url)
    if (isVid) {
      // Cloudinary account does not have dynamic derived video-frame extraction enabled
      return ''
    }
    // 40px wide, q_auto:low, blurred image
    return transformCloudinaryUrl(url, 'w_40,q_auto:low,f_auto,e_blur:200,c_limit')
  }

  return url
}

/**
 * Generates an optimized image URL with proper responsive width, format, and compression.
 */
export function getOptimizedImageUrl(url, { width = 800, quality = 'auto:good' } = {}) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com')) return url

  if (url.includes('/image/upload/')) {
    return transformCloudinaryUrl(url, `w_${width},q_${quality},f_auto,c_limit`)
  }
  return url
}


/**
 * Generates an image URL tailored for a specific preset slot (e.g. 'thumb_sm', 'card', 'hero').
 */
export function getPresetImageUrl(url, presetKey = 'card') {
  const preset = MEDIA_CONFIG.presets[presetKey] || MEDIA_CONFIG.presets.card
  return getOptimizedImageUrl(url, preset)
}

/**
 * Generates a responsive srcset string for an array of target viewport widths.
 */
export function getResponsiveSrcSet(url, widths = [320, 640, 960, 1280, 1600]) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return ''
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ')
}

/**
 * Generates an optimized WebP poster frame from a video or image URL.
 */
export function getOptimizedVideoPoster(url, { width = 800 } = {}) {
  if (!url || typeof url !== 'string') return ''
  if (url.includes('/video/upload/') || /\.(mp4|mov|webm)$/i.test(url)) {
    // Cloudinary does not have dynamic video-frame extraction enabled on this plan
    return ''
  }
  if (!url.includes('res.cloudinary.com')) {
    return url.replace(/\.(mp4|mov|webm)$/i, '.webp')
  }

  return transformCloudinaryUrl(url, `w_${width},q_auto:good,f_auto,c_limit`)
}

/**
 * Generates an optimized video streaming URL with adaptive bitrate and optimal codec (vc_auto),
 * preserving original aspect ratio (prevents vertical/portrait videos from being stretched into landscape).
 */
export function getOptimizedVideoUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url

  return transformCloudinaryUrl(url, 'q_auto,vc_auto')
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

export function isMediaLoaded(url) {
  if (!url || typeof url !== 'string') return false
  return LOADED_MEDIA_CACHE.has(url)
}

export function clearLoadedMediaCache() {
  LOADED_MEDIA_CACHE.clear()
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
  }
}
