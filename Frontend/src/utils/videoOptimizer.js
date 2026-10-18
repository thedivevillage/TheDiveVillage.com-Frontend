/**
 * Video Assets Definition (HLS adaptive ladder & Cloudinary poster optimizations removed)
 * Directly references original/master media assets.
 */

// Master Source Assets (Cloudflare R2 endpoints)
// Serving the 1080p stream (13MB) instead of the 4K raw master (61MB) enables instant loading on all devices
export const RAW_CLOUDINARY_CLOWNFISH = '/media/TDV-Media/Background/ClownFish_1080p.mp4'
export const RAW_CLOUDINARY_BARRACUDA = '/media/TDV-Media/Background/baracuda_1080p.mp4'
export const RAW_CLOUDINARY_TURTLE = '/media/TDV-Media/Background/Turtle.mp4'
export const RAW_CLOUDINARY_NIGHT_DIVE = '/media/TDV-Media/Background/Night_Dive.mp4'

// Master Bitrate Video Assets
export const MASTER_1080P_CLOWNFISH = '/media/TDV-Media/Background/ClownFish_1080p.mp4'
export const MASTER_1080P_BARRACUDA = '/media/TDV-Media/Background/baracuda_1080p.mp4'
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

export const POSTER_CLOWNFISH_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325557/TDV-Media/AirportToAirport/gallery1.webp'
export const POSTER_BARRACUDA_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325558/TDV-Media/AirportToAirport/travel.webp'
export const POSTER_TURTLE_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325578/TDV-Media/Extras%20for%20Gallery/posters/Hawksbill_Sea_Turtle_2_thumb.webp'
export const POSTER_NIGHT_DIVE_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325558/TDV-Media/AirportToAirport/travel.webp'
