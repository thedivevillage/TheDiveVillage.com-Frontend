import { useState, useEffect } from 'react'

/**
 * Universal night-dive mode manager.
 * Guarantees that:
 * 1. Both document.documentElement and document.body always have 'night-dive' synchronously added or removed together.
 * 2. localStorage ('tdv_night_dive') is updated consistently.
 * 3. A window custom event ('tdv_night_dive_change') is dispatched so all active components across every page update instantly.
 * 4. Cross-tab storage changes and external DOM mutations are caught via storage & MutationObserver listeners.
 */

export function applyNightDive(enable) {
  if (typeof document === 'undefined') return
  const isNight = Boolean(enable)

  if (isNight) {
    if (!document.documentElement.classList.contains('night-dive')) {
      document.documentElement.classList.add('night-dive')
    }
    if (!document.body.classList.contains('night-dive')) {
      document.body.classList.add('night-dive')
    }
    try {
      localStorage.setItem('tdv_night_dive', 'true')
    } catch (e) {}
  } else {
    if (document.documentElement.classList.contains('night-dive')) {
      document.documentElement.classList.remove('night-dive')
    }
    if (document.body.classList.contains('night-dive')) {
      document.body.classList.remove('night-dive')
    }
    try {
      localStorage.setItem('tdv_night_dive', 'false')
    } catch (e) {}
  }

  try {
    window.dispatchEvent(new CustomEvent('tdv_night_dive_change', { detail: { isNightDive: isNight } }))
  } catch (e) {}
}

export function getIsNightDive() {
  if (typeof document === 'undefined') return false
  try {
    const stored = localStorage.getItem('tdv_night_dive')
    if (stored === 'true') return true
    if (stored === 'false') return false
  } catch (e) {}
  return (
    document.body.classList.contains('night-dive') ||
    document.documentElement.classList.contains('night-dive')
  )
}

export function toggleNightDive() {
  const current = getIsNightDive()
  const next = !current
  applyNightDive(next)
  return next
}

/**
 * Backward compatibility stub: Night mode is now universally enabled across every page.
 */
export function isNightModeDisabledRoute() {
  return false
}

export function useNightDive() {
  const [isNightDive, setIsNightDive] = useState(getIsNightDive)

  useEffect(() => {
    // 1. Sync DOM with saved preference on mount
    try {
      const stored = localStorage.getItem('tdv_night_dive')
      if (stored === 'true') {
        if (!document.documentElement.classList.contains('night-dive') || !document.body.classList.contains('night-dive')) {
          applyNightDive(true)
        }
      } else if (stored === 'false') {
        if (document.documentElement.classList.contains('night-dive') || document.body.classList.contains('night-dive')) {
          applyNightDive(false)
        }
      }
    } catch (e) {}

    const handleUpdate = () => {
      setIsNightDive(getIsNightDive())
    }

    handleUpdate()

    window.addEventListener('tdv_night_dive_change', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    const observer = new MutationObserver(handleUpdate)
    if (document.body) {
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    }
    if (document.documentElement) {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    }

    return () => {
      window.removeEventListener('tdv_night_dive_change', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
      observer.disconnect()
    }
  }, [])

  return isNightDive
}

export default useNightDive

