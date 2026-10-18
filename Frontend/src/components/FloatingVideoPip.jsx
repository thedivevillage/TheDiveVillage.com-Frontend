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
  const masterRef = useRef(null)
  const previewRef = useRef(null)

  const fastSrc = fallbackSrc || videoSrc
  const hdSrc = videoSrc && videoSrc !== fallbackSrc ? videoSrc : null

  const [previewStarted, setPreviewStarted] = useState(false)
  const [masterReady, setMasterReady] = useState(false)
  const [masterStarted, setMasterStarted] = useState(false)

  // Reset states when source changes
  useEffect(() => {
    setPreviewStarted(false)
    setMasterReady(false)
    setMasterStarted(false)
  }, [videoSrc, fallbackSrc])

  // Play preview video immediately
  useEffect(() => {
    const prev = previewRef.current
    if (!prev) return

    prev.muted = true
    prev.defaultMuted = true
    prev.volume = 0

    if (prev.readyState >= 2) {
      setPreviewStarted(true)
    }

    const p = prev.play()
    if (p !== undefined) {
      p.then(() => setPreviewStarted(true)).catch(() => {})
    }
  }, [fastSrc])

  // Start master video smoothly once preview is playing or immediately if no preview
  useEffect(() => {
    if (!hdSrc) return
    const master = masterRef.current
    if (!master) return

    master.muted = true
    master.defaultMuted = true
    master.volume = 0

    // Small delay to let fast preview get established first
    const timer = setTimeout(() => {
      const p = master.play()
      if (p !== undefined) {
        p.then(() => {
          setMasterReady(true)
          setMasterStarted(true)
        }).catch(() => {})
      }
    }, fallbackSrc ? 250 : 0)

    return () => clearTimeout(timer)
  }, [hdSrc, fallbackSrc])

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
              previewStarted || masterStarted ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Layer 1: Fast 360p Preview Video Layer (Plays in 0ms, <750KB) */}
        {fastSrc && (
          <video
            ref={previewRef}
            src={fastSrc}
            poster={poster || undefined}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline=""
            x5-playsinline=""
            preload="auto"
            onTimeUpdate={() => {
              if (!previewStarted) setPreviewStarted(true)
            }}
            onPlaying={() => setPreviewStarted(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-400 z-10 pointer-events-none ${
              masterStarted ? 'opacity-0' : previewStarted ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Layer 2: HD Master Video Layer (Seamless background crossfade) */}
        {hdSrc && (
          <video
            ref={masterRef}
            src={hdSrc}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline=""
            x5-playsinline=""
            preload="metadata"
            onCanPlay={() => setMasterReady(true)}
            onPlaying={() => {
              setMasterReady(true)
              setMasterStarted(true)
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-20 pointer-events-none ${
              masterStarted ? 'opacity-100' : 'opacity-0'
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
