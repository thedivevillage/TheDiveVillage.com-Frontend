import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { getOptimizedImageUrl } from '../utils/mediaOptimizer'
const cursorVideo = '/media/TDV-Media/UI/cursor.webm'
const rawCursorLogo = 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1791691225/TDV-Media/UI/Logo.png'
const cursorPng = getOptimizedImageUrl(rawCursorLogo, { width: 64 })
const cursorHoverPng = getOptimizedImageUrl(rawCursorLogo, { width: 64 })
import useNightDive from '../hooks/useNightDive'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const orientationRef = useRef(null)
  const videoRef = useRef(null)
  const isNightDive = useNightDive()
  const location = useLocation()
  const [isHovering, setIsHovering] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const isAuthPage = location?.pathname === '/login' || 
    location?.pathname === '/signup' || 
    location?.pathname?.startsWith('/login/') || 
    location?.pathname?.startsWith('/signup/')

  useEffect(() => {
    if (isAuthPage || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursors')
      }
      return
    }

    document.body.classList.add('hide-cursors')

    let latestX = -100
    let latestY = -100
    let lastPhysicsX = -100
    let lastPhysicsY = -100
    let lastPhysicsTime = performance.now()
    let rafId = null
    let isHidden = true
    let isHoveringInteractive = false
    let isOverNormalCursor = false
    let currentRotation = 0
    let targetRotation = 0
    let currentScaleX = 1
    let targetScaleX = 1
    let isNearStaticZoneActive = false

    const checkNormalCursor = (target) => {
      if (!target) return false
      const el = target instanceof Element ? target : target.parentElement
      if (!el || !(el instanceof Element)) return false
      return !!el.closest('input, textarea, select, [contenteditable="true"], .normal-cursor, [data-normal-cursor], form, [data-auth-container], model-viewer, .maplibregl-map, .maplibregl-canvas, .maplibregl-canvas-container, [data-dive-map]')
    }

    const checkInteractive = (target) => {
      if (!target) return false
      const el = target instanceof Element ? target : target.parentElement
      if (!el || !(el instanceof Element)) return false
      return !!el.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive], label, [data-360-toggle="clickable"], [data-gallery-close], [aria-label="Close Lightbox"]')
    }

    const checkStaticZone = (target) => {
      if (!target || typeof document === 'undefined') return false
      if (document.body.hasAttribute('data-360-dragging')) return true
      const el = target instanceof Element ? target : target.parentElement
      if (!el || !(el instanceof Element)) return false
      return !!el.closest('[data-360-toggle], .joystick-container, [data-gallery-close], [aria-label="Close Lightbox"], [data-cursor-static], #gallery-preview-close')
    }

    // 1. High-Performance Instant Tracking (Hardware Polling Rate > 60fps - 120Hz/144Hz+)
    const onPointerMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      latestX = x
      latestY = y

      // Zero-latency direct GPU translation
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      // Fast synchronous hit testing via event target (0 layout reflows)
      const overNormal = checkNormalCursor(e.target)
      if (overNormal !== isOverNormalCursor) {
        isOverNormalCursor = overNormal
        if (cursorRef.current) {
          cursorRef.current.style.opacity = overNormal ? '0' : '1'
          cursorRef.current.style.visibility = overNormal ? 'hidden' : 'visible'
        }
      }

      if (overNormal) {
        if (isHoveringInteractive) {
          isHoveringInteractive = false
          setIsHovering(false)
        }
        return
      }

      if (isHidden) {
        isHidden = false
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1'
          cursorRef.current.style.visibility = 'visible'
        }
      }

      // Fast check for 360 controller or lightbox buttons
      isNearStaticZoneActive = checkStaticZone(e.target)

      // Instant interactive hover check (buttons, links, clickables)
      const interactive = checkInteractive(e.target)
      if (interactive !== isHoveringInteractive) {
        isHoveringInteractive = interactive
        setIsHovering(interactive)
      }
    }

    // 2. High-Refresh Physics Loop (Runs smoothly at native 60Hz/120Hz/144Hz screen refresh)
    const updatePhysics = (now) => {
      const dt = Math.min((now - lastPhysicsTime) / 1000, 0.05)
      lastPhysicsTime = now

      const dx = latestX - lastPhysicsX
      const dy = latestY - lastPhysicsY
      lastPhysicsX = latestX
      lastPhysicsY = latestY

      const speed = Math.hypot(dx, dy)

      // Determine horizontal facing direction (flip on intentional horizontal swimming)
      if (isHoveringInteractive || isNearStaticZoneActive) {
        targetRotation = 0
      } else if (speed > 2.0 && Math.abs(dx) > Math.abs(dy) * 0.45) {
        targetScaleX = dx > 0 ? -1 : 1
      }

      // Smooth swimming pitch (tilts naturally up/down when diving or ascending)
      if (isHoveringInteractive || isNearStaticZoneActive) {
        targetRotation = 0
      } else if (speed > 1.5) {
        if (targetScaleX === -1) {
          targetRotation = Math.min(30, Math.max(-30, dy * 2.2))
        } else {
          targetRotation = -Math.min(30, Math.max(-30, dy * 2.2))
        }
      } else {
        targetRotation = 0
      }

      // Frame-rate independent exponential smoothing (identical physics at 60Hz, 120Hz, 144Hz, 240Hz)
      const rotLerp = 1 - Math.exp(-16 * dt)
      const scaleLerp = 1 - Math.exp(-22 * dt)
      currentRotation += (targetRotation - currentRotation) * rotLerp
      currentScaleX += (targetScaleX - currentScaleX) * scaleLerp

      if (orientationRef.current) {
        orientationRef.current.style.transform = `rotate(${currentRotation.toFixed(2)}deg) scaleX(${currentScaleX.toFixed(3)})`
      }

      rafId = requestAnimationFrame(updatePhysics)
    }

    rafId = requestAnimationFrame(updatePhysics)

    const onScroll = () => {
      if (latestX >= 0 && latestY >= 0) {
        const el = document.elementFromPoint(latestX, latestY)
        if (el) {
          const overNormal = checkNormalCursor(el)
          if (overNormal !== isOverNormalCursor) {
            isOverNormalCursor = overNormal
            if (cursorRef.current) {
              cursorRef.current.style.opacity = overNormal ? '0' : '1'
              cursorRef.current.style.visibility = overNormal ? 'hidden' : 'visible'
            }
          }
          if (!overNormal) {
            const interactive = checkInteractive(el)
            if (interactive !== isHoveringInteractive) {
              isHoveringInteractive = interactive
              setIsHovering(interactive)
            }
          }
        }
      }
    }

    const onMouseLeave = () => {
      isHidden = true
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0'
        cursorRef.current.style.visibility = 'hidden'
      }
      if (isHoveringInteractive) {
        isHoveringInteractive = false
        setIsHovering(false)
      }
    }

    const onMouseEnter = (e) => {
      isHidden = false
      const target = e?.target || (latestX >= 0 && latestY >= 0 ? document.elementFromPoint(latestX, latestY) : null)
      const overNormal = checkNormalCursor(target)
      isOverNormalCursor = overNormal
      if (cursorRef.current) {
        cursorRef.current.style.opacity = overNormal ? '0' : '1'
        cursorRef.current.style.visibility = overNormal ? 'hidden' : 'visible'
      }
    }

    const onFocusIn = (e) => {
      if (checkNormalCursor(e.target) && cursorRef.current) {
        cursorRef.current.style.opacity = '0'
        cursorRef.current.style.visibility = 'hidden'
      }
    }

    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true })
    window.addEventListener('pointerdown', onPointerMove, { capture: true, passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mouseenter', onMouseEnter)
    window.addEventListener('focusin', onFocusIn)

    const ensureVideoPlaying = () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    }

    window.addEventListener('pointerdown', ensureVideoPlaying, { passive: true })
    window.addEventListener('click', ensureVideoPlaying, { passive: true })

    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.defaultMuted = true
      videoRef.current.play().catch(() => {})
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove, { capture: true })
      window.removeEventListener('pointerdown', onPointerMove, { capture: true })
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('pointerdown', ensureVideoPlaying)
      window.removeEventListener('click', ensureVideoPlaying)
      document.body.classList.remove('hide-cursors')
    }
  }, [isAuthPage])

  // Keep video playing continuously across theme toggles and visibility changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [isNightDive])

  if (isAuthPage || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
    return null
  }

  const cursorNode = (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[99999999] will-change-transform select-none"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
        opacity: 0,
        visibility: 'hidden',
        contain: 'layout style paint',
      }}
    >
      {/* Night Dive Mode Underwater Flashlight Beam & Spotlight Aura */}
      {isNightDive && (
        <div
          className="pointer-events-none absolute rounded-full transition-all duration-300"
          style={{
            width: isHovering ? '180px' : '140px',
            height: isHovering ? '180px' : '140px',
            left: isHovering ? '-90px' : '-70px',
            top: isHovering ? '-90px' : '-70px',
            background: isHovering
              ? 'radial-gradient(circle, rgba(0, 242, 254, 0.16) 0%, rgba(255, 205, 0, 0.08) 35%, rgba(0, 56, 101, 0.03) 65%, transparent 80%)'
              : 'radial-gradient(circle, rgba(0, 242, 254, 0.10) 0%, rgba(255, 205, 0, 0.05) 30%, transparent 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(5px)',
          }}
        />
      )}

      {/* Orientation & Swimming Physics Layer (High FPS smooth rotation and flip around hotspot) */}
      <div
        ref={orientationRef}
        style={{
          transformOrigin: '0 0',
          transform: 'rotate(0deg) scaleX(1)',
          willChange: 'transform',
        }}
      >
        {/* Scuba Diver with Dynamic Luminescence and Interactive Scale */}
        <div
          className="will-change-transform transition-transform duration-150 ease-out"
          style={{
            transformOrigin: '4.6% 57.5%',
            transform: `translate(-4.6%, -57.5%) rotate(20deg) scale(${isHovering ? 1.15 : 1.0})`,
            filter: isNightDive
              ? (isHovering
                  ? 'drop-shadow(0 0 6px rgba(0, 242, 254, 0.6)) brightness(1.15) contrast(1.05)'
                  : 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.4)) brightness(1.1) contrast(1.05)')
              : (isHovering
                  ? 'drop-shadow(0 4px 12px rgba(0, 56, 101, 0.4)) brightness(1.05)'
                  : 'drop-shadow(0 2px 8px rgba(0, 30, 61, 0.25))'),
          }}
        >
          {!videoError ? (
            <video
              ref={videoRef}
              src={cursorVideo}
              autoPlay
              loop
              muted
              playsInline
              crossOrigin="anonymous"
              onError={() => setVideoError(true)}
              className="w-16 sm:w-20 h-auto object-contain pointer-events-none select-none"
            />
          ) : (
            <img
              src={isHovering ? cursorHoverPng : cursorPng}
              alt="Scuba Diver Cursor"
              className="w-16 sm:w-20 h-auto object-contain pointer-events-none select-none"
            />
          )}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(cursorNode, document.body)
  }

  return cursorNode
}
