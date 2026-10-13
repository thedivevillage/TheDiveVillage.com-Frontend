import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router'
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

const diversBg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458258/TDV-Media/Products/Group/4M7A6732.jpg'

const cleanTitle = (t) => (t ? t.replace(/\s*\(\d+\)/g, '').trim() : '')
const SANITIZED_GALLERY_ITEMS = GALLERY_ITEMS.map((item) => ({
  ...item,
  title: cleanTitle(item.title),
}))

export default function Gallery() {
  const [itemsList, setItemsList] = useState(SANITIZED_GALLERY_ITEMS)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null)
  const reduce = useReducedMotion()
  const lenis = useLenis()

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const filteredItems = itemsList

  // Always scroll to top when mounting or reloading the Gallery page
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    }
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      if (lenis) lenis.scrollTo(0, { immediate: true })
    }, 50)
    return () => clearTimeout(timer)
  }, [lenis])

  // High-Res Preloading for adjacent images in Lightbox
  useEffect(() => {
    if (selectedMediaIndex === null || !filteredItems.length) return
    const prevIdx = (selectedMediaIndex - 1 + filteredItems.length) % filteredItems.length
    const nextIdx = (selectedMediaIndex + 1) % filteredItems.length

    ;[prevIdx, nextIdx].forEach((idx) => {
      const item = filteredItems[idx]
      if (item && item.type !== 'video' && item.src) {
        const img = new Image()
        img.src = item.src
      }
    })
  }, [selectedMediaIndex, filteredItems])

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
    if (selectedMediaIndex === null) return

    // 1. Pause Lenis smooth scroll
    if (lenis) {
      lenis.stop()
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
      if (lenis) {
        lenis.start()
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

  // Ensure only 10 thumbnails are visible in a given time
  const thumbStartIndex = useMemo(() => {
    if (selectedMediaIndex === null || filteredItems.length <= 10) return 0
    return Math.max(0, Math.min(selectedMediaIndex - 4, filteredItems.length - 10))
  }, [selectedMediaIndex, filteredItems.length])

  const visibleThumbs = useMemo(() => {
    if (!filteredItems.length) return []
    const count = Math.min(10, filteredItems.length)
    return filteredItems.slice(thumbStartIndex, thumbStartIndex + count).map((item, idx) => ({
      item,
      index: thumbStartIndex + idx,
    }))
  }, [filteredItems, thumbStartIndex])

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
    <div className="bg-[#FAFAFA] min-h-screen text-navy font-body pt-24 sm:pt-32 pb-24 overflow-x-hidden" style={{ textShadow: 'none' }}>
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

        {/* GALLERY MASONRY / GRID: 2 Cards per row on mobile, 3 on desktop */}
        <div className="gallery-grid-container grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8 mb-14 sm:mb-24">
          {filteredItems.map((item, idx) => (
            <GalleryGridCard
              key={item.id}
              item={item}
              idx={idx}
              reduce={reduce}
              onClick={() => openLightbox(idx)}
            />
          ))}
        </div>

        {/* 4. INSTAGRAM & COMMUNITY SECTION */}
        <div className="rounded-[40px] bg-[#F0F2F5] p-8 sm:p-14 mb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">
                #TheDiveVillage
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
                Tag Us in Your Ocean Adventures
              </h2>
              <p className="text-navy/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                Every moment tells a story of discovery and courage. Share your dive logs, underwater encounters, and island moments with <span className="font-bold text-navy">@TheDiveVillage</span> on Instagram to get featured on our wall.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <a
                href="https://www.instagram.com/thedivevillage"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-navy text-white px-8 py-4 text-center text-sm font-bold shadow-soft hover:bg-accent hover:text-navy transition"
              >
                Follow on Instagram →
              </a>
              <Button as={Link} to="/book-us" variant="secondary" className="justify-center !border-navy/20 !text-navy hover:!bg-navy/5">
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

      {/* 6. IMMERSIVE LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedMediaIndex !== null && currentItem && (
          <div 
            data-lenis-prevent="true"
            className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex flex-col items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm overflow-hidden select-none"
            style={{
              top: 'var(--toolbar-bottom, 64px)',
              overscrollBehavior: 'contain',
              touchAction: 'none',
            }}
            onClick={() => setSelectedMediaIndex(null)}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Dark Blue, Preview Panel strictly below toolbar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-navy rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-3.5 max-w-4xl sm:max-w-5xl lg:max-w-6xl w-full h-full max-h-[calc(100vh-var(--toolbar-bottom,64px)-16px)] flex flex-col gap-2 select-none border border-white/15 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Top-Right Close Button */}
              <button
                id="gallery-preview-close"
                data-gallery-close="true"
                data-cursor-static="true"
                type="button"
                onClick={() => setSelectedMediaIndex(null)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-[#FFCD00] hover:text-[#001e3d] text-white flex items-center justify-center transition active:scale-90 cursor-pointer font-bold text-xs sm:text-sm border border-white/20 shadow-lg backdrop-blur-md"
                aria-label="Close Lightbox"
              >
                ✕
              </button>

              {/* Media Display Area (Fit to Window Size, No Overflow, No Crop) */}
              <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-black/95">
                {/* Previous Media Arrow */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prevMedia() }}
                  className="absolute left-3 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 hover:bg-[#FFCD00] hover:text-[#001e3d] text-white transition hover:scale-110 active:scale-90 cursor-pointer shadow-xl backdrop-blur-md border border-white/15"
                  aria-label="Previous visual"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Media Arrow */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); nextMedia() }}
                  className="absolute right-3 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 hover:bg-[#FFCD00] hover:text-[#001e3d] text-white transition hover:scale-110 active:scale-90 cursor-pointer shadow-xl backdrop-blur-md border border-white/15"
                  aria-label="Next visual"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {currentItem.type === 'video' ? (
                  <LazyVideo
                    src={currentItem.src}
                    controls
                    autoPlay
                    loop
                    playsInline
                    muted={true}
                    defaultMuted={true}
                    playbackRate={currentItem.playbackRate || (currentItem.title?.toLowerCase().includes('clownfish and sea anemone') || currentItem.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)}
                    className="w-full h-full max-w-full max-h-full object-contain flex items-center justify-center"
                  />
                ) : (
                  <SafeImage
                    src={currentItem.src}
                    alt={currentItem.title || 'Gallery visual'}
                    targetWidth={1600}
                    disableParallax={true}
                    className="w-full h-full max-w-full max-h-full flex items-center justify-center"
                    imgClassName="w-full h-full max-w-full max-h-full object-contain select-none m-auto"
                  />
                )}
              </div>

              {/* Bottom Title Bar: Bigger Title & Count */}
              <div className="flex items-center justify-between gap-4 px-1.5 w-full shrink-0">
                <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-white tracking-wide truncate">
                  {currentItem.title}
                </h2>
                <span className="text-xs sm:text-sm md:text-base font-bold text-[#FFCD00] tracking-wider shrink-0 font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  {selectedMediaIndex + 1} / {filteredItems.length}
                </span>
              </div>

              {/* Only 10 Thumbnails Visible in a Given Time (Compact & Centered at Bottom) */}
              {filteredItems.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto w-full pt-0.5 shrink-0">
                  {filteredItems.length > 10 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMediaIndex((prev) => Math.max(0, prev - 10))
                      }}
                      disabled={thumbStartIndex === 0}
                      className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-white/10 hover:bg-[#FFCD00] hover:text-[#001e3d] disabled:opacity-20 disabled:pointer-events-none text-white flex items-center justify-center transition active:scale-90 cursor-pointer font-bold border border-white/15 shadow-sm text-xs"
                      aria-label="Previous 10 thumbnails"
                      title="Previous 10"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* 10 Compact Visible Thumbnail Slots */}
                  <div className="grid grid-cols-10 gap-1 sm:gap-1.5 flex-1 min-w-0">
                    {visibleThumbs.map(({ item, index }) => {
                      const isActive = index === selectedMediaIndex
                      return (
                        <button
                          key={item.id || index}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            triggerHaptic(8)
                            setSelectedMediaIndex(index)
                          }}
                          className={`relative aspect-square w-full rounded-md sm:rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            isActive
                              ? 'border-[#FFCD00] shadow-md shadow-[#FFCD00]/20 ring-1 sm:ring-2 ring-[#FFCD00]/40 scale-105 opacity-100'
                              : 'border-white/15 opacity-50 hover:opacity-100 hover:border-white/40 bg-white/5'
                          }`}
                          title={item.title}
                        >
                          {item.type === 'video' ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                              <img
                                src={getOptimizedVideoPoster(item.src, { width: 120 })}
                                alt=""
                                className="w-full h-full object-cover pointer-events-none opacity-85"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[7px] sm:text-[8px]">
                                ▶
                              </div>
                            </div>
                          ) : (
                            <img
                              src={getOptimizedImageUrl(item.src, { width: 120 })}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {filteredItems.length > 10 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMediaIndex((prev) => Math.min(filteredItems.length - 1, prev + 10))
                      }}
                      disabled={thumbStartIndex + 10 >= filteredItems.length}
                      className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-white/10 hover:bg-[#FFCD00] hover:text-[#001e3d] disabled:opacity-20 disabled:pointer-events-none text-white flex items-center justify-center transition active:scale-90 cursor-pointer font-bold border border-white/15 shadow-sm text-xs"
                      aria-label="Next 10 thumbnails"
                      title="Next 10"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GalleryGridCard({ item, idx, reduce, onClick }) {
  const cardRef = useRef(null)
  const hoverTimerRef = useRef(null)

  const handleMouseEnter = () => {
    if (item.type !== 'video') return
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    // Hover 3 seconds to play
    hoverTimerRef.current = setTimeout(() => {
      const vid = cardRef.current?.querySelector('video')
      if (vid) {
        const rate = item.playbackRate || (item.title?.toLowerCase().includes('clownfish and sea anemone') || item.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)
        if (rate && rate !== 1) {
          vid.playbackRate = rate
        }
        vid.play().catch(() => {})
      }
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (item.type !== 'video') return
    // Cancel pending timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    // Stop video playing immediately and reset
    const vid = cardRef.current?.querySelector('video')
    if (vid) {
      vid.pause()
      vid.currentTime = 0
    }
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
      const vid = cardRef.current?.querySelector('video')
      if (vid) {
        vid.pause()
      }
    }
  }, [])

  return (
    <motion.div
      ref={cardRef}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.25) }}
      className="group flex flex-col rounded-2xl sm:rounded-[24px] overflow-hidden bg-white border border-navy/10 shadow-sm hover:shadow-xl hover:border-cyan-500/30 transition-all duration-300 cursor-pointer active:scale-[0.99]"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Container */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#00172b]">
        {item.type === 'video' ? (
          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            <LazyVideo
              src={item.src}
              muted={true}
              defaultMuted={true}
              loop
              playsInline
              autoPlay={false}
              playbackRate={item.playbackRate || (item.title?.toLowerCase().includes('clownfish and sea anemone') || item.src?.includes('Clownfish_and_Sea_Anemone') ? 0.7 : 1)}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <SafeImage
            src={item.src}
            alt={item.title || 'Gallery item'}
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
      <div className="p-2 sm:p-5 bg-white">
        <h3 className="font-heading text-xs sm:text-lg font-bold text-navy group-hover:text-accent transition duration-200 line-clamp-1 leading-tight">
          {item.title}
        </h3>
      </div>
    </motion.div>
  )
}
