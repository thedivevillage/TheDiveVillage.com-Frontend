import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { MEDIA_CONFIG } from '../config/mediaConfig'
import useNightDive from '../hooks/useNightDive'

const cursorVideo = MEDIA_CONFIG?.r2?.ui?.cursor || 'https://media.thedivevillage.com/TDV-Media/UI/cursor.webm'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const flipRef = useRef(null)
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
    if (isAuthPage || videoError || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursors')
      }
      return
    }

    document.body.classList.add('hide-cursors')

    let latestX = -100
    let latestY = -100
    let prevMouseX = -100
    let prevMouseY = -100
    let pendingDx = 0
    let pendingDy = 0
    let hasNewMouseMove = false
    let lastMouseMoveTime = 0
    let currentTarget = null
    let rafId = null
    let isHidden = true
    let isHoveringInteractive = false
    let isOverNormalCursor = false
    let lastCheckTime = 0

    const isPointInsideGlobe = () => false

    const checkNormalCursor = (target) => {
      if (!target) return false
      const el = target instanceof Element ? target : target.parentElement
      if (!el || !(el instanceof Element)) return false
      // Never hide custom cursor over product cards or product media
      if (el.closest('[data-product-card], .product-card, [data-product-media], [data-product-subpage], .product-3d-wrapper')) {
        return false
      }
      return !!el.closest('input, textarea, select, [contenteditable="true"], .normal-cursor, [data-normal-cursor], form, [data-auth-container], .maplibregl-map, .maplibregl-canvas, .maplibregl-canvas-container, [data-dive-map]')
    }

    const checkInteractive = (target) => {
      if (!target) return false
      const el = target instanceof Element ? target : target.parentElement
      if (!el || !(el instanceof Element)) return false
      return !!el.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive], label, [data-product-card], .product-card, [data-360-toggle="clickable"], [data-gallery-close], [aria-label="Close Lightbox"]')
    }

    const checkRadiusForInteractive = (x, y) => {
      let el = document.elementFromPoint(x, y)
      return el ? checkInteractive(el) : false
    }

    let cachedToggleCenter = null
    let lastToggleCheckTime = 0

    const isNear360Toggle = (x, y, target) => {
      if (typeof document === 'undefined') return false

      if (document.body.hasAttribute('data-360-dragging')) {
        return true
      }

      if (target instanceof Element && target.closest('[data-360-toggle], .joystick-container')) {
        return true
      }

      if (x < window.innerWidth - 220) {
        return false
      }

      const now = performance.now()
      if (!cachedToggleCenter || now - lastToggleCheckTime > 300) {
        lastToggleCheckTime = now
        const toggleEl = document.querySelector('[data-360-toggle="clickable"]') || document.querySelector('.joystick-container')
        if (toggleEl && toggleEl.offsetParent !== null) {
          const rect = toggleEl.getBoundingClientRect()
          cachedToggleCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }
        } else {
          cachedToggleCenter = null
        }
      }

      if (!cachedToggleCenter) return false

      const dist = Math.hypot(x - cachedToggleCenter.x, y - cachedToggleCenter.y)
      return dist <= 140
    }

    let cachedGalleryCloseCenter = null
    let lastGalleryCloseCheckTime = 0

    const isNearGalleryClose = (x, y, target) => {
      if (typeof document === 'undefined') return false

      if (target instanceof Element && target.closest('[data-gallery-close], [aria-label="Close Lightbox"], [data-cursor-static], #gallery-preview-close')) {
        return true
      }

      const now = performance.now()
      if (!cachedGalleryCloseCenter || now - lastGalleryCloseCheckTime > 300) {
        lastGalleryCloseCheckTime = now
        const closeBtn = document.querySelector('[data-gallery-close], [aria-label="Close Lightbox"], [data-cursor-static], #gallery-preview-close')
        if (closeBtn && closeBtn.offsetParent !== null) {
          const rect = closeBtn.getBoundingClientRect()
          cachedGalleryCloseCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }
        } else {
          cachedGalleryCloseCenter = null
        }
      }

      if (!cachedGalleryCloseCenter) return false

      const dist = Math.hypot(x - cachedGalleryCloseCenter.x, y - cachedGalleryCloseCenter.y)
      return dist <= 140
    }

    let lastTime = performance.now()
    let currentRotation = 0
    let targetRotation = 0
    let currentScaleX = -1
    let targetScaleX = -1
    let smoothDx = 0
    let smoothDy = 0

    const updateCursorPosition = (now = performance.now()) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0)`

        let frameDx = 0
        let frameDy = 0

        if (hasNewMouseMove) {
          frameDx = pendingDx
          frameDy = pendingDy
          pendingDx = 0
          pendingDy = 0
          hasNewMouseMove = false
        }

        const timeSinceMove = now - lastMouseMoveTime

        if (timeSinceMove < 70) {
          // Smooth velocity filter to eliminate monitor refresh / mouse polling stutter
          const filterFactor = 1 - Math.exp(-22 * dt)
          smoothDx += (frameDx - smoothDx) * filterFactor
          smoothDy += (frameDy - smoothDy) * filterFactor
        } else {
          // Stationary for > 70ms: gently decay smoothed velocity so cursor smoothly settles
          const decayFactor = Math.exp(-14 * dt)
          smoothDx *= decayFactor
          smoothDy *= decayFactor
          if (Math.abs(smoothDx) < 0.04) smoothDx = 0
          if (Math.abs(smoothDy) < 0.04) smoothDy = 0
        }

        const speed = Math.hypot(smoothDx, smoothDy)
        const isDragging360 = typeof document !== 'undefined' && document.body.hasAttribute('data-360-dragging')

        if (isDragging360) {
          // Level out horizontally during active 360 dragging
          targetRotation = 0
        } else if (speed > 0.8) {
          const absX = Math.abs(smoothDx)
          const absY = Math.abs(smoothDy)

          // 1. Determine horizontal facing direction (left vs right) with hysteresis:
          // Keep current facing direction unless there is deliberate horizontal motion
          if (absX > 1.8) {
            const isHorizontalIntent = absX > absY * 0.35 || absX > 3.5
            if (isHorizontalIntent) {
              if (smoothDx > 1.8) {
                targetScaleX = -1 // Moving rightwards -> face RIGHT
              } else if (smoothDx < -1.8) {
                targetScaleX = 1 // Moving leftwards -> face LEFT
              }
            }
          }

          // 2. Determine swimming pitch (turn up vs down vs level):
          // - Moving up rotates 45 deg to point UP
          // - Moving down rotates 45 deg to point DOWN
          // - Deliberate horizontal motion levels out to 0 deg
          // - When stopped or taking hand off mouse, retain current position!
          if (absY > 0.8 && absY > absX * 0.35) {
            targetRotation = smoothDy < 0 ? 45 : -45
          } else if (absX > 1.8 && absX > absY * 1.4) {
            targetRotation = 0
          }
        }
        // When speed <= 0.8 (stopped / hand taken off cursor):
        // Retain current targetRotation so the cursor remains in its position!

        // Frame-rate independent exponential smoothing
        const rotLerp = 1 - Math.exp(-12 * dt)
        const scaleLerp = 1 - Math.exp(-18 * dt)
        currentRotation += (targetRotation - currentRotation) * rotLerp
        currentScaleX += (targetScaleX - currentScaleX) * scaleLerp

        // Snap near targets to prevent floating point drift
        if (Math.abs(currentRotation - targetRotation) < 0.05) currentRotation = targetRotation
        if (Math.abs(currentScaleX - targetScaleX) < 0.01) currentScaleX = targetScaleX

        if (flipRef.current) {
          flipRef.current.style.transform = `scaleX(${currentScaleX.toFixed(3)})`
        }

        if (orientationRef.current) {
          orientationRef.current.style.transform = `rotate(${currentRotation.toFixed(2)}deg)`
        }

        if (isOverNormalCursor || isHidden) {
          cursorRef.current.style.opacity = '0'
          cursorRef.current.style.visibility = 'hidden'
        } else {
          cursorRef.current.style.opacity = '1'
          cursorRef.current.style.visibility = 'visible'
        }
      }

      // Radius check throttled to ~15fps (bypass during active scroll)
      const isScrolling = typeof document !== 'undefined' && document.body.classList.contains('is-scrolling')
      if (!isScrolling && now - lastCheckTime >= 64 && latestX >= 0 && latestY >= 0) { // Limit to ~15fps for radius checks, bypass during scroll
        lastCheckTime = now
        const elUnderPoint = document.elementFromPoint(latestX, latestY) || currentTarget
        isOverNormalCursor = checkNormalCursor(elUnderPoint) || isPointInsideGlobe(latestX, latestY)
        if (isOverNormalCursor) {
          if (isHoveringInteractive) {
            isHoveringInteractive = false
            setIsHovering(false)
          }
        } else {
          const hovering = checkRadiusForInteractive(latestX, latestY)
          if (hovering !== isHoveringInteractive) {
            isHoveringInteractive = hovering
            setIsHovering(hovering)
          }
        }
      }

      rafId = requestAnimationFrame(updateCursorPosition)
    }

    rafId = requestAnimationFrame(updateCursorPosition)

    const onMouseMove = (e) => {
      const now = performance.now()
      if (prevMouseX === -100 && prevMouseY === -100) {
        prevMouseX = e.clientX
        prevMouseY = e.clientY
      } else {
        pendingDx += e.clientX - prevMouseX
        pendingDy += e.clientY - prevMouseY
        prevMouseX = e.clientX
        prevMouseY = e.clientY
        hasNewMouseMove = true
        lastMouseMoveTime = now
      }

      latestX = e.clientX
      latestY = e.clientY
      currentTarget = e.target
      isOverNormalCursor = checkNormalCursor(e.target) || isPointInsideGlobe(latestX, latestY)

      if (isOverNormalCursor) {
        if (isHoveringInteractive) {
          isHoveringInteractive = false
          setIsHovering(false)
        }
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '0'
          cursorRef.current.style.visibility = 'hidden'
        }
      } else {
        if (isHidden) {
          isHidden = false
        }
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0)`
          cursorRef.current.style.opacity = '1'
          cursorRef.current.style.visibility = 'visible'
        }

        // 0ms Instant Response ONLY if directly on a button and not over globe/normal cursor
        if (e.target && checkInteractive(e.target)) {
          if (!isHoveringInteractive) {
            isHoveringInteractive = true
            setIsHovering(true)
          }
        }
      }
    }

    const onScroll = () => {
      if (latestX >= 0 && latestY >= 0) {
        const el = document.elementFromPoint(latestX, latestY)
        currentTarget = el
        isOverNormalCursor = checkNormalCursor(el) || isPointInsideGlobe(latestX, latestY)
        if (isOverNormalCursor && cursorRef.current) {
          cursorRef.current.style.opacity = '0'
          cursorRef.current.style.visibility = 'hidden'
        }
      }
    }

    const onMouseLeave = () => {
      isHidden = true
      prevMouseX = -100
      prevMouseY = -100
      pendingDx = 0
      pendingDy = 0
      hasNewMouseMove = false
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0'
        cursorRef.current.style.visibility = 'hidden'
      }
      setIsHovering(false)
    }

    const onMouseEnter = (e) => {
      isHidden = false
      if (e?.clientX != null && e?.clientY != null) {
        latestX = e.clientX
        latestY = e.clientY
        prevMouseX = e.clientX
        prevMouseY = e.clientY
        pendingDx = 0
        pendingDy = 0
        hasNewMouseMove = false
        lastMouseMoveTime = performance.now()
      }
      const target = e?.target || document.elementFromPoint(latestX, latestY)
      isOverNormalCursor = checkNormalCursor(target) || isPointInsideGlobe(latestX, latestY)
      if (cursorRef.current) {
        if (isOverNormalCursor) {
          cursorRef.current.style.opacity = '0'
          cursorRef.current.style.visibility = 'hidden'
        } else {
          cursorRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0)`
          cursorRef.current.style.opacity = '1'
          cursorRef.current.style.visibility = 'visible'
        }
      }
    }

    const onFocusIn = (e) => {
      if (checkNormalCursor(e.target) && cursorRef.current) {
        cursorRef.current.style.opacity = '0'
        cursorRef.current.style.visibility = 'hidden'
      }
    }

    // Listener setups with capture to ensure priority over canvas libraries
    window.addEventListener('pointermove', onMouseMove, { capture: true, passive: true })
    window.addEventListener('mousemove', onMouseMove, { capture: true, passive: true })
    window.addEventListener('pointerdown', onMouseMove, { capture: true, passive: true })
    window.addEventListener('pointerup', onMouseMove, { capture: true, passive: true })
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

    const onResize = () => {
      cachedToggleCenter = null
      cachedGalleryCloseCenter = null
    }
    window.addEventListener('resize', onResize)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMouseMove, { capture: true })
      window.removeEventListener('mousemove', onMouseMove, { capture: true })
      window.removeEventListener('pointerdown', onMouseMove, { capture: true })
      window.removeEventListener('pointerup', onMouseMove, { capture: true })
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('pointerdown', ensureVideoPlaying)
      window.removeEventListener('click', ensureVideoPlaying)
      document.body.classList.remove('hide-cursors')
    }
  }, [isAuthPage, videoError])

  // Keep video playing continuously across theme toggles and visibility changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [isNightDive])

  if (isAuthPage || videoError || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
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
      }}
    >
      {/* Night Dive Mode Underwater Flashlight Beam & Spotlight Aura (Subtle reduced halo) */}
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

      {/* Horizontal Facing Layer (Flip left/right around fingertip hotspot) */}
      <div
        ref={flipRef}
        style={{
          transformOrigin: '0 0',
          transform: 'scaleX(-1)',
          willChange: 'transform',
        }}
      >
        {/* Pitch Rotation Layer (Smooth 45 deg up / down / level around fingertip hotspot) */}
        <div
          ref={orientationRef}
          style={{
            transformOrigin: '0 0',
            transform: 'rotate(0deg)',
            willChange: 'transform',
          }}
        >
<<<<<<< Updated upstream
          <video
            ref={videoRef}
            src={cursorVideo}
            poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            className="w-16 sm:w-20 h-auto object-contain pointer-events-none select-none"
          />
=======
          {/* Scuba Diver with Dynamic Luminescence and Interactive Scale */}
          <div
            className="will-change-transform transition-transform duration-100 ease-out"
            style={{
              transformOrigin: '4.6% 57.5%',
              transform: `translate(-4.6%, -57.5%) scale(${isHovering ? 1.15 : 1.0})`,
              filter: isNightDive
                ? (isHovering
                    ? 'drop-shadow(0 0 6px rgba(0, 242, 254, 0.6)) brightness(1.15) contrast(1.05)'
                    : 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.4)) brightness(1.1) contrast(1.05)')
                : (isHovering
                    ? 'drop-shadow(0 4px 12px rgba(0, 56, 101, 0.4)) brightness(1.05)'
                    : 'drop-shadow(0 2px 8px rgba(0, 30, 61, 0.25))'),
            }}
          >
            <video
              ref={videoRef}
              src={cursorVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="w-16 sm:w-20 h-auto object-contain pointer-events-none select-none"
            />
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(cursorNode, document.body)
  }

  return cursorNode
}
