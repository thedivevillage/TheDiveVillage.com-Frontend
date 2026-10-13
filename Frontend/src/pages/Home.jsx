import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import SectionReveal, { StaggerGrid, StaggerItem } from '../components/SectionReveal'
import SEOHead from '../components/SEOHead'
import { IMAGES, CAROUSEL_IMAGES, PANEL_IMAGES } from '../utils/images'
import { useReviews } from '../contexts/ReviewsContext'
// Cloudinary Media URLs
const img1 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691491/TDV-Media/OceanWelcomesAll/1.png'
const img2 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691503/TDV-Media/OceanWelcomesAll/2.png'
const img3 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691529/TDV-Media/OceanWelcomesAll/3.png'
const img4 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691578/TDV-Media/OceanWelcomesAll/4.png'
const travelVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/q_auto,f_auto/v1791691360/TDV-Media/AirportToAirport/travel.mp4'
const travelPoster = 'https://res.cloudinary.com/qvbunv8y/video/upload/f_auto,q_auto/v1791691360/TDV-Media/AirportToAirport/travel.webp'
const stayImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691313/TDV-Media/AirportToAirport/Stay.webp'
const foodImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691316/TDV-Media/AirportToAirport/food.webp'
const itineraryVid = 'https://res.cloudinary.com/qvbunv8y/video/upload/q_auto,f_auto/v1791691465/TDV-Media/AirportToAirport/gallery1.mp4'
const itineraryPoster = 'https://res.cloudinary.com/qvbunv8y/video/upload/f_auto,q_auto/v1791691465/TDV-Media/AirportToAirport/gallery1.webp'
const imgIntroductoryPrograms = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691278/TDV-Media/ServicesThumbnails/Introductory%20Programs.webp'
const imgGuidedSnorkeling = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691302/TDV-Media/ServicesThumbnails/Snorkeling.webp'
const imgCertifiedCourses = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691284/TDV-Media/ServicesThumbnails/Certified%20Courses.webp'
const imgFreeDiving = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691291/TDV-Media/ServicesThumbnails/Free%20Diving.webp'
const imgFlexibleFunDives = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691298/TDV-Media/ServicesThumbnails/Flexible%20Fun%20Dives.webp'

import ProgramsPreview from '../components/ProgramsPreview'
import GalleryPreview from '../components/GalleryPreview'
import CustomizeExperiencePanel from '../components/CustomizeExperiencePanel'
import LazyVideo from '../components/LazyVideo'

const ADVENTURE_CALM_IMAGES = PANEL_IMAGES


const HIGHLIGHTS_DATA = [
  {
    id: 'scuba',
    title: 'Introductory Programs',
    desc: 'Experience scuba safely in shallow water alongside our professionals.',
    image: imgIntroductoryPrograms,
    link: '/services?category=programs',
    btnText: 'Explore'
  },
  {
    id: 'snorkeling',
    title: 'Guided Snorkeling',
    desc: 'Discover snorkeling and explore the coral reefs along side our experts.',
    image: imgGuidedSnorkeling,
    link: '/services?category=snorkeling',
    btnText: 'Explore'
  },
  {
    id: 'courses',
    title: 'Certified Courses',
    desc: 'From your first breath underwater to professional divemaster courses.',
    image: imgCertifiedCourses,
    link: '/services?category=courses',
    btnText: 'Explore'
  },
  {
    id: 'surfing',
    title: 'Freediving',
    desc: 'Explore the ocean with free diving and rely on your natural abilities.',
    image: imgFreeDiving,
    link: '/services?category=freediving',
    btnText: 'Explore'
  },
  {
    id: 'products',
    title: 'Flexible Fun Dives',
    desc: 'Every single experience is one step deeper into the world of the ocean.',
    image: imgFlexibleFunDives,
    link: '/services/combo-fundives',
    btnText: 'Explore'
  },
]

const TESTIMONIALS = [
  {
    name: "Sofia Stalance",
    role: "Open Water Diver",
    text: "The pre-dive briefing was thorough, and my instructor stayed right by my side until my breathing relaxed. By dive two, my buoyancy felt like second nature—truly unforgettable.",
    image: CAROUSEL_IMAGES[1]
  },
  {
    name: "Krishawn Rahul",
    role: "Certified Diver",
    text: "Every dive felt relaxed and unhurried. Top-notch equipment, small groups, and instructors who focus on safety and technique. Pure weightlessness from start to finish.",
    image: CAROUSEL_IMAGES[2]
  },
  {
    name: "Michael Antony",
    role: "Experienced Diver",
    text: "One of the most professional dive centers I've dived with. Flawless gear, seamless surface support, and well-executed dive plans every single time.",
    image: CAROUSEL_IMAGES[0]
  }
]

export default function Home() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const { approvedReviews, addReview } = useReviews()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [revName, setRevName] = useState('')
  const [revRole, setRevRole] = useState('')
  const [revText, setRevText] = useState('')
  const [revRating, setRevRating] = useState(5)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  // Prevent background scrolling when review modal is active
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (showReviewModal) {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
      }
    }
  }, [showReviewModal])

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!revName.trim() || !revText.trim()) return
    addReview({ name: revName.trim(), role: revRole.trim() || 'Ocean Diver', text: revText.trim(), rating: revRating || 5 })
    setReviewSubmitted(true)
    setTimeout(() => {
      setReviewSubmitted(false)
      setShowReviewModal(false)
      setRevName('')
      setRevRole('')
      setRevText('')
      setRevRating(5)
    }, 2400)
  }

  return (
    <div className="overflow-x-hidden relative isolate pointer-events-none">
      <SEOHead
        title="The Dive Village | It's a Community"
        description="Experience world-class scuba diving, professional certifications, guided snorkeling tours, and freediving with The Dive Village. Explore ocean gear and sustainable apparel."
        keywords="scuba diving center, certification courses, guided snorkeling tours, freediving school, ocean apparel, dive gear shop, eco diving village"
        canonicalUrl="https://thedivevillage.com/"
      />

      {/* 1. HERO */}
      <section className="relative flex min-h-[100dvh] sm:min-h-screen items-start sm:items-end justify-start pb-12 sm:pb-28 md:pb-32 lg:pb-32 xl:pb-44 pt-36 xs:pt-40 sm:pt-[120px] pointer-events-none">

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="max-w-3xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto mt-4 xs:mt-6 sm:mt-0"
            >
              <h1 className="mt-2 sm:mt-5 font-heading text-[3.2rem] xs:text-[3.9rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[5.8rem] xl:text-[6.8rem] 2xl:text-[7.2rem] font-bold uppercase tracking-tight sm:tracking-normal text-white leading-[0.92] flex flex-col drop-shadow-2xl">
                <span className="block text-xs xs:text-sm sm:text-lg font-bold tracking-[0.22em] mb-1.5 sm:mb-3 text-white/90">MORE THAN A DESTINATION</span>
                <span className="block text-white mb-0.5 sm:mb-2">IT'S A</span>
                <span className="block text-[#FFCD00]">COMMUNITY.</span>
              </h1>
              <div className="mt-2.5 sm:mt-6 h-1 w-12 sm:w-20 bg-[#FFCD00] rounded-full"></div>
              <p className="mt-3.5 sm:mt-8 max-w-[280px] xs:max-w-sm sm:max-w-2xl text-[14px] xs:text-base sm:text-xl md:text-2xl font-normal sm:font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-relaxed text-left">
                The life-changing magic of the ocean is a feeling that is meant to be shared.
              </p>
              <div className="mt-5 sm:mt-10 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-6">
                <Link
                  to="/book-us"
                  className="hero-btn w-[215px] xs:w-[235px] sm:w-fit inline-flex items-center justify-between gap-3 rounded-full bg-white/20 sm:bg-white/10 backdrop-blur-xl border border-white/40 px-5 xs:px-6 sm:px-8 py-3 sm:py-4 font-body text-xs sm:text-sm tracking-widest font-bold text-white uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 hover:!bg-[#FFCD00] hover:!text-navy hover:!border-[#FFCD00] active:scale-95 group"
                >
                  <span className="group-hover:!text-navy transition-colors">Book Your Dive</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1 group-hover:!stroke-navy shrink-0"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
                <Link
                  to="/shop"
                  className="hero-btn w-[215px] xs:w-[235px] sm:w-fit inline-flex items-center justify-between gap-3 rounded-full bg-white/20 sm:bg-white/10 backdrop-blur-xl border border-white/40 px-5 xs:px-6 sm:px-8 py-3 sm:py-4 font-body text-xs sm:text-sm tracking-widest font-bold text-white uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 hover:!bg-[#FFCD00] hover:!text-navy hover:!border-[#FFCD00] active:scale-95 group"
                >
                  <span className="group-hover:!text-navy transition-colors">Shop Merch</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1 group-hover:!stroke-navy shrink-0"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar overlay */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-2 left-0 right-0 w-full px-6 lg:px-12 flex items-center justify-center pointer-events-none text-white font-body text-xs tracking-widest font-bold uppercase opacity-90"
        >
          {/* Center: Scroll to explore */}
          <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/80 flex items-center justify-center text-white shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
            </div>
            <span className="text-[8.5px] sm:text-[10px] tracking-[0.25em] text-white/90 font-bold uppercase">SCROLL TO EXPLORE</span>
          </div>
        </motion.div>
      </section >

      {/* HIGHLIGHTS */}
      <section className="relative z-10 pb-6 sm:pb-24 pt-8 sm:pt-20 pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="mb-4 sm:mb-12 flex flex-col items-center text-center">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-tight">
              Explore Our <span className="text-[#FFCD00]">Programs</span>
            </h2>
            <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg text-white/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-justify">
              From your very first breath under the water <br />To professional dive master certifications.
            </p>
          </SectionReveal>
        </div>
        <div className="w-full max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-1 sm:px-2">
          <SectionReveal>
            <InteractiveHighlights />
          </SectionReveal>
        </div>
      </section>

      {/* CUSTOMIZE DIVE EXPERIENCE */}
      <section id="customize-dive-section" className="py-6 sm:py-16 pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CustomizeExperiencePanel />
        </div>
      </section>

      {/* 4. WHO CAN DIVE */}
      <section id="who-can-dive-section" className="relative py-16 sm:py-32 pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="mb-10 sm:mb-16 flex flex-col items-center text-center">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-tight">
              The Ocean <span className="text-[#FFCD00]">Welcomes All</span>
            </h2>
            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg text-white/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center">
              <span className="sm:hidden">You don't need to be an expert. You only need the curiosity.</span>
              <span className="hidden sm:inline">You don't need to be an athlete or an expert to dive<br />You only need curiosity to explore what lies below.</span>
            </p>
          </SectionReveal>

          <StaggerGrid data-no-bg-drag="true" className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 gap-3.5 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 mt-10 sm:mt-24 sm:overflow-visible px-2 sm:px-0">
            {[
              {
                t: 'Enthusiastic Beginners',
                img: img1,
                bgImg: imgIntroductoryPrograms,
                desc: "New to diving? Start your journey with confidence, our expert guidance and support every step."
              },
              {
                t: 'Families & Groups',
                img: img2,
                bgImg: imgCertifiedCourses,
                desc: "Shared memories. Deeper connections. Perfect experiences with who matter the most to you."
              },
              {
                t: 'Professionals',
                img: img3,
                bgImg: imgFreeDiving,
                desc: "For those who work beneath the surface. Training, support and solutions you can always rely on."
              },
              {
                t: 'Adventure Seekers',
                img: img4,
                bgImg: imgFlexibleFunDives,
                desc: "For the bold, the curious and all the ocean lovers. Explore more. Dive deeper. Live the adventure."
              }
            ].map((item, i) => (
              <StaggerItem key={i} className="w-[245px] min-w-[245px] max-w-[245px] shrink-0 sm:w-auto sm:min-w-0 sm:max-w-none snap-center h-full">
                <div
                  onClick={() => {
                    navigate('/book-us')
                  }}
                  className="h-full group cursor-pointer relative mt-6 sm:mt-10 flex flex-col pointer-events-auto"
                >

                  {/* Floating transparent PNG image centered with respect to bg panel */}
                  {item.img ? (
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3.2 + (i * 0.4), repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute inset-x-0 mx-auto w-full flex items-center justify-center z-20 pointer-events-none px-2 h-[150px] xs:h-[170px] sm:h-[240px] lg:h-[270px] ${
                        i === 1
                          ? '-top-2 xs:-top-1 sm:-top-2 lg:top-0'
                          : 'top-2 xs:top-4 sm:top-6 lg:top-8'
                      }`}
                    >
                      <img
                        src={item.img}
                        alt={item.t}
                        className="w-full h-full max-w-full max-h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                      />
                    </motion.div>
                  ) : null}

                  {/* Actual Card Background & Content */}
                  <div className="h-full w-full rounded-[20px] sm:rounded-[32px] overflow-hidden border border-white/30 relative flex flex-col p-3.5 xs:p-4 sm:p-6 lg:p-7 pt-32 xs:pt-36 sm:pt-56 lg:pt-64 pb-4 sm:pb-8 z-10 transition duration-500 group-hover:border-white/60 shadow-none justify-end who-can-dive-card">

                    {item.bgImg ? (
                      <img
                        src={item.bgImg}
                        alt={item.t}
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 blur-[2px] scale-105 transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : null}

                    <div className="absolute bottom-0 inset-x-0 h-3/5 bg-gradient-to-t from-navy via-navy/80 to-transparent z-0 pointer-events-none who-can-dive-overlay" />

                    <div className="relative z-10 flex flex-col justify-end h-full mt-auto">
                      <h3 className="font-heading text-sm xs:text-base sm:text-xl lg:text-2xl font-bold text-white uppercase tracking-wider mb-1.5 sm:mb-2 leading-tight text-left drop-shadow-md min-h-[36px] sm:min-h-[48px] flex items-end">
                        {item.t}
                      </h3>

                      <div className="w-6 sm:w-8 h-[2.5px] sm:h-[3px] bg-[#FFCD00] mb-2 sm:mb-3 shadow-sm shrink-0"></div>

                      <p className="text-white/90 text-xs sm:text-sm font-medium mb-3 sm:mb-5 leading-relaxed text-left drop-shadow-sm line-clamp-3 sm:line-clamp-none min-h-[48px] sm:min-h-[64px] flex items-start whitespace-normal">
                        {item.desc}
                      </p>

                      <div className="mt-auto shrink-0 pt-1 flex justify-center w-full">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/15 backdrop-blur-xl border border-white/30 text-white rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2.5 transition-all duration-300 group-hover:bg-[#FFCD00] group-hover:text-navy group-hover:border-[#FFCD00] shadow-md cursor-pointer">
                          <span>Dive In</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* 6. AIRPORT TO AIRPORT - HOSPITALITY */}
      <section id="airport-to-airport-section" className="relative py-12 sm:py-32 text-white pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="text-center mb-8 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] mb-4">
              From Airport to Airport<br />
              <span className="text-[#FFCD00] font-bold">We've Got You Covered</span>
            </h2>
            <p className="text-sm sm:text-lg text-white/90 font-medium leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
              Relax, Slow down and immerse yourself.<br />We handle every detail of your holiday.
            </p>
          </SectionReveal>

          <StaggerGrid data-no-bg-drag="true" className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 gap-3 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 sm:overflow-visible px-1">
            {[
              {
                title: 'Travel Logistics',
                desc: 'Seamless transfers and hassle free travel, arrival to departure.',
                video: travelVid,
                poster: travelPoster,
                img: travelPoster,
                icon: (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00AEC7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                )
              },
              {
                title: 'Comfortable Stays',
                desc: 'Handpicked accommodations for luxury holidays and backpacking alike',
                img: stayImg,
                icon: (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00AEC7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
                  </svg>
                )
              },
              {
                title: 'Local Cuisine',
                desc: 'Savor authentic flavors, freshly crafted delicacies by local chefs.',
                img: foodImg,
                icon: (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00AEC7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.55 3.89 3.54 4.23L6.5 22h3l-.04-8.77C11.45 12.89 13 11.12 13 9V2h-2v7zm9-7h-1c-1.66 0-3 1.34-3 3v5c0 1.66 1.34 3 3 3h1v9h2V2h-2z" />
                  </svg>
                )
              },
              {
                title: 'Personal Itineraries',
                desc: 'Custom experiences tailored to your travel style and made to fit.',
                video: itineraryVid,
                poster: itineraryPoster,
                img: CAROUSEL_IMAGES[1],
                icon: (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00AEC7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
                  </svg>
                )
              },
            ].map((item, i) => (
              <StaggerItem key={i} className="w-[62vw] min-w-[215px] max-w-[270px] aspect-square sm:w-auto sm:aspect-auto shrink-0 snap-center h-full">
                <div
                  onClick={i === 3 ? () => {
                    const el = document.getElementById('customize-dive-section')
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  } : undefined}
                  className={`group relative h-full w-full rounded-2xl sm:rounded-[28px] lg:rounded-[32px] bg-[#00172b]/40 backdrop-blur-2xl border border-white/20 p-3 sm:p-5 lg:p-6 shadow-none transition-all duration-500 hover:bg-[#00172b]/60 flex flex-col justify-between ${
                    i === 3
                      ? 'cursor-pointer hover:-translate-y-3 hover:border-[#00AEC7] hover:shadow-none'
                      : 'cursor-default'
                  }`}
                >
                  <div className="flex flex-col flex-1">
                    {/* Top Bar: Icon Box */}
                    <div className="flex items-center mb-1.5 sm:mb-4">
                      <div className="w-7 h-7 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-[#00AEC7]/20 border border-[#00AEC7]/50 flex items-center justify-center shadow-sm group-hover:bg-[#00AEC7]/30 group-hover:border-[#00AEC7] transition duration-300">
                        {item.icon}
                      </div>
                    </div>

                    {/* Main Heading Text */}
                    <h3 className="font-heading text-xs xs:text-sm sm:text-xl lg:text-2xl font-bold text-white uppercase tracking-wide leading-tight mt-0.5 sm:mt-0 mb-3.5 sm:mb-2 text-left group-hover:text-[#FFCD00] transition-colors truncate sm:whitespace-normal">
                      {item.title}
                    </h3>

                    {/* Description Text */}
                    <p className="hidden sm:block text-white/85 text-xs lg:text-sm font-medium leading-relaxed mb-5 text-left min-h-[40px]">
                      {item.desc}
                    </p>

                    {/* Media Frame (Video or Image) */}
                    <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] rounded-xl sm:rounded-2xl overflow-hidden bg-black/40 mb-1.5 sm:mb-5 border border-white/20 shadow-none flex-1">
                      {item.video ? (
                        <LazyVideo
                          src={item.video}
                          poster={item.poster || item.img}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : item.img ? (
                        <img
                          src={item.img}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Footer: Click to select (Desktop Only - Last panel only) */}
                  {i === 3 && (
                    <div className="hidden sm:flex items-center justify-center pt-3 border-t border-white/20 text-xs font-bold">
                      <span className="text-white/90 group-hover:text-[#FFCD00] transition-colors">
                        Click to select
                      </span>
                    </div>
                  )}

                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* 8. THE DIVE VILLAGE GALLERY CAROUSEL */}
      <GalleryPreview />

      {/* 9. TESTIMONIALS (COMMUNITY VOICES) */}
      <section id="testimonials-section" className="relative py-12 sm:py-32 pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[#FFCD00] font-bold tracking-widest uppercase text-xs mb-3 block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Community Voices
            </span>
            <h2
              className="font-heading text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)]"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9)' }}
            >
              Every Dive Has a Story
            </h2>
            <p
              className="mt-4 text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] text-center sm:text-lg"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.85)' }}
            >
              Real experiences from divers who explored with us.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 transition-all duration-300 hover:scale-105 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer"
              >
                <span>+ Write a Review</span>
              </button>
            </div>
          </SectionReveal>

          <StaggerGrid data-no-bg-drag="true" className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 gap-4 md:grid md:grid-cols-3 md:gap-8 items-stretch md:overflow-visible px-2 sm:px-4">
            {approvedReviews.slice(0, 3).map((t, i) => (
              <StaggerItem key={t.id || i} className="w-[85vw] max-w-[340px] xs:max-w-[360px] sm:w-[360px] shrink-0 md:w-auto snap-center h-full">
                <div className="h-full flex flex-col justify-between bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/20 shadow-none hover:bg-white/15 hover:border-white/40 hover:-translate-y-2 hover:shadow-none transition-all duration-500">
                  <div>
                    <div className="flex gap-1 mb-3 sm:mb-6">
                      {[...Array(t.rating || 5)].map((_, j) => (
                        <svg key={j} className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCD00]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-white/95 font-medium mb-4 sm:mb-8 text-xs sm:text-base leading-relaxed text-left">
                      <span className="sm:hidden">"{t.mobileText || t.text}"</span>
                      <span className="hidden sm:inline">"{t.text}"</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 mt-auto pt-2">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/30 shrink-0 shadow-md">
                      <SafeImage src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm tracking-wide truncate">
                        {t.name}
                      </h4>
                      <span className="text-[10px] sm:text-xs text-[#FFCD00] font-medium block truncate">
                        {t.role}
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* REVIEW MODAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showReviewModal && (
            <div
              data-lenis-prevent="true"
              onClick={() => setShowReviewModal(false)}
              className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-sm pointer-events-auto select-auto overflow-hidden"
              style={{ top: 'var(--toolbar-bottom, 64px)' }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="bg-[#00172b]/80 backdrop-blur-2xl border border-white/25 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative text-left select-auto pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer text-sm"
                  aria-label="Close review dialog"
                >
                  ✕
                </button>

                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-1">Write a Review</h3>
                <p className="text-white/75 text-xs sm:text-sm mb-4">Share your diving experience with our community.</p>

                {reviewSubmitted ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-[#00AEC7]/20 border border-[#00AEC7] rounded-full flex items-center justify-center mx-auto mb-3 text-[#00AEC7] text-lg font-bold">
                      ✓
                    </div>
                    <h4 className="text-white font-bold text-base mb-1">Thank you!</h4>
                    <p className="text-white/80 text-xs sm:text-sm">Your review has been submitted and is pending moderation.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 sm:space-y-3.5 pointer-events-auto select-auto">
                    <div>
                      <label className="block text-white/90 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={revName}
                        onChange={(e) => setRevName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 py-2 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFCD00] focus:ring-1 focus:ring-[#FFCD00] transition-colors pointer-events-auto select-text touch-manipulation"
                      />
                    </div>

                    <div>
                      <label className="block text-white/90 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1">Diver Role / Level</label>
                      <input
                        type="text"
                        required
                        value={revRole}
                        onChange={(e) => setRevRole(e.target.value)}
                        placeholder="e.g. Advanced Adventurer"
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 py-2 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFCD00] focus:ring-1 focus:ring-[#FFCD00] transition-colors pointer-events-auto select-text touch-manipulation"
                      />
                    </div>

                    <div>
                      <label className="block text-white/90 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isSelected = star <= revRating
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRevRating(star)}
                              className="p-1 -m-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none group"
                              aria-label={`${star} star rating`}
                            >
                              <svg
                                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                                  isSelected
                                    ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                                    : 'text-transparent fill-none stroke-white/60 group-hover:stroke-white'
                                }`}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                            </button>
                          )
                        })}
                        <span className="text-white/60 text-xs font-medium ml-1">
                          {revRating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/90 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1">Your Experience</label>
                      <textarea
                        required
                        rows={3}
                        value={revText}
                        onChange={(e) => setRevText(e.target.value)}
                        placeholder="Tell us about the reefs, instructors, or your holiday..."
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 py-2 sm:py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFCD00] focus:ring-1 focus:ring-[#FFCD00] transition-colors resize-none pointer-events-auto select-text touch-manipulation"
                      />
                    </div>

                    <div className="pt-2 flex justify-center w-full">
                      <button
                        type="submit"
                        className="w-auto min-w-[160px] xs:min-w-[180px] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-navy text-white hover:bg-[#FFCD00] hover:text-[#001e3d] font-bold text-xs sm:text-sm uppercase tracking-wider transition hover:scale-105 border border-navy/30 shadow-lg cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CLOSING CTA WITH CAROUSEL */}
      <section id="closing-cta-section" className="py-16 sm:py-24 bg-transparent pointer-events-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <AutoCarousel images={ADVENTURE_CALM_IMAGES} />
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}

function InteractiveHighlights() {
  const navigate = useNavigate()
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const velocityRef = useRef(0)
  const isHoveredRef = useRef(false)
  const hasMovedRef = useRef(false)
  const isSwipingHorizontalRef = useRef(null)
  const scrollPosRef = useRef(0)
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(1400)

  // Measure container width dynamically to guarantee cards fit on screen
  useEffect(() => {
    if (!containerRef.current) return
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    updateWidth()
    const ro = new ResizeObserver(updateWidth)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Repeat HIGHLIGHTS_DATA 6 times for ultra-smooth continuous infinite looping
  const repeatedData = [
    ...HIGHLIGHTS_DATA,
    ...HIGHLIGHTS_DATA,
    ...HIGHLIGHTS_DATA,
    ...HIGHLIGHTS_DATA,
    ...HIGHLIGHTS_DATA,
    ...HIGHLIGHTS_DATA
  ]

  const itemsInSet = HIGHLIGHTS_DATA.length
  const cardGap = containerWidth < 640 ? 10 : 20 // px gap between cards

  // Responsively show 5 cards on desktop, 3.2 on tablet, 2.3 on wide mobile, 1.85 on narrow mobile (narrower panels on mobile)
  const cardsToShow = containerWidth < 480 ? 1.85 : (containerWidth < 640 ? 2.15 : (containerWidth < 768 ? 2.3 : (containerWidth < 1024 ? 3.2 : 5)))
  const cardWidth = Math.floor((containerWidth - (Math.ceil(cardsToShow) - 1) * cardGap) / cardsToShow)
  const singleSetWidth = itemsInSet * (cardWidth + cardGap)

  // Smooth 60/120fps Animation Loop with Momentum & Auto-scroll (only when in viewport)
  useEffect(() => {
    let animationFrameId = null
    let isVisible = false
    const autoSpeed = containerWidth < 640 ? 0.28 : 1.35 // further reduced speed on mobile (pixels per frame)

    const startLoop = () => {
      if (!animationFrameId && isVisible) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    const stopLoop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    const step = () => {
      if (!isVisible) {
        animationFrameId = null
        return
      }

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.08) {
          scrollPosRef.current -= velocityRef.current
          velocityRef.current *= 0.94 // Natural friction deceleration
        } else {
          velocityRef.current = 0
          if (!isHoveredRef.current) {
            scrollPosRef.current += autoSpeed
          }
        }
      }

      if (trackRef.current && singleSetWidth > 0) {
        let normalized = scrollPosRef.current % singleSetWidth
        if (normalized < 0) normalized += singleSetWidth
        trackRef.current.style.transform = `translate3d(-${normalized}px, 0, 0)`
      }

      animationFrameId = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
          if (isVisible) {
            startLoop()
          } else {
            stopLoop()
          }
        })
      },
      { threshold: 0.05, rootMargin: '100px 0px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      stopLoop()
      observer.disconnect()
    }
  }, [singleSetWidth])

  const handlePointerDown = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    isDraggingRef.current = true
    hasMovedRef.current = false
    isSwipingHorizontalRef.current = null
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragStartXRef.current = clientX
    dragStartYRef.current = clientY
    lastXRef.current = clientX
    lastTimeRef.current = performance.now()
    velocityRef.current = 0
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return
    if (e && e.stopPropagation) e.stopPropagation()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const totalDeltaX = clientX - dragStartXRef.current
    const totalDeltaY = clientY - dragStartYRef.current

    // Detect gesture orientation early to avoid locking native vertical scroll
    if (isSwipingHorizontalRef.current === null) {
      if (Math.abs(totalDeltaX) > 6 || Math.abs(totalDeltaY) > 6) {
        if (Math.abs(totalDeltaX) >= Math.abs(totalDeltaY)) {
          isSwipingHorizontalRef.current = true
        } else {
          isSwipingHorizontalRef.current = false
          isDraggingRef.current = false
          return
        }
      }
    }

    if (isSwipingHorizontalRef.current === false) return

    if (Math.abs(totalDeltaX) > 6) {
      hasMovedRef.current = true
    }

    const deltaX = clientX - lastXRef.current
    scrollPosRef.current -= deltaX

    const now = performance.now()
    const dt = now - lastTimeRef.current
    if (dt > 0) {
      velocityRef.current = (deltaX / dt) * 16.67
    }
    lastXRef.current = clientX
    lastTimeRef.current = now
  }

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      if (e && e.stopPropagation) e.stopPropagation()
      isDraggingRef.current = false
      if (velocityRef.current > 35) velocityRef.current = 35
      if (velocityRef.current < -35) velocityRef.current = -35
    }
    isSwipingHorizontalRef.current = null
  }

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    velocityRef.current = -((cardWidth + cardGap) / 5)
  }

  const handleNext = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    velocityRef.current = (cardWidth + cardGap) / 5
  }

  const handleNavigate = (e, targetLink) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (hasMovedRef.current) {
      return
    }
    const destination = targetLink || '/services'
    navigate(destination)
  }

  return (
    <div
      data-no-bg-drag="true"
      onMouseEnter={() => { isHoveredRef.current = true }}
      onMouseLeave={() => { isHoveredRef.current = false }}
      className="relative w-full max-w-[1800px] mx-auto my-4 pointer-events-auto px-1 sm:px-2"
    >
      {/* Sleek Floating Arrow Buttons outside cards */}
      <button
        type="button"
        onClick={handlePrev}
        onMouseEnter={(e) => { e.stopPropagation(); isHoveredRef.current = true }}
        onMouseLeave={(e) => { e.stopPropagation(); isHoveredRef.current = false }}
        className="carousel-arrow-btn absolute -left-1 sm:left-2 lg:left-3 top-1/2 -translate-y-1/2 z-40 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/15 border border-white/30 text-white hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-2xl flex items-center justify-center cursor-pointer select-none transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Previous Slide"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleNext}
        onMouseEnter={(e) => { e.stopPropagation(); isHoveredRef.current = true }}
        onMouseLeave={(e) => { e.stopPropagation(); isHoveredRef.current = false }}
        className="carousel-arrow-btn absolute -right-1 sm:right-2 lg:right-3 top-1/2 -translate-y-1/2 z-40 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/15 border border-white/30 text-white hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-2xl flex items-center justify-center cursor-pointer select-none transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Next Slide"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Main Track Viewport */}
      <div
        ref={containerRef}
        data-no-bg-drag="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        className="w-full py-4 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{
            gap: `${cardGap}px`,
            width: `${repeatedData.length * (cardWidth + cardGap)}px`
          }}
        >
          {repeatedData.map((current, i) => (
            <div
              key={`${current.id}-${i}`}
              onClick={(e) => handleNavigate(e, current.link)}
              style={{ width: `${cardWidth}px` }}
              className="h-[290px] xs:h-[320px] sm:h-[450px] flex-shrink-0 rounded-[18px] sm:rounded-[28px] overflow-hidden shadow-none relative border border-white/20 bg-transparent group cursor-pointer pointer-events-auto transition-all duration-500 hover:border-[#FFCD00]/70 hover:shadow-none hover:-translate-y-1.5"
            >
              {current.image ? (
                <img
                  src={current.image}
                  alt={current.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-100"
                />
              ) : null}

              {/* Light dark blue overlay lightly at the bottom of each panel */}
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#00172b]/85 via-[#00172b]/40 to-transparent pointer-events-none" />

              <div className="absolute inset-0 p-3.5 xs:p-4 sm:p-6 lg:p-7 flex flex-col justify-end pointer-events-auto">
                <div className="mt-auto flex flex-col">
                  <span className="inline-flex items-center self-start text-[#FFCD00] font-heading font-bold text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-widest bg-black/30 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/30 mb-1.5 sm:mb-2.5 pointer-events-none shadow-sm">
                    Featured
                  </span>
                  <h3
                    className="font-heading text-sm xs:text-base sm:text-2xl font-bold text-white leading-tight mb-1 sm:mb-2 pointer-events-none line-clamp-2 sm:whitespace-normal"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {current.title}
                  </h3>
                  <p
                    className="text-white text-[11px] xs:text-xs sm:text-[13px] font-medium line-clamp-2 leading-relaxed mb-3 sm:mb-5 pointer-events-none text-left"
                    style={{ textShadow: '0 1px 6px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.9)' }}
                  >
                    {current.desc}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => handleNavigate(e, current.link)}
                    className="w-full py-1.5 xs:py-2 sm:py-3 px-2.5 sm:px-5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shadow-lg pointer-events-auto cursor-pointer relative z-30 flex items-center justify-center gap-1.5 sm:gap-2 group/btn"
                  >
                    <span>{current.btnText || 'Explore'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AutoCarousel({ images, showContent = true }) {
  const [index, setIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!images || images.length === 0) return
    let timer = null
    let isVisible = false

    const startTimer = () => {
      if (!timer && isVisible && !document.hidden) {
        const intervalDuration = (typeof window !== 'undefined' && window.innerWidth < 640) ? 5000 : 3200
        timer = setInterval(() => {
          setIndex((curr) => {
            setPrevIndex(curr)
            return (curr + 1) % images.length
          })
        }, intervalDuration)
      }
    }

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopTimer()
      } else if (isVisible) {
        startTimer()
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
          if (isVisible) {
            startTimer()
          } else {
            stopTimer()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopTimer()
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [images])

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-none w-full h-[420px] lg:h-[480px] bg-transparent border border-white/20">
      {/* Base Layer: Previous image stays 100% solid underneath so background is NEVER visible during transition */}
      {images[prevIndex] && (
        <img
          src={images[prevIndex]}
          alt="Ocean Life"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      )}

      {/* Active Layer: Current image smoothly fades in on top of previous image */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Marine Life ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out pointer-events-none ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          loading="lazy"
        />
      ))}

      {showContent && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 sm:p-10 lg:p-16 pointer-events-none">
          <div className="max-w-2xl pointer-events-auto flex flex-col justify-center">
            <span className="inline-block self-start bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold text-[#FFCD00] uppercase tracking-widest mb-4 shadow-sm">
              The Sea is Calling
            </span>
            <h3
              className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-tight mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9)' }}
            >
              COME FOR THE ADVENTURE.<br />
              <span className="font-heading font-bold text-[#FFCD00]">STAY FOR THE CALM.</span>
            </h3>
            <p
              className="text-white/90 font-medium text-sm sm:text-base mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] max-w-xl leading-relaxed"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
            >
              Leave with stories that last a lifetime.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/book-us"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 px-7 py-3.5 font-body text-xs sm:text-sm tracking-wider font-bold text-white uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:scale-105 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] cursor-pointer"
              >
                <span>Book Your Dive</span>
                <ArrowIcon />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 px-7 py-3.5 font-body text-xs sm:text-sm tracking-wider font-bold text-white uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:scale-105 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] cursor-pointer"
              >
                <span>View Gallery</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InstructIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12a8 8 0 0116 0v5a2 2 0 01-2 2h-2v-6h4M4 13h4v6H6a2 2 0 01-2-2v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function TrainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16M7 19V7l5-3 5 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function OceanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 14c2 1 3 1 5 0s3-1 5 0 3 1 5 0 3-1 3 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 18c2 1 3 1 5 0s3-1 5 0 3 1 5 0 3-1 3 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
