import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { SHOP_PRODUCTS, GROUP_PHOTOS } from '../utils/products'
import { productService } from '../services/productService'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import SEOHead from '../components/SEOHead'
import { useLenis } from '../utils/lenisReact'
import useNightDive from '../hooks/useNightDive'

import { triggerHaptic, triggerSuccessHaptic } from '../utils/haptics'
const bannerImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791686007/TDV-Media/Merch/banner.jpg';
const pop1Local = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458274/TDV-Media/Products/pop1.webp';
const pop2Local = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458275/TDV-Media/Products/pop2.webp';
const pop1 = pop1Local
const pop2 = pop2Local

const CATEGORIES = [
  { key: 'all', label: 'All Merchandise' },
  { key: 'Tops', label: 'Tops' },
  { key: 'Skin Wear', label: 'Skin Wear' },
  { key: 'Accessories', label: 'Accessories' },
  { key: 'Gear', label: 'Gear' },
  { key: 'Bottoms', label: 'Bottoms' },
]

const MOBILE_PRODUCT_ORDER = [
  'product-womens-shirt',        // Sweetheart neck
  'product-unisex-shorts',       // Shorts Unisex
  'product-half-sleeves-unisex', // Half sleeves
  'product-full-sleeves-unisex', // Full sleeves
  'product-full-suit',           // Unisex Full body skin
  'product-full-wetsuit',        // Wet Suit full length
  'product-womens-pants',        // Bottoms compression
  'product-shortie-wetsuit',     // Wet Suit shortie
  'product-womens-strap',        // Shoulder strap shortie
  'product-ocean-bag',           // Gear Bag
  'product-dive-cap',            // Cap
]

export default function Shop() {
  const isNightDive = useNightDive()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [productsList, setProductsList] = useState(SHOP_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [sortBy, setSortBy] = useState('featured')
  const [priceFilter, setPriceFilter] = useState('all')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [addedToast, setAddedToast] = useState(null)
  const { addItem, itemCount } = useCart()
  const { count: wishlistCount, toggle: toggleWishlist, isWishlisted } = useWishlist()
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await productService.getProducts()
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const merged = SHOP_PRODUCTS.map((staticProd) => {
            const dbProd = res.data.data.find((dp) => dp.id === staticProd.id || dp._id === staticProd.id)
            if (!dbProd) return staticProd
            return {
              ...staticProd,
              ...dbProd,
              glb: staticProd.glb || dbProd.glb,
              glbByColor: staticProd.glbByColor || dbProd.glbByColor,
              images: staticProd.images && staticProd.images.length > 0 ? staticProd.images : dbProd.images,
              imageLabels: staticProd.imageLabels && staticProd.imageLabels.length > 0 ? staticProd.imageLabels : dbProd.imageLabels,
              image: staticProd.image || dbProd.image,
            }
          })
          const extraDbProds = res.data.data.filter(
            (dp) => !SHOP_PRODUCTS.some((sp) => sp.id === dp.id || sp.id === dp._id)
          )
          setProductsList([...merged, ...extraDbProds])
        }
      } catch (err) {
        console.warn('Could not load live products from DB, using fallback:', err)
      }
    }
    loadProducts()
  }, [])

  const handleQuickAdd = (product, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    triggerSuccessHaptic()
    if (!user?.uid) {
      navigate('/login')
      return
    }
    const firstColor = product.colors?.[0]?.name || 'Standard'
    const firstSize = product.sizes?.[0] || 'Standard'
    addItem({
      inventoryId: `${product.id}-${firstSize}-${firstColor}`,
      quantity: 1,
      product: {
        id: product.id,
        name: product.title || product.name,
        title: product.title || product.name,
        price: product.price,
        image: product.image,
        selectedSize: firstSize,
        selectedColor: firstColor,
      },
    })
    setAddedToast(product.title || product.name)
    setTimeout(() => setAddedToast(null), 3000)
  }

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(productsList)) return []
    return productsList.filter((product) => {
      if (!product) return false
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Gear' && (product.category === 'Accessories' || product.category === 'Wetsuits'))

      const titleOrName = (product.title || product.name || '')
      const desc = (product.description || '')
      const query = (deferredSearchQuery || '').toLowerCase()
      const matchesSearch =
        titleOrName.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query)

      let matchesPrice = true
      const numPrice = Number(product.price) || 0
      if (priceFilter === 'under-2500') matchesPrice = numPrice < 2500
      else if (priceFilter === '2500-5000') matchesPrice = numPrice >= 2500 && numPrice <= 5000
      else if (priceFilter === 'above-5000') matchesPrice = numPrice > 5000

      return matchesCategory && matchesSearch && matchesPrice
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a?.price) || 0) - (Number(b?.price) || 0)
      if (sortBy === 'price-high') return (Number(b?.price) || 0) - (Number(a?.price) || 0)
      if (sortBy === 'rating') return (Number(b?.rating) || 5) - (Number(a?.rating) || 5)
      if (isMobile) {
        const idxA = MOBILE_PRODUCT_ORDER.indexOf(a.id)
        const idxB = MOBILE_PRODUCT_ORDER.indexOf(b.id)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
      }
      return 0
    })
  }, [productsList, selectedCategory, deferredSearchQuery, sortBy, priceFilter, isMobile])

  return (
    <div className={`min-h-screen font-body pt-20 md:pt-32 pb-24 overflow-x-hidden transition-colors duration-500 ${isNightDive ? 'bg-[#003865] text-white' : 'bg-[#FAFAFA] text-navy'}`}>
      <SEOHead
        title="Dive Shop & Sustainable Marine Apparel | The Dive Village"
        description="Shop high-performance ocean gear, eco-friendly dive apparel, dive suits, and diving accessories. Designed for comfort, durability, and marine conservation."
        keywords="scuba diving shop, dive gear store, ocean apparel, dive suits, eco-friendly swimsuits, dive village merch"
        canonicalUrl="https://thedivevillage.com/shop"
      />
      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[999] bg-navy text-white px-5 py-3 rounded-2xl shadow-float flex items-center gap-3 border border-white/20 text-xs font-bold"
          >
            <span>✓ Added <strong className="text-accent">{addedToast}</strong> to cart!</span>
            <Link to="/cart" className="ml-3 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-white transition">
              View Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO BANNER */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 mb-4 sm:mb-10">
        <div data-shop-banner="true" className={`shop-hero-banner relative rounded-[20px] sm:rounded-[36px] lg:rounded-[40px] overflow-hidden bg-[#001428] shadow-lift ${isNightDive ? 'border-2 border-[#001C39]' : 'border border-white/10'} w-full h-[180px] xs:h-[220px] sm:h-[300px] md:h-[340px] lg:h-[410px] xl:h-[440px] 2xl:h-[460px] flex items-center justify-end`}>
          <img
            src={bannerImg}
            alt="Merchandise Banner"
            className="w-full h-full object-cover object-center pointer-events-none block"
          />

          {/* Left Side Blue Gradient Overlay */}
          <div
            className="absolute inset-y-0 left-0 w-[34%] xs:w-[32%] sm:w-[36%] lg:w-[32%] pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to right, #003865 0%, rgba(0, 56, 101, 0.92) 30%, rgba(0, 56, 101, 0.70) 60%, rgba(0, 56, 101, 0.30) 85%, transparent 100%)',
            }}
          />

          {/* Left Side Typography: MADE FOR ALL BODY TYPES */}
          <div className="absolute left-3 xs:left-5 sm:left-10 lg:left-14 top-0 bottom-0 flex flex-col justify-center z-20 pointer-events-none w-[36%] xs:w-[34%] sm:max-w-md pr-1 sm:pr-2">
            <h2 className="font-heading text-[12px] xs:text-[14px] sm:text-3xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.08] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] text-left sm:text-justify sm:[text-align-last:justify] mb-0.5 sm:mb-6">
              MADE TO FIT<br />
              <span className="text-[#FFCD00] block mt-0.5 sm:mt-0">ALL BODY TYPES</span>
            </h2>
          </div>

          {/* Right Column: 3D Flipping Product Tag */}
          <div className="absolute right-2 xs:right-3.5 sm:right-8 lg:right-12 top-0 bottom-0 z-10 shrink-0 h-full flex items-center">
            <FlippingProductTag />
          </div>
        </div>
      </section>

      {/* 2. MOBILE STORE CONTROLS (md:hidden - Matches Reference UI) */}
      <section className="md:hidden px-3.5 mb-3">
        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search rash guards, suits, collectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-300/80 bg-white pl-11 pr-9 py-2.5 xs:py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-[#FFCD00] focus:outline-none shadow-sm transition"
          />
          <svg className="absolute left-3.5 top-3 xs:top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 xs:top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
              ✕
            </button>
          )}
        </div>

        {/* Row with Sort Box, Wishlist (Heart only), and Cart on the same line */}
        <div className="flex items-center gap-2 xs:gap-2.5 mt-3">
          {/* Sort Dropdown Box */}
          <div className="relative flex-1 min-w-0">
            <select
              value={sortBy}
              onChange={(e) => {
                triggerHaptic(8)
                setSortBy(e.target.value)
              }}
              style={{ fontSize: '11px' }}
              className="mobile-sort-select w-full appearance-none rounded-2xl border border-slate-300/80 bg-white pl-3 pr-7 h-[42px] font-semibold text-slate-800 shadow-sm focus:outline-none cursor-pointer truncate"
            >
              <option value="featured" style={{ fontSize: '11px' }}>Featured / Newest</option>
              <option value="price-low" style={{ fontSize: '11px' }}>Price: Low to High</option>
              <option value="price-high" style={{ fontSize: '11px' }}>Price: High to Low</option>
              <option value="rating" style={{ fontSize: '11px' }}>Highest Rated</option>
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-3.5 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Wishlist Button: Heart Icon Only */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            title="Wishlist"
            className="relative h-[42px] w-[42px] rounded-2xl bg-white border border-slate-300/80 flex items-center justify-center text-slate-800 shadow-sm active:scale-95 transition shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlistCount > 0 ? '#FFCD00' : 'none'} stroke={wishlistCount > 0 ? '#FFCD00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FFCD00] text-[#001e3d] text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button: Symbol + "Cart" */}
          <Link
            to="/cart"
            className="h-[42px] px-3.5 xs:px-4 rounded-2xl bg-[#FFCD00] hover:bg-[#FFD700] flex items-center justify-center gap-1.5 text-slate-900 font-bold text-xs xs:text-sm shadow-sm active:scale-95 transition shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="bg-[#001e3d] text-[#FFCD00] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ml-0.5">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Category Pills Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3.5 scrollbar-none items-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                triggerHaptic(8)
                setSelectedCategory(cat.key)
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#FFCD00] text-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-300/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Count & Filter Button */}
        <div className="flex items-center justify-between mt-3.5 mb-1 px-0.5">
          <span className="text-sm font-semibold text-slate-600">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="rounded-xl border border-slate-300/80 bg-white px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filter</span>
          </button>
        </div>
      </section>

      {/* 2. DESKTOP STORE CONTROLS TOOLBAR IN BRAND BLUE (hidden md:block - 100% Preserved) */}
      <section className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="rounded-[28px] bg-white md:bg-[#003865] p-4 sm:p-6 shadow-card md:shadow-lift border border-navy/10 md:border-white/15 text-navy md:text-white flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl transition-colors duration-300">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search rash guards, suits, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-navy/15 md:border-white/20 bg-[#F0F2F5] md:bg-[#00223D]/80 pl-12 pr-8 py-3 text-sm text-navy md:text-white placeholder:text-navy/40 md:placeholder:text-white/60 focus:border-accent focus:bg-white md:focus:bg-[#00223D] focus:outline-none transition shadow-inner"
            />
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-navy/40 md:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3.5 text-xs text-navy/50 md:text-white/70 hover:text-accent font-bold cursor-pointer">✕</button>}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
            <span className="text-xs font-extrabold text-navy/60 md:text-cyan-400/90 uppercase tracking-wider whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                triggerHaptic(8)
                setSortBy(e.target.value)
              }}
              style={{ backgroundPosition: 'right 16px center' }}
              className="rounded-full border border-navy/15 md:border-white/20 bg-[#F0F2F5] md:bg-[#00223D]/80 pl-4 pr-10 py-2.5 text-xs sm:text-sm font-bold text-navy md:text-white focus:border-navy/15 md:focus:border-white/20 focus:outline-none focus:ring-0 transition cursor-pointer"
            >
              <option value="featured" className="text-navy bg-white md:bg-[#00223D] md:text-white">Featured / Newest</option>
              <option value="price-low" className="text-navy bg-white md:bg-[#00223D] md:text-white">Price: Low to High</option>
              <option value="price-high" className="text-navy bg-white md:bg-[#00223D] md:text-white">Price: High to Low</option>
              <option value="rating" className="text-navy bg-white md:bg-[#00223D] md:text-white">Highest Rated</option>
            </select>

            <Link
              to="/wishlist"
              className="rounded-full bg-navy/5 md:bg-white/10 hover:!bg-[#FFCD00] hover:!text-[#001e3d] text-navy md:text-white font-bold px-5 py-2.5 text-xs sm:text-sm transition-all duration-200 shadow-sm md:shadow-md flex items-center gap-2 whitespace-nowrap border border-navy/10 md:border-white/20 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-accent text-[#001e3d] text-[11px] font-extrabold px-2 py-0.5 rounded-full ml-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="rounded-full bg-accent hover:bg-white text-navy font-extrabold px-5 py-2.5 text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center gap-2 whitespace-nowrap border border-transparent cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>View Cart</span>
              {itemCount > 0 && (
                <span className="bg-[#001e3d] text-accent text-[11px] font-extrabold px-2 py-0.5 rounded-full ml-0.5">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 mt-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                triggerHaptic(8)
                setSelectedCategory(cat.key)
              }}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${selectedCategory === cat.key
                ? 'bg-accent text-[#001e3d] shadow-md font-extrabold'
                : 'bg-white text-navy/70 border border-navy/10 hover:bg-[#003865] hover:text-white hover:border-[#003865]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PRODUCT LISTINGS */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2 md:py-8">
        <div className="hidden md:flex mb-6 justify-between items-center text-xs font-bold text-navy/60">
          <span>Showing {filteredProducts.length} product{filteredProducts.length !== 1 && 's'}</span>
          {selectedCategory !== 'all' && (
            <button onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="text-accent hover:underline">Clear filters</button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-navy/5 my-8">
            <h3 className="font-heading text-2xl font-bold mb-2">No products matched.</h3>
            <Button onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="bg-navy text-white">Reset Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCardItem
                key={product.id}
                product={product}
                isNightDive={isNightDive}
                onQuickAdd={handleQuickAdd}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  triggerHaptic(15)
                  toggleWishlist(product)
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. GROUP SHOWCASE & COMMUNITY GALLERY */}
      <GroupGallerySection />

      {/* 5. MOBILE FILTER DRAWER MODAL (md:hidden) */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div
            className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-end justify-center pointer-events-auto"
            style={{ top: 'var(--toolbar-bottom, 64px)' }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 text-slate-800 shadow-2xl max-h-[calc(100vh-var(--toolbar-bottom,64px)-16px)] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <h3 className="font-heading text-lg font-bold">Filter Products</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Categories */}
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Category</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8)
                        setSelectedCategory(cat.key)
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                        selectedCategory === cat.key
                          ? 'bg-[#FFCD00] text-black shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Sort By</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'featured', label: 'Featured / Newest' },
                    { val: 'price-low', label: 'Price: Low to High' },
                    { val: 'price-high', label: 'Price: High to Low' },
                    { val: 'rating', label: 'Highest Rated' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8)
                        setSortBy(opt.val)
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold text-left border transition cursor-pointer ${
                        sortBy === opt.val
                          ? 'border-[#FFCD00] bg-[#FFCD00]/20 text-slate-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>


              {/* Footer Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setPriceFilter('all')
                    setSortBy('featured')
                    setSearchQuery('')
                  }}
                  className="rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="rounded-xl bg-[#FFCD00] py-2.5 text-xs font-bold text-black shadow-sm hover:bg-[#FFD700] cursor-pointer"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GroupGallerySection() {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const lenis = useLenis()

  // Lock background scroll when photo preview is open
  useEffect(() => {
    if (!selectedPhoto) return

    if (lenis) lenis.stop()
    const origBodyOverflow = document.body.style.overflow
    const origHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      if (lenis) lenis.start()
      document.body.style.overflow = origBodyOverflow
      document.documentElement.style.overflow = origHtmlOverflow
    }
  }, [selectedPhoto, lenis])

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-navy/10 mt-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-extrabold uppercase tracking-widest text-accent block mb-2">
          Community & Group Moments
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
          The Dive Village Community
        </h2>
        <p className="text-navy/70 text-sm sm:text-base leading-relaxed">
          Behind every dive suit, expedition bag, and rash guard is a vibrant community of divers, ocean lovers, and adventurers exploring the deep blue together.
        </p>
      </div>

      {/* Group Photos Masonry / Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {GROUP_PHOTOS.map((photo, idx) => (
          <div
            key={photo.id || idx}
            onClick={() => {
              triggerHaptic(8)
              setSelectedPhoto(photo)
            }}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-float transition duration-300 border border-navy/5"
          >
            <img
              src={photo.src}
              alt="Community Photo"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal - Clean with No Title */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent="true"
            style={{
              top: 'var(--toolbar-bottom, 64px)',
              overscrollBehavior: 'contain',
              touchAction: 'none',
            }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 cursor-pointer overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] rounded-3xl overflow-hidden bg-navy/95 border border-white/15 shadow-2xl flex flex-col items-center justify-center p-2.5 sm:p-4 cursor-default"
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-accent hover:text-navy flex items-center justify-center transition cursor-pointer font-bold shadow-lg"
                aria-label="Close photo"
              >
                ✕
              </button>
              <img
                src={selectedPhoto.src}
                alt="Community Photo"
                className="max-h-[calc(100vh-var(--toolbar-bottom,64px)-48px)] w-auto max-w-full object-contain rounded-2xl shadow-inner"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function ProductCardItem({ product, onQuickAdd, isWishlisted, onToggleWishlist, isNightDive }) {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [hasHovered, setHasHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const viewerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
      document.head.appendChild(script)
    }
  }, [])

  useEffect(() => {
    let active = true
    const el = viewerRef.current
    if (el) {
      const applyMatte = () => {
        try {
          if (el.model && el.model.materials) {
            el.model.materials.forEach((mat) => {
              if (typeof mat.setDoubleSided === 'function') {
                mat.setDoubleSided(true)
              } else {
                mat.doubleSided = true
              }
              const pbr = mat.pbrMetallicRoughness
              if (pbr) {
                pbr.setRoughnessFactor(1.0)
                pbr.setMetallicFactor(0.0)

                if (pbr.metallicRoughnessTexture && typeof pbr.metallicRoughnessTexture.setTexture === 'function') {
                  try {
                    pbr.metallicRoughnessTexture.setTexture(null)
                  } catch (e) {}
                }
              }
              if (mat.clearcoat) {
                if (typeof mat.clearcoat.setClearcoatFactor === 'function') {
                  mat.clearcoat.setClearcoatFactor(0.0)
                }
                if (typeof mat.clearcoat.setClearcoatRoughnessFactor === 'function') {
                  mat.clearcoat.setClearcoatRoughnessFactor(1.0)
                }
              }
              if (mat.specular) {
                if (typeof mat.specular.setSpecularFactor === 'function') {
                  mat.specular.setSpecularFactor(0.0)
                }
                if (typeof mat.specular.setSpecularColorFactor === 'function') {
                  mat.specular.setSpecularColorFactor([0, 0, 0])
                }
              }
              if (mat.ior && typeof mat.ior.setIor === 'function') {
                try {
                  mat.ior.setIor(1.0)
                } catch (e) {}
              }
            })
          }

          // Deep recursive traversal across all Three.js materials
          const visited = new Set()
          const threeMaterials = new Set()

          const scan = (obj, depth = 0) => {
            if (!obj || depth > 6 || visited.has(obj) || typeof obj !== 'object') return
            visited.add(obj)

            if (obj.isMaterial) {
              threeMaterials.add(obj)
              return
            }
            if (obj.isMesh && obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((m) => threeMaterials.add(m))
              } else {
                threeMaterials.add(obj.material)
              }
            }
            if (obj.isScene || obj.isObject3D) {
              obj.traverse((node) => {
                if (node.isMesh && node.material) {
                  if (Array.isArray(node.material)) {
                    node.material.forEach((m) => threeMaterials.add(m))
                  } else {
                    threeMaterials.add(node.material)
                  }
                }
              })
              return
            }

            if (typeof obj.forEach === 'function') {
              try {
                obj.forEach((item) => scan(item, depth + 1))
              } catch (e) {}
            }

            Object.getOwnPropertySymbols(obj).forEach((sym) => {
              try {
                scan(obj[sym], depth + 1)
              } catch (e) {}
            })

            Object.getOwnPropertyNames(obj).forEach((key) => {
              try {
                scan(obj[key], depth + 1)
              } catch (e) {}
            })
          }

          scan(el)
          if (el.model) scan(el.model)

          threeMaterials.forEach((threeMat) => {
            if (!threeMat || !threeMat.isMaterial) return

            // Soft matte finish - zero shine/gloss, gentle fabric texture
            threeMat.roughness = 0.9
            threeMat.metalness = 0.0

            // Rich ambient diffuse lighting so garments are brightly lit and fully visible
            threeMat.envMapIntensity = 0.95

            if ('clearcoat' in threeMat) threeMat.clearcoat = 0.0
            if ('clearcoatRoughness' in threeMat) threeMat.clearcoatRoughness = 1.0
            if ('clearcoatMap' in threeMat) threeMat.clearcoatMap = null
            if ('clearcoatNormalMap' in threeMat) threeMat.clearcoatNormalMap = null
            if ('sheen' in threeMat) threeMat.sheen = 0.0
            if ('specularIntensity' in threeMat) threeMat.specularIntensity = 0.0
            if ('specularIntensityMap' in threeMat) threeMat.specularIntensityMap = null
            if (threeMat.specularColor && typeof threeMat.specularColor.set === 'function') {
              threeMat.specularColor.set(0, 0, 0)
            }
            if ('specularColorMap' in threeMat) threeMat.specularColorMap = null
            if ('ior' in threeMat) threeMat.ior = 1.0
            if ('reflectivity' in threeMat) threeMat.reflectivity = 0.0

            // Natural fabric drape and fold definition
            if (threeMat.normalScale && typeof threeMat.normalScale.set === 'function') {
              threeMat.normalScale.set(0.75, 0.75)
            }

            // Lift dark tones so black models have rich graphite visibility instead of pitch-dark silhouettes
            if (threeMat.color) {
              threeMat.color.r = Math.max(threeMat.color.r, 0.22)
              threeMat.color.g = Math.max(threeMat.color.g, 0.22)
              threeMat.color.b = Math.max(threeMat.color.b, 0.22)
            }

            threeMat.needsUpdate = true
          })
        } catch (e) { }
      }

      const runMatte = () => {
        if (!active) return
        setIsLoaded(true)
        applyMatte()
        setTimeout(applyMatte, 150)
        setTimeout(applyMatte, 600)
      }

      if (el.loaded) {
        runMatte()
      }
      const handleLoad = () => {
        runMatte()
      }
      el.addEventListener('load', handleLoad)
      return () => {
        active = false
        if (el) {
          el.removeEventListener('load', handleLoad)
        }
      }
    }
    const fallbackTimer = setTimeout(() => {
      if (active) setIsLoaded(true)
    }, 300)
    return () => {
      active = false
      clearTimeout(fallbackTimer)
    }
  }, [product?.glb, hasHovered])

  const show3D = isHovered && hasHovered

  return (
    <>
      {/* MOBILE PRODUCT CARD (md:hidden - White Card) */}
      <div
        data-product-card="true"
        onClick={() => navigate(`/shop/${product.id}`)}
        style={{ backgroundColor: '#ffffff' }}
        className="md:hidden group rounded-2xl bg-white border border-slate-200/90 text-navy shadow-sm p-2.5 xs:p-3 flex flex-col justify-between cursor-pointer relative transition active:scale-[0.99]"
      >
        {/* Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleWishlist(e)
          }}
          className="product-wishlist-btn absolute top-2.5 right-2.5 z-10 w-7.5 h-7.5 xs:w-8 xs:h-8 rounded-full bg-slate-100/90 border border-slate-200/90 text-slate-700 flex items-center justify-center shadow-sm transition active:scale-90 hover:text-red-500 cursor-pointer"
          aria-label="Wishlist"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <svg
            className="w-3.5 h-3.5 xs:w-4 xs:h-4"
            viewBox="0 0 24 24"
            fill={isWishlisted ? '#FFCD00' : 'none'}
            stroke={isWishlisted ? '#FFCD00' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Product Image */}
        <div data-product-media="true" style={{ backgroundColor: '#ffffff' }} className="w-full aspect-[4/5] flex items-center justify-center p-2 mb-1 bg-white">
          <img
            src={product.image}
            alt={product.title || product.name}
            className="max-h-full max-w-full object-contain mx-auto"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 justify-between mb-2.5">
          <div>
            <span className="product-card-category text-[10px] font-semibold uppercase tracking-wider text-[#00AEC7] block mb-0.5">
              {product.category || 'MERCH'}
            </span>
            <h3 className="product-card-title font-bold text-navy text-xs xs:text-[13px] leading-snug line-clamp-2 min-h-[32px]">
              {product.title || product.name}
            </h3>
          </div>
        </div>

        {/* Add to Cart Yellow Button */}
        <button
          type="button"
          onClick={(e) => onQuickAdd(product, e)}
          className="product-add-btn-mobile w-full bg-[#FFCD00] hover:bg-[#FFD700] text-black font-bold py-2 xs:py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs xs:text-sm active:scale-95 transition shadow-sm cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>

      {/* DESKTOP PRODUCT CARD (hidden md:flex - White Card) */}
      <div
        data-product-card="true"
        onClick={() => navigate(`/shop/${product.id}`)}
        onMouseEnter={() => {
          setIsHovered(true)
          setHasHovered(true)
        }}
        onMouseLeave={() => setIsHovered(false)}
        style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
        className="hidden md:flex group rounded-2xl sm:rounded-[32px] bg-white border border-navy/10 text-navy p-3 sm:p-6 shadow-card hover:shadow-float transition duration-300 flex-col justify-between cursor-pointer relative"
      >
        <div style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
          <div data-product-media="true" style={{ backgroundColor: '#ffffff', background: '#ffffff' }} className="relative mb-3 sm:mb-5">
            <div data-product-media="true" style={{ backgroundColor: '#ffffff', background: '#ffffff' }} className="aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white flex items-center justify-center p-2.5 sm:p-4 relative">
              {/* Low-contrast Skeleton Shimmer Placeholder */}
              {!imgLoaded && (
                <div className="absolute inset-0 skeleton-shimmer bg-navy/5 z-0" aria-hidden="true" />
              )}
              <img
                src={product.image}
                alt={product.title}
                onLoad={() => setImgLoaded(true)}
                data-product-media="true"
                style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
                className={`max-h-full max-w-full object-contain relative z-[1] transition-opacity duration-300 ${!imgLoaded ? 'opacity-0' : 'opacity-100'}`}
              />
              {product.glb && hasHovered && (
                <div
                  data-product-media="true"
                  style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
                  className={`absolute inset-0 w-full h-full z-10 bg-white flex items-center justify-center transition-opacity duration-300 cursor-grab active:cursor-grabbing ${show3D ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                >
                  <model-viewer
                    ref={viewerRef}
                    data-product-media="true"
                    src={product.glb}
                    alt={product.title}
                    loading="eager"
                    reveal="auto"
                    auto-rotate
                    auto-rotate-delay="0"
                    rotation-per-second="28deg"
                    camera-orbit="0deg 75deg 120%"
                    camera-target="auto auto auto"
                    disable-zoom
                    disable-pan
                    min-camera-orbit="auto 75deg auto"
                    max-camera-orbit="auto 75deg auto"
                    interaction-prompt="none"
                    environment-image="neutral"
                    exposure="1.85"
                    shadow-intensity="0.10"
                    shadow-softness="1.0"
                    tone-mapping="neutral"
                    bounds="tight"
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#ffffff',
                      background: '#ffffff',
                      '--poster-color': '#ffffff',
                      '--progress-bar-color': 'transparent',
                      '--progress-bar-height': '0px',
                      '--progress-mask': 'transparent',
                    }}
                  >
                    <div slot="progress-bar" style={{ display: 'none' }} />
                    <div slot="poster" data-product-media="true" style={{ backgroundColor: '#ffffff', background: '#ffffff' }} className="w-full h-full flex items-center justify-center p-4 bg-white">
                      <img src={product.image} alt={product.title} data-product-media="true" style={{ backgroundColor: '#ffffff', background: '#ffffff' }} className="max-h-full max-w-full object-contain bg-white" />
                    </div>
                  </model-viewer>
                </div>
              )}
            </div>
          </div>

          <div className="mb-2 sm:mb-4">
            <span className="product-card-category text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#00AEC7] block mb-0.5 sm:mb-1">{product.category}</span>
            <h3 className="product-card-title font-heading text-xs xs:text-sm sm:text-xl font-bold text-navy leading-tight sm:leading-snug transition line-clamp-2 sm:line-clamp-none">{product.title}</h3>
            <p className="product-card-desc text-[10px] sm:text-xs text-navy/70 line-clamp-1 sm:line-clamp-2 mt-1 sm:mt-2 leading-relaxed hidden xs:block">{product.description}</p>
          </div>
        </div>

        <div className="pt-2 sm:pt-4 border-t border-navy/10 flex items-center justify-between gap-1.5 sm:gap-3">
          <span className="product-card-inquire text-[9px] sm:text-[10px] text-emerald-600 font-bold hidden sm:inline">Inquire within</span>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={onToggleWishlist}
              className="product-wishlist-btn w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-navy/5 hover:bg-navy border border-navy/15 text-navy hover:text-white flex items-center justify-center shadow-sm transition duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
              aria-label="Wishlist"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]"
                viewBox="0 0 24 24"
                fill={isWishlisted ? '#FFCD00' : 'none'}
                stroke={isWishlisted ? '#FFCD00' : 'currentColor'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            <button onClick={(e) => onQuickAdd(product, e)} className="product-add-btn rounded-full bg-navy text-white px-3 py-1.5 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs font-bold hover:bg-[#00AEC7] hover:text-navy active:scale-95 transition shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function programTag(tag) {
  return tag || 'Official'
}

function FlippingProductTag() {
  return (
    <>
      <style>
        {`
          @keyframes spinY {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(-360deg); }
          }
        `}
      </style>
      <div className="relative h-full flex flex-col items-center justify-center select-none py-2 sm:py-4 group cursor-pointer">
        {/* Hanging Cord */}
        <div className="w-0.5 h-1.5 xs:h-2 sm:h-3.5 lg:h-4 bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.7)] mb-[-2px] relative z-20 shrink-0 pointer-events-none">
          <div className="w-1 xs:w-1.5 sm:w-2 h-1 xs:h-1.5 sm:h-2 rounded-full bg-white -top-1 -left-[2px] sm:-left-[3px] absolute shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
        </div>

        {/* 3D Perspective Container matched to exact 447x864 image aspect ratio */}
        <div className="perspective-1000 h-[68px] xs:h-[82px] sm:h-[160px] lg:h-[195px] aspect-[447/864] relative">
          <div
            className="w-full h-full preserve-3d relative rounded-xl sm:rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.4)] animate-[spinY_18s_linear_infinite] group-hover:[animation-play-state:paused]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* FRONT SIDE (pop1.webp) */}
            <div
              className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden backface-hidden bg-transparent"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <img
                src={pop1}
                alt="Product Tag Front"
                className="w-full h-full object-fill rounded-xl sm:rounded-2xl pointer-events-none"
              />
            </div>

            {/* BACK SIDE (pop2.webp) */}
            <div
              className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden backface-hidden bg-transparent"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <img
                src={pop2}
                alt="Product Tag Back"
                className="w-full h-full object-fill rounded-xl sm:rounded-2xl pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
