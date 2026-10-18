import { useParams, Link, useNavigate } from 'react-router'
import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SHOP_PRODUCTS } from '../utils/products'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../hooks/useAuth'
import Product3DViewer from '../components/Product3DViewer'
import SEOHead from '../components/SEOHead'
import { triggerHaptic, triggerSuccessHaptic } from '../utils/haptics'
import { shareContent } from '../utils/share'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()

  // Find product
  const product = SHOP_PRODUCTS.find((p) => p.id === id) || SHOP_PRODUCTS[0]

  // Color / Variant selection
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Standard', hex: '#000000' }
  )

  // Sizing setup: "One Size Fits Most" for accessories, and two size buttons for apparel
  const isAccessory = product.category === 'Accessories' || product.id === 'product-dive-cap' || product.id === 'product-ocean-bag'
  
  // Available size options: Only two buttons for apparel: XS - M and L -XXL
  const availableSizes = useMemo(() => {
    if (isAccessory) return ['One Size Fits Most']
    return ['XS - M', 'L -XXL']
  }, [isAccessory])

  const [selectedSize, setSelectedSize] = useState(() => {
    if (isAccessory) return 'One Size Fits Most'
    return 'XS - M'
  })

  // Mobile / Tablet Carousel Slider state
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0)
  const mobileTouchStartX = useRef(0)
  const mobileTouchStartY = useRef(0)

  const handleMobileTouchStart = (e) => {
    mobileTouchStartX.current = e.touches[0].clientX
    mobileTouchStartY.current = e.touches[0].clientY
  }

  const handleMobileTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - mobileTouchStartX.current
    const deltaY = e.changedTouches[0].clientY - mobileTouchStartY.current
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        setMobileSlideIndex((prev) => (prev + 1) % productImages.length)
        triggerHaptic(6)
      } else {
        setMobileSlideIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
        triggerHaptic(6)
      }
    }
  }

  // Native & Social Share Sheet
  const handleShareClick = async () => {
    triggerHaptic(8)
    const productUrl = window.location.href
    const titleText = `${product.title || product.name} | The Dive Village`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: titleText,
          text: product.description,
          url: productUrl,
        })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    const result = await shareContent({
      title: titleText,
      text: product.description,
      url: productUrl,
      imageUrl: product.image,
    })
    if (result?.copied) {
      setToastMessage('Product link copied to clipboard!')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const [quantity, setQuantity] = useState(1)
  const [toastMessage, setToastMessage] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  // Pincode checker state
  const [pincode, setPincode] = useState('')
  const [pincodeStatus, setPincodeStatus] = useState(null) // null | 'checking' | 'valid' | 'invalid'

  // Modals state
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySuccess, setNotifySuccess] = useState(false)

  // Accordion state
  const [expandedAccordion, setExpandedAccordion] = useState('details') // 'details' | 'care' | 'sizing' | '3d' | null

  // Lightbox Modal state (when user taps on an image)
  const [modalActiveImage, setModalActiveImage] = useState(null) // image url string or null
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // 3D View toggle (if 3D GLB model exists)
  const [view3DMode, setView3DMode] = useState(false)

  // Build product images list (switches between Yellow photos and Grey photos for full body skin)
  const productImages = useMemo(() => {
    if (product.id === 'product-full-suit') {
      const activeColorObj = product.colors?.find((c) => c.name === selectedColor?.name)
      if (activeColorObj?.images && activeColorObj.images.length > 0) {
        return activeColorObj.images
      }
      if (selectedColor?.name?.toLowerCase().includes('grey') && product.images && product.images.length > 5) {
        return product.images.slice(5)
      } else if (product.images && product.images.length > 5) {
        return product.images.slice(0, 5)
      }
    }
    if (product.images && product.images.length > 0) {
      return product.images
    }
    if (product.image) {
      return [product.image]
    }
    return []
  }, [product, selectedColor])

  // Get active GLB model
  const activeGlb = (product.glbByColor && product.glbByColor[selectedColor?.name]) || product.glb

  // Badge text for image 0 (e.g. | RELAXED FIT / | 4-WAY STRETCH)
  const mainBadgeText = useMemo(() => {
    if (product.category === 'Tops') return 'ADAPTIVE FIT'
    if (product.category === 'Bottoms') return 'COMPRESSION SUPPORT'
    if (product.category === 'Wetsuits') return '3MM SUPER-STRETCH'
    if (product.category === 'Skin Wear') return 'UV 50+ SUN GUARD'
    if (product.category === 'Accessories') return 'DIVE GRADE'
    return 'PREMIUM DIVE WEAR'
  }, [product])


  // Reset states and scroll position when ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (typeof window !== 'undefined' && window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(0, { immediate: true, force: true })
    }

    const p = SHOP_PRODUCTS.find((item) => item.id === id) || SHOP_PRODUCTS[0]
    const initialColor = p.colors && p.colors.length > 0 ? p.colors[0] : { name: 'Standard', hex: '#000000' }
    setSelectedColor(initialColor)
    
    if (p.category === 'Accessories' || p.id === 'product-dive-cap' || p.id === 'product-ocean-bag') {
      setSelectedSize('One Size Fits Most')
    } else {
      setSelectedSize('XS - M')
    }
    
    setQuantity(1)
    setPincode('')
    setPincodeStatus(null)
    setModalActiveImage(null)
    setView3DMode(false)
    setMobileSlideIndex(0)
  }, [id])

  // Keyboard navigation for Lightbox Modal
  useEffect(() => {
    if (!modalActiveImage) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalActiveImage(null)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextModalImage()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevModalImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [modalActiveImage, modalImageIndex, productImages])

  // Modal navigation helpers
  const handleOpenModal = (imgSrc, index) => {
    triggerHaptic(8)
    setModalActiveImage(imgSrc)
    setModalImageIndex(index)
  }

  const handleNextModalImage = () => {
    if (!productImages.length) return
    triggerHaptic(8)
    const nextIdx = (modalImageIndex + 1) % productImages.length
    setModalImageIndex(nextIdx)
    setModalActiveImage(productImages[nextIdx])
  }

  const handlePrevModalImage = () => {
    if (!productImages.length) return
    triggerHaptic(8)
    const prevIdx = (modalImageIndex - 1 + productImages.length) % productImages.length
    setModalImageIndex(prevIdx)
    setModalActiveImage(productImages[prevIdx])
  }

  // Touch swipe support for Modal
  const modalTouchStartX = useRef(0)
  const modalTouchStartY = useRef(0)

  const handleModalTouchStart = (e) => {
    modalTouchStartX.current = e.touches[0].clientX
    modalTouchStartY.current = e.touches[0].clientY
  }

  const handleModalTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - modalTouchStartX.current
    const deltaY = e.changedTouches[0].clientY - modalTouchStartY.current
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNextModalImage()
      } else {
        handlePrevModalImage()
      }
    }
  }

  // Add to Cart handler
  const handleAddToCart = () => {
    triggerSuccessHaptic()
    if (!user?.uid) {
      navigate('/login')
      return
    }
    setIsAdding(true)

    const mappedSize = selectedSize
    const colorName = (product.colors && product.colors.length > 0 && selectedColor?.name) ? selectedColor.name : 'Standard'
    
    addItem({
      inventoryId: `${product.id}-${selectedSize}-${colorName}`,
      quantity,
      product: {
        id: product.id,
        name: product.title || product.name,
        price: product.price,
        image: product.images ? product.images[0] : product.image,
        selectedSize: mappedSize,
        selectedColor: colorName,
      },
    })

    const colorText = product.colors && product.colors.length > 0 && colorName !== 'Standard' ? ` / ${colorName}` : ''
    setToastMessage(`Added ${quantity}x ${product.title} (${selectedSize}${colorText}) to cart`)
    setTimeout(() => {
      setIsAdding(false)
      setToastMessage(null)
    }, 3500)
  }

  // Pincode validation
  const handleCheckPincode = (e) => {
    e.preventDefault()
    if (!pincode || pincode.trim().length !== 6 || isNaN(pincode)) {
      setPincodeStatus('invalid')
      return
    }
    setPincodeStatus('checking')
    setTimeout(() => {
      setPincodeStatus('valid')
    }, 400)
  }

  // Share handlers
  const handleSocialShare = async (platform) => {
    triggerHaptic(8)
    const productUrl = window.location.href
    const titleText = `${product.title || product.name} | The Dive Village`
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${titleText} - ${productUrl}`)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank')
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(titleText)}&url=${encodeURIComponent(productUrl)}`, '_blank')
    } else if (platform === 'instagram' || platform === 'copy') {
      const result = await shareContent({
        title: titleText,
        text: product.description,
        url: productUrl,
        imageUrl: product.image,
      })
      if (result?.copied) {
        setToastMessage('Product link copied to clipboard!')
        setTimeout(() => setToastMessage(null), 3000)
      }
    }
  }

  // Notify submit handler
  const handleNotifySubmit = (e) => {
    e.preventDefault()
    if (!notifyEmail) return
    triggerSuccessHaptic()
    setNotifySuccess(true)
    setTimeout(() => {
      setIsNotifyOpen(false)
      setNotifySuccess(false)
      setNotifyEmail('')
    }, 2000)
  }

  // Related products
  const relatedProducts = useMemo(() => {
    return SHOP_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 6)
  }, [product.id])

  // Variants: Show ONLY for the full body skins with the yellow and grey variant
  const hasVariants = Boolean(product.id === 'product-full-suit' || (product.colors && product.colors.length > 1))

  const variantLooks = useMemo(() => {
    if (!hasVariants) return []

    return (product.colors || []).map((c, i) => {
      const isYellow = c.name?.toLowerCase().includes('yellow') || c.label?.toLowerCase() === 'yellow' || i === 0
      const isGrey = c.name?.toLowerCase().includes('grey') || c.label?.toLowerCase() === 'grey' || i === 1
      const variantTitle = isYellow ? 'Yellow' : isGrey ? 'Grey' : (c.label || c.name)

      return {
        id: `variant-${c.name || i}`,
        title: variantTitle,
        color: c,
        image: c.image || product.images?.[i] || product.image,
        active: selectedColor?.name === c.name,
      }
    })
  }, [hasVariants, product, selectedColor])

  return (
    <div 
      data-product-subpage="true" 
      data-bg-white="true"
      className="relative z-10 min-h-screen bg-white text-gray-900 font-body select-none pt-[72px] sm:pt-[76px] lg:pt-[82px] pb-32 lg:pb-24"
      style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#111827' }}
    >
      <SEOHead
        title={`${product.title || product.name} | The Dive Village Store`}
        description={`${product.description}. Premium quality ocean apparel and dive wear.`}
        keywords={`${product.title}, dive wear, ocean apparel, ${product.category}, The Dive Village`}
        canonicalUrl={`https://thedivevillage.com/shop/${product.id}`}
        ogImage={product.image || product.images?.[0]}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-[9999] rounded-xl bg-gray-900 text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-gray-700"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shrink-0">
              ✓
            </span>
            <div className="text-xs sm:text-sm font-medium">
              {toastMessage}
            </div>
            <Link
              to="/cart"
              className="ml-2 rounded-md bg-[#e11b22] text-white hover:bg-[#c81017] px-3 py-1 text-xs font-bold uppercase transition"
            >
              Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20">
        
        {/* Back To Shop redirect */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-950 transition-colors uppercase tracking-wider group cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform group-hover:-translate-x-1"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back To Shop</span>
          </Link>
        </div>

        {/* =========================================================================
            MOBILE & TABLET VIEW (< lg)
            Matching the User's Reference Screenshot
            ========================================================================= */}
        <div className="lg:hidden flex flex-col gap-4 max-w-lg mx-auto w-full mb-12">
          {/* Top Media Carousel with Dots */}
          <div className="w-full">
            {view3DMode && activeGlb ? (
              <div className="w-full flex flex-col">
                <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] max-h-[580px] bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex items-center justify-center">
                  <Product3DViewer
                    key={activeGlb}
                    src={activeGlb}
                    alt={product.title}
                    productId={product.id}
                    poster={product.image}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8)
                      setView3DMode(false)
                    }}
                    className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-900 text-[#FFCD00] border border-[#FFCD00] shadow-md cursor-pointer"
                  >
                    View Photos
                  </button>
                </div>

                {/* Visible below the display view box */}
                <div className="flex items-center justify-center gap-1.5 pt-2.5 pb-1 text-gray-500 text-xs font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                  <span>Drag with finger to rotate 360°</span>
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                {/* Swipeable Track */}
                <div
                  className="relative w-full aspect-[3/4] max-h-[560px] bg-[#F7F8F9] rounded-lg overflow-hidden border border-gray-150 touch-pan-y"
                  onTouchStart={handleMobileTouchStart}
                  onTouchEnd={handleMobileTouchEnd}
                >
                  <div
                    className="flex w-full h-full transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${mobileSlideIndex * 100}%)` }}
                  >
                    {productImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="w-full h-full shrink-0 relative cursor-pointer flex items-center justify-center p-2 sm:p-3"
                        onClick={() => handleOpenModal(imgSrc, idx)}
                      >
                        <img
                          src={imgSrc}
                          alt={`${product.title} - view ${idx + 1}`}
                          className="w-full h-full object-contain"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                        />

                        {/* Top-Left Corner Badge on first image */}
                        {idx === 0 && (
                          <div className="absolute top-3 left-3 z-10 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-gray-800 uppercase tracking-wider rounded-xs shadow-xs border border-gray-200/60">
                              <span className="text-gray-400">|</span>
                              <span>{mainBadgeText}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 3D Model toggle pill in bottom right (so it never collides with top-left badge) */}
                  {activeGlb && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        triggerHaptic(8)
                        setView3DMode(true)
                      }}
                      className="btn-view-3d absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#FFCD00] text-gray-950 border border-[#e6b800] shadow-md active:scale-95 transition cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      <span>View in 3D</span>
                    </button>
                  )}

                  {/* Chevrons: hidden on mobile phone for pure clean look matching screenshot, visible on tablet */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          triggerHaptic(6)
                          setMobileSlideIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
                        }}
                        aria-label="Previous image"
                        className="hidden md:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs text-gray-800 shadow-md items-center justify-center hover:bg-white transition cursor-pointer z-10"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          triggerHaptic(6)
                          setMobileSlideIndex((prev) => (prev + 1) % productImages.length)
                        }}
                        aria-label="Next image"
                        className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs text-gray-800 shadow-md items-center justify-center hover:bg-white transition cursor-pointer z-10"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Pagination Dots Directly Beneath Image Matching Screenshot: [- • • • •] */}
                {productImages.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-3 pb-1">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          triggerHaptic(6)
                          setMobileSlideIndex(idx)
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 cursor-pointer ${
                          idx === mobileSlideIndex
                            ? 'w-7 h-1.5 rounded-full bg-[#1e293b]'
                            : 'w-1.5 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title & Share Icon Header Row */}
          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="flex-1 min-w-0 pr-1">
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900 tracking-tight leading-snug">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                {product.category === 'Tops' ? 'Performance Dive Tops' :
                 product.category === 'Bottoms' ? 'Compression Dive Wear' :
                 product.category === 'Wetsuits' ? 'Thermal Neoprene Wetsuits' :
                 product.category === 'Skin Wear' ? 'Full Body Protective Skin' : 'Marine Gear & Accessories'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleShareClick}
              className="p-2 -mr-1 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-full transition cursor-pointer shrink-0 active:scale-90"
              aria-label="Share product"
              title="Share product"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>

          {/* Price Block - Commented out */}
          {/*
          <div className="pt-0.5">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                ₹ {product.price?.toLocaleString('en-IN')}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-sm sm:text-base text-gray-400 line-through font-normal">
                    ₹ {product.oldPrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 font-normal mt-0.5">
              Price incl. of all taxes
            </p>
          </div>
          */}

          {/* Shop by Variant - Only shown for Full Body Skins with Yellow and Grey */}
          {hasVariants && variantLooks.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Shop by Variant
                </h3>
                <span className="text-xs font-semibold text-gray-500">
                  {selectedColor?.name?.includes('Yellow') ? 'Yellow' : selectedColor?.name?.includes('Grey') ? 'Grey' : selectedColor?.name}
                </span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
                {variantLooks.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8)
                      if (variant.color) {
                        setSelectedColor(variant.color)
                      }
                      setMobileSlideIndex(0)
                    }}
                    className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-lg border-2 transition-all cursor-pointer bg-white ${
                      variant.active
                        ? 'border-gray-900 shadow-sm ring-1 ring-gray-900'
                        : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                    }`}
                    title={variant.title}
                  >
                    <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                      <img
                        src={variant.image}
                        alt={variant.title}
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span className={`text-[11px] font-bold ${variant.active ? 'text-gray-900' : 'text-gray-600'}`}>
                      {variant.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizing: Please select a size + SIZE CHART */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                Please select a size.
              </span>
              {!isAccessory && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8)
                    setIsSizeChartOpen(true)
                  }}
                  className="text-xs font-bold text-[#006666] uppercase tracking-wider hover:underline cursor-pointer"
                >
                  SIZE CHART
                </button>
              )}
            </div>

            {/* Size Buttons Grid: Only two buttons for apparel (XS - M and L -XXL) */}
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {isAccessory ? (
                <button
                  type="button"
                  className="min-w-[140px] h-10 px-4 rounded-md border-2 border-gray-900 text-xs font-bold text-gray-900 bg-white shadow-xs cursor-default"
                >
                  One Size Fits Most
                </button>
              ) : (
                availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8)
                        setSelectedSize(sz)
                      }}
                      className={`min-w-[100px] h-10 px-4 rounded-md text-xs sm:text-sm font-bold transition flex items-center justify-center cursor-pointer relative ${
                        isSelected
                          ? 'border-2 border-gray-900 text-gray-900 bg-white shadow-xs ring-1 ring-gray-900/10'
                          : 'border border-gray-300 text-gray-700 bg-white hover:border-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>{sz}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Size not available? Notify Me When Available */}
            {!isAccessory && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Size not available?</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8)
                    setIsNotifyOpen(true)
                  }}
                  className="text-[#006666] font-semibold hover:underline cursor-pointer ml-0.5"
                >
                  Notify Me When Available
                </button>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="pt-1 flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700">Quantity</span>
            <div className="relative inline-block">
              <select
                value={quantity}
                onChange={(e) => {
                  triggerHaptic(6)
                  setQuantity(Number(e.target.value))
                }}
                className="appearance-none bg-white border border-gray-300 hover:border-gray-500 rounded-md py-1.5 pl-3 pr-8 text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value={1}>01</option>
                <option value={2}>02</option>
                <option value={3}>03</option>
                <option value={4}>04</option>
                <option value={5}>05</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="pt-3 border-t border-gray-150">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">
              Delivery Details
            </h3>
            
            <form onSubmit={handleCheckPincode} className="relative flex items-center max-w-sm mb-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ''))
                  setPincodeStatus(null)
                }}
                placeholder="Enter Pincode"
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-3.5 pr-20 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1.5 text-xs font-bold text-[#006666] uppercase hover:underline cursor-pointer"
              >
                CHECK
              </button>
            </form>

            {pincodeStatus === 'valid' && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-md flex items-center gap-1.5 font-medium mb-2">
                <span>✓</span>
                <span>Free delivery in 2-3 business days. Cash on delivery eligible.</span>
              </div>
            )}
            {pincodeStatus === 'invalid' && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md font-medium mb-2">
                Please enter a valid 6-digit postal pincode.
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>10-day hassle-free return or exchange</span>
            </div>
          </div>

          {/* Collapsible Accordions */}
          <div className="pt-2 border-t border-gray-150 space-y-2">
            {/* 1. Product Details */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(6)
                  setExpandedAccordion(expandedAccordion === 'details' ? null : 'details')
                }}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer"
              >
                <span>Product Details</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${expandedAccordion === 'details' ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedAccordion === 'details' && (
                <div className="px-4 pb-4 pt-1 bg-white text-xs sm:text-sm text-gray-600 space-y-2 border-t border-gray-100">
                  <p className="leading-relaxed">{product.description}</p>
                  {product.features && (
                    <ul className="list-disc pl-4 space-y-1 pt-1 text-gray-700">
                      {product.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 2. Care Instructions */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(6)
                  setExpandedAccordion(expandedAccordion === 'care' ? null : 'care')
                }}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer"
              >
                <span>Dry Clean & Care Instructions</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${expandedAccordion === 'care' ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedAccordion === 'care' && (
                <div className="px-4 pb-4 pt-1 bg-white text-xs sm:text-sm text-gray-600 space-y-1.5 border-t border-gray-100">
                  <p>• Rinse with fresh cold water immediately after saltwater exposure.</p>
                  <p>• Do not dry clean or iron directly on technical neoprene or logos.</p>
                  <p>• Line dry in the shade; avoid direct harsh sunlight when drying.</p>
                  <p>• Hand wash cold or gentle machine cycle with mild detergent.</p>
                </div>
              )}
            </div>

            {/* 3. Universal Sizing Guide Accordion */}
            {!isAccessory && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6)
                    setExpandedAccordion(expandedAccordion === 'sizing' ? null : 'sizing')
                  }}
                  className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer"
                >
                  <span>Size Guide & Fit Information</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform duration-200 ${expandedAccordion === 'sizing' ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedAccordion === 'sizing' && (
                  <div className="px-4 pb-4 pt-1 bg-white text-xs text-gray-600 border-t border-gray-100 overflow-x-auto">
                    <p className="mb-2 leading-relaxed">
                      Engineered with 4-way ultra-stretch performance fabric. Choose standard sizing S, M, L, or XL.
                    </p>
                    <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-900 font-bold border-b">
                          <th className="p-2">Option</th>
                          <th className="p-2">Fits Sizes</th>
                          <th className="p-2">Chest (in)</th>
                          <th className="p-2">Waist (in)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr><td className="p-2 font-bold text-gray-900">S</td><td className="p-2">Small</td><td className="p-2">34 - 37</td><td className="p-2">28 - 30</td></tr>
                        <tr><td className="p-2 font-bold text-gray-900">M</td><td className="p-2">Medium</td><td className="p-2">38 - 40</td><td className="p-2">31 - 33</td></tr>
                        <tr><td className="p-2 font-bold text-gray-900">L</td><td className="p-2">Large</td><td className="p-2">41 - 44</td><td className="p-2">34 - 36</td></tr>
                        <tr><td className="p-2 font-bold text-gray-900">XL</td><td className="p-2">Extra Large</td><td className="p-2">45 - 48</td><td className="p-2">37 - 40</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            DESKTOP VIEW (lg:)
            2-Column Product Layout: Left Gallery Grid + Right Sticky Details
            ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          
          {/* =========================================================================
              LEFT SECTION: 2-COLUMN PRODUCT IMAGE GALLERY GRID
              ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* 3D Model Viewer Card (when 3D mode is toggled) */}
            {view3DMode && activeGlb ? (
              <div className="w-full flex flex-col">
                <div className="w-full h-[480px] sm:h-[540px] lg:h-[600px] xl:h-[640px] max-h-[calc(100vh-160px)] bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex items-center justify-center">
                  <Product3DViewer
                    key={activeGlb}
                    src={activeGlb}
                    alt={product.title}
                    productId={product.id}
                    poster={product.image}
                  />
                </div>

                {/* Visible below the display view box */}
                <div className="flex items-center justify-center gap-2 pt-2.5 pb-1 text-gray-500 text-xs font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                  <span>Drag with mouse or finger to rotate 360°</span>
                </div>
              </div>
            ) : (
              /* The 2-Column Product Gallery Grid */
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                {productImages.map((imgSrc, idx) => {
                  const isFirstImage = idx === 0
                  const isSecondImage = idx === 1
                  const label = product.imageLabels && product.imageLabels[idx]
                    ? product.imageLabels[idx]
                    : (isFirstImage ? 'Front' : isSecondImage ? 'Back' : `View ${idx + 1}`)

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOpenModal(imgSrc, idx)}
                      className="group relative aspect-[3/4] bg-[#F7F8F9] rounded-xs border border-gray-150 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 flex items-center justify-center p-2 sm:p-4"
                    >
                      {/* Product Image */}
                      <img
                        src={imgSrc}
                        alt={`${product.title} - ${label}`}
                        className="w-full h-full object-contain transition-transform duration-500"
                        loading={idx < 4 ? 'eager' : 'lazy'}
                      />

                      {/* Subtle hover zoom hint icon in bottom right */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/85 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* =========================================================================
              RIGHT SECTION: STICKY PRODUCT SPECIFICATIONS & ACTIONS
              ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-20 xl:top-24 lg:self-start gap-4">
            
            {/* Product Title & View in 3D Button (on the same line) */}
            <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-2xl sm:text-[28px] text-gray-900 leading-snug tracking-tight">
                  {product.title}
                </h1>
                {/* Category / Subtitle directly under title */}
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {product.category === 'Tops' ? 'Performance Dive Tops' :
                   product.category === 'Bottoms' ? 'Compression Dive Wear' :
                   product.category === 'Wetsuits' ? 'Thermal Neoprene Wetsuits' :
                   product.category === 'Skin Wear' ? 'Full Body Protective Skin' : 'Marine Gear & Accessories'}
                </p>
              </div>

              {/* View in 3D Button (on the right side of the product name) */}
              {activeGlb && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8)
                    setView3DMode(!view3DMode)
                  }}
                  className={`btn-view-3d shrink-0 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 ${
                    view3DMode
                      ? 'btn-view-3d-active bg-gray-900 text-[#FFCD00] border-2 border-[#FFCD00] hover:bg-black'
                      : 'btn-view-3d-yellow bg-[#FFCD00] text-gray-950 border-2 border-[#e6b800] hover:bg-[#ffb700]'
                  }`}
                  style={
                    view3DMode
                      ? { backgroundColor: '#111827', color: '#FFCD00', borderColor: '#FFCD00' }
                      : { backgroundColor: '#FFCD00', color: '#030a12', borderColor: '#e6b800' }
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={view3DMode ? '#FFCD00' : '#030a12'}
                    strokeWidth="2.5"
                    className="shrink-0"
                  >
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span style={{ color: view3DMode ? '#FFCD00' : '#030a12' }}>
                    {view3DMode ? 'View Photos' : 'View in 3D'}
                  </span>
                </button>
              )}
            </div>

            {/* Price Block - Commented out */}
            {/*
            <div className="pt-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                  ₹ {product.price?.toLocaleString('en-IN')}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-sm sm:text-base text-gray-400 line-through font-normal">
                      ₹ {product.oldPrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Price incl. of all taxes
              </p>
            </div>
            */}

            {/* Shop by Variant - Only shown for Full Body Skins with Yellow and Grey */}
            {hasVariants && variantLooks.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Shop by Variant
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedColor?.name?.includes('Yellow') ? 'Yellow' : selectedColor?.name?.includes('Grey') ? 'Grey' : selectedColor?.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {variantLooks.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8)
                        if (variant.color) {
                          setSelectedColor(variant.color)
                        }
                        setMobileSlideIndex(0)
                      }}
                      className={`group relative flex flex-col items-center gap-1.5 p-1.5 rounded-lg border-2 transition-all cursor-pointer bg-white ${
                        variant.active
                          ? 'border-gray-900 shadow-sm ring-1 ring-gray-900'
                          : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                      }`}
                      title={variant.title}
                    >
                      <div className="w-16 h-20 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                        <img
                          src={variant.image}
                          alt={variant.title}
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                      <span className={`text-xs font-bold ${variant.active ? 'text-gray-900' : 'text-gray-600'}`}>
                        {variant.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Please select a size + SIZE CHART */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  Please select a size.
                </span>
                {!isAccessory && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8)
                      setIsSizeChartOpen(true)
                    }}
                    className="text-xs font-bold text-[#006666] uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    SIZE CHART
                  </button>
                )}
              </div>

              {/* Size Buttons Grid: Only two buttons for apparel (XS - M and L -XXL) */}
              <div className="flex items-center gap-3 flex-wrap mb-2">
                {isAccessory ? (
                  <button
                    type="button"
                    className="min-w-[140px] h-10 px-5 rounded-md border-2 border-gray-900 text-xs font-bold text-gray-900 bg-white shadow-xs cursor-default"
                  >
                    One Size Fits Most
                  </button>
                ) : (
                  availableSizes.map((sz) => {
                    const isSelected = selectedSize === sz

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          triggerHaptic(8)
                          setSelectedSize(sz)
                        }}
                        className={`min-w-[100px] h-10 px-4 rounded-md text-xs sm:text-sm font-bold transition flex items-center justify-center cursor-pointer relative ${
                          isSelected
                            ? 'border-2 border-gray-900 text-gray-900 bg-white shadow-xs ring-1 ring-gray-900/10'
                            : 'border border-gray-300 text-gray-800 bg-white hover:border-gray-600'
                        }`}
                      >
                        <span>{sz}</span>
                      </button>
                    )
                  })
                )}
              </div>

              {/* Size subtitle / helper */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-2">
                <span>4-way ultra-stretch memory fabric</span>
              </div>

              {/* Size not available? Notify Me When Available */}
              {!isAccessory && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span>Size not available?</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8)
                      setIsNotifyOpen(true)
                    }}
                    className="text-[#006666] font-semibold hover:underline cursor-pointer ml-0.5"
                  >
                    Notify Me When Available
                  </button>
                </div>
              )}
            </div>

            {/* Quantity Dropdown */}
            <div className="pt-1 flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Quantity</span>
              <div className="relative inline-block">
                <select
                  value={quantity}
                  onChange={(e) => {
                    triggerHaptic(6)
                    setQuantity(Number(e.target.value))
                  }}
                  className="appearance-none bg-white border border-gray-300 hover:border-gray-500 rounded-md py-1.5 pl-3 pr-8 text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value={1}>01</option>
                  <option value={2}>02</option>
                  <option value={3}>03</option>
                  <option value={4}>04</option>
                  <option value={5}>05</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons: ADD TO CART (Yellow) + WISHLIST (Outline) */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="btn-add-to-cart-yellow flex-1 bg-[#FFCD00] hover:bg-[#FFD700] active:scale-[0.98] text-black font-bold py-3.5 px-6 rounded-md shadow-xs text-xs sm:text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isAdding ? 'Adding...' : 'ADD TO CART'}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12)
                  toggleWishlist(product)
                }}
                className="min-w-[130px] sm:min-w-[140px] border border-gray-300 hover:border-gray-500 active:scale-[0.98] bg-white text-gray-800 font-bold py-3.5 px-4 rounded-md shadow-2xs text-xs sm:text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>WISHLIST</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isWishlisted(product.id) ? '#e11b22' : 'none'}
                  stroke={isWishlisted(product.id) ? '#e11b22' : 'currentColor'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>

            {/* Social Share Row matching Screenshot 2 */}
            <div className="pt-2 flex items-center gap-3 text-gray-600">
              <span className="text-xs font-semibold text-gray-500">Share</span>
              
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => handleSocialShare('whatsapp')}
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center transition cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.97.58 3.89 1.68 5.54L2 22l4.69-1.53c1.61.99 3.47 1.51 5.35 1.51 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.79 14.13c-.24.68-1.41 1.25-1.95 1.33-.51.07-1.17.1-3.41-.83-2.87-1.19-4.71-4.13-4.85-4.32-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.11 1-2.4.26-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.03.9 2.18.07.15.12.33.02.53-.1.19-.15.31-.3.49-.15.18-.32.4-.46.54-.15.15-.31.32-.13.63.18.31.79 1.3 1.7 2.11 1.17 1.04 2.16 1.37 2.47 1.52.31.15.49.13.68-.08.19-.22.8-1.02 1.01-1.37.21-.35.42-.29.71-.18.29.11 1.84.87 2.15 1.03.31.15.52.23.59.36.07.12.07.72-.17 1.4z" />
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSocialShare('facebook')}
                aria-label="Share on Facebook"
                title="Share on Facebook"
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-blue-600 hover:text-blue-600 flex items-center justify-center transition cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.54 5c1.3 0 2.66.23 2.66.23v2.93h-1.5c-1.51 0-1.98.94-1.98 1.9V12h3.3l-.53 3h-2.77v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={() => handleSocialShare('x')}
                aria-label="Share on X"
                title="Share on X"
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-900 hover:text-gray-900 flex items-center justify-center transition cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={() => handleSocialShare('instagram')}
                aria-label="Share on Instagram"
                title="Share on Instagram"
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-pink-600 hover:text-pink-600 flex items-center justify-center transition cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </button>
            </div>

            {/* Delivery Details Section */}
            <div className="pt-3 border-t border-gray-150">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">
                Delivery Details
              </h3>
              
              <form onSubmit={handleCheckPincode} className="relative flex items-center max-w-sm mb-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''))
                    setPincodeStatus(null)
                  }}
                  placeholder="Enter Pincode"
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-3.5 pr-20 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-1.5 text-xs font-bold text-[#006666] uppercase hover:underline cursor-pointer"
                >
                  CHECK
                </button>
              </form>

              {/* Pincode response state */}
              {pincodeStatus === 'valid' && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-md flex items-center gap-1.5 font-medium mb-2">
                  <span>✓</span>
                  <span>Free delivery in 2-3 business days. Cash on delivery eligible.</span>
                </div>
              )}
              {pincodeStatus === 'invalid' && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md font-medium mb-2">
                  Please enter a valid 6-digit postal pincode.
                </div>
              )}

              {/* 10-day return or exchange policy */}
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>10-day hassle-free return or exchange</span>
              </div>
            </div>

            {/* Collapsible Accordions (Product Details, Wash & Care, etc.) */}
            <div className="pt-3 border-t border-gray-150 space-y-2">
              
              {/* 1. Product Details Accordion */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6)
                    setExpandedAccordion(expandedAccordion === 'details' ? null : 'details')
                  }}
                  className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer"
                >
                  <span>Product Details</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform duration-200 ${expandedAccordion === 'details' ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedAccordion === 'details' && (
                  <div className="px-4 pb-4 pt-1 bg-white text-xs sm:text-sm text-gray-600 space-y-2 border-t border-gray-100">
                    <p className="leading-relaxed">{product.description}</p>
                    {product.features && (
                      <ul className="list-disc pl-4 space-y-1 pt-1 text-gray-700">
                        {product.features.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Wash & Care Instructions Accordion */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6)
                    setExpandedAccordion(expandedAccordion === 'care' ? null : 'care')
                  }}
                  className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer"
                >
                  <span>Dry Clean & Care Instructions</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform duration-200 ${expandedAccordion === 'care' ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedAccordion === 'care' && (
                  <div className="px-4 pb-4 pt-1 bg-white text-xs sm:text-sm text-gray-600 space-y-1.5 border-t border-gray-100">
                    <p>• Rinse with fresh cold water immediately after saltwater exposure.</p>
                    <p>• Do not dry clean or iron directly on technical neoprene or logos.</p>
                    <p>• Line dry in the shade; avoid direct harsh sunlight when drying.</p>
                    <p>• Hand wash cold or gentle machine cycle with mild detergent.</p>
                  </div>
                )}
              </div>

              {/* 3. Universal Sizing Guide Accordion */}
              {!isAccessory && (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(6)
                      setExpandedAccordion(expandedAccordion === 'sizing' ? null : 'sizing')
                    }}
                    className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer"
                  >
                    <span>Size Guide & Fit Information</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`transition-transform duration-200 ${expandedAccordion === 'sizing' ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedAccordion === 'sizing' && (
                    <div className="px-4 pb-4 pt-1 bg-white text-xs text-gray-600 border-t border-gray-100 overflow-x-auto">
                      <p className="mb-2 leading-relaxed">
                        Engineered with 4-way ultra-stretch performance fabric. Choose <strong>S-M</strong> for standard sizes XS to M, and <strong>L-XXL</strong> for sizes L to XXL.
                      </p>
                      <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                        <thead>
                          <tr className="bg-gray-100 text-gray-900 font-bold border-b">
                            <th className="p-2">Option</th>
                            <th className="p-2">Fits Sizes</th>
                            <th className="p-2">Chest (in)</th>
                            <th className="p-2">Waist (in)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="p-2 font-bold text-gray-900">S-M</td><td className="p-2">S to M</td><td className="p-2">32 - 40</td><td className="p-2">26 - 33</td></tr>
                          <tr><td className="p-2 font-bold text-gray-900">L-XXL</td><td className="p-2">L to XXL</td><td className="p-2">41 - 48</td><td className="p-2">34 - 42</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* =========================================================================
            YOU MAY ALSO LIKE / RECOMMENDATIONS CAROUSEL
            ========================================================================= */}
        <div className="mt-16 sm:mt-24 pt-10 border-t border-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#006666] block">
                Recommended For You
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-[#e11b22] hover:underline uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct.id}
                to={`/shop/${relProduct.id}`}
                className="group flex flex-col bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition duration-200 p-2"
              >
                <div className="aspect-[3/4] w-full bg-[#F7F8F9] rounded-xs overflow-hidden mb-2 relative flex items-center justify-center p-2">
                  <img
                    src={relProduct.image}
                    alt={relProduct.title}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#006666]">
                  {relProduct.category}
                </span>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-[#e11b22] transition">
                  {relProduct.title}
                </h4>
                {/* Price - Commented out */}
                {/*
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xs font-bold text-gray-900">
                    ₹ {relProduct.price?.toLocaleString('en-IN')}
                  </span>
                  {relProduct.oldPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      ₹ {relProduct.oldPrice?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                */}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* =========================================================================
          LIGHTBOX MODAL POPUP (SCREENSHOT 2 STYLE)
          Triggered when tapping ANY product image in the gallery.
          Portaled to document.body to blur the entire viewport (including header).
          Maximized for the largest possible screen dimensions on any device.
          ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {modalActiveImage && (
            <motion.div
              key="product-lightbox-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setModalActiveImage(null)}
              data-product-modal-backdrop="true"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
              className="fixed inset-0 z-[100000] bg-black/60 sm:bg-black/65 flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden"
            >
              {/* Modal Dialog Card Container: maximized on any device */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleModalTouchStart}
                onTouchEnd={handleModalTouchEnd}
                data-product-modal-dialog="true"
                style={{ backgroundColor: '#ffffff', color: '#111827' }}
                className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-[96vw] max-w-[1260px] h-[95vh] max-h-[96vh] flex flex-col items-center justify-between p-2 sm:p-3 sm:pb-3.5 overflow-hidden"
              >
                {/* Circular Close Button 'X' in top-right corner of modal */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8)
                    setModalActiveImage(null)
                  }}
                  aria-label="Close dialog"
                  className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-600/85 hover:bg-gray-800 text-white flex items-center justify-center transition shadow-md active:scale-90 cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>

                {/* Main Center Image Display Area - Expands to maximum screen size */}
                <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden my-1">
                  {/* Left Navigation Chevron Button */}
                  {productImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrevModalImage()
                      }}
                      aria-label="Previous image"
                      className="absolute left-2 sm:left-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-xl text-gray-800 flex items-center justify-center hover:bg-gray-100 active:scale-90 cursor-pointer transition border border-gray-150"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                  )}

                  {/* Right Navigation Chevron Button */}
                  {productImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNextModalImage()
                      }}
                      aria-label="Next image"
                      className="absolute right-2 sm:right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-xl text-gray-800 flex items-center justify-center hover:bg-gray-100 active:scale-90 cursor-pointer transition border border-gray-150"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )}

                  {/* The Full Uncropped Image */}
                  <div className="relative h-full flex items-center justify-center">
                    <img
                      key={modalActiveImage}
                      src={modalActiveImage}
                      alt={product.title}
                      className="h-full max-h-[77vh] sm:max-h-[81vh] w-auto max-w-full object-contain rounded-xs select-none shadow-xs"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Bottom Thumbnail Strip matching Screenshot 2 */}
                {productImages.length > 1 && (
                  <div className="w-full pt-2 mt-1 border-t border-gray-150 flex items-center justify-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 shrink-0">
                    {productImages.map((thumb, idx) => {
                      const isSelected = modalActiveImage === thumb
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            triggerHaptic(6)
                            setModalActiveImage(thumb)
                            setModalImageIndex(idx)
                          }}
                          className={`relative w-11 h-15 sm:w-13 sm:h-17 rounded-xs overflow-hidden border-2 transition cursor-pointer shrink-0 bg-white ${
                            isSelected
                              ? 'border-gray-900 ring-1 ring-gray-900 shadow-xs'
                              : 'border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={thumb}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          SIZE CHART MODAL
          ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isSizeChartOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeChartOpen(false)}
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
              className="fixed inset-0 z-[100000] bg-black/65 sm:bg-black/70 flex items-center justify-center p-4 select-none overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-md shadow-2xl max-w-lg w-full p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Universal Sizing Guide
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-gray-600">
                  <p className="leading-relaxed">
                    The Dive Village ocean apparel is crafted with 4-way ultra-stretch memory elastane that contours smoothly to your body shape.
                  </p>

                  <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-900 font-bold border-b">
                          <th className="p-2.5">Size Button</th>
                          <th className="p-2.5">Chest (in)</th>
                          <th className="p-2.5">Waist (in)</th>
                          <th className="p-2.5">Height (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="p-2.5 font-bold text-gray-900">XS - M</td>
                          <td className="p-2.5">32 - 40</td>
                          <td className="p-2.5">26 - 33</td>
                          <td className="p-2.5">155 - 180</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-gray-900">L -XXL</td>
                          <td className="p-2.5">41 - 48</td>
                          <td className="p-2.5">34 - 42</td>
                          <td className="p-2.5">175 - 195</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md text-xs space-y-1 text-gray-700">
                    <p className="font-bold text-gray-900">How to Measure:</p>
                    <p><strong>Chest/Bust:</strong> Measure around the fullest part of your chest, keeping tape horizontal.</p>
                    <p><strong>Waist:</strong> Measure around your natural waistline, where your trousers usually sit.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          NOTIFY ME MODAL
          ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isNotifyOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotifyOpen(false)}
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
              className="fixed inset-0 z-[100000] bg-black/65 sm:bg-black/70 flex items-center justify-center p-4 select-none overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-md shadow-2xl max-w-sm w-full p-5 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-3">
                  <h3 className="text-sm font-bold text-gray-900">
                    Notify Me When Available
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsNotifyOpen(false)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {notifySuccess ? (
                  <div className="py-6 text-center text-emerald-600 font-bold text-sm">
                    ✓ We will notify you as soon as this size restocks!
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Enter your email or phone number to receive an alert when <strong>{selectedSize}</strong> is back in stock.
                    </p>
                    <input
                      type="text"
                      required
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter Email or Mobile"
                      className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#e11b22] hover:bg-[#c81017] text-white font-bold py-2.5 rounded-md text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      Notify Me
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          MOBILE & TABLET STICKY BOTTOM BAR (MATCHING SCREENSHOT)
          ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 sm:px-6 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center gap-3 pb-[calc(10px+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(12)
            toggleWishlist(product)
          }}
          className="w-[44%] sm:w-[40%] h-11 sm:h-12 border border-gray-900 hover:border-black active:scale-[0.98] bg-white text-gray-900 font-bold px-3 rounded-md shadow-2xs text-xs sm:text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          aria-label="Wishlist"
        >
          <span className="whitespace-nowrap">WISHLIST</span>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={isWishlisted(product.id) ? '#e11b22' : 'none'}
            stroke={isWishlisted(product.id) ? '#e11b22' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="btn-add-to-cart-yellow flex-1 h-11 sm:h-12 bg-[#FFCD00] hover:bg-[#FFD700] active:scale-[0.98] text-black font-bold px-4 rounded-md text-xs sm:text-sm tracking-wider uppercase transition text-center shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-75"
        >
          {isAdding ? 'ADDING...' : 'ADD TO CART'}
        </button>
      </div>

    </div>
  )
}
