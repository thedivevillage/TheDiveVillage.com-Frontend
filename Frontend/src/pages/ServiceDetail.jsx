import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { SERVICES_DATA, CATEGORIES, FUN_DIVES_PACKAGES } from '../data/servicesData'
import SafeImage from '../components/SafeImage'
import LazyVideo from '../components/LazyVideo'
import Button from '../components/Button'
import SEOHead from '../components/SEOHead'

const DEFAULT_FAQS = [
  {
    q: "Do I need to be a strong swimmer?",
    a: "For entry-level programs like Try Dive or Discover Scuba, basic water comfort is enough. For full certifications, you must be able to swim 200m continuously and float for 10 minutes."
  },
  {
    q: "Is scuba diving safe?",
    a: "Yes! Scuba diving is extremely safe when guided by our certified diving professionals. We maintain strict safety protocols and small student-to-instructor ratios."
  },
  {
    q: "What should I bring with me?",
    a: "Just bring your swimsuit, a towel, reef-safe sunscreen, and a sense of adventure! We provide all the required equipment."
  }
]

export default function ServiceDetail() {
  const { id } = useParams()
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedFunPackage, setSelectedFunPackage] = useState(FUN_DIVES_PACKAGES[1] || FUN_DIVES_PACKAGES[0])
  const [funCategoryFilter, setFunCategoryFilter] = useState('day')

  const service = SERVICES_DATA.find((s) => s.id === id) || (id === 'combo-fundives' ? SERVICES_DATA.find(s => s.id === 'combo-fundives') : null)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const isFunDivesCombo = service.id === 'combo-fundives' || service.isFunDivesContainer
  const isSingleFunDive = service.category === 'fundives'
  const categoryLabel = CATEGORIES.find(c => c.key === service.category)?.label || (isFunDivesCombo ? 'Combos & Packages' : 'Services')
  const activeFaqs = service.faqs && service.faqs.length > 0 ? service.faqs : DEFAULT_FAQS

  const filteredFunPackages = FUN_DIVES_PACKAGES.filter(
    (pkg) => !pkg.funType || pkg.funType === funCategoryFilter
  )

  // Parse highlight string into pills
  const highlightItems = service.highlights
    ? service.highlights.split('|').map(item => item.trim()).filter(Boolean)
    : []

  const activeHeroVideo = (isFunDivesCombo && selectedFunPackage?.video) ? selectedFunPackage.video : service.video
  const activeHeroImage = (isFunDivesCombo && selectedFunPackage?.image) ? selectedFunPackage.image : service.image
  const activeHeroTitle = (isFunDivesCombo && selectedFunPackage?.title) ? `${selectedFunPackage.title} Package` : service.title
  const activeHeroDesc = (isFunDivesCombo && selectedFunPackage?.short_desc) ? selectedFunPackage.short_desc : service.short_desc

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-navy font-body overflow-x-hidden" style={{ textShadow: 'none' }}>
      <SEOHead
        title={`${activeHeroTitle} | The Dive Village Services`}
        description={activeHeroDesc || service.long_desc}
        keywords="scuba diving, fun dives, diving packages, andaman dive village"
        canonicalUrl={`https://thedivevillage.com/services/${service.id}`}
      />
      
      {/* 1. HERO BANNER WITH SMOOTH FADE OUT */}
      <section className="relative w-full h-[58vh] min-h-[440px] lg:h-[62vh] lg:min-h-[480px] overflow-hidden flex flex-col justify-end pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)'
          }}
        >
          {activeHeroVideo ? (
            <LazyVideo
              key={activeHeroVideo}
              ref={(el) => {
                if (el) {
                  el.muted = true
                  el.defaultMuted = true
                  el.setAttribute('muted', '')
                  el.setAttribute('playsinline', '')
                  el.play().catch(() => {})
                }
              }}
              src={activeHeroVideo}
              poster={activeHeroImage}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onPlay={(e) => { e.currentTarget.playbackRate = 0.75 }}
              className="w-full h-full object-cover object-center transition-all duration-700"
            />
          ) : (
            <SafeImage
              key={activeHeroImage}
              src={activeHeroImage}
              alt={activeHeroTitle}
              className="w-full h-full object-cover object-center transition-all duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001428]/70 via-[#001428]/30 to-transparent pointer-events-none" />
        </div>
        
        {/* Bottom Ultra-Smooth Dissolve & Merge Layer into page background */}
        <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 lg:h-44 pointer-events-none z-[5] bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 via-45% to-transparent" />
        
        <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            key={activeHeroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center gap-3 mb-3 sm:mb-4 flex-wrap">
              <Link
                to={service.category ? `/services?category=${service.category}` : '/services'}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition cursor-pointer"
              >
                ← Back to Services
              </Link>
              <span className="inline-block bg-accent/30 border border-accent/50 backdrop-blur-md rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold text-accent uppercase tracking-widest">
                {categoryLabel}
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none mb-3 sm:mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {activeHeroTitle}
            </h1>
            <p className="max-w-2xl text-base sm:text-xl font-medium text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {activeHeroDesc}
            </p>

            {/* Quick Badges in Hero */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-4 sm:mt-6">
              {service.min_age && (
                <span className="rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-[11px] sm:text-xs font-bold">
                  Min Age: {service.min_age} yrs
                </span>
              )}
              {service.days_min && (
                <span className="rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-[11px] sm:text-xs font-bold">
                  Duration: {service.days_min}{service.days_max && service.days_max !== service.days_min ? `–${service.days_max}` : ''} {service.days_min === 1 && !service.days_max ? 'Day' : 'Days'}
                </span>
              )}
              {highlightItems.map((hl, i) => (
                <span key={i} className="rounded-full bg-accent/20 backdrop-blur-md text-white border border-accent/40 px-3 py-1 text-[11px] sm:text-xs font-bold">
                  {hl}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. DEDICATED FUN DIVES PACKAGE SELECTOR (IF VIEWING FUN DIVES COMBO) */}
      {isFunDivesCombo && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="rounded-[36px] bg-white border border-navy/10 p-6 sm:p-10 lg:p-12 shadow-card">
            
            {/* Header & Filter Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pb-8 border-b border-navy/10">
              <div>
                <span className="inline-block bg-accent/20 text-[#003865] rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider mb-2">
                  Certified Diver Packages
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-navy">
                  Choose Your Fun Dive Package
                </h2>
                <p className="text-sm sm:text-base text-navy/70 mt-2 font-medium max-w-xl">
                  Select how many dives you want to explore. From quick 1-day visits to 12-dive comprehensive island expeditions.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {[
                  { key: 'day', label: 'Day Dive' },
                  { key: 'dawn', label: 'Dawn Dive' },
                  { key: 'night', label: 'Night Dive' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFunCategoryFilter(tab.key)}
                    className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                      funCategoryFilter === tab.key
                        ? 'bg-navy text-white shadow-md'
                        : 'bg-[#F0F2F5] text-navy/70 hover:bg-navy/10 hover:text-navy'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Fun Dive Packages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredFunPackages.map((pkg) => {
                const isSelected = selectedFunPackage?.id === pkg.id
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedFunPackage(pkg)}
                    className={`rounded-3xl border-2 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-accent bg-accent/5 shadow-float scale-[1.01]'
                        : 'border-navy/10 bg-white hover:border-navy/30 hover:shadow-card'
                    }`}
                  >
                    <div>
                      {/* Media Preview */}
                      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-navy/10 mb-4">
                        {pkg.video ? (
                          <LazyVideo
                            src={pkg.video}
                            poster={pkg.image}
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            playsInline={true}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                          />
                        ) : (
                          <SafeImage
                            src={pkg.image}
                            alt={pkg.title}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            imgClassName="w-full h-full object-cover object-center"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute top-3 left-3 rounded-full bg-navy/85 backdrop-blur-md text-white px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm">
                          {pkg.badge}
                        </span>
                        {isSelected && (
                          <span className="absolute top-3 right-3 rounded-full bg-accent text-navy px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-md">
                            ✓ Selected
                          </span>
                        )}
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-white leading-tight">
                            {pkg.title}
                          </h3>
                        </div>
                      </div>

                      {/* Package Description & Highlights */}
                      <p className="text-xs sm:text-sm text-navy/70 leading-relaxed font-medium mb-4">
                        {pkg.short_desc}
                      </p>

                      <div className="rounded-xl bg-[#F0F2F5] p-3 text-[11px] font-semibold text-navy/80 mb-4">
                        {pkg.highlights}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-navy/10 flex items-center gap-2">
                      <Button
                        as={Link}
                        to={`/book-us?service=${pkg.id}`}
                        variant={isSelected ? 'gold' : 'navy'}
                        className="flex-1 justify-center py-2.5 text-xs font-bold shadow-sm"
                      >
                        Book {pkg.title}
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFunPackage(pkg)
                        }}
                        className={`rounded-full px-3 py-2 text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-accent/20 border-accent text-navy'
                            : 'bg-white border-navy/20 text-navy/70 hover:bg-navy/5'
                        }`}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Package Spotlight Card */}
            {selectedFunPackage && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-gradient-to-br from-[#00223D] via-[#003865] to-[#00172A] p-6 sm:p-10 text-white shadow-lift flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
              >
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent text-navy px-3 py-1 text-xs font-black uppercase tracking-wider mb-3">
                    <span>Active Selection</span>
                    <span>•</span>
                    <span>{selectedFunPackage.badge}</span>
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">
                    {selectedFunPackage.title} Package
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium mb-4">
                    {selectedFunPackage.long_desc}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-bold text-accent">
                    <span>✓ Certified Guide Included</span>
                    <span>✓ Full Scuba Gear Provided</span>
                    <span>✓ Island Boat Transport</span>
                  </div>
                </div>

                <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                  <Button
                    as={Link}
                    to={`/book-us?service=${selectedFunPackage.id}`}
                    variant="gold"
                    className="w-full justify-center py-4 px-8 text-sm sm:text-base font-black shadow-lg"
                  >
                    Proceed to Book {selectedFunPackage.title} →
                  </Button>
                  <Button
                    as={Link}
                    to="/contact"
                    className="w-full justify-center py-3 px-8 text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    Inquire Custom Dates
                  </Button>
                </div>
              </motion.div>
            )}

          </div>
        </section>
      )}

      {/* 3. STANDARD OVERVIEW & INCLUSIONS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left Column: Description & FAQs */}
        <div className="lg:col-span-7 xl:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg text-navy/80 leading-relaxed font-medium"
          >
            {isSingleFunDive && (
              <div className="mb-8 p-4 rounded-2xl bg-[#003865]/10 border border-[#003865]/20 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-bold text-navy uppercase tracking-wider block">Part of Fun Dives Package</span>
                  <p className="text-sm font-medium text-navy/70">Explore all 1 to 12-dive bundles, night dives, and dawn packages.</p>
                </div>
                <Link
                  to="/services/combo-fundives"
                  className="rounded-full bg-navy text-white px-4 py-2 text-xs font-bold hover:bg-accent hover:text-navy transition shadow-sm"
                >
                  View All Fun Dive Packages →
                </Link>
              </div>
            )}

            {/* Overview Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-navy/5 mb-12">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-4">Program Overview</h2>
              <p className="text-base sm:text-lg text-navy/80 leading-relaxed">{service.long_desc}</p>
            </div>

            {/* Highlights Breakdown Grid */}
            {highlightItems.length > 0 && (
              <div className="mb-12">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-navy mb-4">Key Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {highlightItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/15 text-navy flex items-center justify-center shrink-0 font-bold text-xs">
                        ✓
                      </div>
                      <span className="text-sm font-bold text-navy">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INCLUSIONS */}
            <div className="mb-16">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-navy mb-6">What's Included</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/5">
                  <h4 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    Included
                  </h4>
                  <ul className="space-y-3">
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Premium Scuba Equipment</li>
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Certified Divemaster / Instructor</li>
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Boat Logistics & Surface Interval Drinks</li>
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Pre-Dive Site Briefing & Safety Checks</li>
                  </ul>
                </div>
                <div className="bg-[#F0F2F5] rounded-2xl p-6 border border-navy/5">
                  <h4 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </span>
                    Excluded
                  </h4>
                  <ul className="space-y-3">
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Flights & Ferry Transfers</li>
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Personal Travel Insurance</li>
                    <li className="text-sm font-medium text-navy/70 flex items-center gap-2">Alcoholic Beverages</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SERVICE SPECIFIC FAQS */}
            <div className="mb-8">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-navy mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {activeFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-navy/5 overflow-hidden shadow-sm transition-all duration-200">
                      <button 
                        type="button"
                        data-no-glass
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="faq-box-btn w-full text-left px-6 py-5 flex items-center justify-between font-bold text-navy hover:bg-navy/5 transition-colors text-sm sm:text-base cursor-pointer select-none"
                      >
                        <span className="pr-4">{faq.q}</span>
                        <span className={`text-2xl transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45 text-navy' : 'text-navy/50'}`}>+</span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                          >
                            <div className="px-6 pb-5 text-navy/70 text-sm font-medium leading-relaxed border-t border-navy/5 pt-3">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

          </motion.div>
        </div>

        {/* Right Column: Sticky Sidebar / Details */}
        <div className="lg:col-span-5 xl:col-span-4 relative">
          <div className="sticky top-32 bg-white rounded-[32px] p-8 shadow-card border border-navy/5">
            <h3 className="font-heading text-xl font-bold text-navy mb-6 uppercase tracking-wider text-sm">Service Details</h3>
            
            <ul className="space-y-5 mb-10">
              {service.highlights && (
                <li className="flex items-start gap-4 text-sm font-medium text-navy/80">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center shrink-0 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-navy/50 font-bold mb-0.5">Highlights</span>
                    <span>{service.highlights}</span>
                  </div>
                </li>
              )}
              {service.days_min && (
                <li className="flex items-start gap-4 text-sm font-medium text-navy/80">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center shrink-0 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-navy/50 font-bold mb-0.5">Duration</span>
                    <span>{service.days_min}{service.days_max && service.days_max !== service.days_min ? `–${service.days_max}` : ''} {service.days_min === 1 && !service.days_max ? 'Day' : 'Days'}</span>
                  </div>
                </li>
              )}
              {service.min_age && (
                <li className="flex items-start gap-4 text-sm font-medium text-navy/80">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center shrink-0 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-navy/50 font-bold mb-0.5">Requirements</span>
                    <span>Minimum Age {service.min_age} yrs</span>
                  </div>
                </li>
              )}
            </ul>

            <div className="flex flex-col gap-3">
              <Button
                as={Link}
                to={isFunDivesCombo && selectedFunPackage ? `/book-us?service=${selectedFunPackage.id}` : `/book-us?service=${service.id}`}
                variant="gold"
                className="w-full justify-center py-4 text-base shadow-md"
              >
                Book Now
              </Button>
              <Button
                as={Link}
                to="/contact"
                variant="navy"
                className="w-full justify-center py-4 text-base shadow-md"
              >
                Enquire More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
