import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../hooks/useCart'
import { triggerHaptic } from '../utils/haptics'

export default function MiniCartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex justify-end pointer-events-auto overflow-hidden"
          style={{ top: 'var(--toolbar-bottom, 64px)' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative z-10 w-full max-w-md bg-[#00192e] text-white h-full shadow-2xl border-l border-white/15 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#001428]">
              <div className="flex items-center gap-2.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <h3 className="font-heading text-lg font-bold text-white">
                  Shopping Cart <span className="text-xs font-mono text-cyan-300 font-normal">({itemCount} items)</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                aria-label="Close cart drawer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/20">
              {items.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/60 mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <h4 className="font-heading text-base font-bold text-white mb-1">Your cart is empty</h4>
                  <p className="text-xs text-white/60 max-w-xs mb-6">
                    Gear up for your next dive with official rash guards, dry bags, and apparel.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      navigate('/shop')
                    }}
                    className="rounded-full bg-accent text-navy px-6 py-2.5 text-xs font-bold hover:bg-white transition cursor-pointer shadow-md"
                  >
                    Explore Merchandise →
                  </button>
                </div>
              ) : (
                items.map((item, idx) => {
                  const p = item.product || item
                  const unitPrice = p.price ?? item.price ?? 0
                  const itemImg = p.image || p.images?.[0] || item.image

                  return (
                    <div
                      key={item.id || item.inventoryId || idx}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                    >
                      <div className="w-16 h-16 rounded-xl bg-navy/40 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {itemImg ? (
                          <img src={itemImg} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-white/40">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-xs font-bold text-white truncate leading-tight">
                          {p.title || p.name || 'Merchandise Item'}
                        </h4>
                        {item.selectedSize && (
                          <span className="text-[10px] text-white/60 block mt-0.5">
                            Size: <strong className="text-cyan-300">{item.selectedSize}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic(5)
                              if (item.quantity > 1) {
                                updateQuantity(item.id || item.inventoryId, item.quantity - 1)
                              } else {
                                removeItem(item.id || item.inventoryId)
                              }
                            }}
                            className="text-xs font-bold text-white/70 hover:text-white px-1 transition"
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-xs font-mono font-bold text-white px-1">
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic(5)
                              updateQuantity(item.id || item.inventoryId, (item.quantity || 1) + 1)
                            }}
                            className="text-xs font-bold text-white/70 hover:text-white px-1 transition"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic(8)
                            removeItem(item.id || item.inventoryId)
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-[#001428] space-y-3">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Total Items</span>
                  <span className="font-heading text-base font-bold text-white">
                    {items.reduce((acc, i) => acc + (i.quantity || 1), 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-center text-xs font-bold text-white transition active:scale-95 cursor-pointer"
                  >
                    View Full Cart
                  </Link>
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="rounded-full bg-accent hover:bg-white hover:text-navy px-4 py-3 text-center text-xs font-extrabold text-navy transition active:scale-95 cursor-pointer shadow-md"
                  >
                    Checkout →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
