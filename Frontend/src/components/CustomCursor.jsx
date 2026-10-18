import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { getOptimizedImageUrl } from '../utils/mediaOptimizer'
const cursorVideo = '/media/TDV-Media/UI/cursor.webm'
const rawCursorLogo = 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1791691225/TDV-Media/UI/Logo.png'
const cursorPng = rawCursorLogo
const cursorHoverPng = rawCursorLogo
import useNightDive from '../hooks/useNightDive'

export default function CustomCursor() {
  const cursorRef = useRef(null)
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

    let lastRenderX = -100
    let lastRenderY = -100
    let currentRotation = 0
    let targetRotation = 0
    let currentScaleX = 1
    let targetScaleX = 1

    const updateCursorPosition = () => {
      if (cursorRef.current) {
        const dx = latestX - lastRenderX
        const dy = latestY - lastRenderY
        lastRenderX = latestX
        lastRenderY = latestY

        const near360 = isNear360Toggle(latestX, latestY, currentTarget)
        const nearGalleryClose = isNearGalleryClose(latestX, latestY, currentTarget)
        const isNearStaticZone = near360 || nearGalleryClose

        // Smooth, natural orientation without wild spinning or erratic 90-degree glitching
        if (isHoveringInteractive || isNearStaticZone) {
          targetRotation = 0
          targetScaleX = 1
        } else {
          const speed = Math.hypot(dx, dy)
          if (speed > 1.5) {
            targetRotation = Math.max(-10, Math.min(10, dy * 0.6))
            if (dx > 2) targetScaleX = 1
            else if (dx < -2) targetScaleX = -1
          }
        }

        const lerpFactor = 0.35
        currentRotation += (targetRotation - currentRotation) * lerpFactor
        currentScaleX += (targetScaleX - currentScaleX) * lerpFactor

        cursorRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0) rotate(${currentRotation}deg) scaleX(${currentScaleX})`

        if (isOverNormalCursor || isHidden) {
          cursorRef.current.style.opacity = '0'
          cursorRef.current.style.visibility = 'hidden'
        } else {
          cursorRef.current.style.opacity = '1'
          cursorRef.current.style.visibility = 'visible'
        }
      }

      const now = performance.now()
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
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0'
        cursorRef.current.style.visibility = 'hidden'
      }
      setIsHovering(false)
    }

    const onMouseEnter = (e) => {
      isHidden = false
      const target = e?.target || document.elementFromPoint(latestX, latestY)
      isOverNormalCursor = checkNormalCursor(target) || isPointInsideGlobe(latestX, latestY)
      if (cursorRef.current) {
        if (isOverNormalCursor) {
          cursorRef.current.style.opacity = '0'
          cursorRef.current.style.visibility = 'hidden'
        } else {
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

      {/* Scuba Diver with Dynamic Luminescence and Interactive Scale */}
      <div
        className="will-change-transform transition-transform duration-100 ease-out"
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
  )

  if (typeof document !== 'undefined') {
    return createPortal(cursorNode, document.body)
  }

  return cursorNode
}
