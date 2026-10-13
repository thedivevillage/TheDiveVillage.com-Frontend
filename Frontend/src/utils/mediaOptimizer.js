/**
 * Media Optimizer Utility for The Dive Village
 * Implements Low-Quality Image Placeholder (LQIP) and progressive asset loading
 * via Cloudinary dynamic on-the-fly transformations.
 */

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
      // 40px wide, q_20, blurred frame extracted at second 2
      return transformCloudinaryUrl(url, 'so_2,w_40,q_20,f_auto,e_blur:200').replace(/\.(mp4|mov|webm)$/i, '.jpg')
    }
    // 40px wide, q_20, blurred image
    return transformCloudinaryUrl(url, 'w_40,q_20,f_auto,e_blur:200')
  }

  return url
}

/**
 * Generates an optimized image URL with proper responsive width, format, and compression.
 */
export function getOptimizedImageUrl(url, { width = 800, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com')) return url

  if (url.includes('/image/upload/')) {
    return transformCloudinaryUrl(url, `w_${width},q_${quality},f_auto`)
  }
  return url
}

/**
 * Generates an optimized WebP poster frame from a video or image URL.
 */
export function getOptimizedVideoPoster(url, { width = 800 } = {}) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com')) {
    return url.replace(/\.(mp4|mov|webm)$/i, '.webp')
  }

  return transformCloudinaryUrl(url, `so_2,w_${width},q_auto,f_auto`).replace(/\.(mp4|mov|webm)$/i, '.webp')
}

/**
 * Generates an optimized video streaming URL with adaptive bitrate/codec and capped dimensions.
 */
export function getOptimizedVideoUrl(url, { width = 720 } = {}) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url

  return transformCloudinaryUrl(url, `w_${width},q_auto,vc_auto`)
}

/**
 * Global cache of already loaded and decoded media URLs in the browser session.
 * Prevents redundant blur animations and ensures already-loaded media appears instantly.
 */
export const LOADED_MEDIA_CACHE = new Set()

export function markMediaLoaded(url) {
  if (url && typeof url === 'string') {
    LOADED_MEDIA_CACHE.add(url)
  }
}

export function isMediaLoaded(url) {
  if (!url || typeof url !== 'string') return false
  return LOADED_MEDIA_CACHE.has(url)
}

