let app = null
let auth = null
let authModule = null

const getEnvVar = (key) => (import.meta.env[key] || '').trim()

// Firebase configuration loaded strictly from build-time environment variables
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
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
    usingEnvVars: hasEnvConfig,
    usingFallback: useFallback,
    hostname: window.location.hostname,
    isConfigured: isFirebaseConfigured,
  })
}

async function getAuthModule() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_* environment variables are set in Cloudflare Pages.'
    )
  }
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
