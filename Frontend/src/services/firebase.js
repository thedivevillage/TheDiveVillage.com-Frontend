let app = null
let auth = null
let authModule = null

// Fallback configuration strictly for local development when environment variables are omitted
const DEV_FALLBACK_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC5-WeuVzMZxq5A31jMqoTq33TZH9Mx008',
  authDomain: 'dive-village-testing.firebaseapp.com',
  projectId: 'dive-village-testing',
  storageBucket: 'dive-village-testing.firebasestorage.app',
  messagingSenderId: '65243166255',
  appId: '1:65243166255:web:f4d281ac4e5bf9525c38da',
}

const getEnvVar = (key) => (import.meta.env[key] || '').trim()

// Primary Vercel Production environment variables
const envApiKey = getEnvVar('VITE_FIREBASE_API_KEY')
const envAuthDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN')
const envProjectId = getEnvVar('VITE_FIREBASE_PROJECT_ID')
const envStorageBucket = getEnvVar('VITE_FIREBASE_STORAGE_BUCKET')
const envMessagingSenderId = getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID')
const envAppId = getEnvVar('VITE_FIREBASE_APP_ID')

const hasEnvConfig = Boolean(envApiKey && envProjectId && envApiKey !== 'placeholder')

// In production, strictly use environment variables. In DEV mode, allow fallback if env vars are missing.
const useFallback = !hasEnvConfig && import.meta.env.DEV

const firebaseConfig = {
  apiKey: envApiKey || (useFallback ? DEV_FALLBACK_FIREBASE_CONFIG.apiKey : ''),
  authDomain: envAuthDomain || (useFallback ? DEV_FALLBACK_FIREBASE_CONFIG.authDomain : ''),
  projectId: envProjectId || (useFallback ? DEV_FALLBACK_FIREBASE_CONFIG.projectId : ''),
  storageBucket: envStorageBucket || (useFallback ? DEV_FALLBACK_FIREBASE_CONFIG.storageBucket : ''),
  messagingSenderId: envMessagingSenderId || (useFallback ? DEV_FALLBACK_FIREBASE_CONFIG.messagingSenderId : ''),
  appId: envAppId || (useFallback ? DEV_FALLBACK_FIREBASE_CONFIG.appId : ''),
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'placeholder' &&
    firebaseConfig.projectId
)

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('[Firebase] Active Configuration:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    usingEnvVars: hasEnvConfig,
    usingDevFallback: useFallback,
    hostname: window.location.hostname,
    isConfigured: isFirebaseConfigured,
  })
}

async function getAuthModule() {
  if (!isFirebaseConfigured) return null
  if (auth && authModule) return { auth, app, authMod: authModule }
  const [{ initializeApp }, authMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ])
  app = initializeApp(firebaseConfig)
  auth = authMod.getAuth(app)
  authModule = authMod
  return { auth, app, authMod }
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

export default { getAuthModule, isFirebaseConfigured }
