import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './utils/audioManager'
import { initIdlePrefetching } from './utils/routePrefetcher'

// Filter non-actionable notices from external libraries and empty-src fallbacks
if (typeof console !== 'undefined') {
  if (console.warn) {
    const origWarn = console.warn
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
        return
      }
      origWarn.apply(console, args)
    }
  }
  if (console.error) {
    const origError = console.error
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('An empty string ("") was passed to the src attribute')) {
        return
      }
      origError.apply(console, args)
    }
  }
}

initIdlePrefetching()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
