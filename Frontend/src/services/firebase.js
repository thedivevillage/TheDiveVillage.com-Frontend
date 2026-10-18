let app = null
let auth = null
let authModule = null
let messaging = null
let messagingModule = null
let messagingSwRegistration = null

const getEnvVar = (key) => (import.meta.env[key] || '').trim()

// Firebase configuration loaded strictly from build-time environment variables or verified project defaults
export const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'AIzaSyDAxPsEFVub2IVrpSuCQxCn-JnsBU0NbdY',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'the-dive-village.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'the-dive-village',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'the-dive-village.firebasestorage.app',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || '458045547653',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || '1:458045547653:web:54a40c550a07edf8d8b5ec',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'placeholder' &&
    firebaseConfig.projectId
)

if (typeof window !== 'undefined') {
  console.log('[Firebase] Active Configuration:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hostname: window.location.hostname,
    isConfigured: isFirebaseConfigured,
  })
}

async function getFirebaseApp() {
  if (!app) {
    const { initializeApp } = await import('firebase/app')
    app = initializeApp(firebaseConfig)
  }
  return app
}

export async function getAuthModule() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_* environment variables are set in Cloudflare Pages.'
    )
  }
  if (auth && authModule) return { auth, app, authMod: authModule }
  const [firebaseApp, authMod] = await Promise.all([
    getFirebaseApp(),
    import('firebase/auth'),
  ])
  auth = authMod.getAuth(firebaseApp)
  authModule = authMod
  return { auth, app: firebaseApp, authMod }
}

const handleAuthError = (err) => {
  if (err?.code === 'auth/unauthorized-domain' && typeof window !== 'undefined') {
    console.error(
      `[Firebase Auth Error] Unauthorized Domain: "${window.location.hostname}". ` +
      `Please ensure "${window.location.hostname}" is listed in Firebase Console -> Authentication -> Settings -> Authorized domains.`
    )
  }
  throw err
}

export const firebaseAuth = {
  onAuthStateChanged: (cb) => {
    if (!isFirebaseConfigured) {
      cb(null)
      return () => {}
    }
    let unsub = () => {}
    getAuthModule().then(({ auth: a, authMod }) => {
      if (!a) {
        cb(null)
        return
      }
      unsub = authMod.onAuthStateChanged(a, cb)
    }).catch(() => cb(null))
    return () => unsub()
  },
  signInEmail: async (email, password) => {
    try {
      const { auth: a, authMod } = await getAuthModule()
      return await authMod.signInWithEmailAndPassword(a, email, password)
    } catch (err) {
      handleAuthError(err)
    }
  },
  signUpEmail: async (email, password) => {
    try {
      const { auth: a, authMod } = await getAuthModule()
      return await authMod.createUserWithEmailAndPassword(a, email, password)
    } catch (err) {
      handleAuthError(err)
    }
  },
  signInGoogle: async () => {
    try {
      const { auth: a, authMod } = await getAuthModule()
      const provider = new authMod.GoogleAuthProvider()
      return await authMod.signInWithPopup(a, provider)
    } catch (err) {
      handleAuthError(err)
    }
  },
  sendPasswordReset: async (email) => {
    try {
      const { auth: a, authMod } = await getAuthModule()
      return await authMod.sendPasswordResetEmail(a, email)
    } catch (err) {
      handleAuthError(err)
    }
  },
  signOut: async () => {
    if (!isFirebaseConfigured) return
    const { auth: a, authMod } = await getAuthModule()
    return authMod.signOut(a)
  },
}

/**
 * Registers the Firebase Cloud Messaging Service Worker without creating duplicate registrations.
 */
export async function registerFirebaseMessagingSW() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }
  if (messagingSwRegistration) {
    return messagingSwRegistration
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    const existing = registrations.find((r) => {
      const scriptURL = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || ''
      return scriptURL.includes('firebase-messaging-sw.js')
    })

    if (existing) {
      messagingSwRegistration = existing
      return existing
    }

    messagingSwRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/firebase-cloud-messaging-push-scope',
    })
    console.log('[Firebase Messaging] Service worker registered successfully')
    return messagingSwRegistration
  } catch (err) {
    console.warn('[Firebase Messaging] Service worker registration failed:', err)
    return null
  }
}

/**
 * Initializes and retrieves the Firebase Messaging module and instance.
 */
export async function getMessagingModule() {
  if (!isFirebaseConfigured) {
    console.warn('[Firebase Messaging] Firebase is not configured. Messaging skipped.')
    return null
  }
  if (typeof window === 'undefined') return null

  if (messaging && messagingModule) {
    return { messaging, messagingMod: messagingModule, app }
  }

  try {
    const { isSupported } = await import('firebase/messaging')
    const supported = await isSupported().catch(() => false)
    if (!supported) {
      console.warn('[Firebase Messaging] Push notifications are not supported in this browser environment.')
      return null
    }

    const [firebaseApp, messagingMod] = await Promise.all([
      getFirebaseApp(),
      import('firebase/messaging'),
    ])

    messaging = messagingMod.getMessaging(firebaseApp)
    messagingModule = messagingMod
    return { messaging, messagingMod, app: firebaseApp }
  } catch (err) {
    console.warn('[Firebase Messaging] Failed to initialize messaging module:', err)
    return null
  }
}

export const firebaseMessaging = {
  isSupported: async () => {
    if (typeof window === 'undefined') return false
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return false
    }
    try {
      const { isSupported } = await import('firebase/messaging')
      return await isSupported().catch(() => false)
    } catch {
      return false
    }
  },

  registerServiceWorker: async () => {
    return await registerFirebaseMessagingSW()
  },

  getToken: async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return null
    // Strictly preserve UI - never automatically trigger browser permission prompt without user action
    if (Notification.permission !== 'granted') {
      return null
    }

    try {
      const mod = await getMessagingModule()
      if (!mod) return null
      const { messaging: m, messagingMod } = mod
      const swReg = await registerFirebaseMessagingSW()

      const vapidKey = getEnvVar('VITE_FIREBASE_VAPID_KEY') || undefined

      const tokenOptions = {
        ...(swReg ? { serviceWorkerRegistration: swReg } : {}),
        ...(vapidKey ? { vapidKey } : {}),
      }

      return await messagingMod.getToken(m, tokenOptions)
    } catch (err) {
      console.warn('[Firebase Messaging] Failed to get FCM token:', err)
      return null
    }
  },

  requestPermissionAndGetToken: async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return null
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('[Firebase Messaging] Notification permission not granted:', permission)
        return null
      }
      return await firebaseMessaging.getToken()
    } catch (err) {
      console.warn('[Firebase Messaging] Error requesting notification permission:', err)
      return null
    }
  },

  onMessage: (callback) => {
    if (typeof window === 'undefined') return () => {}
    let unsub = () => {}
    getMessagingModule().then((mod) => {
      if (!mod) return
      const { messaging: m, messagingMod } = mod
      unsub = messagingMod.onMessage(m, callback)
    }).catch((err) => {
      console.warn('[Firebase Messaging] onMessage listener registration error:', err)
    })
    return () => unsub()
  },
}

export default { getAuthModule, getMessagingModule, firebaseAuth, firebaseMessaging, isFirebaseConfigured }
