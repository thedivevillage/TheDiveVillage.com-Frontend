/**
 * Media Ready Manager
 * Coordinates high-priority media loading (such as the 360 Hero sphere video)
 * with the application Preloader to guarantee a zero-gap, instant handoff.
 */

import {
  OPTIMIZED_CLOWNFISH_360,
  RAW_CLOUDINARY_CLOWNFISH,
  MASTER_1080P_CLOWNFISH
} from './videoOptimizer'
import { attachHlsStream } from '../hooks/useCloudinaryHls'

export const HERO_VIDEO_SRC = OPTIMIZED_CLOWNFISH_360 || RAW_CLOUDINARY_CLOWNFISH

let isHeroVideoReady = false
let isHeroWebGLReady = false
const videoListeners = new Set()
const webglListeners = new Set()
let warmHeroVideo = null
let warmHeroHlsController = null
let currentHeroSrc = null

export function setHeroVideoReady(ready = true) {
  if (isHeroVideoReady === ready) return
  isHeroVideoReady = ready
  videoListeners.forEach((callback) => {
    try {
      callback(ready)
    } catch (e) {
      console.error('Error in hero video ready listener:', e)
    }
  })
}

export function getHeroVideoReady() {
  return isHeroVideoReady
}

export function subscribeHeroVideoReady(callback) {
  videoListeners.add(callback)
  if (isHeroVideoReady) {
    callback(true)
  }
  return () => {
    videoListeners.delete(callback)
  }
}

export function setHeroWebGLReady(ready = true) {
  if (isHeroWebGLReady === ready) return
  isHeroWebGLReady = ready
  webglListeners.forEach((callback) => {
    try {
      callback(ready)
    } catch (e) {
      console.error('Error in hero WebGL ready listener:', e)
    }
  })
}

export function getHeroWebGLReady() {
  return isHeroWebGLReady
}

export function subscribeHeroWebGLReady(callback) {
  webglListeners.add(callback)
  if (isHeroWebGLReady) {
    callback(true)
  }
  return () => {
    webglListeners.delete(callback)
  }
}

export function getIsHeroFullyReady() {
  return isHeroVideoReady && isHeroWebGLReady
}

/**
 * Gets or initializes the singleton hero video DOM element.
 * Eagerly buffers the 3840x1920 stream from millisecond zero.
 */
export function getOrCreateHeroVideoElement(src = HERO_VIDEO_SRC, playbackRate = 0.5) {
  if (typeof window === 'undefined') return null

  if (warmHeroVideo && currentHeroSrc === src) {
    warmHeroVideo.playbackRate = playbackRate
    return warmHeroVideo
  }

  // If changing src, cleanup existing controller
  if (warmHeroHlsController) {
    warmHeroHlsController.destroy()
    warmHeroHlsController = null
  }

  let container = document.getElementById('hero-360-video-dom-root')
  if (!container) {
    container = document.createElement('div')
    container.id = 'hero-360-video-dom-root'
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-99999;'
    document.body.appendChild(container)
  }

  let video = warmHeroVideo
  if (!video) {
    video = document.createElement('video')
    if (src && (src.startsWith('http://') || src.startsWith('https://')) && !src.includes(window.location.host)) {
      video.crossOrigin = 'anonymous'
    }
    video.muted = true
    video.defaultMuted = true
    video.volume = 0
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.loop = true
    video.autoplay = true
    video.preload = 'auto'
    video.playbackRate = playbackRate
    video.setAttribute('fetchpriority', 'high')
    container.appendChild(video)
    warmHeroVideo = video
  }

  currentHeroSrc = src

  const evaluateReadiness = () => {
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      setHeroVideoReady(true)
    }
  }

  const handleNetworkStall = () => {
    if (video.paused && video.readyState >= 2) {
      video.play().catch(() => {})
    }
  }

  const mediaEvents = [
    'loadstart',
    'loadedmetadata',
    'loadeddata',
    'canplay',
    'canplaythrough',
    'progress',
    'playing',
    'timeupdate',
    'resize',
  ]

  mediaEvents.forEach((evt) => {
    video.addEventListener(evt, evaluateReadiness)
  })

  video.addEventListener('waiting', handleNetworkStall)
  video.addEventListener('stalled', handleNetworkStall)

  // Attach HLS stream if .m3u8, with transparent MP4 fallback
  if (src && src.includes('.m3u8')) {
    warmHeroHlsController = attachHlsStream({
      video,
      hlsUrl: src,
      mp4FallbackUrl: MASTER_1080P_CLOWNFISH,
      autoPlay: true,
      playbackRate,
      onLoaded: evaluateReadiness,
    })
  } else {
    video.src = src
    video.play().catch(() => {})
  }

  evaluateReadiness()
  return video
}

export function pauseHeroVideo() {
  if (warmHeroHlsController) {
    warmHeroHlsController.stopLoad()
  }
  if (warmHeroVideo && !warmHeroVideo.paused) {
    warmHeroVideo.pause()
  }
}

export function resumeHeroVideo(playbackRate = 0.5) {
  if (warmHeroHlsController) {
    warmHeroHlsController.startLoad()
  }
  if (warmHeroVideo) {
    warmHeroVideo.playbackRate = playbackRate
    if (warmHeroVideo.paused) {
      warmHeroVideo.play().catch(() => {})
    }
  }
}

// Start eager buffering on client boot ONLY IF starting on a sphere page (Home or About)
if (typeof window !== 'undefined') {
  const isSpherePage = window.location.pathname === '/' || window.location.pathname === '/about'
  if (isSpherePage) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => getOrCreateHeroVideoElement())
    } else {
      getOrCreateHeroVideoElement()
    }
  } else {
    // Starting on a non-sphere page (Services, Book Us, Gallery, Shop, etc.):
    // Immediately mark ready so Preloader finishes without downloading 360 video
    setHeroVideoReady(true)
    setHeroWebGLReady(true)
  }
}
