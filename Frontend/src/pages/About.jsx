import LazyVideo from '../components/LazyVideo'
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import SectionReveal, { StaggerGrid, StaggerItem } from '../components/SectionReveal'
import SEOHead from '../components/SEOHead'
import MerchBannerCTA from '../components/MerchBannerCTA'
import { CAROUSEL_IMAGES } from '../utils/images'
import { useReviews } from '../contexts/ReviewsContext'
const aboutVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/About.mp4'
const nightDiveVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Night_Dive.mp4'
const divingVid = 'https://res.cloudinary.com/bbgt5nk7/video/upload/v1790244035/dive-village/ui-videos/diving_1_mp4.mp4';
import useNightDive from '../hooks/useNightDive'

const certifiedCoursesImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691284/TDV-Media/ServicesThumbnails/Certified%20Courses.webp'
const introProgImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691278/TDV-Media/ServicesThumbnails/Introductory%20Programs.webp'
const freeDivingImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691291/TDV-Media/ServicesThumbnails/Free%20Diving.webp'
const flexibleFunDivesImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691298/TDV-Media/ServicesThumbnails/Flexible%20Fun%20Dives.webp'

const SAFETY_PROMISES = [
  {
    title: 'Globally Certified Instructors',
    desc: 'Globally certified instructors and professional guides dedicated to your safety and growth.',
    image: certifiedCoursesImg,
  },
  {
    title: 'Personalized Training',
    desc: 'Personalized training sessions tailored to your individual pace, comfort, and skill level.',
    image: introProgImg,
  },
  {
    title: 'Serviced Equipment',
    desc: 'High-quality, regularly inspected and serviced dive gear for flawless underwater performance.',
    image: freeDivingImg,
  },
  {
    title: 'Emergency-Ready Staff',
    desc: 'Emergency-ready, rescue-trained staff equipped with complete safety protocols on every dive.',
    image: flexibleFunDivesImg,
  },
]

const TESTIMONIALS = [
  {
    id: 'rev-1',
    name: "Sofia Stalance",
    role: "Open Water Diver",
    text: "The pre-dive briefing was thorough, and my instructor stayed right by my side until my breathing relaxed. By dive two, my buoyancy felt like second nature—truly unforgettable.",
    image: CAROUSEL_IMAGES[1]
  },
  {
    id: 'rev-2',
    name: "Krishawn Rahul",
    role: "Certified Diver",
    text: "Every dive felt relaxed and unhurried. Top-notch equipment, small groups, and instructors who focus on safety and technique. Pure weightlessness from start to finish.",
    image: CAROUSEL_IMAGES[2]
  },
  {
    id: 'rev-3',
    name: "Michael Antony",
    role: "Experienced Diver",
    text: "One of the most professional dive centers I've dived with. Flawless gear, seamless surface support, and well-executed dive plans every single time.",
    image: CAROUSEL_IMAGES[0]
  }
]

const titleWords = ["Your", "Ocean", "Community"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const wordVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 200,
    },
  },
}

export default function About() {
  const reduce = useReducedMotion()
  const isNightDive = useNightDive()
  const { approvedReviews } = useReviews()
  const reviewsToDisplay = approvedReviews && approvedReviews.length > 0 ? approvedReviews.slice(0, 3) : TESTIMONIALS
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen font-body overflow-x-hidden pointer-events-none relative bg-[#001e3d] text-white">
      <SEOHead
        title="About Us | Certified Scuba Instructors & Ocean Sanctuary | The Dive Village"
        description="Discover the story behind The Dive Village. Dedicated to safety, marine conservation, diving excellence, and building an inclusive underwater community."
        keywords="about the dive village, certified instructors, marine conservation dive center, eco scuba diving, ocean community"
        canonicalUrl="https://thedivevillage.com/about"
      />
      
      {/* FULL-SCREEN VIDEO BACKGROUND (DYNAMIC FOR NIGHT DIVE ACROSS ENTIRE PAGE) */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <LazyVideo
          key={isNightDive ? 'night-dive-bg' : 'day-diving-bg'}
          src={isNightDive ? nightDiveVideo : divingVid}
          autoPlay
          loop
          muted
          playsInline
          onPlay={(e) => { e.currentTarget.playbackRate = 0.7 }}
          className="w-full h-full object-cover transition-opacity duration-700 opacity-95 sm:opacity-100"
        />
        <div className={`absolute inset-0 transition-colors duration-700 ${
          isNightDive
            ? 'bg-[#030a12]/30'
            : 'bg-[#00223D]/25'
        }`} />
      </div>

      {/* 1. HERO BANNER — STAGGERED WORD ANIMATION */}
      <div className="pt-36 pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pointer-events-auto text-white relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={containerVariants}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none text-white drop-shadow-lg mb-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {titleWords.map((word, idx) => (
              <motion.span
                key={idx}
                variants={wordVariants}
                className={word === "Ocean" || word === "Community" ? "text-[#FFCD00] font-bold" : "text-white"}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-2xl text-lg sm:text-xl font-body font-medium text-white/90 leading-relaxed text-center drop-shadow-md"
          >
            A feeling meant to be shared. Built by ocean lovers, for ocean lovers. Here, every dive holds a story, and every visitor who arrives leaves as family.
          </motion.p>
        </motion.div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="relative z-10 pointer-events-auto pt-6 sm:pt-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 2.1 VISION & MISSION — STACKED ON MOBILE, SIDE-BY-SIDE ON DESKTOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-6 lg:gap-8 mb-16 sm:mb-28">
          
          {/* Vision Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-2xl sm:rounded-[32px] bg-white/10 backdrop-blur-2xl text-white p-6 sm:p-10 shadow-2xl transition-all duration-500 border border-white/20 hover:border-[#FFCD00]/60 hover:bg-white/15 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFCD00]/15 border border-[#FFCD00]/40 flex items-center justify-center shadow-inner text-[#FFCD00]">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
              </div>

              <h3 className="font-heading text-xl sm:text-3xl font-bold text-white uppercase tracking-wide leading-tight mb-3 sm:mb-4">
                OUR VISION
              </h3>

              <blockquote className="text-white/95 text-sm sm:text-xl leading-relaxed font-body border-l-3 sm:border-l-4 border-[#FFCD00] pl-3.5 sm:pl-4">
                “To unite the world's ocean lovers into a global community—driven by passion, connected by purpose, and committed to protection.”
              </blockquote>
            </div>
          </motion.div>

          {/* Mission Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="h-full rounded-2xl sm:rounded-[32px] bg-white/10 backdrop-blur-2xl text-white p-6 sm:p-10 shadow-2xl transition-all duration-500 border border-white/20 hover:border-[#FFCD00]/60 hover:bg-white/15 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFCD00]/15 border border-[#FFCD00]/40 flex items-center justify-center shadow-inner text-[#FFCD00]">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.5-3.5-3.5-7.5-4 11z"/>
                  </svg>
                </div>
              </div>

              <h3 className="font-heading text-xl sm:text-3xl font-bold text-white uppercase tracking-wide leading-tight mb-3 sm:mb-4">
                OUR MISSION
              </h3>

              <blockquote className="text-white/95 text-sm sm:text-lg leading-relaxed font-body border-l-3 sm:border-l-4 border-[#FFCD00] pl-3.5 sm:pl-4">
                “At The Dive Village, our mission is to inspire adventure and foster respect for the ocean by providing safe, sustainable, and unforgettable scuba diving experiences. We are committed to building a platform and educating Divers of all levels, protecting marine ecosystems, and building a community that shares a passion for exploring the ocean world.”
              </blockquote>
            </div>
          </motion.div>

        </div>

        {/* 2.2 FOUNDER'S NOTE — TRANSLUCENT GLASS BOX */}
        <div className="relative rounded-[40px] bg-white/10 backdrop-blur-2xl text-white border border-white/20 p-0 shadow-2xl mb-28 overflow-hidden">
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 sm:p-14 lg:p-16 flex flex-col justify-center relative z-20">
              <span className="inline-block self-start bg-white/15 backdrop-blur-md text-[#FFCD00] font-heading font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/25 shadow-sm">
                Founder's Note — Sanjeev Bajaj
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white leading-tight mb-6">
                Built by Ocean Lovers, <br />
                <span className="text-[#FFCD00] font-bold">For Ocean Lovers</span>
              </h2>
              <p className="text-white/90 leading-relaxed text-base sm:text-lg font-body font-medium mb-4">
                The Dive Village began with one man and one belief. For Sanjeev, the ocean was more than a passion—it was a sanctuary. A place of healing, discovery, and profound transformation. And he knew, deep down, that this magic was not meant to be kept to himself.
              </p>
              <p className="text-white/90 leading-relaxed text-base sm:text-lg font-body font-medium mb-6">
                So he built a door to “The Dive Village” , a community for divers. A home beneath the waves, built by ocean lovers, for ocean lovers. A place where anyone, from all walks of life, could feel the rhythm of the currents and in doing so rediscover themselves.
              </p>
              <p className="text-white/95 leading-relaxed text-base sm:text-lg font-body font-bold border-l-4 border-[#FFCD00] pl-6 mb-8 bg-white/10 backdrop-blur-md py-4 pr-4 rounded-r-2xl border-t border-b border-white/15">
                “Today, Sanjeev's vision lives on in every dive, every story, and every stranger who arrives—and leaves as family member of this community. This is The Dive Village. Your Diving Community.”
              </p>
              <div className="pt-4 border-t border-white/15">
                <h4 className="font-heading font-bold text-white text-base">Sanjeev Bajaj</h4>
                <p className="text-xs text-[#FFCD00] font-heading font-bold">Founder & Master Instructor</p>
              </div>
            </div>

            {/* Right Video Frame next to Sanjeev's Story */}
            <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-full overflow-hidden rounded-b-[40px] lg:rounded-b-none lg:rounded-r-[40px]">
              <LazyVideo
                src={aboutVid} 
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 2.3 TRAINING & SAFETY — TRANSLUCENT GLASS CONTAINER */}
        <div className="rounded-[44px] bg-white/10 backdrop-blur-2xl border border-white/20 p-8 sm:p-14 lg:p-20 shadow-2xl mb-28 text-white">
          <SectionReveal className="text-center mb-16 max-w-3xl mx-auto">
            <span className="inline-block bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-heading font-bold text-[#FFCD00] uppercase tracking-widest mb-4 border border-white/25 shadow-sm">
              THE DIVE VILLAGE (SWIM · SCUBA · FREEDIVE)
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-bold text-white leading-tight mb-4">
              Training & Safety — <span className="text-[#FFCD00] font-bold">Confidence Beneath Every Wave</span>
            </h2>
            <p className="text-white/90 text-base sm:text-lg font-body font-medium leading-relaxed">
              At Dive Village, every adventure begins with safety. Our focus is on comfort, skill, and confidence for every participant.
            </p>
          </SectionReveal>

          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3.5 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 mb-8 sm:mb-12">
            {SAFETY_PROMISES.map((s, i) => (
              <div key={i} className="w-[210px] xs:w-[230px] shrink-0 snap-center sm:w-auto rounded-[24px] sm:rounded-[32px] bg-white/10 backdrop-blur-xl p-3.5 sm:p-6 flex flex-col justify-between hover:bg-white/20 hover:border-[#FFCD00]/50 transition duration-500 group border border-white/15 shadow-lg overflow-hidden">
                <div>
                  {/* Photo Container */}
                  <div className="h-28 sm:h-44 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 border border-white/15 relative bg-black/20 shadow-md">
                    <img 
                      src={s.image} 
                      alt={s.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <h3 className="font-heading text-base sm:text-xl font-bold text-white mb-1.5 sm:mb-2 group-hover:text-[#FFCD00] transition leading-tight">{s.title}</h3>
                  <p className="text-[11px] sm:text-sm text-white/80 leading-relaxed font-body font-medium transition line-clamp-3 sm:line-clamp-none">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-8 border-t border-white/15">
            <blockquote className="font-heading text-xl sm:text-2xl font-bold text-white max-w-2xl mx-auto">
              “You'll never dive alone — you'll always be guided, supported, and cared for. Because trust is the deepest dive of all.”
            </blockquote>
          </div>
        </div>

        {/* 2.4 COMMUNITY VOICES — TRANSLUCENT TESTIMONIALS */}
        <div className="mb-28">
          <SectionReveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#FFCD00] font-heading font-bold tracking-widest uppercase text-xs mb-3 block">
              Community Voices
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white">
              What Our Divers Say
            </h2>
          </SectionReveal>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 md:gap-8 md:grid md:grid-cols-3 items-stretch pb-4 md:pb-0 px-2 sm:px-4">
            {reviewsToDisplay.map((t, i) => (
              <div key={t.id || i} className="w-[85vw] max-w-[340px] xs:max-w-[360px] sm:w-[360px] shrink-0 snap-center md:w-auto bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/20 shadow-none hover:bg-white/15 hover:border-white/30 hover:-translate-y-2 transition duration-500 flex flex-col justify-between h-full">
                <div>
                  <div className="flex gap-1 mb-3 sm:mb-6">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCD00]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs sm:text-base text-white/95 mb-4 sm:mb-8 leading-relaxed font-body font-medium text-left">
                    <span className="sm:hidden">"{t.mobileText || t.text}"</span>
                    <span className="hidden sm:inline">"{t.text}"</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-auto pt-2">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/30 shrink-0 shadow-md">
                    <SafeImage src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-white text-xs sm:text-sm truncate">{t.name}</h4>
                    <span className="text-[10px] sm:text-xs text-[#FFCD00] font-heading font-bold block truncate">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merchandise Banner CTA */}
        <MerchBannerCTA className="mt-16 sm:mt-24" />

        </div>
      </div>
    </div>
  )
}
