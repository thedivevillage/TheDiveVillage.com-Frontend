import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const merch0 = 'https://res.cloudinary.com/bbgt5nk7/image/upload/v1790244020/dive-village/reviews/scthqb8u6jscwk2laiyv.jpg'
const merch1 = 'https://res.cloudinary.com/bbgt5nk7/image/upload/v1790244022/dive-village/reviews/lq36jjo99ualm5y6cnwg.jpg'
const merch2 = 'https://res.cloudinary.com/bbgt5nk7/image/upload/v1790244024/dive-village/reviews/hyfyou1sr4xmjg87vqp0.jpg'
const merch3 = 'https://res.cloudinary.com/bbgt5nk7/image/upload/v1790244025/dive-village/reviews/feaskib6hvao8x3ucetz.jpg'
const merch4 = 'https://res.cloudinary.com/bbgt5nk7/image/upload/v1790244030/dive-village/reviews/aqniyjug5ropcb9xcorv.jpg'
const merch5 = 'https://res.cloudinary.com/bbgt5nk7/video/upload/v1790240882/dive-village/reviews/merch_5_mp4.mp4';
import LazyVideo from './LazyVideo'

export const MERCH_MEDIA_ITEMS = [
  { id: 'm0', src: merch0, type: 'image', alt: 'Customer Merch 0' },
  { id: 'm1', src: merch1, type: 'image', alt: 'Customer Merch 1' },
  { id: 'm2', src: merch2, type: 'image', alt: 'Customer Merch 2' },
  { id: 'm3', src: merch3, type: 'image', alt: 'Customer Merch 3' },
  { id: 'm4', src: merch4, type: 'image', alt: 'Customer Merch 4' },
  { id: 'm5', src: merch5, type: 'video', alt: 'Customer Merch 5' },
]

export default function CustomerReviews({ className = '' }) {
  const [activeMedia, setActiveMedia] = useState(null)

  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 ${className}`} id="customer-reviews">
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block rounded-full bg-navy/10 border border-navy/20 px-4 py-1.5 text-xs font-bold text-navy uppercase tracking-widest mb-3">
          Community Showcase
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
          Customer Reviews
        </h2>
      </div>

      {/* Media Grid: 6 Items (Images & Video) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {MERCH_MEDIA_ITEMS.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setActiveMedia(item)}
            className="group relative w-full rounded-3xl overflow-hidden bg-[#EAEFF4] border border-navy/10 shadow-card hover:shadow-float hover:-translate-y-1.5 transition-all duration-300 cursor-pointer aspect-[4/5] sm:aspect-[3/4]"
          >
            {item.type === 'video' ? (
              <div className="w-full h-full relative">
                <LazyVideo
                  src={item.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ) : (
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            {/* Hover Glass Overlay */}
            <div className="absolute inset-0 bg-navy/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-navy shadow-lg flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>View</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeMedia && (
          <div
            className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md cursor-pointer overflow-hidden"
            style={{
              top: 'var(--toolbar-bottom, 64px)',
              overscrollBehavior: 'contain',
              touchAction: 'none',
            }}
            onClick={() => setActiveMedia(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] rounded-3xl overflow-hidden bg-black flex items-center justify-center shadow-2xl border border-white/20 cursor-default"
            >
              <button
                type="button"
                onClick={() => setActiveMedia(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-[#FFCD00] hover:text-[#001e3d] text-white flex items-center justify-center font-bold text-lg transition cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>

              {activeMedia.type === 'video' ? (
                <LazyVideo
                  src={activeMedia.src}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-h-[calc(100vh-var(--toolbar-bottom,64px)-48px)] max-w-full object-contain"
                />
              ) : (
                <img
                  src={activeMedia.src}
                  alt={activeMedia.alt}
                  className="max-h-[calc(100vh-var(--toolbar-bottom,64px)-48px)] max-w-full object-contain"
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
