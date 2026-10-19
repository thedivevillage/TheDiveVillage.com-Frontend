import { useState, useEffect } from 'react'
import { useLocation } from 'react-router'

export function isNightModeAllowedRoute(pathname) {
  if (!pathname && typeof window !== 'undefined') {
    pathname = window.location.pathname
  }
  const cleanPath = (pathname || '/').split('?')[0].split('#')[0].trim().toLowerCase().replace(/\/+$/, '') || '/'
  return (
    cleanPath === '/' ||
    cleanPath === '/about' ||
    cleanPath === '/services' ||
    cleanPath === '/our-services' ||
    cleanPath.startsWith('/services/') ||
    cleanPath === '/courses' ||
    cleanPath.startsWith('/courses/') ||
    cleanPath === '/scuba-diving' ||
    cleanPath === '/snorkeling' ||
    cleanPath === '/freediving' ||
    cleanPath === '/gallery' ||
    cleanPath.startsWith('/gallery/') ||
    cleanPath === '/contact'
  )
}

export function isNightModeDisabledRoute(pathname) {
  return !isNightModeAllowedRoute(pathname)
}

function useSafeLocation() {
  try {
    return useLocation()
  } catch (e) {
    return { pathname: typeof window !== 'undefined' ? window.location.pathname : '' }
  }
}

export function useNightDive() {
  const location = useSafeLocation()
  const isNightDisabled = isNightModeDisabledRoute(location?.pathname)

  const [isNightDive, setIsNightDive] = useState(() => {
    if (typeof document !== 'undefined') {
      const currentDisabled = isNightModeDisabledRoute(
        location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '')
      )
      if (currentDisabled) {
        if (document.body.classList.contains('night-dive')) {
          document.body.classList.remove('night-dive')
        }
        if (document.documentElement.classList.contains('night-dive')) {
          document.documentElement.classList.remove('night-dive')
        }
        return false
      }
      try {
        if (localStorage.getItem('tdv_night_dive') === 'true') {
          if (!document.body.classList.contains('night-dive')) {
            document.body.classList.add('night-dive')
          }
          if (!document.documentElement.classList.contains('night-dive')) {
            document.documentElement.classList.add('night-dive')
          }
          return true
        }
      } catch (e) {}
      return document.body.classList.contains('night-dive')
    }
    return false
  })

  useEffect(() => {
    if (isNightDisabled) {
      if (document.body.classList.contains('night-dive')) {
        document.body.classList.remove('night-dive')
      }
      if (document.documentElement.classList.contains('night-dive')) {
        document.documentElement.classList.remove('night-dive')
      }
      setIsNightDive(false)
      return
    }

    try {
      if (localStorage.getItem('tdv_night_dive') === 'true') {
        if (!document.body.classList.contains('night-dive')) {
          document.body.classList.add('night-dive')
        }
        if (!document.documentElement.classList.contains('night-dive')) {
          document.documentElement.classList.add('night-dive')
        }
      }
    } catch (e) {}

    const updateTheme = () => {
      if (isNightModeDisabledRoute(location?.pathname)) {
        setIsNightDive(false)
      } else {
        setIsNightDive(document.body.classList.contains('night-dive'))
      }
    }

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    updateTheme()

    return () => observer.disconnect()
  }, [isNightDisabled, location?.pathname])

  return isNightDisabled ? false : isNightDive
}

export default useNightDive
