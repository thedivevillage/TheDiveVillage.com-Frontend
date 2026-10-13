import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { cartService } from '../services/cartService'
import { CartContext } from './CartContext'
import { useAuth } from '../hooks/useAuth'

function getCartStorageKey(user) {
  if (user?.uid) return `tdv_cart_user_${user.uid}`
  return 'tdv_cart_guest'
}

function loadLocalCart(storageKey) {
  if (!storageKey) return []
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const storageKey = useMemo(() => getCartStorageKey(user), [user])
  const [items, setItems] = useState(() => loadLocalCart(storageKey))
  const [loading, setLoading] = useState(false)
  const activeUserUidRef = useRef(user?.uid || null)
  const prevUidRef = useRef(user?.uid || null)

  // Sync state and load authoritative backend cart when user changes
  useEffect(() => {
    const prevUid = prevUidRef.current
    const curUid = user?.uid || null
    activeUserUidRef.current = curUid
    prevUidRef.current = curUid

    if (!curUid) {
      // Switched to guest mode (logged out) - do not leak previous user's cart
      setItems([])
      localStorage.removeItem('tdv_cart_guest')
      setLoading(false)
      return
    }

    // Switched to logged-in user mode:
    // A brand new account has no cached cart and starts completely empty ([]).
    // An existing account restores its saved cart items indefinitely.
    const cached = loadLocalCart(storageKey)
    const initialItems = Array.isArray(cached) && cached.length > 0 ? cached : []
    setItems(initialItems)

    // Fetch authoritative cart from backend for this user
    let isCancelled = false
    setLoading(true)

    cartService
      .get()
      .then((res) => {
        if (isCancelled || activeUserUidRef.current !== curUid) return
        const backendItems = res?.data?.data?.cart?.items || res?.data?.cart?.items
        if (Array.isArray(backendItems)) {
          const finalItems = backendItems.length > 0 ? backendItems : initialItems
          setItems(finalItems)
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(finalItems))
          }
        }
      })
      .catch(() => {
        /* Keep cached user items on network error */
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [user?.uid, storageKey])

  // Save current items to active storage cache
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(items))
    }
  }, [items, storageKey])

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setItems(loadLocalCart('tdv_cart_guest'))
      return
    }
    setLoading(true)
    try {
      const res = await cartService.get()
      const backendItems = res?.data?.data?.cart?.items || res?.data?.cart?.items
      if (Array.isArray(backendItems)) {
        setItems(backendItems)
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(backendItems))
        }
      }
    } catch {
      /* Keep existing state on error */
    } finally {
      setLoading(false)
    }
  }, [user?.uid, storageKey])

  const addItem = useCallback(
    async (arg1, qtyParam, colorParam, sizeParam) => {
      if (!user?.uid) {
        navigate('/login')
        return false
      }

      let inventoryId, quantity, rawProduct, selectedColor, selectedSize

      if (arg1 && typeof arg1 === 'object' && ('product' in arg1 || 'inventoryId' in arg1)) {
        inventoryId = arg1.inventoryId
        quantity = typeof arg1.quantity === 'number' ? arg1.quantity : 1
        rawProduct = arg1.product || arg1
        selectedColor = arg1.product?.selectedColor || arg1.selectedColor || 'Standard'
        selectedSize = arg1.product?.selectedSize || arg1.selectedSize || 'Standard'
      } else if (arg1 && typeof arg1 === 'object') {
        rawProduct = arg1
        quantity = typeof qtyParam === 'number' ? qtyParam : 1
        selectedColor = colorParam || arg1.colors?.[0]?.name || 'Standard'
        selectedSize = sizeParam || arg1.sizes?.[0] || 'Standard'
        inventoryId = `${arg1.id}-${selectedSize}-${selectedColor}`
      } else {
        return
      }

      const id = inventoryId || `${rawProduct.id || 'item'}-${Date.now()}`
      const name = rawProduct.title || rawProduct.name || 'Dive Gear'
      const price = typeof rawProduct.price === 'number' ? rawProduct.price : parseFloat(rawProduct.price || 0)
      const image = rawProduct.image || (rawProduct.images && rawProduct.images[0]) || ''

      const cleanProduct = {
        ...rawProduct,
        id: rawProduct.id || id,
        name,
        title: name,
        price,
        image,
        selectedColor,
        selectedSize,
      }

      // Optimistic update
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.inventoryId === id || i.id === id || i.product?.id === cleanProduct.id)
        let updated
        if (existingIndex > -1) {
          updated = [...prev]
          const cur = updated[existingIndex]
          updated[existingIndex] = {
            ...cur,
            quantity: cur.quantity + quantity,
            product: cleanProduct,
            subtotal: price * (cur.quantity + quantity),
          }
        } else {
          updated = [
            ...prev,
            {
              id: `temp-${id}-${Date.now()}`,
              inventoryId: id,
              quantity,
              price,
              subtotal: price * quantity,
              product: cleanProduct,
            },
          ]
        }
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        }
        return updated
      })

      // Backend sync
      if (user?.uid) {
        try {
          const res = await cartService.addItem({
            inventoryId: id,
            quantity,
            product: cleanProduct,
            productSnapshot: {
              title: name,
              sku: cleanProduct.id || id,
              price,
              image,
              selectedSize,
              selectedColor,
              category: cleanProduct.category || 'Gear',
            },
          })
          const backendItems = res?.data?.data?.cart?.items || res?.data?.cart?.items
          if (Array.isArray(backendItems) && activeUserUidRef.current === user.uid) {
            setItems(backendItems)
            if (storageKey) {
              localStorage.setItem(storageKey, JSON.stringify(backendItems))
            }
          }
        } catch {
          /* optimistic fallback retained */
        }
      }
    },
    [user?.uid, storageKey]
  )

  const removeItem = useCallback(
    async (itemId) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== itemId && i.inventoryId !== itemId && i.product?.id !== itemId)
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(next))
        }
        return next
      })
      if (user?.uid) {
        try {
          const res = await cartService.removeItem(itemId)
          const backendItems = res?.data?.data?.cart?.items || res?.data?.cart?.items
          if (Array.isArray(backendItems) && activeUserUidRef.current === user.uid) {
            setItems(backendItems)
            if (storageKey) {
              localStorage.setItem(storageKey, JSON.stringify(backendItems))
            }
          }
        } catch {
          /* optimistic */
        }
      }
    },
    [user?.uid, storageKey]
  )

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      const validQty = Math.max(1, parseInt(quantity, 10) || 1)
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === itemId || i.inventoryId === itemId || i.product?.id === itemId
            ? { ...i, quantity: validQty, subtotal: (i.price || i.product?.price || 0) * validQty }
            : i
        )
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(next))
        }
        return next
      })

      if (user?.uid) {
        try {
          const res = await cartService.updateQuantity(itemId, validQty)
          const backendItems = res?.data?.data?.cart?.items || res?.data?.cart?.items
          if (Array.isArray(backendItems) && activeUserUidRef.current === user.uid) {
            setItems(backendItems)
            if (storageKey) {
              localStorage.setItem(storageKey, JSON.stringify(backendItems))
            }
          }
        } catch {
          /* optimistic */
        }
      }
    },
    [user?.uid, storageKey]
  )

  const clearCart = useCallback(async () => {
    setItems([])
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify([]))
    }
    if (user?.uid) {
      try {
        await cartService.clear()
      } catch {
        /* optimistic */
      }
    }
  }, [user?.uid, storageKey])

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [items]
  )

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const price = i.product?.price ?? i.price ?? 0
        return sum + price * (i.quantity || 0)
      }, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      loading,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refresh,
    }),
    [items, loading, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, refresh]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


