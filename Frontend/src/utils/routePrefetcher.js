/**
 * Intelligent Route & Asset Pre-Fetcher
 * Pre-warms dynamic imports and heavy assets during browser idle time
 * and on hover, achieving instantaneous (0ms) page navigation.
 */
const routeLoaders = {
  '/book-us': () => import('../pages/BookUs'),
  '/about': () => import('../pages/About'),
  '/services': () => import('../pages/Services'),
  '/our-services': () => import('../pages/Services'),
  '/gallery': () => import('../pages/Gallery'),
  '/shop': () => import('../pages/Shop'),
  '/contact': () => import('../pages/Contact'),
  '/login': () => import('../pages/Login'),
  '/signup': () => import('../pages/Signup'),
  '/cart': () => import('../pages/Cart'),
  '/wishlist': () => import('../pages/Wishlist'),
  '/checkout': () => import('../pages/Checkout'),
  '/courses': () => import('../pages/AllCourses'),
  '/courses/scuba': () => import('../pages/Scuba'),
  '/courses/snorkeling': () => import('../pages/Snorkeling'),
  '/courses/surfing': () => import('../pages/Surfing'),
  '/scuba-diving': () => import('../pages/Scuba'),
  '/snorkeling': () => import('../pages/Snorkeling'),
  '/freediving': () => import('../pages/Surfing')
}

const prefetchedRoutes = new Set()

export function prefetchRoute(path) {
  if (!path || prefetchedRoutes.has(path)) return
  
  // Find matching loader
  const cleanPath = path.split('?')[0].toLowerCase()
  const loader = routeLoaders[cleanPath]
  
  if (loader) {
    prefetchedRoutes.add(cleanPath)
    try {
      loader()
    } catch (e) {
      console.warn('Prefetch notice for', cleanPath, e)
    }
  }
}

// Automatically warm up primary routes progressively during browser idle time
export function initIdlePrefetching() {
  if (typeof window === 'undefined') return

  const priorityRoutes = ['/about', '/services', '/shop', '/gallery']
  let queueIndex = 0

  const scheduleNext = () => {
    if (queueIndex >= priorityRoutes.length) return
    const route = priorityRoutes[queueIndex++]
    prefetchRoute(route)

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(scheduleNext, { timeout: 3000 })
    } else {
      setTimeout(scheduleNext, 1200)
    }
  }

  // Defer idle warming until well after initial render and hero video ready
  const startIdleWarm = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(scheduleNext, { timeout: 4000 })
    } else {
      setTimeout(scheduleNext, 2500)
    }
  }

  if (document.readyState === 'complete') {
    startIdleWarm()
  } else {
    window.addEventListener('load', startIdleWarm, { once: true })
  }
}
