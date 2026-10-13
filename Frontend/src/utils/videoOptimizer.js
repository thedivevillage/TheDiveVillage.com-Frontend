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

// Master Source Assets (Cloudinary raw/master endpoints)
export const RAW_CLOUDINARY_CLOWNFISH = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/ClownFish.mp4'
export const RAW_CLOUDINARY_BARRACUDA = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/baracuda.mp4'
export const RAW_CLOUDINARY_TURTLE = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Turtle.mp4'
export const RAW_CLOUDINARY_NIGHT_DIVE = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Night_Dive.mp4'

// 1920x1080 Master Bitrate Video Assets (Legacy MP4 fallbacks)
export const MASTER_1080P_CLOWNFISH = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791729293/TDV-Media/Background/ClownFish_1080p.mp4'
export const MASTER_1080P_BARRACUDA = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791729341/TDV-Media/Background/baracuda_1080p.mp4'
export const MASTER_1080P_TURTLE = RAW_CLOUDINARY_TURTLE
export const MASTER_1080P_NIGHT_DIVE = RAW_CLOUDINARY_NIGHT_DIVE

// Cloudinary 4K Adaptive Bitrate HLS (.m3u8) Streams
export const HLS_4K_CLOWNFISH = 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791626590/TDV-Media/Background/ClownFish.m3u8'
export const HLS_4K_BARRACUDA = 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791627870/TDV-Media/Background/baracuda.m3u8'
export const HLS_4K_TURTLE = 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791626669/TDV-Media/Background/Turtle.m3u8'
export const HLS_4K_NIGHT_DIVE = 'https://res.cloudinary.com/qvbunv8y/video/upload/sp_4k/v1791626977/TDV-Media/Background/Night_Dive.m3u8'

// Stream Definitions bundling HLS primary URL with MP4 fallback URL
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
export function get360PosterUrl(url, { width = 1920, quality = 'best' } = {}) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return ''
  }

  // Remove existing streaming profile prefix if present
  let cleanUrl = url.replace(/\/sp_[a-zA-Z0-9_]+\//, '/')
  const transform = `so_0,f_webp,q_auto:${quality},c_limit,w_${width}`
  return cleanUrl
    .replace('/video/upload/', `/video/upload/${transform}/`)
    .replace(/\.(mp4|m3u8)(\?.*)?$/i, '.webp$1')
}

// Active 360 Stream Constants
export const OPTIMIZED_CLOWNFISH_360 = STREAM_CLOWNFISH.hls
export const OPTIMIZED_BARRACUDA_360 = STREAM_BARRACUDA.hls
export const OPTIMIZED_TURTLE_360 = STREAM_TURTLE.hls
export const OPTIMIZED_NIGHT_DIVE_360 = STREAM_NIGHT_DIVE.hls

export const POSTER_CLOWNFISH_360 = get360PosterUrl(MASTER_1080P_CLOWNFISH)
export const POSTER_BARRACUDA_360 = get360PosterUrl(MASTER_1080P_BARRACUDA)
export const POSTER_TURTLE_360 = get360PosterUrl(MASTER_1080P_TURTLE)
export const POSTER_NIGHT_DIVE_360 = get360PosterUrl(MASTER_1080P_NIGHT_DIVE)
