import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../utils/formatCurrency'
import { triggerHaptic, triggerSuccessHaptic } from '../utils/haptics'
import Button from '../components/Button'

export default function Wishlist() {
  const { user } = useAuth()
  const { items, count, remove } = useWishlist()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [addedAllToast, setAddedAllToast] = useState(false)
  const [addedToast, setAddedToast] = useState(null)

  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0)
  }, [items])

  const handleAddToCart = (item, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    triggerSuccessHaptic()
    if (!user?.uid) {
      navigate('/login')
      return
    }
    addItem({
      inventoryId: item.inventoryId || `${item.id}-default`,
      quantity: 1,
      product: {
        id: item.id,
        name: item.title || item.name,
        title: item.title || item.name,
        price: item.price,
        image: item.image,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || 'Standard',
      },
    })
    setAddedToast(item.title || item.name)
    setTimeout(() => setAddedToast(null), 3000)
  }

  const handleAddAllToCart = () => {
    if (!user?.uid) {
      navigate('/login')
      return
    }
    triggerSuccessHaptic()
    items.forEach((item) => {
      addItem({
        inventoryId: item.inventoryId || `${item.id}-default`,
        quantity: 1,
        product: {
          id: item.id,
          name: item.title || item.name,
          title: item.title || item.name,
          price: item.price,
          image: item.image,
          selectedSize: item.selectedSize || 'Standard',
          selectedColor: item.selectedColor || 'Standard',
        },
      })
    })
    setAddedAllToast(true)
    setTimeout(() => setAddedAllToast(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-navy font-body pt-20 sm:pt-32 pb-24" style={{ textShadow: 'none' }}>
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">

        {/* Toast Notification */}
        {addedToast && (
          <div className="fixed top-24 right-6 z-[999] bg-navy text-white px-5 py-3 rounded-2xl shadow-float flex items-center gap-3 border border-white/20 text-xs font-bold">
            <span>✓ Added <strong className="text-accent">{addedToast}</strong> to cart!</span>
            <Link to="/cart" className="ml-3 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-white transition">
              View Cart
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-10 border-b border-navy/10 pb-5 sm:pb-6 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 block">Saved Items</span>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-navy tracking-tight">Your Wishlist</h1>
            <p className="mt-1 text-xs sm:text-sm text-navy/60 font-medium">{count} item{count !== 1 && 's'} saved</p>
          </div>
          <Link to="/shop" className="text-xs sm:text-sm font-bold text-navy hover:text-accent transition underline decoration-2 underline-offset-4">
            ← Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center max-w-lg mx-auto bg-white rounded-[40px] p-8 sm:p-12 shadow-card border border-navy/5">
            <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center mx-auto mb-6 shadow-md border border-white/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFCD00" stroke="#FFCD00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h2 className="font-heading text-3xl font-bold mb-3 text-navy">Your wishlist is empty.</h2>
            <p className="text-navy/60 mb-8 text-sm leading-relaxed">
              Explore our ocean-crafted hoodies, pro dive suits, rash guards, and branded essentials, and tap the heart icon on any product to save it here.
            </p>
            <Button as={Link} to="/shop" className="w-full justify-center bg-navy text-white hover:bg-accent">
              Explore Merchandise Store →
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">

            {/* Left Column: Wishlist Items Grid (2 in each row on mobile) */}
            <div className="lg:col-span-8 space-y-4">

              {addedAllToast && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 shadow-soft text-emerald-800 text-xs font-bold flex justify-between items-center">
                  <span>All wishlist items added to your cart!</span>
                  <Link to="/cart" className="underline text-emerald-900">View Cart →</Link>
                </div>
              )}

              {/* 2 in each row just like products page */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/shop/${item.id}`)}
                    className="group rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-2.5 xs:p-3 flex flex-col justify-between cursor-pointer relative transition active:scale-[0.99] hover:shadow-md"
                  >
                    {/* Remove Wishlist Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        triggerHaptic(15)
                        remove(item.id)
                      }}
                      className="absolute top-2.5 right-2.5 z-10 w-7.5 h-7.5 xs:w-8 xs:h-8 rounded-full bg-slate-50/90 border border-slate-200/90 text-[#FFCD00] hover:text-rose-600 flex items-center justify-center shadow-sm transition active:scale-90 cursor-pointer"
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <svg
                        className="w-3.5 h-3.5 xs:w-4 xs:h-4"
                        viewBox="0 0 24 24"
                        fill="#FFCD00"
                        stroke="#FFCD00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>

                    {/* Product Image */}
                    <div className="w-full aspect-[4/5] flex items-center justify-center p-2 mb-1 bg-white">
                      <img
                        src={item.image}
                        alt={item.title || item.name}
                        className="max-h-full max-w-full object-contain mx-auto transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 justify-between mb-2.5">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {item.category || 'MERCH'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs xs:text-[13px] leading-snug line-clamp-2 min-h-[32px] group-hover:text-accent transition">
                          {item.title || item.name}
                        </h3>
                      </div>
                    </div>

                    {/* Add to Cart Yellow Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      className="w-full bg-[#FFCD00] hover:bg-[#FFD700] text-black font-bold py-2 xs:py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs xs:text-sm active:scale-95 transition shadow-sm cursor-pointer"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Wishlist Summary Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[32px] border border-navy/5 p-6 sm:p-8 shadow-card space-y-6 sticky top-28">
                <h2 className="font-heading text-2xl font-bold text-navy">Wishlist Summary</h2>

                <div className="space-y-3 border-y border-navy/10 py-4 text-sm font-medium text-navy/70">
                  <div className="flex justify-between">
                    <span>Saved Items</span>
                    <span className="font-bold text-navy">{count}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddAllToCart}
                    className="w-full rounded-full bg-accent hover:bg-navy text-navy hover:text-white font-bold py-3.5 px-6 text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Add All Items to Cart
                  </button>

                  <Link
                    to="/shop"
                    className="w-full text-center block rounded-full bg-white border-2 border-navy/20 hover:border-navy hover:bg-navy hover:text-white text-navy font-bold py-3 px-6 text-xs transition-all duration-200 shadow-xs cursor-pointer"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
