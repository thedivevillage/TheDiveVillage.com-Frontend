import { useState, useEffect, useRef, useMemo } from 'react'
import {
  getLqipUrl,
  getOptimizedVideoPoster,
  getOptimizedVideoUrl,
  getOptimizedImageUrl,
  isMediaLoaded,
  markMediaLoaded
} from '../utils/mediaOptimizer'
import { usePageVisibility } from '../hooks/usePageVisibility'

export default function LazyVideo({
  src,
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
  ...props
}) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const posterImgRef = useRef(null)
  const isVisible = usePageVisibility()
  const wasPlayingBeforeHideRef = useRef(false)

  // Sharp WebP/JPG poster
  const resolvedPoster = useMemo(() => {
    if (poster) {
      return getOptimizedImageUrl(poster, { width: 800 })
    }
    return getOptimizedVideoPoster(src, { width: 800 })
  }, [poster, src])

  // Optimized video stream URL
  const optimizedVideoSrc = useMemo(() => {
    return getOptimizedVideoUrl(src)
  }, [src])

  // Check if video or poster was already loaded/cached in this session
  const isVideoCached = useMemo(() => {
    return isMediaLoaded(src) || (optimizedVideoSrc && isMediaLoaded(optimizedVideoSrc))
  }, [src, optimizedVideoSrc])

  const isPosterCached = useMemo(() => {
    return resolvedPoster ? isMediaLoaded(resolvedPoster) : false
  }, [resolvedPoster])

  const alreadyCached = isVideoCached || isPosterCached
  const [posterLoaded, setPosterLoaded] = useState(isPosterCached)
  const [hasFrame, setHasFrame] = useState(isVideoCached)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [hasEnteredView, setHasEnteredView] = useState(isVideoCached)
  const [isInView, setIsInView] = useState(false)

  // Ultra-lightweight ~400-byte Low Quality Image Placeholder
  const lqipPoster = useMemo(() => {
    if (alreadyCached) return null
    return getLqipUrl(poster || src, { isVideo: true })
  }, [poster, src, alreadyCached])


  // Reset states when src changes
  useEffect(() => {
    const cached = isMediaLoaded(src) || (optimizedVideoSrc && isMediaLoaded(optimizedVideoSrc))
    if (cached) {
      setHasFrame(true)
      setHasEnteredView(true)
    }
    if (resolvedPoster && isMediaLoaded(resolvedPoster)) {
      setPosterLoaded(true)
    }
  }, [src, optimizedVideoSrc, resolvedPoster])

  // Check if poster is in browser cache on mount
  useEffect(() => {
    if (posterImgRef.current && posterImgRef.current.complete && posterImgRef.current.naturalWidth > 0 && !posterLoaded) {
      setPosterLoaded(true)
      if (resolvedPoster) markMediaLoaded(resolvedPoster)
    }
  }, [resolvedPoster, posterLoaded])

  const autoPlayRef = useRef(autoPlay)
  useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      setHasEnteredView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            setHasEnteredView(true)
            if (videoRef.current && autoPlayRef.current && isVisible) {
              videoRef.current.play().catch(() => {})
            }
          } else {
            setIsInView(false)
            // DO NOT UNMOUNT! Only pause to save resources while preserving rendered frame & buffer in DOM
            if (videoRef.current) {
              videoRef.current.pause()
            }
          }
        })
      },
      { rootMargin: '250px 100px', threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isVisible])

  // Start video playback when in view if autoPlay is true and tab is visible
  useEffect(() => {
    const video = videoRef.current
    if (isInView && video && autoPlay && isVisible) {
      video.muted = true
      video.defaultMuted = true
      video.volume = 0
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', '')

      const attemptPlay = () => {
        const p = video.play()
        if (p !== undefined) {
          p.then(() => {
            setIsVideoPlaying(true)
            setHasFrame(true)
            markMediaLoaded(src)
            if (optimizedVideoSrc) markMediaLoaded(optimizedVideoSrc)
          }).catch(() => {})
        }
      }

      attemptPlay()
    }
  }, [isInView, autoPlay, src, optimizedVideoSrc, isVisible])

  // Pause video when tab becomes hidden; resume when visible if in view
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isVisible) {
      wasPlayingBeforeHideRef.current = !video.paused
      video.pause()
    } else {
      if (wasPlayingBeforeHideRef.current && isInView && autoPlay) {
        video.muted = true
        video.defaultMuted = true
        video.play().catch(() => {})
      }
    }
  }, [isVisible, isInView, autoPlay])

  // Ensure custom playbackRate is maintained
  useEffect(() => {
    const video = videoRef.current
    if (video && playbackRate && playbackRate !== 1) {
      video.playbackRate = playbackRate
    }
  }, [playbackRate, isInView, src])

  // Handle user gestures (touch/click/hover) to unlock playback
  const handleUserGesture = () => {
    const video = videoRef.current
    if (autoPlay && video && isInView && isVisible) {
      video.muted = true
      video.defaultMuted = true
      video.volume = 0
      if (playbackRate && playbackRate !== 1) {
        video.playbackRate = playbackRate
      }
      video.play().catch(() => {})
    }
  }

  const applyPlaybackRate = (e) => {
    const el = e?.currentTarget || videoRef.current
    if (el && playbackRate && playbackRate !== 1) {
      el.playbackRate = playbackRate
    }
  }

  const handleFrameSuccess = (el) => {
    setHasFrame(true)
    setIsVideoPlaying(true)
    markMediaLoaded(src)
    if (optimizedVideoSrc) markMediaLoaded(optimizedVideoSrc)
    applyPlaybackRate(el)
  }

  const handlePosterSuccess = () => {
    setPosterLoaded(true)
    if (resolvedPoster) markMediaLoaded(resolvedPoster)
  }

  const fitClass = className.includes('object-contain') ? 'object-contain' : 'object-cover'
  const zoomStyle = zoom && zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: 'center center' } : {}

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleUserGesture}
      onTouchStart={handleUserGesture}
      onClick={handleUserGesture}
      className={`${className.includes('absolute') ? '' : 'relative'} overflow-hidden bg-[#00172b] ${className}`}
    >
      {/* 1. Low Quality Image Placeholder: Instant 400-byte blurred frame at second 0 */}
      {lqipPoster && !alreadyCached && (
        <img
          src={lqipPoster}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full ${fitClass} filter blur-[10px] scale-110 pointer-events-none z-0`}
          style={zoomStyle}
        />
      )}

      {/* 2. Crisp WebP/JPG Poster Frame: Sits directly on top at z-[1] */}
      {resolvedPoster && (
        <img
          ref={posterImgRef}
          src={resolvedPoster}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={handlePosterSuccess}
          className={`absolute inset-0 w-full h-full ${fitClass} z-[1] pointer-events-none ${
            posterLoaded && !hasFrame && !isVideoPlaying ? 'opacity-100' : 'opacity-0'
          } ${alreadyCached ? '' : 'transition-opacity duration-300 ease-out'}`}
          style={zoomStyle}
        />
      )}

      {/* 3. HTML5 Video Element: Once mounted/cached, stays mounted forever (never destroyed on scroll) */}
      {(isInView || hasEnteredView || isVideoCached) && src && (
        <video
          ref={(el) => {
            videoRef.current = el
            if (el) {
              el.muted = true
              el.defaultMuted = true
              el.volume = 0
              el.setAttribute('muted', '')
              el.setAttribute('playsinline', '')
              el.setAttribute('webkit-playsinline', '')
              if (playbackRate && playbackRate !== 1) {
                el.playbackRate = playbackRate
              }
            }
            if (typeof props.ref === 'function') {
              props.ref(el)
            } else if (props.ref && typeof props.ref === 'object') {
              props.ref.current = el
            }
          }}
          src={optimizedVideoSrc || src}
          poster={resolvedPoster || undefined}
          autoPlay={autoPlay && isVisible && isInView}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          webkit-playsinline=""
          x5-playsinline=""
          controls={controls}
          controlsList={controlsList}
          disablePictureInPicture={disablePictureInPicture}
          preload={hasEnteredView || isVideoCached ? 'auto' : preload}
          onPlaying={(e) => {
            handleFrameSuccess(e.currentTarget)
            props.onPlaying?.(e)
          }}
          onPlay={(e) => {
            handleFrameSuccess(e.currentTarget)
            props.onPlay?.(e)
          }}
          onLoadedData={(e) => {
            handleFrameSuccess(e.currentTarget)
            props.onLoadedData?.(e)
          }}
          onLoadedMetadata={(e) => {
            handleFrameSuccess(e.currentTarget)
            props.onLoadedMetadata?.(e)
          }}
          onCanPlay={(e) => {
            handleFrameSuccess(e.currentTarget)
            props.onCanPlay?.(e)
          }}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime > 0.05) {
              handleFrameSuccess(e.currentTarget)
            }
            props.onTimeUpdate?.(e)
          }}
          onPause={(e) => {
            props.onPause?.(e)
          }}
          className={`absolute inset-0 w-full h-full ${fitClass} ${
            alreadyCached ? '' : 'transition-opacity duration-300 ease-out'
          } z-[2] ${
            hasFrame || isVideoPlaying || isVideoCached || !resolvedPoster ? 'opacity-100' : 'opacity-0'
          } ${videoClassName}`}
          style={{ objectFit: fitClass === 'object-contain' ? 'contain' : 'cover', ...zoomStyle, ...(props.style || {}) }}
          {...props}
        />
      )}
    </div>
  )
}
