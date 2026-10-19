/**
 * Video Assets Definition (HLS adaptive ladder & Cloudinary poster optimizations removed)
 * Directly references original/master media assets.
 */

// Cloudflare R2 HLS Master Playlists (Adaptive ladders with full CORS support)
export const HLS_CLOWNFISH = 'https://media.thedivevillage.com/TDV-Media/HLS/ClownFish/master.m3u8'
export const HLS_BARRACUDA = 'https://media.thedivevillage.com/TDV-Media/HLS/baracuda/master.m3u8'
export const HLS_TURTLE = 'https://media.thedivevillage.com/TDV-Media/HLS/Turtle/master.m3u8'
export const HLS_NIGHT_DIVE = 'https://media.thedivevillage.com/TDV-Media/HLS/Night_Dive/master.m3u8'

// Master Source Assets (Cloudflare R2 endpoints)
export const RAW_CLOUDINARY_CLOWNFISH = 'https://media.thedivevillage.com/TDV-Media/Background/ClownFish_1080p.mp4'
export const RAW_CLOUDINARY_BARRACUDA = 'https://media.thedivevillage.com/TDV-Media/Background/baracuda_1080p.mp4'
export const RAW_CLOUDINARY_TURTLE = 'https://media.thedivevillage.com/TDV-Media/Background/Turtle.mp4'
export const RAW_CLOUDINARY_NIGHT_DIVE = 'https://media.thedivevillage.com/TDV-Media/Background/Night_Dive.mp4'

// Master Bitrate Video Assets
export const MASTER_1080P_CLOWNFISH = RAW_CLOUDINARY_CLOWNFISH
export const MASTER_1080P_BARRACUDA = RAW_CLOUDINARY_BARRACUDA
export const MASTER_1080P_TURTLE = RAW_CLOUDINARY_TURTLE
export const MASTER_1080P_NIGHT_DIVE = RAW_CLOUDINARY_NIGHT_DIVE

// Direct Stream Definitions (HLS with MP4 fallbacks)
export const STREAM_CLOWNFISH = {
  hls: HLS_CLOWNFISH,
  fallback: RAW_CLOUDINARY_CLOWNFISH,
}

export const STREAM_BARRACUDA = {
  hls: HLS_BARRACUDA,
  fallback: RAW_CLOUDINARY_BARRACUDA,
}

export const STREAM_TURTLE = {
  hls: HLS_TURTLE,
  fallback: RAW_CLOUDINARY_TURTLE,
}

export const STREAM_NIGHT_DIVE = {
  hls: HLS_NIGHT_DIVE,
  fallback: RAW_CLOUDINARY_NIGHT_DIVE,
}

export function get360PosterUrl() {
  return ''
}

// Active 360 Stream Constants (Cloudflare R2 HLS)
export const OPTIMIZED_CLOWNFISH_360 = HLS_CLOWNFISH
export const OPTIMIZED_BARRACUDA_360 = HLS_BARRACUDA
export const OPTIMIZED_TURTLE_360 = HLS_TURTLE
export const OPTIMIZED_NIGHT_DIVE_360 = HLS_NIGHT_DIVE

export const POSTER_CLOWNFISH_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325557/TDV-Media/AirportToAirport/gallery1.webp'
export const POSTER_BARRACUDA_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325558/TDV-Media/AirportToAirport/travel.webp'
export const POSTER_TURTLE_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325578/TDV-Media/Extras%20for%20Gallery/posters/Hawksbill_Sea_Turtle_2_thumb.webp'
export const POSTER_NIGHT_DIVE_360 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1792325558/TDV-Media/AirportToAirport/travel.webp'
