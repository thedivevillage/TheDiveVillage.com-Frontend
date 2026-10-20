import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import LazyVideo from '../components/LazyVideo'
import SEOHead from '../components/SEOHead'
import MerchBannerCTA from '../components/MerchBannerCTA'
import FloatingVideoPip from '../components/FloatingVideoPip'
import { IMAGES, CAROUSEL_IMAGES } from '../utils/images'

import { CATEGORIES, SERVICES_DATA } from '../data/servicesData'
import useNightDive from '../hooks/useNightDive'
import { useLenis } from '../utils/lenisReact'

export default function Services() {
  const isNightDive = useNightDive()
  const lenis = useLenis()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [pipVideo, setPipVideo] = useState(null)

  const getInitialCategory = () => {
    const param = searchParams.get('category') || searchParams.get('tab')
    if (param && CATEGORIES.some(c => c.key === param)) {
      return param
    }
    if (location.pathname === '/courses') {
      return 'courses'
    }
    return 'all'
  }

  const [activeTab, setActiveTab] = useState(getInitialCategory)

  useEffect(() => {
    const param = searchParams.get('category') || searchParams.get('tab')
    if (param && CATEGORIES.some(c => c.key === param)) {
      setActiveTab(param)
    } else if (location.pathname === '/courses') {
      setActiveTab('courses')
    }
  }, [searchParams, location.pathname])

  const handleTabChange = (key) => {
    setActiveTab(key)
    if (key === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: key })
    }
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.6 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (location.hash && activeTab === 'all') {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(el, { offset: -120, duration: 1.0 })
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 150)
      }
    }
  }, [location.hash, activeTab, lenis])

  const isMatch = (service, catKey) => {
    if (service.category === catKey) return true
    if (Array.isArray(service.categories) && service.categories.includes(catKey)) return true
    return false
  }

  const filtered = activeTab === 'all'
    ? SERVICES_DATA
    : SERVICES_DATA.filter((s) => isMatch(s, activeTab))

  const grouped = CATEGORIES.slice(1).map(cat => ({
    category: cat,
    services: (activeTab === 'all' ? SERVICES_DATA : filtered).filter(s => isMatch(s, cat.key))
  })).filter(g => g.services.length > 0)

  return (
    <div className={`min-h-screen text-navy font-body pt-24 sm:pt-32 pb-24 overflow-x-clip transition-colors duration-500 ${isNightDive ? 'bg-[#003865]' : 'bg-[#FAFAFA]'}`} style={{ textShadow: 'none' }}>
      <SEOHead
        title="Scuba Diving & Ocean Services | Certified Courses, Snorkeling & Charters | The Dive Village"
        description="Explore professional scuba diving courses, certifications, guided snorkeling safaris, freediving, and bespoke dive charters at The Dive Village."
        keywords="scuba diving services, diving courses, snorkeling excursions, freediving lessons, dive charters, marine gear rental"
        canonicalUrl="https://thedivevillage.com/services"
      />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* 1. HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <span className={`inline-block rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 transition-colors ${
              isNightDive ? 'bg-white/10 text-white/90' : 'bg-black/5 text-navy/60'
            }`}>
              What We Offer
            </span>
            <h1 className={`font-heading text-4xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none transition-colors ${
              isNightDive ? 'text-white' : 'text-navy'
            }`}>
              {activeTab === 'courses' ? 'Our Courses' : 'Our Services'}
            </h1>
          </div>
          <p className={`max-w-md text-sm sm:text-base lg:text-lg font-medium leading-relaxed lg:pb-4 transition-colors ${
            isNightDive ? 'text-white/80' : 'text-navy/70'
          }`}>
            From beginner certifications and reef safaris to full island logistics and gear rentals — everything you need for the ultimate ocean adventure.
          </p>
        </div>

        {/* 2. CATEGORY FILTER TABS: Preserved in crisp day mode styling with Night Dive support */}
        <div className={`grid grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3 mb-10 sm:mb-16 border-b pb-5 sm:pb-6 ${isNightDive ? 'border-white/10' : 'border-navy/10'}`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              data-category-tab={cat.key}
              data-active={activeTab === cat.key ? 'true' : 'false'}
              onClick={() => handleTabChange(cat.key)}
              className={`group services-category-tab w-full md:w-auto rounded-xl md:rounded-full px-1.5 sm:px-3 md:px-5 py-2 md:py-2.5 text-[11px] xs:text-xs sm:text-sm font-bold text-center transition-all duration-200 cursor-pointer flex items-center justify-center ${activeTab === cat.key
                  ? 'bg-navy text-white shadow-md border-2 border-transparent'
                  : 'bg-white text-navy border border-navy/15 hover:bg-navy/5'
                }`}
            >
              <span className={`truncate ${activeTab === cat.key ? 'text-white' : ''}`}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* 3. SERVICES GRID: 2 Panels per row on mobile just like the product page */}
        {grouped.map((group, groupIndex) => (
          <div key={group.category.key} id={`category-${group.category.key}`} className="mb-14 sm:mb-24 scroll-mt-28">
            <div className="mb-6 sm:mb-10">
              <span className={`inline-block rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 transition-colors ${
                isNightDive ? 'bg-white/10 text-white/90' : 'bg-black/5 text-navy/60'
              }`}>
                Category
              </span>
              <h2 className={`font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none transition-colors ${
                isNightDive ? 'text-white' : 'text-navy'
              }`}>
                {group.category.label}
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
              {group.services.map((service, i) => {
                const isInitialBatch = groupIndex === 0 && i < 6
                return (
                  <div
                    key={service.id}
                    data-day-panel="true"
                    data-service-card="true"
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="group rounded-2xl sm:rounded-[32px] bg-white border border-navy/5 shadow-sm hover:shadow-float transition-[box-shadow,transform] duration-300 flex flex-col justify-between cursor-pointer overflow-hidden relative active:scale-[0.99] transform-gpu hover:will-change-transform"
                    style={{ contain: 'layout paint' }}
                  >
                    <div 
                      className="relative aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden bg-[#00172b] shrink-0"
                      onClick={(e) => {
                        const isCamping = service.id === 'addon-campers' || service.title?.toLowerCase().includes('camper') || service.title?.toLowerCase().includes('camp')
                        if (isCamping && service.video) {
                          e.stopPropagation()
                          setPipVideo({
                            video: service.video,
                          })
                        }
                      }}
                    >
                      {service.video ? (
                        <LazyVideo
                          src={service.video}
                          lowResSrc={service.lowResVideo || service.previewVideo}
                          poster={service.image}
                          priority={isInitialBatch}
                          autoPlay={true}
                          loop={true}
                          muted={true}
                          playsInline={true}
                          zoom={service.zoom || ((service.id === 'course-4' || service.id === 'combo-fundives' || service.title?.toLowerCase().includes('adventure diver') || service.title?.toLowerCase().includes('fun dive')) ? 2.95 : 1)}
                          zoomOrigin={service.zoomOrigin || (service.id === 'combo-fundives' || service.title?.toLowerCase().includes('fun dive') ? 'center 75%' : 'center center')}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                        />
                      ) : (
                        <SafeImage
                          src={service.image}
                          alt={service.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          imgClassName="w-full h-full object-cover object-center"
                        />
                      )}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-5 sm:right-3 z-20">
                        <h3 className="font-heading text-xs xs:text-sm sm:text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                          {service.title}
                        </h3>
                      </div>
                    </div>
                  <div className="p-2 sm:p-6 flex-1 flex flex-col">
                    <p className="text-[11px] sm:text-sm text-navy/70 leading-snug sm:leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                      {service.short_desc}
                    </p>
                  </div>
                  <div className="px-2 pb-2.5 sm:px-6 sm:pb-6 pt-0 mt-auto">
                    <div className="text-[10px] sm:text-sm font-bold text-navy flex items-center justify-between">
                      <span className="truncate">View Details</span>
                      <span className="text-xs sm:text-xl group-hover:translate-x-1 transition-transform text-accent font-bold ml-1 shrink-0">→</span>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        ))}

        {/* 4. THE POWER OF DIVING */}
        <div
          data-day-panel="true"
          data-power-diving="true"
          className={`rounded-[40px] bg-[#F0F2F5] p-8 sm:p-14 mb-24 border transition-colors duration-300 ${
            isNightDive ? 'border-white/60' : 'border-navy/20'
          }`}
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-navy/60 font-bold tracking-widest uppercase text-xs mb-3 block">Transformative Growth</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">The Power of Diving</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: 1,
                title: 'Unique Skill Development',
                desc: 'Builds confidence, discipline, and responsibility through mastering safety protocols and equipment handling.',
              },
              {
                num: 2,
                title: 'STEM Integration',
                desc: 'Directly connects to biology (self and marine ecosystems), physics (pressure, buoyancy) and environmental science (conservation).',
              },
              {
                num: 3,
                title: 'Physical & Mental Growth',
                desc: 'Enhances fitness, focus, and stress management while encouraging mindfulness in nature.',
              },
              {
                num: 4,
                title: 'Global Citizenship',
                desc: 'Instils respect for oceans and sustainability, aligning with modern educational goals.',
              },
            ].map((p) => (
              <div
                key={p.num}
                data-day-panel="true"
                className={`power-point-card bg-white rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col justify-between hover:-translate-y-1 transition duration-300 border ${
                  isNightDive ? 'border-white' : 'border-navy/15'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-navy text-accent flex items-center justify-center mb-5 text-lg font-bold">
                    {p.num}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-navy mb-3 leading-tight">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-navy/70 leading-relaxed font-medium">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. MERCHANDISE BANNER CALL TO ACTION */}
        <MerchBannerCTA className="mt-8" />

      </div>

      {/* Floating Picture-in-Picture Player */}
      {pipVideo && (
        <FloatingVideoPip
          videoSrc={pipVideo.video}
          poster={pipVideo.poster}
          onClose={() => setPipVideo(null)}
        />
      )}

      {/* Floating Back to Top Button with Lenis Smooth Glide */}
      <button
        type="button"
        onClick={() => {
          if (lenis) {
            lenis.scrollTo(0, { duration: 1.2 })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-40 bg-navy/90 hover:bg-navy text-white rounded-full p-3.5 shadow-2xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 group flex items-center gap-2 cursor-pointer"
      >
        <span className="text-xs font-bold hidden sm:inline text-white/90 group-hover:text-white">Back to Top</span>
        <svg className="w-4 h-4 text-accent group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  )
}
