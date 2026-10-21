import { Link, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Badge from './Badge'
import Button from './Button'
import SafeImage from './SafeImage'
import QuantitySelector from './QuantitySelector'
import { formatCurrency } from '../utils/formatCurrency'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../hooks/useAuth'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const reduce = useReducedMotion()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  const inCartQty = (items || [])
    .filter((i) => i.product?.id === product.id || i.inventoryId?.startsWith(product.id) || i.id === product.id)
    .reduce((sum, i) => sum + (i.quantity || 0), 0)

  const [quantity, setQuantity] = useState(() => (inCartQty > 0 ? inCartQty : 0))

  useEffect(() => {
    if (inCartQty > 0 && quantity < 1) {
      setQuantity(inCartQty)
    }
  }, [inCartQty])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const onAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const qtyToAdd = Math.max(1, quantity)
    addItem({
      inventoryId: product.inventoryId || product.id,
      quantity: qtyToAdd,
      product: {
        id: product.id,
        name: product.name || product.title,
        price: product.price,
        image: product.image,
      },
    })
    if (quantity < 1) {
      setQuantity(1)
    }
  }

  const wishlisted = isWishlisted(product.id)

  return (
    <motion.article
      whileHover={reduce || isMobile ? undefined : { y: -6, scale: 1.02 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex flex-col overflow-hidden rounded-card bg-white/10 backdrop-blur-md border border-white/20 shadow-card hover:shadow-lift"
    >
      <Link to={`/shop/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <SafeImage
          src={product.image}
          alt={product.name || product.title}
          className="absolute inset-0 h-full w-full"
          imgClassName="transition duration-500 sm:hover:scale-105"
        />
        {product.badge && (
          <div className="absolute left-3 top-3">
            <Badge tone={product.badgeTone || 'accent'}>{product.badge}</Badge>
          </div>
        )}
        {product.glb && (
          <div className="absolute right-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 bg-[#FFCD00] text-gray-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#e6b800] shadow-xs pointer-events-none">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
              <span>3D</span>
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={`/shop/${product.id}`} className="group">
          <h3 className="font-heading text-base font-bold text-white transition duration-hover group-hover:text-accent">
            {product.name || product.title}
          </h3>
          <p className="mt-1 text-sm text-white/70">{product.category}</p>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
          <QuantitySelector
            value={quantity}
            onChange={(newQty) => setQuantity(newQty)}
            min={inCartQty > 0 ? 1 : 0}
            max={99}
            size="sm"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Button type="button" onClick={onAdd} className="!px-4 !py-2 text-xs">
                Add to Cart
              </Button>
              {inCartQty > 0 && (
                <span className="bg-[#FFCD00] text-black font-extrabold text-xs px-2 py-1 rounded-md border border-black/15 shadow-xs">
                  +{inCartQty}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleWishlist(product)
              }}
              className="w-8 h-8 rounded-full bg-navy/80 border border-white/30 flex items-center justify-center shadow-md transition duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
              aria-label="Wishlist"
              title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={wishlisted ? '#FFCD00' : 'none'}
                stroke={wishlisted ? '#FFCD00' : 'white'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
