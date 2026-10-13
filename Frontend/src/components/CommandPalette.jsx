import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { COURSE_CATALOG } from '../utils/courseEligibility'
import { SHOP_PRODUCTS } from '../utils/products'
import diveCountries from '../data/diveCountries.json'
import { GALLERY_ITEMS } from '../utils/galleryData'
import { triggerHaptic } from '../utils/haptics'

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Aggregate searchable items
  const allItems = useMemo(() => {
    const list = []

    // 1. Pages & Fast Navigation
    list.push(
      { id: 'page-home', type: 'page', title: 'Home Page', subtitle: 'Welcome to The Dive Village', url: '/', iconKey: 'home', category: 'Pages' },
      { id: 'page-book', type: 'page', title: 'Book A Dive / Course', subtitle: 'Online Dive Booking Wizard', url: '/book-us', iconKey: 'globe', category: 'Pages' },
      { id: 'page-services', type: 'page', title: 'Services & Expeditions', subtitle: 'Scuba Diving, Freediving, Surfing', url: '/services', iconKey: 'services', category: 'Pages' },
      { id: 'page-shop', type: 'page', title: 'Shop & Merchandise', subtitle: 'Apparel, Dry Bags, Rashguards & Gear', url: '/shop', iconKey: 'shop', category: 'Pages' },
      { id: 'page-gallery', type: 'page', title: 'Visual Gallery & Lightbox', subtitle: 'Underwater wildlife photos & videos', url: '/gallery', iconKey: 'gallery', category: 'Pages' },
      { id: 'page-about', type: 'page', title: 'About Our Story', subtitle: 'Our instructors, safety philosophy & mission', url: '/about', iconKey: 'about', category: 'Pages' },
      { id: 'page-contact', type: 'page', title: 'Contact Us', subtitle: 'Get in touch with dive masters & team', url: '/contact', iconKey: 'contact', category: 'Pages' }
    )

    // 2. Courses
    COURSE_CATALOG.forEach((c) => {
      list.push({
        id: `course-${c.id}`,
        type: 'course',
        title: c.name,
        subtitle: `Min. Age: ${c.minAge} yrs • ${c.category || 'Certification'}`,
        url: `/book-us?program=${encodeURIComponent(c.id)}`,
        iconKey: 'course',
        category: 'Courses',
        badge: `${c.minAge}+ yrs`,
      })
    })

    // 3. Products / Merchandise
    SHOP_PRODUCTS.forEach((p) => {
      list.push({
        id: `product-${p.id}`,
        type: 'product',
        title: p.title,
        subtitle: `${p.category || 'Official Gear'}`,
        url: `/product/${p.id}`,
        iconKey: 'product',
        category: 'Shop Gear',
        image: p.image || p.images?.[0],
      })
    })

    // 4. Dive Sites / Destinations
    ;(diveCountries || []).slice(0, 25).forEach((countryName) => {
      list.push({
        id: `site-${countryName}`,
        type: 'location',
        title: `${countryName} Dive Expeditions`,
        subtitle: `Explore world-class dive destinations in ${countryName}`,
        url: `/book-us`,
        iconKey: 'location',
        category: 'Dive Sites',
      })
    })

    // 5. Gallery highlights
    GALLERY_ITEMS.slice(0, 10).forEach((g) => {
      list.push({
        id: `gallery-${g.id}`,
        type: 'gallery',
        title: g.title,
        subtitle: `Underwater photo collection • ${g.category}`,
        url: `/gallery`,
        iconKey: 'gallery',
        category: 'Gallery',
      })
    })

    return list
  }, [])

  // Filter items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allItems.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      )
    })
  }, [allItems, query, activeCategory])

  // Keep selected index in range
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, activeCategory])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex]
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        triggerHaptic(5)
        setSelectedIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        triggerHaptic(5)
        setSelectedIndex((prev) => (filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          triggerHaptic(10)
          const target = filtered[selectedIndex]
          onClose()
          navigate(target.url)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, onClose, navigate])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-start justify-center pt-4 sm:pt-6 px-4 bg-black/70 backdrop-blur-md pointer-events-auto overflow-hidden"
        style={{ top: 'var(--toolbar-bottom, 64px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-[#00192e] text-white rounded-3xl border border-cyan-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[calc(100vh-var(--toolbar-bottom,64px)-32px)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search courses, dive sites, gear, pages... (Ctrl + K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-white placeholder:text-white/40 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-white/50 hover:text-white px-2 py-1 rounded-md bg-white/5 cursor-pointer"
              >
                Clear
              </button>
            )}
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white/10 text-white/70 px-2 py-0.5 rounded border border-white/15">
              ESC
            </kbd>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 overflow-x-auto scrollbar-none bg-[#001428]">
            {[
              { id: 'all', label: 'All' },
              { id: 'Courses', label: 'Courses (44)' },
              { id: 'Shop Gear', label: 'Gear & Shop' },
              { id: 'Dive Sites', label: 'Dive Sites' },
              { id: 'Pages', label: 'Navigation' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic(5)
                  setActiveCategory(cat.id)
                }}
                className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-cyan-400 text-navy font-extrabold shadow-sm'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 max-h-[50vh] scrollbar-thin scrollbar-thumb-cyan-500/20"
          >
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-white/50 text-sm">
                <span>No results found for "<strong className="text-white">{query}</strong>"</span>
              </div>
            ) : (
              filtered.map((item, index) => {
                const isSelected = index === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      triggerHaptic(10)
                      onClose()
                      navigate(item.url)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-sm'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ItemIcon type={item.type} iconKey={item.iconKey} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs sm:text-sm font-bold text-white truncate block">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono uppercase font-bold text-cyan-300 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20 shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/60 truncate block mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {item.badge && (
                        <span className="hidden sm:inline-block text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                          {item.badge}
                        </span>
                      )}
                      {isSelected && (
                        <kbd className="hidden sm:inline-flex items-center text-[9px] font-mono text-cyan-200 bg-cyan-500/30 px-1.5 py-0.5 rounded">
                          ↵ Enter
                        </kbd>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="px-4 py-2.5 bg-[#001020] border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
            <div className="flex items-center gap-3">
              <span>Navigate: <strong className="text-white">↑ / ↓</strong></span>
              <span>Open: <strong className="text-white">↵ Enter</strong></span>
              <span>Close: <strong className="text-white">Esc</strong></span>
            </div>
            <span>{filtered.length} match(es)</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function ItemIcon({ type, iconKey }) {
  if (type === 'course' || iconKey === 'course') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    )
  }
  if (type === 'product' || iconKey === 'product' || iconKey === 'shop') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    )
  }
  if (type === 'location' || iconKey === 'location') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    )
  }
  if (type === 'gallery' || iconKey === 'gallery') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-300">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    )
  }
  if (iconKey === 'home') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  }
  if (iconKey === 'globe') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )
  }
  if (iconKey === 'services') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
        <circle cx="12" cy="5" r="3"/>
        <line x1="12" y1="22" x2="12" y2="8"/>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      </svg>
    )
  }
  if (iconKey === 'about') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}
