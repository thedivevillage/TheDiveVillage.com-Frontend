/**
 * Media Ready Manager
 * Coordinates in-DOM 360 hero background video loading with the Preloader
 * to ensure background video is loaded before preloader finishes.
 */

import {
  RAW_CLOUDINARY_CLOWNFISH,
  MASTER_1080P_CLOWNFISH,
  RAW_CLOUDINARY_NIGHT_DIVE
} from './videoOptimizer'
import { attachHlsStream } from '../hooks/useCloudinaryHls'

export const HERO_VIDEO_SRC = RAW_CLOUDINARY_CLOWNFISH
export const NIGHT_DIVE_VIDEO_SRC = RAW_CLOUDINARY_NIGHT_DIVE

const isInitialSpherePage = typeof window !== 'undefined' 
  ? (window.location.pathname === '/' || window.location.pathname === '/about')
  : true

let isHeroVideoReady = !isInitialSpherePage
let isHeroWebGLReady = !isInitialSpherePage
let isNightDiveReady = false
let isNightDivePreloading = false
const videoListeners = new Set()
const webglListeners = new Set()
const nightDiveListeners = new Set()
let warmHeroVideo = null
let warmHeroHlsController = null
let currentHeroSrc = null
let warmNightDiveVideo = null

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

  // Requirement: After day dive has loaded, immediately preload the first 5 seconds of night dive!
  if (ready) {
    preloadNightDiveFirst5Seconds()
  }
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

  // In addition, if WebGL initial frame is presented, ensure Night Dive preloading is hot
  if (ready && isHeroVideoReady) {
    preloadNightDiveFirst5Seconds()
  }
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

export function setNightDiveReady(ready = true) {
  if (isNightDiveReady === ready) return
  isNightDiveReady = ready
  nightDiveListeners.forEach((cb) => {
    try {
      cb(ready)
    } catch (e) {
      console.error('Error in night dive ready listener:', e)
    }
  })
}

export function getNightDiveReady() {
  return isNightDiveReady
}

export function subscribeNightDiveReady(callback) {
  nightDiveListeners.add(callback)
  if (isNightDiveReady) {
    callback(true)
  }
  return () => {
    nightDiveListeners.delete(callback)
  }
}

/**
 * Preload the first 5 seconds of Night Dive video
 * Triggered automatically AFTER Day Dive has loaded.
 */
export function preloadNightDiveFirst5Seconds() {
  if (typeof window === 'undefined') return
  if (isNightDivePreloading) return
  isNightDivePreloading = true

  const src = NIGHT_DIVE_VIDEO_SRC // '/media/TDV-Media/Background/Night_Dive.mp4'

  // Step A: Range request on idle to avoid network contention with active page assets
  const idleRun = window.requestIdleCallback || ((cb) => setTimeout(cb, 3500))
  idleRun(() => {
    try {
      fetch(src, {
        headers: { range: 'bytes=0-1048576' }
      }).catch(() => {})
    } catch (e) {}
  })

  // Step B: Warm video element initialized in background to prime hardware media decoders
  let container = document.getElementById('hero-360-video-dom-root')
  if (!container) {
    container = document.createElement('div')
    container.id = 'hero-360-video-dom-root'
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-99999;'
    document.body.appendChild(container)
  }

  let video = warmNightDiveVideo || document.getElementById('night-dive-dom-video')
  if (!video) {
    video = document.createElement('video')
    video.id = 'night-dive-dom-video'
    video.muted = true
    video.defaultMuted = true
    video.volume = 0
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.loop = true
    video.autoplay = false
    video.preload = 'auto'
    container.appendChild(video)
  }

  warmNightDiveVideo = video

  const evaluateNightDiveReadiness = () => {
    if (video.readyState >= 2 && video.videoWidth > 0) {
      let bufferedEnd = 0
      if (video.buffered && video.buffered.length > 0) {
        bufferedEnd = video.buffered.end(0)
      }
      // If 4.5+ seconds buffered or video is ready to play through
      if (bufferedEnd >= 4.5 || video.readyState >= 3) {
        setNightDiveReady(true)
      }
    }
  }

  const events = ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'progress']
  events.forEach((evt) => video.addEventListener(evt, evaluateNightDiveReadiness))

  if (!video.src || !video.src.includes(src)) {
    video.src = src
    video.load()
  }

  evaluateNightDiveReadiness()
}

export function getOrCreateNightDiveVideoElement() {
  if (typeof window === 'undefined') return null
  if (!warmNightDiveVideo) {
    preloadNightDiveFirst5Seconds()
  }
  return warmNightDiveVideo
}

export function getOrCreateHeroVideoElement(src = HERO_VIDEO_SRC, playbackRate = 0.5) {
  if (typeof window === 'undefined') return null

  if (warmHeroVideo && currentHeroSrc === src) {
    warmHeroVideo.playbackRate = playbackRate
    return warmHeroVideo
  }

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

  let video = warmHeroVideo || document.getElementById('hero-360-dom-video')
  if (!video) {
    video = document.createElement('video')
    video.id = 'hero-360-dom-video'
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
    container.appendChild(video)
  }

  warmHeroVideo = video
  currentHeroSrc = src

  const evaluateReadiness = () => {
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      setHeroVideoReady(true)
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
    if (!video.src || !video.src.includes(src)) {
      video.src = src
    }
    video.playbackRate = playbackRate
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

// Start eager buffering on client boot if on a sphere page
if (typeof window !== 'undefined') {
  const isSpherePage = window.location.pathname === '/' || window.location.pathname === '/about'
  if (isSpherePage) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => getOrCreateHeroVideoElement())
    } else {
      getOrCreateHeroVideoElement()
    }
  } else {
    setHeroVideoReady(true)
    setHeroWebGLReady(true)
  }
}

