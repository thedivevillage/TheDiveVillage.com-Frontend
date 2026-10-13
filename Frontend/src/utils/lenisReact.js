/**
 * Lenis React Bridge & Utilities
 * 
 * Centralized import wrapper for Lenis smooth scrolling in React.
 * Re-exports ReactLenis and useLenis directly from 'lenis/react'.
 */

export { ReactLenis, useLenis } from 'lenis/react'

/**
 * Default smooth scrolling configuration for the application
 */
export const defaultLenisOptions = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  infinite: false,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
}
