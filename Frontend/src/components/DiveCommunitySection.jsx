import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GROUP_PHOTOS } from '../utils/products'
import { useLenis } from '../utils/lenisReact'
import useNightDive from '../hooks/useNightDive'
import { triggerHaptic } from '../utils/haptics'

export default function DiveCommunitySection({ className = '' }) {
  const isNightDive = useNightDive()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null)
  const lenis = useLenis()
  const activeThumbRef = useRef(null)
  const thumbContainerRef = useRef(null)

  const selectedPhoto = selectedPhotoIndex !== null ? GROUP_PHOTOS[selectedPhotoIndex] : null

  const nextPhoto = () => {
    triggerHaptic(8)
    setSelectedPhotoIndex((prev) => (prev === null ? 0 : (prev + 1) % GROUP_PHOTOS.length))
  }

  const prevPhoto = () => {
    triggerHaptic(8)
    setSelectedPhotoIndex((prev) => (prev === null ? 0 : (prev - 1 + GROUP_PHOTOS.length) % GROUP_PHOTOS.length))
  }

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        nextPhoto()
      } else {
        prevPhoto()
      }
    }
  }

  // Smoothly scroll active thumbnail into view when selected media changes
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [selectedPhotoIndex])

  // Lock background scroll and handle arrow keys when photo preview is open
  useEffect(() => {
    if (selectedPhotoIndex === null) return

    if (lenis) lenis.stop()
    const origBodyOverflow = document.body.style.overflow
    const origHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextPhoto()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevPhoto()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (lenis) lenis.start()
      document.body.style.overflow = origBodyOverflow
      document.documentElement.style.overflow = origHtmlOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhotoIndex, lenis])

  const defaultClasses = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-navy/10 mt-8'

  return (
    <section data-community-section="true" className={className || defaultClasses}>
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span
          className="community-badge text-xs font-extrabold uppercase tracking-widest text-accent block mb-2"
          style={{ color: '#FFCD00' }}
        >
          Community & Group Moments
        </span>
        <h2
          className={`community-heading font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 transition-colors ${
            isNightDive ? 'text-white' : 'text-navy'
          }`}
          style={{
            fontFamily: "'Antonio', sans-serif",
            color: isNightDive ? '#ffffff' : '#003865',
          }}
        >
          The Dive Village Community
        </h2>
        <p
          className={`community-description text-sm sm:text-base leading-relaxed transition-colors ${
            isNightDive ? 'text-white/80' : 'text-navy/70'
          }`}
          style={{
            fontFamily: '"Google Sans Flex", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            color: isNightDive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 56, 101, 0.7)',
          }}
        >
          Behind every dive suit, expedition bag, and rash guard is a vibrant community of divers, ocean lovers, and adventurers exploring the deep blue together.
        </p>
      </div>

      {/* Group Photos Masonry / Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {GROUP_PHOTOS.map((photo, idx) => (
          <div
            key={photo.id || idx}
            data-day-panel="true"
            onClick={() => {
              triggerHaptic(8)
              setSelectedPhotoIndex(idx)
            }}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-float transition duration-300 border border-navy/5"
          >
            <img
              src={photo.src}
              alt={photo.title || 'Community Photo'}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal - Shop Preview Box Style with Thumbnails Below (No Number, No Names) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              key="community-lightbox-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedPhotoIndex(null)}
              data-lenis-prevent="true"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                overscrollBehavior: 'contain',
                touchAction: 'none',
              }}
              className="fixed inset-0 z-[100000] bg-black/60 sm:bg-black/65 flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden"
            >
              {/* Modal Dialog Card Container: matches shop preview box */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                data-community-modal-dialog="true"
                style={{ backgroundColor: '#ffffff', color: '#111827' }}
                className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-[96vw] max-w-[1260px] h-[95vh] max-h-[96vh] flex flex-col items-center justify-between p-2 sm:p-3 sm:pb-3.5 overflow-hidden"
              >
                {/* Circular Close Button 'X' in top-right corner of modal */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8)
                    setSelectedPhotoIndex(null)
                  }}
                  aria-label="Close dialog"
                  className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-600/85 hover:bg-gray-800 text-white flex items-center justify-center transition shadow-md active:scale-90 cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>

                {/* Main Center Image Display Area */}
                <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden my-1">
                  {/* Left Navigation Chevron Button */}
                  {GROUP_PHOTOS.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        prevPhoto()
                      }}
                      aria-label="Previous photo"
                      className="absolute left-2 sm:left-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-xl text-gray-800 flex items-center justify-center hover:bg-gray-100 active:scale-90 cursor-pointer transition border border-gray-150"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                  )}

                  {/* Right Navigation Chevron Button */}
                  {GROUP_PHOTOS.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        nextPhoto()
                      }}
                      aria-label="Next photo"
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
                      key={selectedPhoto.src}
                      src={selectedPhoto.src}
                      alt={selectedPhoto.title || 'Community Photo'}
                      className="h-full max-h-[77vh] sm:max-h-[81vh] w-auto max-w-full object-contain rounded-xs select-none shadow-xs"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Bottom Thumbnail Strip - matching shop preview box (No numbers, No names, just thumbnails) */}
                {GROUP_PHOTOS.length > 1 && (
                  <div 
                    ref={thumbContainerRef}
                    className="w-full pt-2 mt-1 border-t border-gray-150 flex items-center justify-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 shrink-0 select-none"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {GROUP_PHOTOS.map((photo, idx) => {
                      const isSelected = selectedPhotoIndex === idx
                      return (
                        <button
                          key={photo.id || idx}
                          ref={isSelected ? activeThumbRef : null}
                          type="button"
                          onClick={() => {
                            triggerHaptic(6)
                            setSelectedPhotoIndex(idx)
                          }}
                          className={`relative w-14 h-11 sm:w-16 sm:h-12 rounded-xs overflow-hidden border-2 transition cursor-pointer shrink-0 bg-white ${
                            isSelected
                              ? 'border-gray-900 ring-1 ring-gray-900 shadow-xs scale-105'
                              : 'border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={photo.src}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
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
    </section>
  )
}
