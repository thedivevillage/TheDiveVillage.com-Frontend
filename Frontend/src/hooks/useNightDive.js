import { useState, useEffect } from 'react'

export function useNightDive() {
  const [isNightDive, setIsNightDive] = useState(() => {
    if (typeof document !== 'undefined') {
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
    try {
      if (localStorage.getItem('tdv_night_dive') === 'true' && !document.body.classList.contains('night-dive')) {
        document.body.classList.add('night-dive')
      }
    } catch (e) {}

    const updateTheme = () => {
      setIsNightDive(document.body.classList.contains('night-dive'))
    }

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    updateTheme()

    return () => observer.disconnect()
  }, [])

  return isNightDive
}

export default useNightDive
