import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
const preloaderVideoLocal = 'https://res.cloudinary.com/bbgt5nk7/video/upload/v1790244018/dive-village/ui-videos/preloader_mp4.mp4'
const preloaderVideo = preloaderVideoLocal
import {
  subscribeHeroVideoReady,
  getHeroVideoReady,
  subscribeHeroWebGLReady,
  getHeroWebGLReady
} from '../utils/mediaReadyManager'

import { usePageVisibility } from '../hooks/usePageVisibility'
import useNightDive from '../hooks/useNightDive'

function DiverAnimation({ src, className, isNightDive }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const isVisible = usePageVisibility()
  const isRunningRef = useRef(true)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    if (isVisible) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    let animId
    isRunningRef.current = isVisible

    const render = () => {
      if (!isRunningRef.current) return
      if (video.readyState >= 2) {
        const targetW = 320
        const aspect = (video.videoWidth && video.videoHeight) ? (video.videoHeight / video.videoWidth) : (9 / 16)
        const targetH = Math.round(targetW * aspect) || 180
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
        }
        ctx.drawImage(video, 0, 0, targetW, targetH)
        try {
          const frame = ctx.getImageData(0, 0, targetW, targetH)
          const data = frame.data
          const len = data.length
          for (let i = 0; i < len; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const minVal = Math.min(r, g, b)
            // Key out any off-white/grey video background pixels completely to transparent
            if (minVal >= 210) {
              data[i + 3] = 0
            } else if (minVal > 165) {
              const factor = (210 - minVal) / 45
              data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, factor)))
            }
            // In night dive mode: convert the diver figure to pure solid white
            if (isNightDive && data[i + 3] > 0) {
              data[i] = 255
              data[i + 1] = 255
              data[i + 2] = 255
            }
          }
          ctx.putImageData(frame, 0, 0)
        } catch (e) {
          // Fallback if canvas is tainted before crossOrigin resolves
        }
      }
      animId = requestAnimationFrame(render)
    }

    if (isVisible) {
      animId = requestAnimationFrame(render)
    }

    return () => {
      isRunningRef.current = false
      if (animId) cancelAnimationFrame(animId)
    }
  }, [src, isVisible, isNightDive])

  return (
    <>
      <video
        ref={videoRef}
        src={src || null}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className={`${className} pointer-events-none`}
        style={isNightDive ? { filter: 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))' } : undefined}
      />
    </>
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
    const maxSafetyTimeout = 1800 // Hard safety cap guaranteeing preloader finishes within 2.0s
    const baseTargetDuration = 1400 // Smooth progress duration (~1.4s)
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
      const isFullyReady = (isVideoReadyRef.current && isWebGLReadyRef.current) || elapsed >= maxSafetyTimeout

      let targetProgress
      if (elapsed >= maxSafetyTimeout) {
        targetProgress = 100
      } else if (isFullyReady) {
        // Smoothly progress to 100%
        targetProgress = Math.min(100, (elapsed / baseTargetDuration) * 100)
      } else {
        // Smoothly ease up to 90% while waiting for assets
        targetProgress = Math.min(90, (elapsed / maxSafetyTimeout) * 90)
      }

      // Smooth step: strictly start at 0 and smoothly increment without jumping to higher values
      const maxStepPerFrame = 2.5
      currentProgress = Math.min(targetProgress, currentProgress + maxStepPerFrame)

      if (targetProgress >= 100 && (elapsed >= maxSafetyTimeout || currentProgress >= 98)) {
        currentProgress = 100
      }

      setProgress(currentProgress)

      if (currentProgress >= 100 && !completed) {
        completed = true
        try {
          window.dispatchEvent(new Event('tdv-unlock-audio'))
        } catch (_) {}
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 200)
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
