import LazyVideo from '../components/LazyVideo'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'

// Reusable CourseTemplate based on the reference design
export default function CourseTemplate({
  heroImage,
  heroVideo,
  titleTop,
  titleBottom,
  heroSubtitle,
  aboutTitle,
  aboutSubtitle,
  aboutText,
  aboutImg1,
  aboutImg2,
  toursTitle = "Most Popular Tours",
  toursSubtitle = "You think you have what it takes?",
  tours = [],
  statsText = "Just take the plunge",
  statsDesc = "Experience the best diving with our highly experienced crew.",
  stats = [],
  statsImage,
  statsQuote = "We get to experience the majestic ocean up close.",
  ctaTitle = "Experience the thrill",
  ctaDesc = "Nothing is more exhilarating than coming face to face with nature.",
  ctaLink = "/book-us",
}) {
  const reduce = useReducedMotion()

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-navy font-body overflow-x-clip" style={{ textShadow: 'none' }}>
      {/* 1. HEADER VIDEO HERO (EXACT MATCH TO BOOK US DESIGN) */}
      <section className="relative h-[56vh] min-h-[420px] lg:h-[60vh] lg:min-h-[460px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)'
          }}
        >
          {heroVideo ? (
            <LazyVideo
              ref={(el) => {
                if (el) {
                  el.muted = true
                  el.defaultMuted = true
                  el.setAttribute('muted', '')
                  el.setAttribute('playsinline', '')
                  el.play().catch(() => {})
                }
              }}
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              onPlay={(e) => { e.currentTarget.playbackRate = 0.75 }}
              className="w-full h-full object-cover scale-110 origin-center transition-all duration-700"
              poster={heroImage}
            />
          ) : (
            <img 
              src={heroImage} 
              alt={titleTop ? `${titleTop} ${titleBottom || ''}` : 'Hero'} 
              className="w-full h-full object-cover scale-110 origin-center transition-all duration-700" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001428]/65 via-[#001428]/25 to-transparent pointer-events-none" />
        </div>

        {/* Bottom Ultra-Smooth Dissolve & Merge Layer */}
        <div 
          className="absolute bottom-0 inset-x-0 h-28 sm:h-36 lg:h-44 pointer-events-none z-[5] bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 via-45% to-transparent" 
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pt-4 sm:pt-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-white leading-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            {titleTop} {titleBottom && <span className="text-[#FFCD00]">{titleBottom}</span>}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl font-medium text-white/90 max-w-xl leading-relaxed drop-shadow-md text-center"
          >
            {heroSubtitle || aboutSubtitle || 'Select your location, group size, participant details, and matching programs. Our dive masters will get back to you.'}
          </motion.p>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="relative pt-6 sm:pt-10 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">{aboutSubtitle}</span>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.1] mb-6">
                {aboutTitle}
              </h2>
            </div>
            <div>
              <p className="text-navy/70 leading-relaxed text-base sm:text-lg mb-6">
                {aboutText}
              </p>
              <Link to={ctaLink} className="text-accent font-bold hover:text-navy transition flex items-center gap-1.5">
                Learn More <span>→</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
              <img src={aboutImg1} alt="About 1" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
              <img src={aboutImg2} alt="About 2" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* TOURS CAROUSEL SECTION */}
      <section className="relative py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">{toursTitle}</span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-navy leading-[1.1] max-w-md">
              {toursSubtitle}
            </h2>
          </div>
          <div className="flex gap-4">
             <button className="w-12 h-12 rounded-full border border-navy/20 flex items-center justify-center text-navy hover:bg-navy/5 transition"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
             <button className="w-12 h-12 rounded-full border border-navy/20 flex items-center justify-center text-navy hover:bg-navy/5 transition"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-12 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tours.map((tour, i) => (
            <div key={i} className="w-[85vw] sm:w-[350px] flex-shrink-0 snap-start bg-[#F8FAFC] rounded-3xl overflow-hidden shadow-sm border border-navy/5 group hover:shadow-xl transition duration-300 relative">
              <div className="aspect-[4/3] relative">
                <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute -bottom-4 right-6 bg-accent text-[#001e3d] font-bold text-sm px-4 py-2 rounded-xl shadow-lg">
                  Inquire
                </div>
              </div>
              <div className="p-8 pt-10">
                <h3 className="font-heading font-bold text-xl text-navy mb-2">{tour.title}</h3>
                <p className="text-navy/60 text-sm mb-6">{tour.desc}</p>
                <div className="flex items-center justify-between pt-6 border-t border-navy/10">
                  <div className="flex text-[#FFCD00] gap-0.5 text-sm items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-navy/50">{tour.spaces} spaces left</span>
                </div>
                <div className="mt-6 flex justify-end">
                  <Link to={ctaLink} className="font-bold text-navy text-sm hover:text-accent transition flex items-center gap-2">
                    Book Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS & PLUNGE SECTION */}
      <section className="relative py-20 sm:py-28 bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">About Us</span>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.1] mb-6">
                {statsText}
              </h2>
              <p className="text-navy/70 leading-relaxed text-base sm:text-lg mb-10 max-w-md">
                {statsDesc}
              </p>
              <Button as={Link} to={ctaLink} variant="gold" className="shadow-md mb-16">
                Book Now
              </Button>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-10 border-t border-navy/10">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="font-heading font-bold text-3xl sm:text-4xl text-accent mb-1 sm:mb-2">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-navy/60 uppercase tracking-wide leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="rounded-[40px] overflow-hidden aspect-[4/5] shadow-2xl">
                <img src={statsImage} alt="Stats" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl max-w-sm border border-navy/5 hidden sm:block">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <p className="text-navy/80 font-medium leading-relaxed text-sm">
                  {statsQuote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 sm:py-32 bg-white text-center overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 relative z-10">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.1] mb-6">
            {ctaTitle}
          </h2>
          <p className="text-navy/70 leading-relaxed text-base sm:text-lg mb-10 max-w-md mx-auto">
            {ctaDesc}
          </p>
          <Button as={Link} to={ctaLink} variant="gold" className="shadow-xl px-8 py-4 text-base">
            Book Now
          </Button>
        </div>
        <div className="absolute right-10 bottom-10 opacity-10 pointer-events-none">
           <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </div>
      </section>
    </div>
  )
}
