import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * FloatingVideoPip - Picture-in-Picture floating video player
 * Features instant progressive preview playback, preserved original/vertical aspect ratio,
 * larger view, and stylish close button.
 */
export default function FloatingVideoPip({
  videoSrc,
  fallbackSrc,
  poster,
  title,
  aspectRatio = 'auto',
  onClose,
}) {
  const videoRef = useRef(null)
  const activeSrc = videoSrc || fallbackSrc
  const [isPlaying, setIsPlaying] = useState(false)
  const [nativeAspect, setNativeAspect] = useState(null)

  // Reset & play when source changes
  useEffect(() => {
    setIsPlaying(false)
    setNativeAspect(null)
    const video = videoRef.current
    if (!video || !activeSrc) return

    video.muted = true
    video.defaultMuted = true
    video.volume = 0

    const updateDimensions = () => {
      if (video.videoWidth && video.videoHeight) {
        setNativeAspect({
          width: video.videoWidth,
          height: video.videoHeight,
          isVertical: video.videoHeight > video.videoWidth,
        })
      }
    }

    if (video.readyState >= 1) {
      updateDimensions()
    }

    if (video.readyState >= 2) {
      setIsPlaying(true)
    }

    const p = video.play()
    if (p !== undefined) {
      p.then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [activeSrc])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const isVertical =
    aspectRatio === 'vertical' ||
    (aspectRatio === 'auto' && nativeAspect?.isVertical) ||
    (!nativeAspect && aspectRatio === 'vertical')

  const currentRatio = nativeAspect
    ? `${nativeAspect.width} / ${nativeAspect.height}`
    : (isVertical ? '9 / 16' : '16 / 9')

  return (
    <AnimatePresence>
      <motion.div
        key="pip-pure-video"
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        drag
        dragMomentum={false}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(255,205,0,0.25)] border-2 border-[#FFCD00] overflow-hidden bg-black select-none cursor-grab active:cursor-grabbing group ${
          isVertical
            ? 'h-[60vh] sm:h-[72vh] md:h-[76vh] max-h-[640px] min-h-[380px] max-w-[calc(100vw-32px)]'
            : 'w-[calc(100vw-32px)] max-w-[440px] xs:max-w-[480px] sm:max-w-none sm:w-[520px] md:w-[600px] lg:w-[660px]'
        }`}
        style={{ aspectRatio: currentRatio }}
      >
        {/* Layer 0: Poster fallback image while buffering */}
        {poster && (
          <img
            src={poster}
            alt={title || ''}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none z-0 ${
              isPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Master Video Layer - Direct playback without preview lag */}
        {activeSrc && (
          <video
            ref={videoRef}
            src={activeSrc}
            poster={poster || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline=""
            x5-playsinline=""
            preload="auto"
            onLoadedMetadata={(e) => {
              if (e.target.videoWidth && e.target.videoHeight) {
                setNativeAspect({
                  width: e.target.videoWidth,
                  height: e.target.videoHeight,
                  isVertical: e.target.videoHeight > e.target.videoWidth,
                })
              }
            }}
            onCanPlay={() => setIsPlaying(true)}
            onPlaying={() => setIsPlaying(true)}
            onTimeUpdate={(e) => {
              if (!isPlaying && e.target.currentTime > 0) {
                setIsPlaying(true)
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-400 z-10 pointer-events-none ${
              isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Subtle gradient overlays for contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/35 pointer-events-none z-20" />

        {/* Optional title badge in top left */}
        {title && (
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-30 max-w-[calc(100%-56px)] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center gap-1.5 pointer-events-none shadow-md">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FFCD00] animate-pulse shrink-0" />
            <span className="text-[10.5px] sm:text-xs font-heading font-bold text-white tracking-wider uppercase drop-shadow truncate">
              {title}
            </span>
          </div>
        )}

        {/* Small close button in top right corner */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/75 hover:bg-black/95 text-white/90 hover:text-white border border-white/25 hover:border-[#FFCD00] backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center group/close"
          title="Close preview"
          aria-label="Close preview"
        >
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover/close:rotate-90 duration-200" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}


