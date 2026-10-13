import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { WishlistContext } from './WishlistContext'
import { useAuth } from '../hooks/useAuth'

function getWishlistStorageKey(user) {
  if (user?.uid) return `tdv_wishlist_user_${user.uid}`
  return 'tdv_wishlist_guest'
}

function loadWishlist(storageKey) {
  if (!storageKey) return []
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw)
    // One-time fallback migration for legacy global key into guest storage
    const legacy = localStorage.getItem('tdv_wishlist_v1')
    if (legacy && storageKey === 'tdv_wishlist_guest') {
      localStorage.removeItem('tdv_wishlist_v1')
      return JSON.parse(legacy)
    }
    return []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const storageKey = useMemo(() => getWishlistStorageKey(user), [user])
  const [items, setItems] = useState(() => loadWishlist(storageKey))
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)
  const prevUidRef = useRef(user?.uid || null)

  // Sync wishlist whenever user logs in or logs out
  useEffect(() => {
    const prevUid = prevUidRef.current
    const curUid = user?.uid || null
    prevUidRef.current = curUid

    if (!curUid) {
      // Switched to guest mode (logged out) - do not leak previous user's wishlist
      setItems([])
      localStorage.removeItem('tdv_wishlist_guest')
      return
    }

    // Switched to logged-in user mode:
    // A brand new account starts completely empty ([]).
    // An existing account restores its saved wishlist items indefinitely until removed.
    const userWishlist = loadWishlist(`tdv_wishlist_user_${curUid}`)
    setItems(Array.isArray(userWishlist) && userWishlist.length > 0 ? userWishlist : [])
  }, [user?.uid])

  // Persist items to active storage key
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(items))
    }
  }, [items, storageKey])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const showToast = useCallback((name, type = 'added') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToast({ name, type })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 3000)
  }, [])

  const toggle = useCallback(
    (product) => {
      const productName = product?.title || product?.name || 'Item'
      setItems((prev) => {
        const exists = prev.some((i) => i.id === product.id)
        let next
        if (exists) {
          showToast(productName, 'removed')
          next = prev.filter((i) => i.id !== product.id)
        } else {
          showToast(productName, 'added')
          next = [...prev, product]
        }
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(next))
        }
        return next
      })
    },
    [showToast, storageKey]
  )

  const remove = useCallback(
    (id) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id)
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(next))
        }
        return next
      })
    },
    [storageKey]
  )

  const isWishlisted = useCallback(
    (id) => items.some((i) => i.id === id),
    [items]
  )

  const value = useMemo(
    () => ({ items, toggle, remove, isWishlisted, count: items.length }),
    [items, toggle, remove, isWishlisted]
  )

  return (
    <WishlistContext.Provider value={value}>
      {/* Wishlist Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 right-6 z-[9999] bg-navy text-white px-5 py-3.5 rounded-2xl shadow-float flex items-center gap-3 border border-white/20 text-xs font-bold pointer-events-auto"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFCD00] text-navy font-bold text-xs shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            <div className="pr-1">
              <p className="text-[11px] text-white/70 font-medium">
                {toast.type === 'added' ? 'Wishlist Updated' : 'Wishlist'}
              </p>
              <p className="text-xs font-bold">
                {toast.type === 'added' ? (
                  <>
                    Added <strong className="text-accent">{toast.name}</strong> to wishlist!
                  </>
                ) : (
                  <>
                    Removed <strong className="text-accent">{toast.name}</strong> from wishlist
                  </>
                )}
              </p>
            </div>
            {toast.type === 'added' && (
              <Link
                to="/wishlist"
                onClick={() => setToast(null)}
                className="ml-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-white transition whitespace-nowrap shadow-sm"
              >
                View Wishlist
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </WishlistContext.Provider>
  )
}

