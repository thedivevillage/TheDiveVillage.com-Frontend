import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './utils/audioManager'
import './utils/mediaCache'
import { initIdlePrefetching } from './utils/routePrefetcher'
import { registerSW } from 'virtual:pwa-register'
import { registerFirebaseMessagingSW, isFirebaseConfigured } from './services/firebase'

// In development mode, automatically unregister any lingering service workers to avoid video streaming lag
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
      }
    })
  } else {
    registerSW({
      immediate: true,
      onRegistered(registration) {
        if (registration) {
          console.log('[TDV-PWA] Persistent Media Service Worker active')
        }
      },
      onRegisterError(err) {
        console.warn('[TDV-PWA] Service Worker registration failed:', err)
      }
    })
  }

  // Register Firebase Messaging Service Worker in background without UI disruption
  if (isFirebaseConfigured) {
    registerFirebaseMessagingSW().catch((err) => {
      console.warn('[TDV-FCM] Firebase Messaging Service Worker registration failed:', err)
    })
  }
}

// Filter non-actionable notices from external libraries and empty-src fallbacks
if (typeof console !== 'undefined') {
  if (console.warn) {
    const origWarn = console.warn
    console.warn = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('THREE.Clock: This module has been deprecated') ||
         args[0].includes('Multiple instances of Three.js being imported'))
      ) {
        return
      }
      origWarn.apply(console, args)
    }
  }
  if (console.error) {
    const origError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('An empty string ("") was passed to the src attribute')
      ) {
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
