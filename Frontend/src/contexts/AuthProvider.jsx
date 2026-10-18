import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { firebaseAuth } from '../services/firebase'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('tdv_auth_user') : null
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [role, setRole] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('tdv_auth_user') : null
      return saved ? JSON.parse(saved)?.role || 'customer' : 'guest'
    } catch {
      return 'guest'
    }
  })
  const [loading, setLoading] = useState(true)

  const syncWithBackend = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      localStorage.removeItem('tdv_id_token')
      localStorage.removeItem('tdv_auth_user')
      setUser(null)
      setRole('guest')
      return null
    }
    const token = await firebaseUser.getIdToken()
    localStorage.setItem('tdv_id_token', token)

    const isAdminEmail = firebaseUser.email?.toLowerCase() === 'admin@tdv.com'

    const googleMetadata = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      photoURL: firebaseUser.photoURL || null,
      emailVerified: firebaseUser.emailVerified || false,
      creationTime: firebaseUser.metadata?.creationTime || null,
      lastSignInTime: firebaseUser.metadata?.lastSignInTime || null,
      providerId: firebaseUser.providerData?.[0]?.providerId || 'google.com',
      role: isAdminEmail ? 'admin' : 'customer',
    }

    // Immediately set authenticated user state so UI/protected routes don't bounce to /login
    setUser((prev) => ({ ...googleMetadata, ...(prev?.uid === googleMetadata.uid ? prev : {}) }))
    setRole(googleMetadata.role)
    try {
      localStorage.setItem('tdv_auth_user', JSON.stringify(googleMetadata))
    } catch {}

    try {
      const { data } = await authService.sync()
      const payload = data?.data || data || {}
      const dbUser = payload?.user || {}
      const rawRole = payload?.role || (typeof dbUser.role === 'object' ? dbUser.role?.name : dbUser.role)
      const userRole = isAdminEmail ? 'admin' : (rawRole || 'customer')

      const enrichedUser = {
        ...googleMetadata,
        ...dbUser,
        displayName: dbUser.fullName || googleMetadata.displayName,
        photoURL: dbUser.photoUrl || googleMetadata.photoURL,
        emailVerified: dbUser.emailVerified ?? googleMetadata.emailVerified,
        role: userRole,
      }
      setUser(enrichedUser)
      setRole(userRole)
      try {
        localStorage.setItem('tdv_auth_user', JSON.stringify(enrichedUser))
      } catch {}
      return enrichedUser
    } catch {
      const fallbackRole = isAdminEmail ? 'admin' : 'customer'
      const fallbackUser = {
        ...googleMetadata,
        role: fallbackRole,
      }
      setUser(fallbackUser)
      setRole(fallbackRole)
      try {
        localStorage.setItem('tdv_auth_user', JSON.stringify(fallbackUser))
      } catch {}
      return fallbackUser
    }
  }, [])

  useEffect(() => {
    let unsub = () => {}
    try {
      // Process any pending redirect auth result from Google (e.g. mobile redirect)
      firebaseAuth.getRedirectResult?.().then((redirectCred) => {
        if (redirectCred?.user) {
          syncWithBackend(redirectCred.user)
        }
      }).catch((e) => {
        console.warn('[Auth] Redirect result check:', e?.message)
      })

      unsub = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        try {
          await syncWithBackend(firebaseUser)
        } finally {
          setLoading(false)
        }
      })
    } catch {
      setLoading(false)
    }
    return () => unsub()
  }, [syncWithBackend])

  const login = useCallback(async (email, password) => {
    const cred = await firebaseAuth.signInEmail(email, password)
    return syncWithBackend(cred.user)
  }, [syncWithBackend])

  const signup = useCallback(async (email, password, profile = {}) => {
    const cred = await firebaseAuth.signUpEmail(email, password)
    try {
      await authService.register({
        email,
        displayName: profile.displayName,
        phone: profile.phone,
      })
    } catch {
      /* backend may be offline during UI development */
    }
    return syncWithBackend(cred.user)
  }, [syncWithBackend])

  const loginWithGoogle = useCallback(async () => {
    const cred = await firebaseAuth.signInGoogle()
    if (cred?.user) {
      return syncWithBackend(cred.user)
    }
    return null
  }, [syncWithBackend])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      /* ignore offline */
    }
    await firebaseAuth.signOut()
    setUser(null)
    setRole('guest')
    localStorage.removeItem('tdv_id_token')
    localStorage.removeItem('tdv_auth_user')
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: role === 'admin',
      login,
      signup,
      loginWithGoogle,
      logout,
      syncWithBackend,
    }),
    [user, role, loading, login, signup, loginWithGoogle, logout, syncWithBackend]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
