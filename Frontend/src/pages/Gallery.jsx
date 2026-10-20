import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useSearchParams } from 'react-router'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import LazyVideo from '../components/LazyVideo'
import SEOHead from '../components/SEOHead'
import { GALLERY_ITEMS } from '../utils/galleryData'
import { triggerHaptic } from '../utils/haptics'
import { shareContent } from '../utils/share'
import { useLenis } from '../utils/lenisReact'
import { getOptimizedImageUrl, getOptimizedVideoPoster } from '../utils/mediaOptimizer'
import useNightDive from '../hooks/useNightDive'

const rawDiversBg = 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1791458258/TDV-Media/Products/Group/4M7A6732.jpg'
const diversBg = rawDiversBg

const cleanTitle = (t) => (t ? t.replace(/\s*\(\d+\)/g, '').trim() : '')
const isBakedVerticalItem = (item) => {
  if (!item) return false
  if (item.title?.toLowerCase().includes('moray eel') || item.id === 'gallery-item-0') return false
  const bakedIds = ['gallery-item-7', 'gallery-item-8', 'gallery-item-18', 'gallery-item-19', 'gallery-item-20']
  if (bakedIds.includes(item.id)) return true
  const bakedTitles = ['Giant Barrel Sponge', 'Hawksbill Sea Turtle', 'Whale Shark', 'Whitetip Reef Shark']
  return bakedTitles.some((t) => item.title?.includes(t))
}
const SANITIZED_GALLERY_ITEMS = GALLERY_ITEMS.map((item) => ({
  ...item,
  title: cleanTitle(item.title),
}))

export default function Gallery() {
  const isNightDive = useNightDive()
  const [itemsList] = useState(SANITIZED_GALLERY_ITEMS)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null)
  const [highlightedItemId, setHighlightedItemId] = useState(null)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const reduce = useReducedMotion()
  const lenis = useLenis()

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const filteredItems = itemsList
  const targetItemId = searchParams.get('item') || (location.hash ? location.hash.replace('#', '') : null)

  // Scroll handling: If arriving for a specific item, smoothly scroll to that image. Otherwise scroll to top.
  useEffect(() => {
    if (targetItemId) {
      setHighlightedItemId(targetItemId)

      let attempts = 0

      const performScroll = (smooth = true) => {
        const el = document.getElementById(targetItemId)
        if (el) {
          const activeLenis = lenis || (typeof window !== 'undefined' ? window.lenis : null)
          if (activeLenis && typeof activeLenis.scrollTo === 'function') {
            activeLenis.scrollTo(el, { offset: -100, duration: smooth ? 1.0 : 0, immediate: !smooth })
          } else {
            const rect = el.getBoundingClientRect()
            const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
            const targetY = rect.top + scrollTop - 100
            window.scrollTo({ top: Math.max(0, targetY), behavior: smooth ? 'smooth' : 'auto' })
          }
          return true
        }
        return false
      }

      // Initial jump if element is already present, then smooth staggered reinforcement as layout settles
      performScroll(false)
      const t1 = setTimeout(() => performScroll(true), 60)
      const t2 = setTimeout(() => performScroll(true), 250)
      const t3 = setTimeout(() => performScroll(true), 600)

      const pollInterval = setInterval(() => {
        attempts++
        if (performScroll(true) || attempts > 20) {
          clearInterval(pollInterval)
        }
      }, 100)

      const highlightTimer = setTimeout(() => {
        setHighlightedItemId(null)
      }, 4500)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearInterval(pollInterval)
        clearTimeout(highlightTimer)
      }
    } else {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      const activeLenis = lenis || (typeof window !== 'undefined' ? window.lenis : null)
      if (activeLenis && typeof activeLenis.scrollTo === 'function') {
        activeLenis.scrollTo(0, { immediate: true })
      }
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        if (activeLenis && typeof activeLenis.scrollTo === 'function') activeLenis.scrollTo(0, { immediate: true })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [targetItemId, lenis])



  const handleLightboxTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleLightboxTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        nextMedia()
      } else {
        prevMedia()
      }
    }
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedMediaIndex === null) return
      if (e.key === 'Escape') setSelectedMediaIndex(null)
      if (e.key === 'ArrowRight') {
        triggerHaptic(8)
        setSelectedMediaIndex((prev) => (prev + 1) % filteredItems.length)
      }
      if (e.key === 'ArrowLeft') {
        triggerHaptic(8)
        setSelectedMediaIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMediaIndex, filteredItems.length])

  // Lock background scrolling and pause Lenis when gallery preview / lightbox is open
  useEffect(() => {
    const activeLenis = lenis || (typeof window !== 'undefined' ? window.lenis : null)

    if (selectedMediaIndex === null) {
      if (activeLenis && typeof activeLenis.start === 'function') {
        activeLenis.start()
      }
      return
    }

    // 1. Pause Lenis smooth scroll
    if (activeLenis && typeof activeLenis.stop === 'function') {
      activeLenis.stop()
    }

    // 2. Lock body & html scroll & contain overscroll
    const originalBodyOverflow = document.body.style.overflow
    const originalBodyOverscroll = document.body.style.overscrollBehavior
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'contain'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'contain'

    // 3. Prevent any wheel / touch gestures from propagating to background
    const preventBackgroundScroll = (e) => {
      e.preventDefault()
    }

    window.addEventListener('wheel', preventBackgroundScroll, { passive: false })
    window.addEventListener('touchmove', preventBackgroundScroll, { passive: false })

    return () => {
      if (activeLenis && typeof activeLenis.start === 'function') {
        activeLenis.start()
      }
      document.body.style.overflow = originalBodyOverflow
      document.body.style.overscrollBehavior = originalBodyOverscroll
      document.documentElement.style.overflow = originalHtmlOverflow
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll
      window.removeEventListener('wheel', preventBackgroundScroll)
      window.removeEventListener('touchmove', preventBackgroundScroll)
    }
  }, [selectedMediaIndex, lenis])

  const openLightbox = (index) => {
    // Stop all grid card videos immediately
    document.querySelectorAll('.gallery-grid-container video').forEach((vid) => {
      vid.pause()
      vid.currentTime = 0
    })
    triggerHaptic(10)
    setSelectedMediaIndex(index)
  }

  const nextMedia = () => {
    triggerHaptic(8)
    setSelectedMediaIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const prevMedia = () => {
    triggerHaptic(8)
    setSelectedMediaIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  const currentItem = selectedMediaIndex !== null ? filteredItems[selectedMediaIndex] : null

  const activeThumbRef = useRef(null)
  const thumbContainerRef = useRef(null)

  // Smoothly scroll active thumbnail into view when selected media changes
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [selectedMediaIndex])

  // AI DOM: Dynamic window measurement & responsive display window optimization
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window === 'undefined') return { width: 1200, height: 800 }
    return { width: window.innerWidth, height: window.innerHeight }
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Video aspect ratio detection from real-time DOM video metadata
  const [videoNaturalRatio, setVideoNaturalRatio] = useState(null)

  // Reset natural ratio when selected media changes
  useEffect(() => {
    setVideoNaturalRatio(null)
  }, [selectedMediaIndex])

  // Vertical media detection (all 9:16 portrait videos)
  const isBakedVertical = Boolean(
    currentItem && isBakedVerticalItem(currentItem)
  )

  const isKnownVerticalVideo = Boolean(
    currentItem && [
      'A Seafan',
      'Beach View',
      'Big Eye Trevally',
      'Clownfish and Sea Anemone',
      'Hawksbill Sea Turtle',
      'Magnificent Sea Anemone',
      'Manta Ray',
      'Marbled Stingray',
      'Silver Barracudas',
      'Free Diving',
      'Giant Barrel Sponge',
      'Whale Shark',
      'Whitetip Reef Shark',
    ].some((t) => currentItem.title?.includes(t))
  )

  const isVerticalVideo = Boolean(
    currentItem?.type === 'video' && (
      isBakedVertical ||
      isKnownVerticalVideo ||
      (videoNaturalRatio !== null && videoNaturalRatio < 0.95)
    )
  )

  // AI DOM: Calculate optimal height & layout bounds based on display window size
  const modalOptimization = useMemo(() => {
    const { width, height } = windowSize
    const isMobile = width < 640
    const isTablet = width >= 640 && width < 1024
    const isShort = height < 640
    const isVeryShort = height < 520

    // Available height in display window (leaving safe margins)
    const marginY = isMobile ? 16 : isShort ? 24 : 40
    const maxAllowedHeight = Math.max(320, height - marginY)

    // Calculate optimal modal card height based on window size:
    // On mobile: maximize vertical space (up to 95vh) so vertical videos get maximum display window height
    // On desktop: optimize height gracefully (up to 880px for vertical videos, 820px for landscape)
    const optimalHeight = isMobile
      ? Math.min(maxAllowedHeight, Math.round(height * 0.95))
      : isVerticalVideo
        ? Math.min(maxAllowedHeight, 880, Math.round(height * 0.92))
        : Math.min(maxAllowedHeight, 820, Math.round(height * 0.88))

    // Calculate optimal modal card width:
    // For vertical videos on desktop: keep card focused and elegant (~560px - 640px)
    // For landscape media: wider card (up to 1040px)
    const optimalMaxWidth = isMobile
      ? '100%'
      : isVerticalVideo
        ? (isTablet ? '520px' : '620px')
        : (isTablet ? '840px' : '1040px')

    return {
      isMobile,
      isTablet,
      isShort,
      isVeryShort,
      optimalHeight,
      optimalMaxWidth,
    }
  }, [windowSize, isVerticalVideo])

  const handleShareVisual = async (item = currentItem) => {
    if (!item) return
    triggerHaptic(15)
    await shareContent({
      title: `${item.title || 'Underwater Visual'} | The Dive Village Gallery`,
      text: `Explore this stunning underwater moment from The Dive Village!`,
      url: window.location.href,
    })
  }

  return (
    <div className={`min-h-screen text-navy font-body pt-24 sm:pt-32 pb-24 overflow-x-hidden transition-colors duration-500 ${isNightDive ? 'bg-[#003865]' : 'bg-[#FAFAFA]'}`} style={{ textShadow: 'none' }}>
      <SEOHead
        title="Underwater Photography & Scuba Gallery | The Dive Village"
        description="Explore our visual gallery of underwater expeditions, vibrant coral reefs, sea turtle encounters, and diving moments captured at The Dive Village."
        keywords="underwater photography, scuba diving gallery, marine life photos, coral reef images, dive village photos"
        canonicalUrl="https://thedivevillage.com/gallery"
      />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* 1. HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <span className={`inline-block rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 transition-colors ${
              isNightDive ? 'bg-white/10 text-white/90' : 'bg-black/5 text-navy/60'
            }`}>
              Underwater Moments
            </span>
            <h1 className={`font-heading text-4xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none transition-colors ${
              isNightDive ? 'text-white' : 'text-navy'
            }`}>
              Gallery
            </h1>
          </div>
          <p className={`max-w-md text-sm sm:text-base lg:text-lg font-medium leading-relaxed lg:pb-4 transition-colors ${
            isNightDive ? 'text-white/80' : 'text-navy/70'
          }`}>
            Moments frozen in time beneath the waves. Explore our underwater expeditions, marine encounters, species identification, and village life.
          </p>
        </div>

        {/* GALLERY MASONRY / GRID: 2 Cards per row on mobile, 3 on desktop */}
        <div className="gallery-grid-container grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8 mb-14 sm:mb-24">
          {filteredItems.map((item, idx) => (
            <GalleryGridCard
              key={item.id}
              item={item}
              idx={idx}
              priority={idx < 8}
              reduce={reduce}
              onClick={() => openLightbox(idx)}
              isHighlighted={highlightedItemId === item.id}
              isNightDive={isNightDive}
            />
          ))}
        </div>

        {/* 4. INSTAGRAM & COMMUNITY SECTION */}
        <div className="rounded-3xl sm:rounded-[40px] bg-[#001e3d] text-white p-6 sm:p-14 mb-16 sm:mb-24 border border-white/10 shadow-lift transition-colors">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">
                #TheDiveVillage
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Tag Us in Your Ocean Adventures
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                Every moment tells a story of discovery and courage. Share your dive logs, underwater encounters, and island moments with <span className="font-bold text-white">@TheDiveVillage</span> on Instagram to get featured on our wall.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <a
                href="https://www.instagram.com/thedivevillage"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#003865] text-white px-8 py-4 text-center text-sm font-bold shadow-soft hover:bg-accent hover:text-navy transition border border-white/10"
              >
                Follow on Instagram →
              </a>
              <Button as={Link} to="/book-us" variant="secondary" className="justify-center">
                Join Next Expedition
              </Button>
            </div>
          </div>
        </div>

        {/* 5. CALL TO ACTION WITH BACKGROUND IMAGE */}
        <div className="rounded-[40px] bg-navy text-white p-10 sm:p-16 lg:p-20 relative overflow-hidden shadow-lift group border border-white/10">
          {/* Background Image: 4M7A6732.jpg */}
          <img
            src={diversBg}
            alt="The Dive Village Divers"
            className="absolute inset-0 w-full h-full object-cover object-[center_right] sm:object-center transition-transform duration-[7000ms] group-hover:scale-105 opacity-85 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001e3d]/85 via-[#001e3d]/55 to-transparent z-0" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none z-0" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest mb-6 border border-white/10">
              Create Your Own Stories
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              Ready to Be in the Next Frame?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mb-10 leading-relaxed font-medium">
              Join us for certified diving, reef safaris, and surfing camps. Experience the serenity that only the ocean can offer.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button as={Link} to="/book-us" variant="primary">
                Book Your Dive Adventure →
              </Button>
              <Button as={Link} to="/contact" variant="secondary">
                Inquire With Us
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* 6. CLEAN LIGHTBOX MODAL (E-COMMERCE PREVIEW STYLE) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedMediaIndex !== null && currentItem && (
              <div 
                data-lenis-prevent="true"
                data-gallery-modal="true"
                className="fixed inset-0 z-[9990] bg-black/80 backdrop-blur-[3px] flex items-center justify-center p-2 sm:p-4 md:p-6 select-none overflow-hidden"
                style={{
                  overscrollBehavior: 'contain',
                  touchAction: 'none',
                }}
                onClick={() => setSelectedMediaIndex(null)}
                onTouchStart={handleLightboxTouchStart}
                onTouchEnd={handleLightboxTouchEnd}
              >
                {/* Optimized Preview Modal Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  data-gallery-modal="true"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#171717',
                    height: `${modalOptimization.optimalHeight}px`,
                    maxWidth: modalOptimization.optimalMaxWidth,
                    width: '100%',
                  }}
                  className="gallery-preview-modal relative bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-hidden border border-neutral-100 transition-[max-width,height] duration-300 ease-out"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button: Dark circular button with white cross in top right */}
                  <button
                    id="gallery-preview-close"
                    data-gallery-close="true"
                    data-cursor-static="true"
                    type="button"
                    onClick={() => setSelectedMediaIndex(null)}
                    className="gallery-close-btn absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#5f6368] hover:bg-[#3c4043] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                    aria-label="Close Lightbox"
                    title="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  {/* Main Media Showcase Area - Dynamic Height Fit */}
                  <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden px-1 sm:px-12 py-1">
                    {/* Previous Media Arrow: White Circle with Drop Shadow */}
                    {filteredItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); prevMedia() }}
                        className="gallery-nav-arrow absolute left-1 sm:left-3 z-20 flex h-8.5 w-8.5 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-neutral-800 hover:text-black hover:bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-neutral-100 transition hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
                        aria-label="Previous visual"
                        title="Previous"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Next Media Arrow: White Circle with Drop Shadow */}
                    {filteredItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); nextMedia() }}
                        className="gallery-nav-arrow absolute right-1 sm:right-3 z-20 flex h-8.5 w-8.5 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-neutral-800 hover:text-black hover:bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-neutral-100 transition hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
                        aria-label="Next visual"
                        title="Next"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Media Item (Video or Image) */}
                    {currentItem.type === 'video' ? (
                      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative bg-white">
                        {isVerticalVideo ? (
                          <div 
                            className="h-full max-h-full max-w-full flex items-center justify-center relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-neutral-900"
                            style={{
                              aspectRatio: (!isBakedVertical && videoNaturalRatio && videoNaturalRatio < 0.95) ? `${videoNaturalRatio}` : '9 / 16',
                              maxHeight: '100%',
                            }}
                          >
                            <LazyVideo
                              key={currentItem.src}
                              src={currentItem.src}
                              priority={true}
                              lowResSrc={currentItem.lowResSrc || currentItem.previewVideo || currentItem.preview}
                              poster={currentItem.poster || currentItem.thumbnail || currentItem.image}
                              controls
                              controlsList="nodownload noplaybackrate noremoteplayback"
                              disablePictureInPicture={true}
                              autoPlay
                              loop
                              playsInline
                              muted={true}
                              defaultMuted={true}
                              playbackRate={currentItem.playbackRate || (currentItem.title?.toLowerCase().includes('clownfish and sea anemone') || currentItem.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)}
                              onLoadedMetadata={(e) => {
                                const vid = e.target
                                if (vid && vid.videoWidth && vid.videoHeight && !isBakedVertical) {
                                  setVideoNaturalRatio(vid.videoWidth / vid.videoHeight)
                                }
                              }}
                              style={{ objectFit: 'cover', maxHeight: '100%', maxWidth: '100%' }}
                              className="w-full h-full max-w-full max-h-full flex items-center justify-center gallery-preview-video object-cover"
                              videoClassName="gallery-preview-video-element object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative bg-white">
                            <LazyVideo
                              key={currentItem.src}
                              src={currentItem.src}
                              priority={true}
                              lowResSrc={currentItem.lowResSrc || currentItem.previewVideo || currentItem.preview}
                              poster={currentItem.poster || currentItem.thumbnail || currentItem.image}
                              controls
                              controlsList="nodownload noplaybackrate noremoteplayback"
                              disablePictureInPicture={true}
                              autoPlay
                              loop
                              playsInline
                              muted={true}
                              defaultMuted={true}
                              playbackRate={currentItem.playbackRate || (currentItem.title?.toLowerCase().includes('clownfish and sea anemone') || currentItem.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)}
                              onLoadedMetadata={(e) => {
                                const vid = e.target
                                if (vid && vid.videoWidth && vid.videoHeight) {
                                  setVideoNaturalRatio(vid.videoWidth / vid.videoHeight)
                                }
                              }}
                              style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%', backgroundColor: '#ffffff' }}
                              className="w-full h-full max-w-full max-h-full object-contain flex items-center justify-center gallery-preview-video bg-white rounded-lg"
                              videoClassName="gallery-preview-video-element bg-white"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        key={currentItem.src}
                        src={currentItem.src}
                        alt={currentItem.title || 'Gallery visual'}
                        decoding="async"
                        style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                        className="max-w-full max-h-full object-contain select-none m-auto block pointer-events-auto rounded-lg shadow-sm"
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Bottom Thumbnail Strip - Just thumbnails below like shop preview box */}
                  {filteredItems.length > 1 && (
                    <div 
                      ref={thumbContainerRef}
                      className="w-full pt-2 mt-1 border-t border-gray-150 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none px-1 sm:px-2 py-1 shrink-0 select-none"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                      }}
                    >
                      {filteredItems.map((item, idx) => {
                        const isActive = idx === selectedMediaIndex
                        return (
                          <button
                            key={item.id || idx}
                            ref={isActive ? activeThumbRef : null}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerHaptic(8)
                              setSelectedMediaIndex(idx)
                            }}
                            className={`relative shrink-0 rounded-md overflow-hidden transition-all cursor-pointer ${
                              modalOptimization.isShort
                                ? 'w-10 h-13 sm:w-11 sm:h-15'
                                : 'w-11 h-15 sm:w-14 sm:h-19'
                            } ${
                              isActive
                                ? 'gallery-thumb-active border-2 border-black ring-1 ring-black/10 scale-105 opacity-100 shadow-sm'
                                : 'gallery-thumb-inactive border border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400 bg-neutral-100'
                            }`}
                            title={item.title}
                          >
                            {item.type === 'video' ? (
                              <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                                {item.poster ? (
                                  <img
                                    src={item.poster}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                ) : (
                                  <video
                                    src={item.src}
                                    muted
                                    preload="metadata"
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[7px] pl-0.5">
                                    ▶
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.src}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

function GalleryGridCard({ item, idx, priority, reduce, onClick, isHighlighted, isNightDive }) {
  const cardRef = useRef(null)
  const isVideo = item.type === 'video'
  const [isHovered, setIsHovered] = useState(false)
  const isHoveredRef = useRef(false)
  const videoRef = useRef(null)
  const playPromiseRef = useRef(null)

  const handleMouseEnter = () => {
    if (!isVideo) return
    isHoveredRef.current = true
    setIsHovered(true)
    const video = videoRef.current
    if (video) {
      try {
        const p = video.play()
        if (p && typeof p.then === 'function') {
          playPromiseRef.current = p
          p.catch((err) => {
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              // Ignore standard interruption aborts
            }
          })
        }
      } catch (e) {}
    }
  }

  const handleMouseLeave = () => {
    if (!isVideo) return
    isHoveredRef.current = false
    setIsHovered(false)
    const video = videoRef.current
    if (video) {
      const p = playPromiseRef.current
      if (p && typeof p.then === 'function') {
        p.then(() => {
          if (!isHoveredRef.current && video) {
            video.pause()
            try {
              if (video.readyState >= 1) video.currentTime = 0
            } catch (e) {}
          }
        }).catch(() => {
          if (!isHoveredRef.current && video) {
            video.pause()
          }
        })
      } else {
        video.pause()
        try {
          if (video.readyState >= 1) video.currentTime = 0
        } catch (e) {}
      }
    }
  }

  useEffect(() => {
    if (!isVideo) return

    const handleWindowBlur = () => {
      if (isHoveredRef.current) {
        handleMouseLeave()
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isHoveredRef.current) {
        handleMouseLeave()
      }
    }

    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (videoRef.current) {
        try {
          videoRef.current.pause()
        } catch (e) {}
      }
    }
  }, [isVideo])

  const handleClick = (e) => {
    if (isVideo) {
      handleMouseLeave()
    }
    if (typeof onClick === 'function') {
      onClick(e)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      id={item.id}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.25) }}
      className={`scroll-mt-28 group flex flex-col rounded-2xl sm:rounded-[24px] overflow-hidden transition-all duration-500 cursor-pointer active:scale-[0.99] transform-gpu hover:will-change-transform ${
        isNightDive
          ? 'bg-[#001e3d] border border-white/15 shadow-none hover:border-accent/40'
          : 'bg-white border border-navy/10 shadow-sm hover:shadow-xl hover:border-cyan-500/30'
      }`}
      style={{ contain: 'layout paint' }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
    >
      {/* Media Container - 4:5 Ratio */}
      <div className={`relative aspect-[4/5] w-full overflow-hidden ${isNightDive ? 'bg-[#001e3d]' : 'bg-white'}`}>
        {item.type === 'video' ? (
          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            <LazyVideo
              ref={videoRef}
              src={item.src}
              lowResSrc={item.lowResSrc || item.previewVideo || item.preview}
              poster={item.poster || item.thumbnail || item.image}
              priority={priority}
              muted={true}
              defaultMuted={true}
              loop
              playsInline
              autoPlay={isHovered}
              playbackRate={item.playbackRate || (item.title?.toLowerCase().includes('clownfish and sea anemone') || item.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)}
              zoom={item.zoom || 1}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <SafeImage
            src={item.src}
            alt={item.title || 'Gallery item'}
            priority={priority}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        )}

        {/* Video Badge - Visible when not hovering */}
        {isVideo && (
          <div
            className={`absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 shadow-md pointer-events-none transition-all duration-300 ${
              isHovered ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
            }`}
          >
            <svg className="w-2.5 h-2.5 fill-white text-white shrink-0" viewBox="0 0 24 24">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase leading-none">
              Video
            </span>
          </div>
        )}

        {/* Hover Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

        {/* Expand Icon on Hover */}
        <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 h-6 w-6 sm:h-9 sm:w-9 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300 hover:scale-110 shadow-md [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>
      </div>

      {/* Information Panel Below Media - Title */}
      <div className={`p-2 sm:p-5 flex items-center justify-between gap-2 transition-colors ${
        isNightDive ? 'bg-[#001e3d] text-white' : 'bg-white text-navy'
      }`}>
        <h3 className={`font-heading text-xs sm:text-lg font-bold group-hover:text-accent transition duration-200 line-clamp-1 leading-tight ${
          isHighlighted ? 'text-accent font-extrabold' : (isNightDive ? 'text-white' : 'text-navy')
        }`}>
          {item.title}
        </h3>
        {isHighlighted && (
          <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#FFCD00] text-[#001e3d] px-2.5 py-0.5 rounded-full shadow-sm">
            Selected
          </span>
        )}
      </div>
    </motion.div>
  )
}

