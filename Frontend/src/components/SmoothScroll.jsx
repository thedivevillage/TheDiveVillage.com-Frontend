import { useEffect, useRef } from 'react'
import { ReactLenis, defaultLenisOptions, useLenis } from '../utils/lenisReact'

function LenisGlobalSync() {
  const lenis = useLenis()
  const scrollTimerRef = useRef(null)

  useEffect(() => {
    if (!lenis || typeof window === 'undefined') return
    window.lenis = lenis

    const onScroll = () => {
      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling')
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
      scrollTimerRef.current = setTimeout(() => {
        document.body.classList.remove('is-scrolling')
      }, 90)
    }

    lenis.on('scroll', onScroll)

    return () => {
      lenis.off('scroll', onScroll)
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
      document.body.classList.remove('is-scrolling')
    }
  }, [lenis])

  return null
}

export default function SmoothScroll({ children, options = {} }) {
  return (
    <ReactLenis
      root
      options={{
        ...defaultLenisOptions,
        duration: 0.45,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        infinite: false,
        syncTouch: false,
        autoRaf: true,
        ...options,
      }}
    >
      <LenisGlobalSync />
      {children}
    </ReactLenis>
  )
}
