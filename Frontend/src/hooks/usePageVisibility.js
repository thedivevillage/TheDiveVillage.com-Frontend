import { useState, useEffect } from 'react'

/**
 * Reusable Page Visibility hook.
 * Detects whether the current tab/document is visible or backgrounded/minimized.
 *
 * @returns {boolean} isVisible - True if document.visibilityState is 'visible', false if 'hidden'.
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') return true
    return document.visibilityState === 'visible'
  })

  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      const nextVisible = document.visibilityState === 'visible'
      setIsVisible((prev) => (prev !== nextVisible ? nextVisible : prev))
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}

export default usePageVisibility
