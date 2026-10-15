import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { useLenis } from '../utils/lenisReact'

export default function ScrollToTop() {
  const location = useLocation()
  const lenis = useLenis()
  const lastNavTimeRef = useRef(0)
  const userInterruptedRef = useRef(false)

  // Force scroll position to top across native DOM and Lenis
  const forceScrollToTop = () => {
    // 1. Native DOM window & root elements
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }

    // 2. Lenis smooth scroll engine (from hook or window instance)
    const activeLenis = lenis || (typeof window !== 'undefined' ? window.lenis : null)
    if (activeLenis && typeof activeLenis.scrollTo === 'function') {
      try {
        activeLenis.scrollTo(0, { immediate: true, force: true, lock: false })
        if (typeof activeLenis.reset === 'function') {
          activeLenis.reset()
        }
      } catch {
        // Safe fallback
      }
    }
  }

  // 1. Disable browser native automatic scroll restoration and clean legacy session data
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    try {
      const keysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('scroll-')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k))
    } catch {
      // Ignore sessionStorage access issues
    }
  }, [])

  // 2. Global capture listener for link taps / clicks anywhere in the app
  useEffect(() => {
    const handleLinkTap = (e) => {
      const anchor = e.target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip non-HTTP links (mailto, tel, viber, etc.) or new tab targets
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('viber:') ||
        href.startsWith('javascript:') ||
        anchor.target === '_blank'
      ) {
        return
      }

      // Check external hostnames
      try {
        const url = new URL(anchor.href, window.location.href)
        if (url.origin !== window.location.origin) return
      } catch {
        return
      }

      // If it's an anchor to a hash or specific item, let target scrolling take over
      if (href.startsWith('#') || href.includes('#') || href.includes('item=')) return

      // Mark navigation timestamp and reset scroll to top immediately upon tap
      lastNavTimeRef.current = Date.now()
      userInterruptedRef.current = false
      forceScrollToTop()
    }

    // Capture phase intercepts before React or other click handlers
    document.addEventListener('click', handleLinkTap, { capture: true })
    return () => {
      document.removeEventListener('click', handleLinkTap, { capture: true })
    }
  }, [lenis])

  // 3. User scroll detection to avoid fighting manual user scroll AFTER page load
  useEffect(() => {
    const onUserManualScroll = () => {
      // Ignore touch/wheel events that occur within 350ms of a navigation tap/redirection
      if (Date.now() - lastNavTimeRef.current < 350) return
      userInterruptedRef.current = true
    }

    window.addEventListener('wheel', onUserManualScroll, { passive: true })
    window.addEventListener('touchmove', onUserManualScroll, { passive: true })

    return () => {
      window.removeEventListener('wheel', onUserManualScroll)
      window.removeEventListener('touchmove', onUserManualScroll)
    }
  }, [])

  // 4. Route change handler: runs on pathname, search, or location.key change
  useEffect(() => {
    lastNavTimeRef.current = Date.now()
    userInterruptedRef.current = false

    // If URL specifies a target hash or item, do NOT force scroll to top
    const searchParams = new URLSearchParams(location.search)
    const targetItemId = searchParams.get('item')
    const hasTargetHashOrItem = Boolean(location.hash || targetItemId)

    if (hasTargetHashOrItem) {
      if (location.hash) {
        const hashId = decodeURIComponent(location.hash.replace('#', ''))
        const targetElement = document.getElementById(hashId) || document.querySelector(location.hash)
        if (targetElement) {
          const activeLenis = lenis || (typeof window !== 'undefined' ? window.lenis : null)
          if (activeLenis && typeof activeLenis.scrollTo === 'function') {
            activeLenis.scrollTo(targetElement, { offset: -100, duration: 1.0 })
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
      return
    }

    // Step A: Immediate reset
    forceScrollToTop()

    // Step B: Animation frame reset
    const rafId = requestAnimationFrame(() => {
      if (!userInterruptedRef.current) {
        forceScrollToTop()
      }
    })

    // Step C: Staggered reinforcement for React Suspense chunk loading and layout shifts
    const timers = [40, 100, 200, 350, 500].map((delay) =>
      setTimeout(() => {
        if (!userInterruptedRef.current) {
          forceScrollToTop()
        }
      }, delay)
    )

    return () => {
      cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
    }
  }, [location.pathname, location.search, location.key, lenis])

  return null
}
