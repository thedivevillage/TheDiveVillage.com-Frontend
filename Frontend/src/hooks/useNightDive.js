import { useState, useEffect } from 'react'
import { useLocation } from 'react-router'

export function isNightModeDisabledRoute(pathname) {
  if (!pathname) return false
  const cleanPath = pathname.toLowerCase()
  return (
    cleanPath === '/cart' ||
    cleanPath.startsWith('/cart/') ||
    cleanPath === '/checkout' ||
    cleanPath.startsWith('/checkout/') ||
    cleanPath === '/profile' ||
    cleanPath.startsWith('/profile/') ||
    cleanPath === '/dashboard' ||
    cleanPath.startsWith('/dashboard/')
  )
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
        return false
      }
      try {
        if (localStorage.getItem('tdv_night_dive') === 'true') {
          if (!document.body.classList.contains('night-dive')) {
            document.body.classList.add('night-dive')
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
      setIsNightDive(false)
      return
    }

    try {
      if (localStorage.getItem('tdv_night_dive') === 'true' && !document.body.classList.contains('night-dive')) {
        document.body.classList.add('night-dive')
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
