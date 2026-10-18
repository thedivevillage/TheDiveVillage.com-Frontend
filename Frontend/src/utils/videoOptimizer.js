/**
 * Video Assets Definition (HLS adaptive ladder & Cloudinary poster optimizations removed)
 * Directly references original/master media assets.
 */

// Master Source Assets (Cloudflare R2 endpoints)
export const RAW_CLOUDINARY_CLOWNFISH = '/media/TDV-Media/Background/ClownFish.mp4'
export const RAW_CLOUDINARY_BARRACUDA = '/media/TDV-Media/Background/baracuda.mp4'
export const RAW_CLOUDINARY_TURTLE = '/media/TDV-Media/Background/Turtle.mp4'
export const RAW_CLOUDINARY_NIGHT_DIVE = '/media/TDV-Media/Background/Night_Dive.mp4'

// Master Bitrate Video Assets
export const MASTER_1080P_CLOWNFISH = RAW_CLOUDINARY_CLOWNFISH
export const MASTER_1080P_BARRACUDA = RAW_CLOUDINARY_BARRACUDA
export const MASTER_1080P_TURTLE = RAW_CLOUDINARY_TURTLE
export const MASTER_1080P_NIGHT_DIVE = RAW_CLOUDINARY_NIGHT_DIVE

// Direct Stream Definitions (using direct master MP4 files)
export const STREAM_CLOWNFISH = {
  hls: RAW_CLOUDINARY_CLOWNFISH,
  fallback: RAW_CLOUDINARY_CLOWNFISH,
}

export const STREAM_BARRACUDA = {
  hls: RAW_CLOUDINARY_BARRACUDA,
  fallback: RAW_CLOUDINARY_BARRACUDA,
}

export const STREAM_TURTLE = {
  hls: RAW_CLOUDINARY_TURTLE,
  fallback: RAW_CLOUDINARY_TURTLE,
}

export const STREAM_NIGHT_DIVE = {
  hls: RAW_CLOUDINARY_NIGHT_DIVE,
  fallback: RAW_CLOUDINARY_NIGHT_DIVE,
}

export function get360PosterUrl() {
  return ''
}

// Active 360 Stream Constants
export const OPTIMIZED_CLOWNFISH_360 = RAW_CLOUDINARY_CLOWNFISH
export const OPTIMIZED_BARRACUDA_360 = RAW_CLOUDINARY_BARRACUDA
export const OPTIMIZED_TURTLE_360 = RAW_CLOUDINARY_TURTLE
export const OPTIMIZED_NIGHT_DIVE_360 = RAW_CLOUDINARY_NIGHT_DIVE

export const POSTER_CLOWNFISH_360 = ''
export const POSTER_BARRACUDA_360 = ''
export const POSTER_TURTLE_360 = ''
export const POSTER_NIGHT_DIVE_360 = ''
