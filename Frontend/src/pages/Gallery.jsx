import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useSearchParams } from 'react-router'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import LazyVideo from '../components/LazyVideo'
import SEOHead from '../components/SEOHead'
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../utils/galleryData'
import { triggerHaptic } from '../utils/haptics'
import { shareContent } from '../utils/share'
import { useLenis } from '../utils/lenisReact'
import { getOptimizedImageUrl, getOptimizedVideoPoster } from '../utils/mediaOptimizer'
import useNightDive from '../hooks/useNightDive'

const rawDiversBg = 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1791458258/TDV-Media/Products/Group/4M7A6732.jpg'
const diversBg = rawDiversBg

const cleanTitle = (t) => (t ? t.replace(/\s*\(\d+\)/g, '').trim() : '')
const SANITIZED_GALLERY_ITEMS = GALLERY_ITEMS.map((item) => ({
  ...item,
  title: cleanTitle(item.title),
}))

export default function Gallery() {
  const isNightDive = useNightDive()
  const [itemsList, setItemsList] = useState(SANITIZED_GALLERY_ITEMS)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null)
  const [highlightedItemId, setHighlightedItemId] = useState(null)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const reduce = useReducedMotion()
  const lenis = useLenis()

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTabChange = (key) => {
    setActiveTab(key)
    const activeLenis = lenis || (typeof window !== 'undefined' ? window.lenis : null)
    if (activeLenis && typeof activeLenis.scrollTo === 'function') {
      activeLenis.scrollTo(0, { duration: 0.6 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return itemsList
    if (activeTab === 'videos') return itemsList.filter((i) => i.type === 'video')
    if (activeTab === 'photos') return itemsList.filter((i) => i.type === 'image')
    return itemsList.filter((i) => i.category === activeTab)
  }, [itemsList, activeTab])
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
    <div className={`${isNightDive ? 'bg-[#003865] text-white' : 'bg-[#FAFAFA] text-navy'} min-h-screen font-body pt-24 sm:pt-32 pb-24 overflow-x-hidden transition-colors duration-500`} style={{ textShadow: 'none' }}>
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
            <span className="inline-block bg-black/5 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-bold text-navy/60 uppercase tracking-widest mb-3 sm:mb-4">
              Visual Chronicles
            </span>
            <h1 className="font-heading text-4xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-navy leading-none">
              Gallery
            </h1>
          </div>
          <p className="max-w-md text-sm sm:text-base lg:text-lg font-medium text-navy/70 leading-relaxed lg:pb-4">
            Moments frozen in time beneath the waves. Explore our underwater expeditions, marine encounters, species identification, and village life.
          </p>
        </div>

        {/* 2. CATEGORY FILTER TABS */}
        <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3 mb-10 sm:mb-16 border-b border-navy/10 pb-5 sm:pb-6">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              data-category-tab={cat.key}
              data-active={activeTab === cat.key ? 'true' : 'false'}
              onClick={() => handleTabChange(cat.key)}
              className={`group gallery-category-tab w-full md:w-auto rounded-xl md:rounded-full px-2 sm:px-3 md:px-5 py-2 md:py-2.5 text-[11px] xs:text-xs sm:text-sm font-bold text-center transition-all duration-200 cursor-pointer flex items-center justify-center ${
                activeTab === cat.key
                  ? `bg-navy text-white shadow-md border-2 ${isNightDive ? 'border-[#FFCD00]' : 'border-transparent'}`
                  : `${isNightDive ? 'bg-[#001e3d] text-white/90 border-white/15 hover:bg-white/10 hover:text-white' : 'bg-white text-navy border border-navy/15 hover:bg-navy/5'}`
              }`}
            >
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
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
                className="fixed inset-0 z-[9990] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none overflow-hidden"
                style={{
                  overscrollBehavior: 'contain',
                  touchAction: 'none',
                }}
                onClick={() => setSelectedMediaIndex(null)}
                onTouchStart={handleLightboxTouchStart}
                onTouchEnd={handleLightboxTouchEnd}
              >
                {/* White Modal Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  data-gallery-modal="true"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#171717',
                  }}
                  className="gallery-preview-modal relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl lg:max-w-5xl h-[88vh] max-h-[820px] flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-hidden border border-neutral-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button: Dark circular button with white cross in top right */}
                  <button
                    id="gallery-preview-close"
                    data-gallery-close="true"
                    data-cursor-static="true"
                    type="button"
                    onClick={() => setSelectedMediaIndex(null)}
                    className="gallery-close-btn absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#5f6368] hover:bg-[#3c4043] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                    aria-label="Close Lightbox"
                    title="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  {/* Main Media Showcase Area */}
                  <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden px-4 sm:px-14 py-1">
                    {/* Previous Media Arrow: White Circle with Drop Shadow */}
                    {filteredItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); prevMedia() }}
                        className="gallery-nav-arrow absolute left-1 sm:left-4 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-700 hover:text-black hover:bg-neutral-50 shadow-[0_4px_16px_rgba(0,0,0,0.14)] border border-neutral-100 transition hover:scale-105 active:scale-95 cursor-pointer"
                        aria-label="Previous visual"
                        title="Previous"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Next Media Arrow: White Circle with Drop Shadow */}
                    {filteredItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); nextMedia() }}
                        className="gallery-nav-arrow absolute right-1 sm:right-4 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-700 hover:text-black hover:bg-neutral-50 shadow-[0_4px_16px_rgba(0,0,0,0.14)] border border-neutral-100 transition hover:scale-105 active:scale-95 cursor-pointer"
                        aria-label="Next visual"
                        title="Next"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Media Item (Video or Image) */}
                    {currentItem.type === 'video' ? (
                      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative">
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
                          style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                          className="w-full h-full max-w-full max-h-full object-contain flex items-center justify-center gallery-preview-video"
                          videoClassName="gallery-preview-video-element"
                        />
                      </div>
                    ) : (
                      <img
                        key={currentItem.src}
                        src={currentItem.src}
                        alt={currentItem.title || 'Gallery visual'}
                        decoding="async"
                        style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                        className="max-w-full max-h-full object-contain select-none m-auto block pointer-events-auto rounded-sm"
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Title & Index (Minimal & Clean) */}
                  <div className="flex items-center justify-between w-full px-2 sm:px-4 pt-1.5 pb-1 shrink-0">
                    <span className="gallery-title-text text-xs sm:text-sm font-semibold tracking-wide truncate max-w-[75%] text-neutral-800">
                      {currentItem.title}
                    </span>
                    <span className="gallery-counter-text text-[11px] sm:text-xs text-neutral-400 font-mono shrink-0">
                      {selectedMediaIndex + 1} / {filteredItems.length}
                    </span>
                  </div>

                  {/* Bottom Thumbnail Strip */}
                  {filteredItems.length > 1 && (
                    <div 
                      ref={thumbContainerRef}
                      className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto w-full max-w-full px-2 pt-1 pb-1 shrink-0 select-none"
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
                            className={`relative shrink-0 w-12 h-16 sm:w-14 sm:h-20 rounded-md overflow-hidden transition-all cursor-pointer ${
                              isActive
                                ? 'gallery-thumb-active border-2 border-black ring-1 ring-black/10 scale-105 opacity-100 shadow-sm'
                                : 'gallery-thumb-inactive border border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400 bg-neutral-100'
                            }`}
                            title={item.title}
                          >
                            {item.type === 'video' ? (
                              <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                                <video
                                  src={item.src}
                                  muted
                                  preload="metadata"
                                  className="w-full h-full object-cover pointer-events-none"
                                />
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

  return (
    <motion.div
      ref={cardRef}
      id={item.id}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.25) }}
      className={`scroll-mt-28 group flex flex-col rounded-2xl sm:rounded-[24px] overflow-hidden ${
        isNightDive ? 'bg-[#001e3d] border-white/10 text-white' : 'bg-white border-navy/10 text-navy'
      } shadow-sm hover:shadow-xl hover:border-cyan-500/30 transition-all duration-500 cursor-pointer active:scale-[0.99] transform-gpu hover:will-change-transform`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 350px', contain: 'layout paint' }}
      onClick={onClick}
    >
      {/* Media Container */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#00172b]">
        {item.type === 'video' ? (
          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            <LazyVideo
              src={item.src}
              lowResSrc={item.lowResSrc || item.previewVideo || item.preview}
              poster={item.poster || item.thumbnail || item.image}
              priority={priority}
              muted={true}
              defaultMuted={true}
              loop
              playsInline
              autoPlay={true}
              playbackRate={item.playbackRate || (item.title?.toLowerCase().includes('clownfish and sea anemone') || item.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)}
              zoom={
                item.title?.toLowerCase().includes('moray eel') || item.id === 'gallery-item-0'
                  ? 1
                  : (item.zoom || (
                      ['gallery-item-7', 'gallery-item-8', 'gallery-item-18', 'gallery-item-19', 'gallery-item-20'].includes(item.id) ||
                      ['Giant Barrel Sponge', 'Hawksbill Sea Turtle', 'Whale Shark', 'Whitetip Reef Shark'].some((t) => item.title?.trim() === t)
                        ? 2.85
                        : 1
                    ))
              }
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
      <div className={`p-2 sm:p-5 ${isNightDive ? 'bg-[#001e3d]' : 'bg-white'} flex items-center justify-between gap-2`}>
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

