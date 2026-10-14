import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  PictureInPicture2,
  Check,
  Plus,
  GripHorizontal,
  Compass,
} from 'lucide-react'

/**
 * FloatingVideoPip - Premium floating Picture-in-Picture player
 * Supports:
 *  - Floating in-page PiP widget (draggable, minimizable, closable)
 *  - Native Browser Picture-in-Picture API detachment (requestPictureInPicture)
 *  - Autoplay with safe muted policy & one-tap unmute
 *  - Dual-source CDN / R2 fallback
 *  - Direct booking toggle integration
 */
export default function FloatingVideoPip({
  videoSrc,
  fallbackSrc,
  poster,
  title = 'Campers Adventure',
  subtitle = 'Overland island exploration',
  description = 'Hit the open road in fully equipped camper vehicles with sleeping quarters and off-grid amenities.',
  isSelected = false,
  onToggleSelect,
  onClose,
}) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(videoSrc)
  const [triedFallback, setTriedFallback] = useState(false)
  const [isNativePipSupported, setIsNativePipSupported] = useState(false)
  const [isNativePipActive, setIsNativePipActive] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef(null)

  // Detect Native PiP capabilities
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const supported =
        document.pictureInPictureEnabled ||
        (videoRef.current && 'webkitSetPresentationMode' in videoRef.current)
      setIsNativePipSupported(Boolean(supported))
    }
  }, [])

  // Update src when videoSrc prop changes
  useEffect(() => {
    setCurrentSrc(videoSrc)
    setTriedFallback(false)
    setIsLoaded(false)
  }, [videoSrc])

  // Attempt video playback
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = isMuted
    video.defaultMuted = isMuted

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser blocked autoplay: keep muted and retry
          video.muted = true
          setIsMuted(true)
          video.play().catch(() => setIsPlaying(false))
        })
    }
  }, [currentSrc])

  // Listen for native PiP events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnterPip = () => setIsNativePipActive(true)
    const handleLeavePip = () => setIsNativePipActive(false)

    video.addEventListener('enterpictureinpicture', handleEnterPip)
    video.addEventListener('leavepictureinpicture', handleLeavePip)

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip)
      video.removeEventListener('leavepictureinpicture', handleLeavePip)
    }
  }, [])

  // Auto-hide overlay controls after idle
  const handleUserActivity = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3200)
  }

  const togglePlay = (e) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return

    const nextMuted = !isMuted
    video.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || !video.duration) return

    setCurrentTime(video.currentTime)
    setDuration(video.duration)
    setProgress((video.currentTime / video.duration) * 100)
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video || !video.duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    video.currentTime = newProgress * video.duration
    setProgress(newProgress * 100)
  }

  const handleVideoError = () => {
    if (!triedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setTriedFallback(true)
      setCurrentSrc(fallbackSrc)
    }
  }

  const toggleNativePip = async (e) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture()
      } else if (video.webkitSetPresentationMode) {
        const mode = isNativePipActive ? 'inline' : 'picture-in-picture'
        video.webkitSetPresentationMode(mode)
      }
    } catch (err) {
      console.warn('Native Picture-in-Picture error:', err)
    }
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <AnimatePresence>
      {/* 1. Minimized Floating Pill View */}
      {isMinimized ? (
        <motion.div
          key="pip-minimized"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          drag
          dragMomentum={false}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex items-center gap-2.5 bg-[#001428]/95 backdrop-blur-xl border border-[#FFCD00]/50 rounded-full px-3.5 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,205,0,0.2)] cursor-grab active:cursor-grabbing text-white select-none"
        >
          {/* Pulsing Camper Icon */}
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#FFCD00]/60 shrink-0 bg-black/40">
            {poster ? (
              <img src={poster} alt="Campers" className="w-full h-full object-cover" />
            ) : (
              <Compass className="w-4 h-4 m-auto text-[#FFCD00]" />
            )}
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black animate-pulse" />
          </div>

          <div className="flex flex-col pr-1">
            <span className="text-xs font-heading font-bold text-white leading-none">
              {title}
            </span>
            <span className="text-[10px] text-[#FFCD00] font-medium leading-tight">
              PiP Active
            </span>
          </div>

          {/* Quick Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-1 rounded-full hover:bg-white/15 text-white transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Maximize Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full hover:bg-white/15 text-[#FFCD00] transition cursor-pointer"
            title="Expand PiP Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer"
            title="Close PiP"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ) : (
        /* 2. Full Floating Picture-in-Picture Card */
        <motion.div
          key="pip-expanded"
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          drag
          dragMomentum={false}
          onMouseMove={handleUserActivity}
          onTouchStart={handleUserActivity}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[calc(100vw-32px)] max-w-[340px] xs:max-w-[360px] sm:w-[380px] bg-[#001428]/95 backdrop-blur-2xl border border-[#FFCD00]/40 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(255,205,0,0.18)] overflow-hidden text-white flex flex-col select-none"
        >
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/30 border-b border-white/10 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-white/40" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-heading font-bold text-white tracking-wide uppercase">
                  {title}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFCD00]/20 text-[#FFCD00] border border-[#FFCD00]/30 ml-1">
                  PiP Mode
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Native PiP Detach Button */}
              {isNativePipSupported && (
                <button
                  type="button"
                  onClick={toggleNativePip}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    isNativePipActive
                      ? 'bg-[#FFCD00] text-[#001428]'
                      : 'hover:bg-white/15 text-white/80 hover:text-white'
                  }`}
                  title={isNativePipActive ? 'Exit Native PiP' : 'Detach to OS Floating Window'}
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Minimize to Pill Button */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
                title="Minimize PiP"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-red-500/30 text-white/80 hover:text-white transition cursor-pointer"
                title="Close PiP"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Container (16:9 Aspect Ratio) */}
          <div
            className="relative w-full aspect-video bg-[#000a14] overflow-hidden group cursor-pointer"
            onClick={togglePlay}
          >
            {/* Poster fallback image */}
            {poster && (
              <img
                src={poster}
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none z-0 ${
                  isLoaded && isPlaying ? 'opacity-0' : 'opacity-100'
                }`}
              />
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentSrc}
              poster={poster || undefined}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              webkit-playsinline=""
              preload="auto"
              onLoadedData={() => setIsLoaded(true)}
              onCanPlay={() => setIsLoaded(true)}
              onTimeUpdate={handleTimeUpdate}
              onError={handleVideoError}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Subtle Gradient Shade for Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none z-20" />

            {/* Center Big Play Icon when Paused */}
            {!isPlaying && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <div className="w-12 h-12 rounded-full bg-[#FFCD00] text-[#001428] flex items-center justify-center shadow-lg transform transition hover:scale-110">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>
            )}

            {/* Controls Overlay (Fade in/out on hover or user gesture) */}
            <div
              className={`absolute inset-x-0 bottom-0 z-30 p-2.5 flex flex-col gap-1.5 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress Bar (Clickable scrubber) */}
              <div
                className="w-full h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#FFCD00] to-amber-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Bottom Control Buttons */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1 rounded hover:bg-white/20 text-white transition cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                      isMuted
                        ? 'bg-black/50 text-[#FFCD00] border border-[#FFCD00]/40'
                        : 'bg-[#FFCD00] text-[#001428] font-bold'
                    }`}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                  </button>
                </div>

                <div className="text-[10px] font-mono text-white/80 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer Info & Booking Toggle */}
          <div className="p-3 sm:p-3.5 bg-gradient-to-b from-[#001428] to-[#000d1a] flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-heading font-bold text-white flex items-center gap-1.5 leading-tight">
                  <span>{subtitle}</span>
                </h4>
                <p className="text-[11px] text-white/70 line-clamp-2 mt-0.5 leading-snug">
                  {description}
                </p>
              </div>
            </div>

            {/* Quick Trip Selection Button */}
            {onToggleSelect && (
              <button
                type="button"
                onClick={onToggleSelect}
                className={`mt-1 w-full py-2 px-3 rounded-xl text-xs font-bold font-heading uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 shadow-sm'
                    : 'bg-[#FFCD00] text-[#001e3d] hover:bg-[#ffe066] border border-[#FFCD00] shadow-md active:scale-98'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Selected for Custom Trip</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Campers to Experience</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
