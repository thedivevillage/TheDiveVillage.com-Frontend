import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import LazyVideo from '../components/LazyVideo'
import SEOHead from '../components/SEOHead'
import MerchBannerCTA from '../components/MerchBannerCTA'
import { IMAGES, CAROUSEL_IMAGES } from '../utils/images'

import { CATEGORIES, SERVICES_DATA } from '../data/servicesData'

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()

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
  }

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
    <div className="bg-[#FAFAFA] min-h-screen text-navy font-body pt-24 sm:pt-32 pb-24 overflow-x-hidden" style={{ textShadow: 'none' }}>
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
            <span className="inline-block bg-black/5 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-bold text-navy/60 uppercase tracking-widest mb-3 sm:mb-4">
              What We Offer
            </span>
            <h1 className="font-heading text-4xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-navy leading-none">
              {activeTab === 'courses' ? 'Our Courses' : 'Our Services'}
            </h1>
          </div>
          <p className="max-w-md text-sm sm:text-base lg:text-lg font-medium text-navy/70 leading-relaxed lg:pb-4">
            From beginner certifications and reef safaris to full island logistics and gear rentals — everything you need for the ultimate ocean adventure.
          </p>
        </div>

        {/* 2. CATEGORY FILTER TABS: 3 Categories in one line on mobile, flex wrap on desktop */}
        <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3 mb-10 sm:mb-16 border-b border-navy/10 pb-5 sm:pb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleTabChange(cat.key)}
              className={`w-full md:w-auto rounded-xl md:rounded-full px-1.5 sm:px-3 md:px-5 py-2 md:py-2.5 text-[11px] xs:text-xs sm:text-sm font-bold text-center transition-all duration-200 cursor-pointer flex items-center justify-center ${activeTab === cat.key
                  ? 'bg-navy text-white shadow-md'
                  : 'bg-[#F0F2F5] text-navy/70 hover:bg-navy/10 hover:text-navy'
                }`}
            >
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* 3. SERVICES GRID: 2 Panels per row on mobile just like the product page */}
        {grouped.map((group) => (
          <div key={group.category.key} className="mb-14 sm:mb-24">
            <div className="mb-6 sm:mb-10">
              <span className="inline-block bg-black/5 rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold text-navy/60 uppercase tracking-widest mb-2 sm:mb-3">
                Category
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy leading-none">
                {group.category.label}
              </h2>
            </div>
            <div className={`grid grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8 ${group.services.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
              {group.services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (i % 3) * 0.05 }}
                  onClick={() => navigate(`/services/${service.id}`)}
                  className="group rounded-2xl sm:rounded-[32px] bg-white border border-navy/5 shadow-sm hover:shadow-float transition duration-300 flex flex-col justify-between cursor-pointer overflow-hidden relative active:scale-[0.99]"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden bg-[#00172b] shrink-0">
                    {service.video ? (
                      <LazyVideo
                        src={service.video}
                        poster={service.image}
                        autoPlay={true}
                        loop={true}
                        muted={true}
                        playsInline={true}
                        className="absolute inset-0 w-full h-full object-cover object-center transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <SafeImage
                        src={service.image}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover object-center transition duration-700 group-hover:scale-105"
                        imgClassName="w-full h-full object-cover object-center"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-5 sm:right-3 z-20">
                      <h3 className="font-heading text-xs xs:text-sm sm:text-xl font-bold text-white leading-tight line-clamp-2">
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
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* 4. THE POWER OF DIVING */}
        <div className="rounded-[40px] bg-[#F0F2F5] p-8 sm:p-14 mb-24">
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
              <div key={p.num} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col justify-between hover:-translate-y-1 transition duration-300">
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
    </div>
  )
}
