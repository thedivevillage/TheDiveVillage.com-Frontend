import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { PANEL_IMAGES } from '../utils/images'

// Activity Media (Cloudinary URLs)
const vidSafari = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791691465/TDV-Media/AirportToAirport/gallery1.mp4'
const imgSafari = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685504/TDV-Media/AddOns/safari.webp'
const vidTrekking = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685324/TDV-Media/AddOns/Trekking.mp4'
const imgTrekking = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685508/TDV-Media/AddOns/trekking.webp'
const vidSightseeing = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685371/TDV-Media/AddOns/sightseeing.mp4'
const imgSightseeing = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685509/TDV-Media/AddOns/sightseeing.webp'
const vidCampers = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791686777/TDV-Media/AddOns/Campers.mp4'
const imgCampers = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685511/TDV-Media/AddOns/campers.webp'
const vidLiveaboard = 'https://res.cloudinary.com/qvbunv8y/video/upload/v1791685388/TDV-Media/AddOns/liveaboard.mp4'
const imgLiveaboard = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791685512/TDV-Media/AddOns/liveaboard.webp'
import { useRef } from 'react'

function HoverVideoPreview({ videoSrc, poster, displayName }) {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    const p = v.play()
    if (p !== undefined) {
      p.catch(() => {})
    }
  }, [videoSrc])

  return (
    <div className="absolute inset-0 w-full h-full bg-[#001428] overflow-hidden">
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster || undefined}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 mt-auto p-2">
        <span className="text-[11px] font-heading font-bold text-white drop-shadow block leading-tight truncate">
          {displayName}
        </span>
      </div>
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#001428] rotate-45 border-r-2 border-b-2 border-[#FFCD00]" />
    </div>
  )
}

const CUSTOM_ACTIVITIES = [
  {
    id: 'canyoneering',
    name: 'Canyoneering',
    video: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_scale,q_auto,w_360/TDV-Media/Services/Other/Canoneering.mp4',
  },
  {
    id: 'safari',
    name: 'Safari',
    video: vidSafari,
    poster: imgSafari,
  },
  {
    id: 'trekking',
    name: 'Trekking',
    video: vidTrekking,
    poster: imgTrekking,
  },
  {
    id: 'surfing',
    name: 'Surfing',
    video: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_scale,q_auto,w_360/TDV-Media/Services/3_Day_Surf_Academy_Course.mp4',
  },
  {
    id: 'sightseeing',
    name: 'Local Sightseeing',
    video: vidSightseeing,
    poster: imgSightseeing,
  },
  {
    id: 'snorkeling',
    name: 'Snorkeling',
    video: 'https://res.cloudinary.com/qvbunv8y/video/upload/c_scale,q_auto,w_360/TDV-Media/Services/Discover_Snorkelling.mp4',
  },
  {
    id: 'camping_camper',
    name: 'Camping / Camper',
    video: vidCampers,
    poster: imgCampers,
  },
  {
    id: 'liveaboard',
    name: 'Liveaboard',
    video: vidLiveaboard,
    poster: imgLiveaboard,
  },
]

export default function CustomizeExperiencePanel({ className = '', images = PANEL_IMAGES }) {
  const [selectedActivities, setSelectedActivities] = useState([])
  const [customText, setCustomText] = useState('')
  const [hoveredActivity, setHoveredActivity] = useState(null)
  const navigate = useNavigate()
  
  // Dynamic Background Image Carousel (Identical to Come for Adventure panel)
  const [index, setIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length === 0) return
    const duration = (typeof window !== 'undefined' && window.innerWidth < 640) ? 5200 : 3400
    const timer = setInterval(() => {
      setIndex((curr) => {
        setPrevIndex(curr)
        return (curr + 1) % images.length
      })
    }, duration)
    return () => clearInterval(timer)
  }, [images])

  const toggleActivity = (id) => {
    setSelectedActivities((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      const selectedNames = CUSTOM_ACTIVITIES.filter((a) => next.includes(a.id)).map((a) => a.name)

      setCustomText((currText) => {
        const lines = currText ? currText.split('\n').filter((line) => !line.startsWith('Selected Activities:')) : []
        const extraText = lines.join('\n').trim()

        if (selectedNames.length > 0) {
          const actHeader = `Selected Activities: ${selectedNames.join(', ')}`
          return extraText ? `${actHeader}\n\n${extraText}` : actHeader
        }
        return extraText
      })

      return next
    })
  }

  const handleSubmit = () => {
    const selectedNames = CUSTOM_ACTIVITIES
      .filter((a) => selectedActivities.includes(a.id))
      .map((a) => a.name)

    const extraNotes = customText
      ? customText
          .split('\n')
          .filter((line) => !line.toLowerCase().startsWith('selected activities:'))
          .join('\n')
          .trim()
      : ''

    const searchParams = new URLSearchParams()
    if (selectedNames.length > 0) {
      searchParams.set('addons', selectedNames.join(','))
    }
    if (extraNotes) {
      searchParams.set('notes', extraNotes)
    }

    navigate(
      {
        pathname: '/book-us',
        search: searchParams.toString() ? `?${searchParams.toString()}` : '',
      },
      {
        state: {
          selectedAddOns: selectedNames,
          requests: extraNotes,
        },
      }
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-[36px] sm:rounded-[44px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full min-h-[480px] lg:min-h-[560px] flex flex-col justify-center text-white ${className}`}>
      {/* Base Layer: Previous image stays solid extending fully to both ends */}
      {images[prevIndex] && (
        <img
          src={images[prevIndex]}
          alt="Ocean Background"
          className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover object-center pointer-events-none"
        />
      )}

      {/* Active Layer: Current image smoothly fades in extending fully to both ends */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Island Activity ${i + 1}`}
          className={`absolute inset-0 w-full h-full min-w-full min-h-full object-cover object-center transition-opacity duration-1000 ease-in-out pointer-events-none ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          loading="lazy"
        />
      ))}

      {/* Soft Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#001428]/60 via-[#001428]/40 to-[#001428]/25 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001428]/45 via-transparent to-black/10 pointer-events-none z-10" />
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#FFCD00]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-20 p-6 sm:p-10 lg:p-14">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Column: Heading & Activity Chips */}
          <div className="flex-1">
            <span className="inline-block self-start bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold text-[#FFCD00] uppercase tracking-widest mb-4 shadow-sm">
              Tailor Made Adventures
            </span>
            
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-tight mb-4 drop-shadow-md">
              Customize Your <span className="font-heading font-bold text-[#FFCD00]"><br />Dive Experience</span>
            </h2>
            
            <p className="text-white/90 text-sm sm:text-base font-medium mb-6 drop-shadow-sm max-w-xl leading-relaxed">
              Select your favorite add-ons to build your perfect ocean journey:
            </p>

            {/* Mobile View: 3 Explicit Lines */}
            <div className="flex sm:hidden flex-col gap-2">
              {[
                ['canyoneering', 'safari', 'trekking'],
                ['sightseeing', 'surfing', 'snorkeling'],
                ['camping_camper', 'liveaboard']
              ].map((lineItemIds, lineIdx) => (
                <div key={lineIdx} className="flex flex-nowrap items-center gap-1.5 xs:gap-2">
                  {lineItemIds.map((actId) => {
                    const activity = CUSTOM_ACTIVITIES.find((a) => a.id === actId)
                    if (!activity) return null
                    const isSelected = selectedActivities.includes(activity.id)
                    const isHovered = hoveredActivity === activity.id
                    const displayName = activity.id === 'sightseeing' ? 'Sightseeing' : activity.name

                    return (
                      <div
                        key={activity.id}
                        className="relative shrink-0"
                        onMouseEnter={() => setHoveredActivity(activity.id)}
                        onMouseLeave={() => setHoveredActivity(null)}
                      >
                        <AnimatePresence>
                          {isHovered && activity.video && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.88 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.9 }}
                              transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                              className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-32 h-32 rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.7)] border-2 border-[#FFCD00] bg-[#001428] z-50 pointer-events-none flex flex-col justify-between"
                            >
                              <HoverVideoPreview
                                videoSrc={activity.video}
                                poster={activity.poster}
                                displayName={displayName}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          type="button"
                          onClick={() => toggleActivity(activity.id)}
                          className={`group inline-flex items-center gap-1 px-2.5 py-1.5 xs:px-3.5 xs:py-2 rounded-full text-[10.5px] xs:text-xs font-bold transition-all duration-300 border cursor-pointer select-none active:scale-95 whitespace-nowrap ${
                            isSelected
                              ? 'bg-navy text-white border-white/40 scale-105 shadow-md'
                              : 'bg-white/10 hover:bg-white/20 text-white border-white/25 hover:border-[#FFCD00] backdrop-blur-md hover:text-[#FFCD00]'
                          }`}
                        >
                          <span>{displayName}</span>
                          {isSelected && (
                            <span className="ml-0.5 text-[10px] font-black">✓</span>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Desktop View: Normal Flex Wrap */}
            <div className="hidden sm:flex flex-wrap gap-2.5">
              {CUSTOM_ACTIVITIES.map((activity) => {
                const isSelected = selectedActivities.includes(activity.id)
                const isHovered = hoveredActivity === activity.id

                return (
                  <div
                    key={activity.id}
                    className="relative"
                    onMouseEnter={() => setHoveredActivity(activity.id)}
                    onMouseLeave={() => setHoveredActivity(null)}
                  >
                    {/* Hover Floating Video Preview Box */}
                    <AnimatePresence>
                      {isHovered && activity.video && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.88 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.9 }}
                          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                          className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.7)] border-2 border-[#FFCD00] bg-[#001428] z-50 pointer-events-none flex flex-col justify-between"
                        >
                          <HoverVideoPreview
                            videoSrc={activity.video}
                            poster={activity.poster}
                            displayName={activity.name}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => toggleActivity(activity.id)}
                      className={`group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-navy text-white border-white/40 scale-105 shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/25 hover:border-[#FFCD00] backdrop-blur-md hover:text-[#FFCD00]'
                      }`}
                    >
                      <span>{activity.name}</span>
                      {isSelected && (
                        <span className="ml-1 text-[11px] font-black">✓</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Asterisk location disclaimer */}
            <p className="mt-4 text-[11px] sm:text-xs text-white/70 italic font-medium">
              *Add Ons are subjected to location.
            </p>
          </div>

          {/* Right Column: Translucent Glass Box (Expanded Length & Height) */}
          <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col gap-4 shrink-0 bg-white/10 backdrop-blur-2xl p-6 sm:p-8 lg:p-9 rounded-[32px] border border-white/20 shadow-2xl">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90 mb-2.5">
                Custom Requests & Details
              </label>
              <textarea
                rows={5}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="E.g., 3-day scuba package with sunset surfing, camping & local food experience..."
                className="w-full min-h-[140px] sm:min-h-[160px] rounded-2xl bg-white/10 border border-white/20 p-4 sm:p-5 text-xs sm:text-sm text-white placeholder-white/55 outline-none focus:border-[#FFCD00] focus:ring-1 focus:ring-[#FFCD00]/50 transition resize-none leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:scale-105 active:scale-95 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] cursor-pointer"
            >
              <span>Submit</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
