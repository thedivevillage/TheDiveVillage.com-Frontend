import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MEDIA_CONFIG } from '../config/mediaConfig'
import {
  subscribeHeroVideoReady,
  getHeroVideoReady,
  subscribeHeroWebGLReady,
  getHeroWebGLReady
} from '../utils/mediaReadyManager'
import { usePageVisibility } from '../hooks/usePageVisibility'
import useNightDive from '../hooks/useNightDive'

const CLOUD_PRELOADER = 'https://media.thedivevillage.com/TDV-Media/UI/preloader.mp4'
const preloaderVideo = CLOUD_PRELOADER

function DiverAnimation({ src, fallbackSrc, className, isNightDive }) {
  const [currentSrc, setCurrentSrc] = useState(src || CLOUD_PRELOADER)
  const videoRef = useRef(null)

  useEffect(() => {
    if (src) setCurrentSrc(src)
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    const p = video.play()
    if (p !== undefined) {
      p.catch(() => {})
    }
  }, [currentSrc])

  return (
    <video
      ref={videoRef}
      src={currentSrc}
      poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
      }}
      className={`${className} pointer-events-none select-none`}
      style={{
        mixBlendMode: isNightDive ? 'screen' : 'multiply',
        filter: isNightDive
          ? 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(0, 242, 254, 0.6))'
          : 'contrast(1.4) brightness(1.12) saturate(1.05)',
      }}
    />
  )
}

export default function Preloader({ onComplete }) {
  const isNightDive = useNightDive()
  const [progress, setProgress] = useState(0)
  const isVideoReadyRef = useRef(getHeroVideoReady())
  const isWebGLReadyRef = useRef(getHeroWebGLReady())

  useEffect(() => {
    const unsubVideo = subscribeHeroVideoReady((ready) => {
      isVideoReadyRef.current = ready
    })
    const unsubWebGL = subscribeHeroWebGLReady((ready) => {
      isWebGLReadyRef.current = ready
    })
    return () => {
      unsubVideo()
      unsubWebGL()
    }
  }, [])

  useEffect(() => {
    // If the user already experienced the preloader in this session, don't block them again
    if (typeof window !== 'undefined' && sessionStorage.getItem('tdv_preloaded')) {
      if (onComplete) onComplete()
      return
    }

    const maxSafetyTimeout = 1400 // Snappy safety cap
    const baseTargetDuration = 800 // Fast, polished progress (~0.8s)
    let animationFrameId
    let completed = false
    let firstFrameTime = null
    let currentProgress = 0

    const updateProgress = (currentTime) => {
      if (firstFrameTime === null) {
        firstFrameTime = currentTime
        setProgress(0)
        animationFrameId = requestAnimationFrame(updateProgress)
        return
      }

      const elapsed = currentTime - firstFrameTime
      const isVideoLoaded = isVideoReadyRef.current
      const isFullyReady = (isVideoLoaded && (isWebGLReadyRef.current || elapsed >= 700)) || elapsed >= maxSafetyTimeout

      let targetProgress
      if (elapsed >= maxSafetyTimeout) {
        targetProgress = 100
      } else if (isFullyReady) {
        targetProgress = Math.min(100, (elapsed / baseTargetDuration) * 100)
      } else {
        targetProgress = Math.min(88, (elapsed / maxSafetyTimeout) * 88)
      }

      const maxStepPerFrame = 4.0
      currentProgress = Math.min(targetProgress, currentProgress + maxStepPerFrame)

      if (targetProgress >= 100 && (elapsed >= maxSafetyTimeout || currentProgress >= 96)) {
        currentProgress = 100
      }

      setProgress(currentProgress)

      if (currentProgress >= 100 && !completed) {
        completed = true
        try {
          sessionStorage.setItem('tdv_preloaded', 'true')
          window.dispatchEvent(new Event('tdv-unlock-audio'))
        } catch (_) {}
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 120)
        return
      }

      animationFrameId = requestAnimationFrame(updateProgress)
    }

    setProgress(0)
    animationFrameId = requestAnimationFrame(updateProgress)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [onComplete])

  const handleUnlockAudio = () => {
    try {
      if (window.__tdvGlobalAudio && typeof window.__tdvGlobalAudio.unmute === 'function') {
        window.__tdvGlobalAudio.unmute()
      }
      window.dispatchEvent(new Event('tdv-unlock-audio'))
    } catch (_) {}
  }

  return (
    <motion.div
      id="preloader-container"
      initial={{ y: 0 }}
      exit={{ y: '-100%', transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
      onClick={handleUnlockAudio}
      onTouchStart={handleUnlockAudio}
      className={`fixed inset-0 z-[99999] ${isNightDive ? 'bg-[#003865] text-white' : 'bg-white text-navy'} flex flex-col items-center justify-center p-6 select-none font-body shadow-none`}
    >
      {/* Diver Graphic / Video Animation with clean background keying */}
      <div className="w-56 sm:w-68 md:w-80 mb-6 flex items-center justify-center overflow-hidden">
        <DiverAnimation
          src={preloaderVideo}
          fallbackSrc={CLOUD_PRELOADER}
          isNightDive={isNightDive}
          className="w-full h-auto max-h-[160px] object-contain"
        />
      </div>

      {/* Progress Bar in #003865 / #FFCD00 in night dive */}
      <div className={`w-56 sm:w-72 h-2 rounded-full ${isNightDive ? 'bg-white/20' : 'bg-[#003865]/10'} overflow-hidden relative mb-3`}>
        <div
          className={`h-full ${isNightDive ? 'bg-[#FFCD00]' : 'bg-[#003865]'} rounded-full transition-all duration-100 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status & Percentage */}
      <div className={`flex items-center justify-between w-56 sm:w-72 text-[11px] font-bold ${isNightDive ? 'text-white/80' : 'text-[#003865]/80'} tracking-wider`}>
        <span className="truncate pr-2">Preparing to dive...</span>
        <span className={`shrink-0 ${isNightDive ? 'text-[#FFCD00]' : 'text-[#003865]'} font-bold`}>{Math.round(progress)}%</span>
      </div>
    </motion.div>
  )
}
