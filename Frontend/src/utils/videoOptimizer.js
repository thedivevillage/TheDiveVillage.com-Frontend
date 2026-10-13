/**
 * 360° VR Video & Media Delivery Optimizer
 *
 * Implements Quality-First Cloudinary Adaptive Bitrate (HLS) Delivery:
 * 1. 4K / 2160p Top-Tier Rendition:
 *    - ClownFish: 3840x1920 @ 18.1 Mbps (True 4K equirectangular)
 *    - Barracuda: 3840x1920 @ 18.1 Mbps (True 4K equirectangular)
 *    - Turtle: 1920x1080 @ 5.6 Mbps (Master 1080p equirectangular)
 *    - Night Dive: 1920x1080 @ 5.6 Mbps (Master 1080p equirectangular)
 *
 * 2. Adaptive Bitrate Ladder:
 *    - Seamlessly adapts downwards to 1440p, 1080p, or 720p during temporary network drops,
 *      then returns to 4K ceiling as bandwidth recovers.
 *    - Uses H.264 (avc1) for 100% universal browser compatibility (Chrome, Safari, iOS, Android, Firefox, Edge).
 *
 * 3. Pristine MP4 Fallbacks:
 *    - Unaltered master MP4 assets preserved as resilient fallback if HLS is unavailable.
 */

// Master Source Assets (Cloudflare R2 endpoints)
export const RAW_CLOUDINARY_CLOWNFISH = '/media/TDV-Media/Background/ClownFish.mp4'
export const RAW_CLOUDINARY_BARRACUDA = '/media/TDV-Media/Background/baracuda.mp4'
export const RAW_CLOUDINARY_TURTLE = '/media/TDV-Media/Background/Turtle.mp4'
export const RAW_CLOUDINARY_NIGHT_DIVE = '/media/TDV-Media/Background/Night_Dive.mp4'

// 1920x1080 Master Bitrate Video Assets
export const MASTER_1080P_CLOWNFISH = '/media/TDV-Media/Background/ClownFish_1080p.mp4'
export const MASTER_1080P_BARRACUDA = '/media/TDV-Media/Background/baracuda_1080p.mp4'
export const MASTER_1080P_TURTLE = RAW_CLOUDINARY_TURTLE
export const MASTER_1080P_NIGHT_DIVE = RAW_CLOUDINARY_NIGHT_DIVE

// Master HLS 360 VR Streams (Cloudflare R2 adaptive multi-bitrate ladder delivery)
export const HLS_4K_CLOWNFISH = '/media/TDV-Media/HLS/ClownFish/master.m3u8'
export const HLS_4K_BARRACUDA = '/media/TDV-Media/HLS/baracuda/master.m3u8'
export const HLS_4K_TURTLE = '/media/TDV-Media/HLS/Turtle/master.m3u8'
export const HLS_4K_NIGHT_DIVE = '/media/TDV-Media/HLS/Night_Dive/master.m3u8'

// Cloudflare R2 Stream Definitions (Quality-First Adaptive Bitrate with MP4 fallback)
export const STREAM_CLOWNFISH = {
  hls: HLS_4K_CLOWNFISH,
  fallback: MASTER_1080P_CLOWNFISH,
}

export const STREAM_BARRACUDA = {
  hls: HLS_4K_BARRACUDA,
  fallback: MASTER_1080P_BARRACUDA,
}

export const STREAM_TURTLE = {
  hls: HLS_4K_TURTLE,
  fallback: MASTER_1080P_TURTLE,
}

export const STREAM_NIGHT_DIVE = {
  hls: HLS_4K_NIGHT_DIVE,
  fallback: MASTER_1080P_NIGHT_DIVE,
}

/**
 * Extracts a sharp, equirectangular WebP keyframe poster for instant Three.js sphere binding.
 */
export function get360PosterUrl(url, { width = 3840, quality = 'best' } = {}) {
  if (!url || typeof url !== 'string') return ''

  if (url.startsWith('/media/')) {
    const cleanKey = url.replace(/^\/media\//, '').replace(/\.(mp4|m3u8|webm)$/i, '')
    return `https://res.cloudinary.com/qvbunv8y/video/upload/so_0,f_webp,q_auto:${quality},c_limit,w_${width}/${encodeURI(cleanKey)}.webp`
  }

  if (url.includes('res.cloudinary.com') && url.includes('/video/upload/')) {
    // Remove existing streaming profile prefix if present
    let cleanUrl = url.replace(/\/sp_[a-zA-Z0-9_]+\//, '/')
    const transform = `so_0,f_webp,q_auto:${quality},c_limit,w_${width}`
    return cleanUrl
      .replace('/video/upload/', `/video/upload/${transform}/`)
      .replace(/\.(mp4|m3u8)(\?.*)?$/i, '.webp$1')
  }

  return ''
}

// Active 360 Stream Constants
export const OPTIMIZED_CLOWNFISH_360 = STREAM_CLOWNFISH.hls
export const OPTIMIZED_BARRACUDA_360 = STREAM_BARRACUDA.hls
export const OPTIMIZED_TURTLE_360 = STREAM_TURTLE.hls
export const OPTIMIZED_NIGHT_DIVE_360 = STREAM_NIGHT_DIVE.hls

export const POSTER_CLOWNFISH_360 = get360PosterUrl(RAW_CLOUDINARY_CLOWNFISH, { width: 3840, quality: 'best' })
export const POSTER_BARRACUDA_360 = get360PosterUrl(RAW_CLOUDINARY_BARRACUDA, { width: 3840, quality: 'best' })
export const POSTER_TURTLE_360 = get360PosterUrl(RAW_CLOUDINARY_TURTLE, { width: 3840, quality: 'best' })
export const POSTER_NIGHT_DIVE_360 = get360PosterUrl(RAW_CLOUDINARY_NIGHT_DIVE, { width: 3840, quality: 'best' })
