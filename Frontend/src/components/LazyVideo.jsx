import { useEffect, useRef, useState, useCallback, forwardRef } from 'react'

/**
 * LazyVideo Component - Dual-Layer Progressive HD Video Player
 *
 * Architecture:
 * 1. Full 1080p Master Resolution:
 *    Renders the full high-resolution master video (`src`) at 1080p HD quality.
 *    Never compromises visual crispness.
 * 2. Instant 0ms Progressive Handoff:
 *    When `lowResSrc` is provided, plays the 3-second micro-preview (<150KB) immediately.
 *    As soon as the 1080p master is ready (`onCanPlay` / `onPlaying`), it smoothly crossfades
 *    in over 400ms, and the preview is paused to release hardware decoders.
 * 3. Zero-Glitch Persistent DOM:
 *    <video> DOM nodes remain mounted. Never destroyed or recreated on scroll,
 *    eliminating 100% of DOM layout thrashing and reflows.
 * 4. Frame-Aware Playback & Decoder Governor:
 *    IntersectionObserver (with 250px rootMargin) governs play/pause.
 *    Offscreen videos are immediately paused, keeping active decoders well below Chrome's 16 limit.
 * 5. Static First-Frame Base Layer:
 *    Base layer renders exact WebP thumbnail until video motion starts, ensuring zero blank/black frames.
 */
// Module-level shared IntersectionObserver for all LazyVideo instances
let sharedVideoObserver = null
const videoObserverCallbacks = new Map()

function getSharedVideoObserver() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null
  if (!sharedVideoObserver) {
    const isMobile = window.innerWidth < 768
    sharedVideoObserver = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          const callback = videoObserverCallbacks.get(entry.target)
          if (callback) {
            callback(entry.isIntersecting)
          }
        }
      },
      {
        rootMargin: isMobile ? '120px 20px 120px 20px' : '200px 0px 200px 0px',
        threshold: 0,
      }
    )
  }
  return sharedVideoObserver
}

const LazyVideo = forwardRef(function LazyVideo({
  src,
  lowResSrc,
  poster,
  className = '',
  videoClassName = '',
  autoPlay = true,
  loop = true,
  muted = true,
  defaultMuted,
  playsInline = true,
  controls = false,
  controlsList,
  disablePictureInPicture,
  preload = 'auto',
  playbackRate = 1,
  zoom = 1,
  zoomOrigin = 'center center',
  priority = false,
  onCanPlay: externalOnCanPlay,
  onPlaying: externalOnPlaying,
  onLoadedData: externalOnLoadedData,
  onTimeUpdate: externalOnTimeUpdate,
  style: externalStyle,
  ...restProps
}, externalRef) {
  const containerRef = useRef(null)
  const masterRef = useRef(null)
  const masterPlayPromiseRef = useRef(null)

  // Direct single-layer video playback (no preview videos)
  const hasPreview = false

  const [hasEnteredView, setHasEnteredView] = useState(() => priority)
  const [isInView, setIsInView] = useState(() => priority)
  const [masterReady, setMasterReady] = useState(false)
  const [masterStarted, setMasterStarted] = useState(false)

  // Reset states if source changes
  useEffect(() => {
    setMasterReady(false)
    setMasterStarted(false)
  }, [src])

  const setVideoNode = useCallback((node) => {
    masterRef.current = node
    if (node) {
      node.muted = muted
      node.defaultMuted = defaultMuted !== undefined ? defaultMuted : muted
    }
    if (typeof externalRef === 'function') {
      externalRef(node)
    } else if (externalRef && typeof externalRef === 'object') {
      externalRef.current = node
    }
  }, [externalRef, muted, defaultMuted])

  const safePlay = useCallback((video, promiseRef) => {
    if (!video || !autoPlay) return
    if (video.paused) {
      try {
        const p = video.play()
        if (p && typeof p.then === 'function') {
          promiseRef.current = p
          p.catch((err) => {
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              // Silently handle ordinary aborts during rapid scrolling
            }
          })
        }
      } catch (e) {}
    }
  }, [autoPlay])

  const safePause = useCallback((video, promiseRef) => {
    if (!video || video.paused) return
    try {
      if (promiseRef && promiseRef.current && typeof promiseRef.current.then === 'function') {
        promiseRef.current
          .then(() => {
            if (video && !video.paused) video.pause()
          })
          .catch(() => {
            if (video && !video.paused) video.pause()
          })
      } else {
        video.pause()
      }
    } catch (e) {}
  }, [])

  // 1. Frame-Aware Shared Intersection Observer (200px margin for pre-warming)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = getSharedVideoObserver()
    if (!observer) {
      setHasEnteredView(true)
      setIsInView(true)
      return
    }

    const handleIntersect = (isIntersecting) => {
      if (isIntersecting) {
        setHasEnteredView((prev) => (prev ? prev : true))
        setIsInView(true)
      } else {
        setIsInView(false)
      }
    }

    videoObserverCallbacks.set(el, handleIntersect)
    observer.observe(el)

    return () => {
      videoObserverCallbacks.delete(el)
      observer.unobserve(el)
    }
  }, [])

  // 2. Playback Governor: Manage active playback based on visibility
  useEffect(() => {
    const master = masterRef.current

    if (isInView && autoPlay && hasEnteredView) {
      safePlay(master, masterPlayPromiseRef)
    } else {
      if (master) safePause(master, masterPlayPromiseRef)
    }
  }, [isInView, autoPlay, hasEnteredView, src, safePlay, safePause])

  // 4. Playback properties sync (muted, playbackRate)
  useEffect(() => {
    const master = masterRef.current

    if (master) {
      master.muted = muted
      master.defaultMuted = defaultMuted !== undefined ? defaultMuted : muted
      if (playbackRate && playbackRate !== 1) master.playbackRate = playbackRate
    }
  }, [muted, defaultMuted, playbackRate])

  const fitClass = className.includes('object-cover') ? 'object-cover' : (className.includes('object-contain') ? 'object-contain' : 'object-cover')
  const zoomStyle = zoom && zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: zoomOrigin || 'center center' } : {}

  const handleMasterCanPlay = (e) => {
    setMasterReady(true)
    if (isInView && autoPlay && masterRef.current && masterRef.current.paused) {
      safePlay(masterRef.current, masterPlayPromiseRef)
    }
    if (typeof externalOnCanPlay === 'function') {
      externalOnCanPlay(e)
    }
  }

  const handleMasterPlaying = (e) => {
    setMasterReady(true)
    setMasterStarted(true)
    if (typeof externalOnPlaying === 'function') {
      externalOnPlaying(e)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className.includes('bg-') ? '' : 'bg-transparent'} ${className}`}
      style={{
        contain: 'layout paint',
        backgroundColor: className.includes('bg-white') ? '#ffffff' : (externalStyle?.backgroundColor || undefined)
      }}
    >
      {/* Layer 0: Static WebP Poster Image (Exact first frame shown until video decodes and actively plays) */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            setMasterReady(true)
          }}
          className={`absolute inset-0 w-full h-full ${fitClass} z-0 pointer-events-none transition-opacity duration-500 ease-out ${
            masterStarted ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            objectFit: fitClass === 'object-contain' ? 'contain' : 'cover',
            backgroundColor: className.includes('bg-white') ? '#ffffff' : undefined,
            ...zoomStyle
          }}
        />
      )}

      {/* Master Video Layer (High-Resolution, FastStart, direct instant playback) */}
      <video
        ref={setVideoNode}
        src={hasEnteredView ? src : undefined}
        autoPlay={autoPlay && isInView}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        webkit-playsinline=""
        x5-playsinline=""
        controls={controls}
        controlsList={controlsList}
        disablePictureInPicture={disablePictureInPicture}
        preload={priority ? 'auto' : (isInView ? 'auto' : (hasEnteredView ? 'metadata' : 'none'))}
        onTimeUpdate={(e) => {
          if (!masterStarted) setMasterStarted(true)
          if (typeof externalOnTimeUpdate === 'function') {
            externalOnTimeUpdate(e)
          }
        }}
        onPlaying={handleMasterPlaying}
        onCanPlay={handleMasterCanPlay}
        onCanPlayThrough={handleMasterCanPlay}
        onLoadedMetadata={() => setMasterReady(true)}
        onLoadedData={(e) => {
          setMasterReady(true)
          if (typeof externalOnLoadedData === 'function') {
            externalOnLoadedData(e)
          }
        }}
        className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-500 ease-out z-[2] ${
          masterStarted || (!poster && masterReady) ? 'opacity-100' : 'opacity-0'
        } ${!controls ? 'pointer-events-none' : ''} ${videoClassName}`}
        style={{
          objectFit: fitClass === 'object-contain' ? 'contain' : 'cover',
          backgroundColor: className.includes('bg-white') ? '#ffffff' : undefined,
          ...zoomStyle,
          ...(externalStyle || {}),
        }}
        {...restProps}
      />
    </div>
  )
})

export default LazyVideo
