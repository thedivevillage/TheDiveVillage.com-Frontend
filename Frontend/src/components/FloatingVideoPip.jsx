import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * FloatingVideoPip - Pure Picture-in-Picture floating video player
 * Strictly no text overlays, controls, scrubber, or icons - just the pristine video stream.
 * Features instant 0ms progressive preview playback with seamless background HD handoff.
 */
export default function FloatingVideoPip({
  videoSrc,
  fallbackSrc,
  poster,
  onClose,
}) {
  const videoRef = useRef(null)
  const activeSrc = videoSrc || fallbackSrc
  const [isPlaying, setIsPlaying] = useState(false)

  // Reset & play when source changes
  useEffect(() => {
    setIsPlaying(false)
    const video = videoRef.current
    if (!video || !activeSrc) return

    video.muted = true
    video.defaultMuted = true
    video.volume = 0

    if (video.readyState >= 2) {
      setIsPlaying(true)
    }

    const p = video.play()
    if (p !== undefined) {
      p.then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [activeSrc])

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
        onTap={() => onClose?.()}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[calc(100vw-32px)] max-w-[320px] xs:max-w-[340px] sm:w-[360px] aspect-video rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(255,205,0,0.2)] border-2 border-[#FFCD00] overflow-hidden bg-black select-none cursor-grab active:cursor-grabbing group"
        title="Tap to close"
      >
        {/* Layer 0: Poster fallback image while buffering */}
        {poster && (
          <img
            src={poster}
            alt=""
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

        {/* Subtle close button in corner on hover; or tap/click pip directly to close */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white transition-opacity duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
          title="Close"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
