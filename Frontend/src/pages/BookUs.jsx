import LazyVideo from '../components/LazyVideo'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneInput, { parsePhoneNumber, getCountryCallingCode } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { useLenis } from '../utils/lenisReact'
import CompactTwoMonthCalendarPopover from '../components/CompactTwoMonthCalendarPopover'
import SEOHead from '../components/SEOHead'
import diveCountries from '../data/diveCountries.json'
import { bookingService } from '../services/bookingService'
import { FUN_DIVES_PACKAGES, SERVICES_DATA } from '../data/servicesData'
import {
  COURSE_CATALOG,
  CERTIFICATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  ADD_ON_OPTIONS,
  isDirectActivity,
  getCourseDisplayName,
  getEligibleCourses,
  getRecommendedCourses,
  getAvailableCertificationsForAge,
  sortCoursesByDifficulty,
  validateParticipantBooking,
  normalizeExperienceKey,
} from '../utils/courseEligibility'
import { triggerHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../utils/haptics'

const turtleAnnaVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Turtle.mp4'
const compiledNightDiveVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Night_Dive.mp4'
import useNightDive from '../hooks/useNightDive'
import DiveExplorerMap from '../components/DiveExplorerMap'
import { loadDiveSites } from '../utils/diveSitesLoader'
import { getIslandsForCountry, getSitesForIsland, getIslandForSite } from '../utils/diveIslandCatalog'


// Maps service page IDs → { courseId, experience, funDivesCount? }
// When a user arrives from services page via 'Book Now', experience is auto-selected (Scuba Diving, FreeDiving, Surfing),
// certifications are hidden in Step 2, and Step 3 is skipped.
const SERVICE_TO_PROGRAM = {
  // Introductory Programs -> Scuba Diving
  'prog-1': { courseId: 'try-dive', experience: 'Scuba Diving' },
  'prog-2': { courseId: 'dsd-lite', experience: 'Scuba Diving' },
  'prog-3': { courseId: 'dsd', experience: 'Scuba Diving' },
  'prog-4': { courseId: 'add-dive-after-dsd', experience: 'Scuba Diving' },
  'prog-5': { courseId: 'bubblemaker', experience: 'Scuba Diving' },
  // Snorkeling -> Snorkeling
  'snork-1': { courseId: 'discover-snorkeling', experience: 'Snorkeling' },
  'snork-2': { courseId: 'reef-explorer', experience: 'Snorkeling' },
  'snork-3': { courseId: 'ocean-explorer', experience: 'Snorkeling' },
  // Certification Courses -> Scuba Diving
  'course-1': { courseId: 'skin-diver', experience: 'Scuba Diving' },
  'course-2': { courseId: 'scuba-diver', experience: 'Scuba Diving' },
  'course-3': { courseId: 'open-water', experience: 'Scuba Diving' },
  'course-4': { courseId: 'adventure-diver', experience: 'Scuba Diving' },
  'course-5': { courseId: 'advanced-ow', experience: 'Scuba Diving' },
  'course-6': { courseId: 'efr-primary-secondary', experience: 'Scuba Diving' },
  'course-7': { courseId: 'rescue-diver', experience: 'Scuba Diving' },
  'course-8': { courseId: 'reactivate', experience: 'Scuba Diving' },
  'course-9': { courseId: 'full-refresher', experience: 'Scuba Diving' },
  'course-10': { courseId: 'lite-refresher', experience: 'Scuba Diving' },
  // Specialties -> Scuba Diving
  'spec-1': { courseId: 'peak-buoyancy', experience: 'Scuba Diving' },
  'spec-2': { courseId: 'project-aware', experience: 'Scuba Diving' },
  'spec-3': { courseId: 'deep-diver', experience: 'Scuba Diving' },
  'spec-4': { courseId: 'wreck-diver', experience: 'Scuba Diving' },
  'spec-5': { courseId: 'night-diver', experience: 'Scuba Diving' },
  'spec-6': { courseId: 'enriched-air-nitrox', experience: 'Scuba Diving' },
  'spec-7': { courseId: 'drift-diver', experience: 'Scuba Diving' },
  // Combos & Packages -> Scuba Diving
  'combo-1': { courseId: 'dsd-ow-combo', experience: 'Scuba Diving' },
  'combo-2': { courseId: 'ow-aow-combo', experience: 'Scuba Diving' },
  'combo-3': { courseId: 'efr-rescue-combo', experience: 'Scuba Diving' },
  'combo-fundives': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-2' },
  // Pro Courses -> Scuba Diving
  'pro-1': { courseId: 'divemaster', experience: 'Scuba Diving' },
  'pro-2': { courseId: 'efr-rescue-dm-combo', experience: 'Scuba Diving' },
  'pro-3': { courseId: 'efr-rescue-dm-prereqs', experience: 'Scuba Diving' },
  'pro-4': { courseId: 'zero-to-hero', experience: 'Scuba Diving' },
  // Freediving -> FreeDiving
  'free-1': { courseId: 'basic-freediver', experience: 'FreeDiving' },
  'free-2': { courseId: 'freediver', experience: 'FreeDiving' },
  // Surfing -> Surfing
  'surf-1': { courseId: 'discover-surfing', experience: 'Surfing' },
  'surf-3': { courseId: '3-day-surf-academy', experience: 'Surfing' },
  // Fun Dives (individual packages) -> Scuba Diving
  'fun-day-dive': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-2' },
  'fun-dawn-dive': { courseId: 'fun-dawn-dive', experience: 'Scuba Diving', funDivesCount: 'fun-dawn-1' },
  'fun-night-dive': { courseId: 'fun-night-dive', experience: 'Scuba Diving', funDivesCount: 'fun-night-1' },
  'fun-1': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-1' },
  'fun-2': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-2' },
  'fun-4': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-4' },
  'fun-6': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-6' },
  'fun-8': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-8' },
  'fun-10': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-10' },
  'fun-12': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-12' },
  'fun-post': { courseId: 'fun-day-dive', experience: 'Scuba Diving', funDivesCount: 'fun-post' },
  'fun-dawn-1': { courseId: 'fun-dawn-dive', experience: 'Scuba Diving', funDivesCount: 'fun-dawn-1' },
  'fun-dawn-2': { courseId: 'fun-dawn-dive', experience: 'Scuba Diving', funDivesCount: 'fun-dawn-2' },
  'fun-night-1': { courseId: 'fun-night-dive', experience: 'Scuba Diving', funDivesCount: 'fun-night-1' },
  'fun-night-2': { courseId: 'fun-night-dive', experience: 'Scuba Diving', funDivesCount: 'fun-night-2' },
}

const normalizeAddOn = (raw) => {
  if (!raw || typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // 1. Direct case-insensitive match against ADD_ON_OPTIONS
  const exact = ADD_ON_OPTIONS.find((opt) => opt.toLowerCase() === trimmed.toLowerCase())
  if (exact) return exact

  // 2. Slug / keyword match
  const clean = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (clean.includes('canoneer') || clean.includes('canyon') || clean === 'addon1') return 'Canyoneering'
  if (clean.includes('trek')) return 'Trekking'
  if (clean.includes('sight')) return 'Local Sightseeing'
  if (clean.includes('camp')) return 'Camping / Camper'
  if (clean.includes('safari')) return 'Safari'
  if (clean.includes('live')) return 'Liveaboard'
  if (clean.includes('snorkel')) return 'Snorkeling'
  if (clean.includes('surf')) return 'Surfing'

  const alphaMatch = ADD_ON_OPTIONS.find(
    (opt) => opt.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  )
  return alphaMatch || trimmed
}

export default function BookUs() {
  const isNightDive = useNightDive()
  const routerLocation = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialProgram = searchParams.get('program') || ''
  const initialCountry = searchParams.get('country') || ''
  const initialSite = searchParams.get('site') || ''
  const initialService = searchParams.get('service') || ''

  // Look up full service data if initialService is provided
  const serviceItem = useMemo(() => {
    if (!initialService) return null
    return SERVICES_DATA.find((s) => s.id === initialService) || null
  }, [initialService])

  // Check if arrival is specifically via an Add-On service
  const isAddOnService = useMemo(() => {
    if (!initialService) return false
    return (
      initialService.startsWith('addon-') ||
      initialService.includes('canyon') ||
      initialService.includes('canoneer') ||
      initialService.includes('trekking') ||
      initialService.includes('sightseeing') ||
      initialService.includes('camper') ||
      initialService.includes('safari') ||
      initialService.includes('liveaboard') ||
      serviceItem?.category === 'addons'
    )
  }, [initialService, serviceItem])

  // Pre-selected course/program service from services page
  const initialFromService = useMemo(() => {
    if (!initialService || isAddOnService) return null
    if (SERVICE_TO_PROGRAM[initialService]) {
      return SERVICE_TO_PROGRAM[initialService]
    }
    // Fallback: check if serviceItem exists and match category
    if (serviceItem) {
      if (serviceItem.category === 'freediving') return { courseId: 'basic-freediver', experience: 'FreeDiving' }
      if (serviceItem.category === 'snorkeling') return { courseId: 'discover-snorkeling', experience: 'Snorkeling' }
      if (serviceItem.category === 'surfing') return { courseId: 'discover-surfing', experience: 'Surfing' }
      return { courseId: 'try-dive', experience: 'Scuba Diving' }
    }
    return null
  }, [initialService, isAddOnService, serviceItem])

  const isCourseService = Boolean(initialFromService)

  // Resolve pre-selected course metadata if available
  const selectedCourseProgram = useMemo(() => {
    if (!initialFromService?.courseId) return null
    return COURSE_CATALOG.find((c) => c.id === initialFromService.courseId) || null
  }, [initialFromService])

  // Pre-selected add-ons when arriving via add-on service or custom dive panel
  const initialAddOns = useMemo(() => {
    // 1. Check router navigation state (e.g. from CustomizeExperiencePanel)
    const stateAddOns = routerLocation?.state?.selectedAddOns || routerLocation?.state?.addons
    if (stateAddOns) {
      const list = Array.isArray(stateAddOns)
        ? stateAddOns
        : typeof stateAddOns === 'string'
          ? stateAddOns.split(',')
          : []
      const resolved = list.map(normalizeAddOn).filter(Boolean)
      if (resolved.length > 0) return Array.from(new Set(resolved))
    }

    // 2. Check query params (?addons=... or ?addon=...)
    const urlAddOns = searchParams.get('addons') || searchParams.get('addon')
    if (urlAddOns) {
      const list = urlAddOns.split(',').map((s) => s.trim()).filter(Boolean)
      const resolved = list.map(normalizeAddOn).filter(Boolean)
      if (resolved.length > 0) return Array.from(new Set(resolved))
    }

    // 3. Fallback: Pre-selected add-ons when arriving via add-on service
    if (initialService) {
      const lower = initialService.toLowerCase()
      if (lower.includes('trekking')) return ['Trekking']
      if (lower.includes('sightseeing')) return ['Local Sightseeing']
      if (lower.includes('camper')) return ['Camping / Camper']
      if (lower.includes('safari')) return ['Safari']
      if (lower.includes('liveaboard')) return ['Liveaboard']
      if (lower.includes('canoneer') || lower.includes('canyon') || lower === 'addon-1') return ['Canyoneering']
      if (serviceItem?.category === 'addons') {
        const title = serviceItem.title?.toLowerCase() || ''
        if (title.includes('trek')) return ['Trekking']
        if (title.includes('sight')) return ['Local Sightseeing']
        if (title.includes('camp')) return ['Camping / Camper']
        if (title.includes('safari')) return ['Safari']
        if (title.includes('live')) return ['Liveaboard']
        if (title.includes('canyon') || title.includes('canon')) return ['Canyoneering']
      }
    }
    return []
  }, [routerLocation?.state, searchParams, initialService, serviceItem])

  const initialRequests = useMemo(() => {
    return (
      routerLocation?.state?.requests ||
      routerLocation?.state?.message ||
      searchParams.get('notes') ||
      searchParams.get('requests') ||
      searchParams.get('message') ||
      ''
    )
  }, [routerLocation?.state, searchParams])

  const [currentStep, setCurrentStep] = useState(1)

  // Today, 7-day preparation cutoff (dates 7 days after current day are unavailable), & 1 year max date bounds
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const cooldownMinDateStr = useMemo(() => {
    const d = new Date()
    // 7 days after current day are unavailable (e.g. if today is 10, till 17 is unavailable, available from 18)
    d.setDate(d.getDate() + 8)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])
  const maxDateStr = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  // Step 1: Country, Island, Dive Site, Experience, Date & Group Size
  const [country, setCountry] = useState(initialCountry)
  const [island, setIsland] = useState('')
  const [allDiveSites, setAllDiveSites] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locationId, setLocationId] = useState(initialSite)
  const [location, setLocation] = useState(initialSite)
  const [experience, setExperience] = useState(initialFromService?.experience || '')
  const [selectedAddOns, setSelectedAddOns] = useState(initialAddOns)

  // Sync selected add-ons when initialAddOns updates
  useEffect(() => {
    if (initialAddOns && initialAddOns.length > 0) {
      setSelectedAddOns((prev) => {
        if (!prev || prev.length === 0 || (prev.length === 1 && prev[0] === 'None')) {
          return initialAddOns
        }
        return Array.from(new Set([...prev.filter((i) => i !== 'None'), ...initialAddOns]))
      })
    }
  }, [initialAddOns])
  const [date, setDate] = useState('')
  const [dateError, setDateError] = useState('')
  const [stepError, setStepError] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const datePickerBtnRef = useRef(null)

  // Load all dive sites to populate islands & sites
  useEffect(() => {
    let isMounted = true
    loadDiveSites().then((data) => {
      if (isMounted && data?.sites) {
        setAllDiveSites(data.sites)
      }
    }).catch(console.error)
    return () => { isMounted = false }
  }, [])

  // Auto-resolve island if initialSite query parameter is provided
  useEffect(() => {
    if (initialSite && allDiveSites.length > 0 && !island) {
      const match = allDiveSites.find((s) => s.id === initialSite || s.siteName === initialSite)
      if (match) {
        if (!country && match.country) setCountry(match.country)
        const siteIsland = getIslandForSite(match)
        if (siteIsland) setIsland(siteIsland)
      }
    }
  }, [initialSite, allDiveSites, island, country])

  // Available islands in selected country
  const availableIslands = useMemo(() => {
    return getIslandsForCountry(country, allDiveSites)
  }, [country, allDiveSites])

  // Available dive sites on selected island
  const availableSitesForIsland = useMemo(() => {
    const list = getSitesForIsland(country, island, allDiveSites)
    return [...list].sort((a, b) => (a.siteName || '').localeCompare(b.siteName || ''))
  }, [country, island, allDiveSites])

  const handleMapSelectCountry = useCallback((newCountry) => {
    setCountry(newCountry || '')
    setIsland('')
    setSelectedLocation(null)
    setLocation('')
    setLocationId('')
    setStepError('')
    triggerHaptic(5)
  }, [])

  const handleMapSelectSite = useCallback((site) => {
    if (!site) return
    if (site.country && site.country !== 'International Waters') {
      setCountry(site.country)
    }
    const siteIsland = getIslandForSite(site)
    if (siteIsland) {
      setIsland(siteIsland)
    }
    if (site.siteName) {
      setLocation(site.siteName)
      setLocationId(site.id || site.siteName)
    }
    setStepError('')
    triggerSuccessHaptic()
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const formEl = document.getElementById('booking-wizard-form')
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [])

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const [year, month, day] = parts
    return `${day}-${month}-${year}`
  }

  // Country list lookup
  const countries = useMemo(() => diveCountries || [], [])

  // Step 1 Handlers
  const handleCountryChange = (newCountry) => {
    setCountry(newCountry)
    setIsland('')
    setSelectedLocation(null)
    setLocationId('')
    setLocation('')
    setStepError('')
  }

  const handleIslandChange = (newIsland) => {
    setIsland(newIsland)
    setSelectedLocation(null)
    setLocationId('')
    setLocation('')
    setStepError('')
    triggerHaptic(5)
  }

  const handleSiteChange = (newSiteName) => {
    setLocation(newSiteName)
    const match = availableSitesForIsland.find((s) => s.siteName === newSiteName)
    setLocationId(match ? (match.id || match.siteName) : newSiteName)
    setStepError('')
    triggerSuccessHaptic()
  }

  const handleExperienceChange = (newExp) => {
    setExperience(newExp)
    setStepError('')
    // Reset experience-specific participant state when experience changes
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        hasCertification: false,
        certifications: [],
        selectedProgram: '',
      }))
    )
  }

  const handleToggleAddOn = (addOn) => {
    if (addOn === 'None') {
      setSelectedAddOns((prev) => (prev.includes('None') ? [] : ['None']))
      setStepError('')
      return
    }

    setSelectedAddOns((prev) => {
      const withoutNone = prev.filter((item) => item !== 'None')
      if (withoutNone.includes(addOn)) {
        return withoutNone.filter((item) => item !== addOn)
      }
      return [...withoutNone, addOn]
    })
    setStepError('')
  }

  const handleClearAddOns = () => {
    setSelectedAddOns([])
    setStepError('')
  }

  // Step 2: Participant Info List
  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: '',
      age: '',
      parentalConsent: false,
      hasCertification: false,
      certifications: [],
      selectedProgram: initialFromService?.courseId || initialProgram || '',
      funDivesCount: initialFromService?.funDivesCount || undefined,
    }
  ])

  const lenis = useLenis()
  const bookingFormRef = useRef(null)
  const participantScrollRef = useRef(null)

  // Order Summary popup modal state before final booking submit
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  // Step 4: Contact Details
  const [phoneCountry, setPhoneCountry] = useState('IN')
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    requests: initialRequests || ''
  })

  // Sync initial special requests if provided via state or search params
  useEffect(() => {
    if (initialRequests) {
      setContact((prev) => {
        if (!prev.requests) return { ...prev, requests: initialRequests }
        if (!prev.requests.includes(initialRequests)) {
          return { ...prev, requests: `${prev.requests}\n\n${initialRequests}` }
        }
        return prev
      })
    }
  }, [initialRequests])

  // Lock background scrolling and pause Lenis when order confirmation modal is open
  useEffect(() => {
    if (!showSummaryModal) return

    if (lenis) {
      lenis.stop()
    }

    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyPaddingRight = document.body.style.paddingRight

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      if (lenis) {
        lenis.start()
      }
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.paddingRight = prevBodyPaddingRight
    }
  }, [showSummaryModal, lenis])

  // Boundary-aware scroll handling for the booking form:
  // When cursor is over the form and the participant list has internal scrollable content:
  // - Scrolling stays strictly within the form while room remains in the scroll direction.
  // - When the bottom of the form is reached, scrolling down seamlessly scrolls the page.
  // - When the top of the form is reached, scrolling up seamlessly scrolls the page.
  useEffect(() => {
    const formEl = bookingFormRef.current
    if (!formEl) return

    const handleWheel = (e) => {
      // Ignore negligible scroll deltas or horizontal scrolling
      if (Math.abs(e.deltaY) < 0.2) return

      const scrollEl = participantScrollRef.current
      if (!scrollEl) return

      const { scrollTop, scrollHeight, clientHeight } = scrollEl
      const maxScroll = scrollHeight - clientHeight

      // If participant container doesn't overflow (no internal scrollbar), let normal page scroll handle it
      if (maxScroll <= 2) return

      const isAtBottom = scrollTop >= maxScroll - 2
      const isAtTop = scrollTop <= 2

      const getCurrentPageScroll = () => {
        if (lenis) {
          if (typeof lenis.targetScroll === 'number') return lenis.targetScroll
          if (typeof lenis.scroll === 'number') return lenis.scroll
        }
        return window.scrollY || window.pageYOffset || 0
      }

      const scrollPageBy = (delta) => {
        if (lenis && typeof lenis.scrollTo === 'function') {
          const current = getCurrentPageScroll()
          lenis.scrollTo(current + delta, { programmatic: false })
        } else {
          window.scrollBy({ top: delta, behavior: 'smooth' })
        }
      }

      if (e.deltaY > 0) {
        // Scrolling DOWN
        if (!isAtBottom) {
          // Scroll stays strictly within the form
          const remaining = maxScroll - scrollTop
          if (e.deltaY <= remaining) {
            scrollEl.scrollTop += e.deltaY
            e.preventDefault()
            e.stopPropagation()
            e.lenisStopPropagation = true
          } else {
            // Reached bottom boundary on this tick: scroll form to bottom and forward excess to page
            scrollEl.scrollTop = maxScroll
            const excess = e.deltaY - remaining
            e.preventDefault()
            e.stopPropagation()
            e.lenisStopPropagation = true
            scrollPageBy(excess)
          }
        } else {
          // Bottom of form is reached: page scrolling is possible!
          e.preventDefault()
          e.stopPropagation()
          e.lenisStopPropagation = true
          scrollPageBy(e.deltaY)
        }
      } else if (e.deltaY < 0) {
        // Scrolling UP
        if (!isAtTop) {
          // Scroll stays strictly within the form
          const remaining = scrollTop
          const absDelta = Math.abs(e.deltaY)
          if (absDelta <= remaining) {
            scrollEl.scrollTop -= absDelta
            e.preventDefault()
            e.stopPropagation()
            e.lenisStopPropagation = true
          } else {
            // Reached top boundary on this tick: scroll form to top and forward excess to page
            scrollEl.scrollTop = 0
            const excess = absDelta - remaining
            e.preventDefault()
            e.stopPropagation()
            e.lenisStopPropagation = true
            scrollPageBy(-excess)
          }
        } else {
          // Top of form is reached: page scrolling is possible!
          e.preventDefault()
          e.stopPropagation()
          e.lenisStopPropagation = true
          scrollPageBy(e.deltaY)
        }
      }
    }

    formEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      formEl.removeEventListener('wheel', handleWheel)
    }
  }, [lenis, currentStep, participants.length])

  // Restrict phone input strictly to at most 10 digits
  const handlePhoneChange = useCallback((val) => {
    if (!val) {
      setContact((prev) => ({ ...prev, phone: '' }))
      return
    }
    try {
      const parsed = parsePhoneNumber(val)
      if (parsed && parsed.nationalNumber && parsed.nationalNumber.length > 10) {
        const trimmed = parsed.nationalNumber.slice(0, 10)
        const clamped = `+${parsed.countryCallingCode}${trimmed}`
        setContact((prev) => ({ ...prev, phone: clamped }))
        return
      }
    } catch { }
    setContact((prev) => ({ ...prev, phone: val }))
  }, [])

  const handlePhoneKeyDown = useCallback((e) => {
    // 1. Allow control & navigation keys
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return
    }

    // 2. Strictly disallow any non-digit character
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
      return
    }

    // 3. Allow typing if user has selected text that will be replaced
    const { selectionStart, selectionEnd } = e.currentTarget
    if (selectionStart !== selectionEnd) {
      return
    }

    // 4. Calculate calling code digit length and limit national digits to strictly 10
    let callingCodeLen = 2
    try {
      callingCodeLen = getCountryCallingCode(phoneCountry || 'IN').length
    } catch { }

    const currentDigits = (e.currentTarget.value || '').replace(/\D/g, '')
    if (currentDigits.length >= callingCodeLen + 10) {
      e.preventDefault()
    }
  }, [phoneCountry])

  // Autofill Special Requests when Add Ons change
  const prevAddOnsRef = useRef([])
  useEffect(() => {
    const activeAddOns = selectedAddOns.filter((item) => item !== 'None')
    const addOnText = activeAddOns.length > 0 ? `Selected Add-ons: ${activeAddOns.join(', ')}` : ''

    setContact((prev) => {
      const currentText = prev.requests || ''
      // Match existing auto-filled "Selected Add-ons: ..." line if present
      const addOnRegex = /(?:^|\n)?Selected Add-ons:[^\n]*(?:\n|$)?/i

      if (!addOnText) {
        // If no add-ons or None selected, cleanly remove previous auto-filled add-ons line
        const cleaned = currentText.replace(addOnRegex, '').trim()
        return { ...prev, requests: cleaned }
      }

      if (addOnRegex.test(currentText)) {
        // Replace existing auto-filled line
        const updated = currentText.replace(addOnRegex, (match) => {
          return match.startsWith('\n') ? `\n${addOnText}\n` : `${addOnText}\n`
        }).trim()
        return { ...prev, requests: updated }
      } else {
        // Prepend/append to any custom user notes
        const updated = currentText ? `${addOnText}\n\n${currentText}` : addOnText
        return { ...prev, requests: updated }
      }
    })
    prevAddOnsRef.current = selectedAddOns
  }, [selectedAddOns])

  const [submitted, setSubmitted] = useState(false)
  const [submittedBooking, setSubmittedBooking] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Completely reset the booking wizard form to its fresh blank state
  const resetFormState = useCallback(() => {
    setCountry('')
    setIsland('')
    setSelectedLocation(null)
    setLocationId('')
    setLocation('')
    setExperience('')
    setSelectedAddOns([])
    setDate('')
    setDateError('')
    setStepError('')
    setGroupSize(1)
    setIsCalendarOpen(false)
    setParticipants([
      {
        id: 1,
        name: '',
        age: '',
        parentalConsent: false,
        hasCertification: false,
        certifications: [],
        selectedProgram: '',
        funDivesCount: undefined,
      }
    ])
    setContact({
      name: '',
      email: '',
      phone: '',
      requests: '',
    })
    setPhoneCountry('IN')
    setCurrentStep(1)
    if (typeof setSearchParams === 'function') {
      try {
        setSearchParams({}, { replace: true })
      } catch { }
    }
    if (bookingFormRef.current) {
      bookingFormRef.current.reset?.()
    }
  }, [setSearchParams])

  // Sync group size changes to participants array
  useEffect(() => {
    const count = Math.max(1, parseInt(groupSize, 10) || 1)
    setParticipants((prev) => {
      if (prev.length === count) return prev
      if (prev.length < count) {
        const extra = Array.from({ length: count - prev.length }, (_, i) => ({
          id: prev.length + i + 1,
          name: '',
          age: '',
          parentalConsent: false,
          hasCertification: false,
          certifications: [],
          selectedProgram: initialFromService?.courseId || '',
          funDivesCount: initialFromService?.funDivesCount || undefined,
        }))
        return [...prev, ...extra]
      }
      return prev.slice(0, count)
    })
  }, [groupSize, initialFromService])

  const handleParticipantChange = (index, field, value) => {
    setParticipants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }

      if (field === 'hasCertification' && !value) {
        updated[index].certifications = []
      }

      if (field === 'age' || field === 'hasCertification' || field === 'certifications') {
        const p = updated[index]
        const ageNum = parseInt(p.age, 10)
        if (isNaN(ageNum) || ageNum < 8 || ageNum > 110) {
          updated[index].hasCertification = false
          updated[index].certifications = []
          if (!isCourseService) {
            updated[index].selectedProgram = ''
          }
        } else {
          // If 12 or above, parental consent is automatically valid
          if (ageNum >= 12) {
            updated[index].parentalConsent = true
          }

          if (!isCourseService) {
            const validCertsForAge = (updated[index].certifications || []).filter((certId) => {
              const opt = CERTIFICATION_OPTIONS.find((c) => c.id === certId)
              return opt && ageNum >= opt.minAgeToHold && (!opt.maxAgeToHold || ageNum <= opt.maxAgeToHold)
            })
            updated[index].certifications = validCertsForAge

            // Non-scuba activities do not have scuba certification tracks
            if (normalizeExperienceKey(experience) !== 'scuba') {
              updated[index].hasCertification = false
              updated[index].certifications = []
            } else if (ageNum === 8) {
              // 8-year-olds can hold junior certification status, but don't hold adult cert cards
              updated[index].certifications = []
            }

            const eligible = getRecommendedCourses(p.age, updated[index].hasCertification, updated[index].certifications, experience)
            const isCurrentEligible = eligible.some((course) => course.id === p.selectedProgram)
            if (!isCurrentEligible) {
              updated[index].selectedProgram = ''
            }
          }
        }
      }

      // Preserve pre-selected course if arriving via service
      if (isCourseService && !updated[index].selectedProgram && initialFromService?.courseId) {
        updated[index].selectedProgram = initialFromService.courseId
      }
      if (isCourseService && !updated[index].funDivesCount && initialFromService?.funDivesCount) {
        updated[index].funDivesCount = initialFromService.funDivesCount
      }

      return updated
    })
  }

  // Single-select certification handler for age > 8
  const handleSelectCertification = (index, certId) => {
    setParticipants((prev) => {
      const updated = [...prev]
      const p = updated[index]
      const newCerts = [certId]

      updated[index] = {
        ...p,
        hasCertification: true,
        certifications: newCerts,
      }

      const eligible = getRecommendedCourses(p.age, true, newCerts, experience)
      const isCurrentEligible = eligible.some((course) => course.id === p.selectedProgram)
      if (!isCurrentEligible) {
        updated[index].selectedProgram = ''
      }
      return updated
    })
  }

  const scrollToFormTop = () => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('booking-wizard-form')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      triggerHaptic(8)
      setStepError('')
      const hasActiveAddOns = selectedAddOns.some((item) => item !== 'None')
      const isDirect = (!experience && hasActiveAddOns) || isDirectActivity(experience)
      if (currentStep === 4) {
        // Step 4 goes back directly to Step 2 (or Step 1 for direct add-on activities)
        setCurrentStep(isDirect ? 1 : 2)
      } else {
        setCurrentStep((prev) => prev - 1)
      }
      scrollToFormTop()
    }
  }, [currentStep, experience, selectedAddOns])

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!country) {
        triggerErrorHaptic()
        setStepError('Please select a dive country.')
        return false
      }
      if (!island && availableIslands.length > 0) {
        triggerErrorHaptic()
        setStepError('Please select an island / region.')
        return false
      }
      if (!locationId && !selectedLocation && !location) {
        triggerErrorHaptic()
        setStepError('Please select a dive site.')
        return false
      }
      const hasActiveAddOns = selectedAddOns.some((item) => item !== 'None')
      if (!experience && !hasActiveAddOns) {
        triggerErrorHaptic()
        setStepError('Please select a primary diving experience or at least one add-on activity.')
        return false
      }
      if (!date || date < cooldownMinDateStr || date > maxDateStr) {
        triggerErrorHaptic()
        setDateError('Please select a date after the 7-day advance booking period.')
        setStepError('Please select a valid date after the 7-day advance booking period.')
        return false
      }
      if (!groupSize || parseInt(groupSize, 10) < 1) {
        triggerErrorHaptic()
        setStepError('Please enter a valid number of participants (minimum 1).')
        return false
      }
      setDateError('')
      setStepError('')

      // Direct activity skips course & participant cert eligibility steps directly to Contact Info (Step 4)
      const isDirect = (!experience && hasActiveAddOns) || isDirectActivity(experience)
      if (isDirect) {
        triggerHaptic(10)
        setCurrentStep(4)
        scrollToFormTop()
        return true
      }

      // Normal flow advances to Step 2 (Participants & Eligibility)
      triggerHaptic(10)
      setCurrentStep(2)
      scrollToFormTop()
      return true
    }
    if (currentStep === 2) {
      const hasEmpty = participants.some((p) => !p.name || !p.age)
      if (hasEmpty) {
        triggerErrorHaptic()
        setStepError('Please fill in the Name and Age for all participants.')
        return false
      }
      const hasInvalidAge = participants.some((p) => parseInt(p.age, 10) < 8)
      if (hasInvalidAge) {
        triggerErrorHaptic()
        setStepError('Minimum age for participating in activities is 8 years. Participants under 8 cannot proceed.')
        return false
      }

      const missingConsent = participants.some((p) => {
        const a = parseInt(p.age, 10)
        return a >= 8 && a < 12 && !p.parentalConsent
      })
      if (missingConsent) {
        triggerErrorHaptic()
        setStepError('Please select the Parental Consent checkbox for all participants under 12 years of age.')
        return false
      }

      // If user came via course service page: skip certification validation & program validation (already prefilled)
      if (isCourseService) {
        setStepError('')
        triggerHaptic(10)
        setCurrentStep(4)
        scrollToFormTop()
        return true
      }

      const hasMissingCert = participants.some((p) => {
        if (normalizeExperienceKey(experience) !== 'scuba') return false
        if (!p.hasCertification) return false
        const available = getAvailableCertificationsForAge(p.age, experience)
        return available.length > 0 && (!p.certifications || p.certifications.length === 0)
      })
      if (hasMissingCert) {
        triggerErrorHaptic()
        setStepError('Please select at least one current certification for participants marked as certified.')
        return false
      }

      const hasUnselected = participants.some((p) => !p.selectedProgram)
      if (hasUnselected) {
        triggerErrorHaptic()
        setStepError('Please select an eligible program for each participant.')
        return false
      }

      const hasMissingFunDivesCount = participants.some((p) => ['fun-day-dive', 'fun-dawn-dive', 'fun-night-dive'].includes(p.selectedProgram) && !p.funDivesCount)
      if (hasMissingFunDivesCount) {
        triggerErrorHaptic()
        setStepError('Please select a dive package (number of dives) for each Fun Dive participant.')
        return false
      }

      for (const p of participants) {
        const val = validateParticipantBooking(p, experience)
        if (!val.valid) {
          triggerErrorHaptic()
          setStepError(val.error || 'Eligibility validation failed.')
          return false
        }
      }

      setStepError('')
      triggerHaptic(10)
      // Advance straight to Contact Details (Step 4)
      setCurrentStep(4)
      scrollToFormTop()
      return true
    }
    if (currentStep < 4) {
      triggerHaptic(10)
      setStepError('')
      setCurrentStep(4)
      scrollToFormTop()
      return true
    }
    return true
  }, [currentStep, country, locationId, selectedLocation, location, experience, selectedAddOns, date, todayStr, maxDateStr, groupSize, participants, isCourseService, availableIslands])

  // Desktop keyboard step navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || isCalendarOpen) return

      if (e.key === 'Enter' && !e.shiftKey && currentStep < 4) {
        e.preventDefault()
        handleNextStep()
      } else if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'Left')) {
        e.preventDefault()
        handlePrevStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextStep, handlePrevStep, isCalendarOpen, currentStep])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!contact.name || !contact.email) {
      setStepError('Please enter your contact Name and Email.')
      return
    }

    if (contact.phone) {
      try {
        const parsed = parsePhoneNumber(contact.phone)
        if (parsed && parsed.nationalNumber && parsed.nationalNumber.length !== 10) {
          setStepError('Phone number must be exactly 10 digits.')
          return
        }
      } catch {
        setStepError('Please enter a valid 10-digit phone number.')
        return
      }
    }

    const activeAddOns = selectedAddOns.filter((item) => item !== 'None')
    const isDirect = (!experience && activeAddOns.length > 0) || isDirectActivity(experience)

    // Pre-submission validation for course-based bookings
    if (!isDirect) {
      for (const p of participants) {
        const ageNum = parseInt(p.age, 10)
        if (!p.name || !p.age || isNaN(ageNum) || ageNum < 8 || ageNum > 110) {
          setStepError('Please enter a valid Name and Age (8-110) for all participants.')
          setCurrentStep(2)
          scrollToFormTop()
          return
        }
        if (ageNum < 12 && !p.parentalConsent) {
          setStepError('Parental consent is required for all participants under 12.')
          setCurrentStep(2)
          scrollToFormTop()
          return
        }
        if (!isCourseService) {
          const validation = validateParticipantBooking(p, experience)
          if (!validation.valid) {
            setStepError(validation.error || 'Participant eligibility validation failed.')
            setCurrentStep(2)
            scrollToFormTop()
            return
          }
        }
      }
    }

    setStepError('')
    setShowSummaryModal(true)
  }

  const handleFinalSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setStepError('')

    const activeAddOns = selectedAddOns.filter((item) => item !== 'None')
    const isDirect = (!experience && activeAddOns.length > 0) || isDirectActivity(experience)
    const addOnsSummary = activeAddOns.join(', ')

    try {
      const res = await bookingService.createBooking({
        country,
        locationId: locationId ? String(locationId) : null,
        location,
        experience: experience || addOnsSummary,
        selectedAddOn: addOnsSummary || null,
        selectedAddOns: activeAddOns,
        date,
        groupSize: participants.length,
        contactName: contact.name,
        contactEmail: contact.email,
        contactPhone: contact.phone || null,
        specialRequests: contact.requests || null,
        participants: isDirect ? [] : participants.map((p) => ({
          name: p.name,
          age: parseInt(p.age, 10),
          parentalConsent: !!p.parentalConsent,
          hasCertification: p.hasCertification,
          certifications: p.certifications,
          selectedProgram: p.selectedProgram,
          funDivesCount: p.funDivesCount,
        })),
      })

      const isSuccess = Boolean(
        res && (
          res.status === 'success' ||
          res.data?.status === 'success' ||
          res.data?.booking ||
          res.booking
        )
      )

      if (isSuccess) {
        triggerSuccessHaptic()
        const newBookingRecord = {
          id: res?.data?.booking?.id || res?.booking?.id || `BK-${Date.now().toString(36).toUpperCase()}`,
          type: 'Booking Request',
          country,
          island: island || null,
          location,
          experience: experience || addOnsSummary,
          selectedAddOn: addOnsSummary || null,
          selectedAddOns: activeAddOns,
          date,
          groupSize: participants.length,
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone || null,
          specialRequests: contact.requests || null,
          participants: isDirect ? [] : participants,
          status: 'Pending Review',
          createdAt: new Date().toISOString(),
        }

        try {
          const existing = JSON.parse(localStorage.getItem('dive_village_bookings') || '[]')
          localStorage.setItem('dive_village_bookings', JSON.stringify([newBookingRecord, ...existing]))
        } catch (e) {
          console.error(e)
        }
        setShowSummaryModal(false)
        setSubmittedBooking(newBookingRecord)
        setSubmitted(true)
        resetFormState()
      } else {
        triggerErrorHaptic()
        setStepError('Booking failed. Please try again.')
      }
    } catch (err) {
      triggerErrorHaptic()
      setStepError(err.message || 'Failed to submit booking. Please check your network and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    const booking = submittedBooking || {}
    const activeAddOns = booking.selectedAddOns || []
    const isDirect = (!booking.experience && activeAddOns.length > 0) || isDirectActivity(booking.experience)
    const addOnsSummary = booking.selectedAddOn || activeAddOns.join(', ') || ''
    const bookingParticipants = booking.participants || []
    const bookingLocation = booking.location || 'Selected Location'
    const bookingExperience = booking.experience || addOnsSummary || 'Selected Program'
    const bookingDate = booking.date || ''
    const bookingContact = {
      name: booking.contactName || '',
      email: booking.contactEmail || '',
      phone: booking.contactPhone || '',
    }

    return (
      <div className="bg-[#FAFAFA] flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="rounded-[40px] bg-white p-8 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,56,101,0.1)] max-w-xl w-full border border-navy/5 relative overflow-hidden"
        >
          {/* Decorative background flare */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_0_0_10px_rgba(16,185,129,0.1)] relative"
          >
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="scale-125"><CheckIcon /></div>
          </motion.div>

          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-navy tracking-tight leading-tight mb-4">
            Great!<br />We'll get in touch with you.
          </h2>
          <p className="text-navy/70 text-sm sm:text-base leading-relaxed">
            Thank you <span className="font-bold text-navy">{bookingContact.name}</span>! We've reserved your request for <span className="font-bold text-accent">{bookingExperience}</span> at <span className="font-bold text-navy">{bookingLocation}</span>.
          </p>

          <div className="my-10 relative">
            {/* Ticket Cutout Effect */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FAFAFA] rounded-full shadow-[inset_-3px_0_6px_rgba(0,0,0,0.02)] z-10" />
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FAFAFA] rounded-full shadow-[inset_3px_0_6px_rgba(0,0,0,0.02)] z-10" />

            <div className="rounded-3xl bg-[#F8F9FA] p-6 text-left space-y-4 text-xs sm:text-sm border border-dashed border-navy/20 relative z-0">
              <div className="flex justify-between items-start border-b border-navy/5 pb-3">
                <span className="text-navy/50 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Experience & Location</span>
                <span className="font-bold text-navy text-right leading-tight max-w-[60%]">{bookingExperience} <br /><span className="text-navy/60 font-medium text-[11px] sm:text-xs">{bookingLocation}</span></span>
              </div>
              {activeAddOns.length > 0 && booking.experience && (
                <div className="flex justify-between items-start border-b border-navy/5 pb-3">
                  <span className="text-navy/50 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Add Ons</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                    {activeAddOns.map((addOn) => (
                      <span key={addOn} className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold">
                        {addOn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-start border-b border-navy/5 pb-3">
                <span className="text-navy/50 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Date & Group</span>
                <span className="font-bold text-navy text-right leading-tight max-w-[60%]">{formatDateToDDMMYYYY(bookingDate)} <br /><span className="text-navy/60 font-medium text-[11px] sm:text-xs">{bookingParticipants.length} Person{bookingParticipants.length > 1 ? 's' : ''}</span></span>
              </div>

              {!isDirect && (
                <div className="space-y-3 pt-1">
                  <span className="text-navy/50 font-semibold uppercase tracking-wider text-[10px] sm:text-xs block mb-2">Participants & Programs</span>
                  {bookingParticipants.map((p, idx) => {
                    const prog = COURSE_CATALOG.find((pr) => pr.id === p.selectedProgram)
                    const certNames = (p.certifications || [])
                      .map((id) => CERTIFICATION_OPTIONS.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                    const isScuba = normalizeExperienceKey(booking.experience) === 'scuba'
                    const certSummary = isScuba
                      ? (p.hasCertification
                        ? (certNames.length ? certNames.join(', ') : 'Certified Diver')
                        : 'No Prior Certification (Beginner / Pathway)')
                      : `${booking.experience} Program`

                    return (
                      <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-navy/5">
                        <div className="pr-3">
                          <span className="font-bold text-navy text-sm block mb-0.5">{p.name || `Participant ${idx + 1}`}</span>
                          <span className="text-[10px] sm:text-[11px] text-navy/50 leading-tight block">Age: {p.age || 'N/A'} • {certSummary}</span>
                        </div>
                        <span className="font-bold text-accent text-[10px] bg-accent/10 px-2.5 py-1.5 rounded-full text-center shrink-0 max-w-[110px] leading-tight">
                          {getCourseDisplayName(prog?.name || 'Selected Course')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex justify-between items-start border-t border-navy/10 pt-4 mt-2">
                <span className="text-navy/50 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Contact Info</span>
                <span className="font-bold text-navy text-right leading-tight max-w-[60%]">{bookingContact.email} <br /><span className="text-navy/60 font-medium text-[11px] sm:text-xs">{bookingContact.phone || 'N/A'}</span></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              resetFormState()
              setSubmitted(false)
              setSubmittedBooking(null)
              if (lenis) {
                lenis.scrollTo(0, { immediate: true })
              } else if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="relative z-10 rounded-full bg-navy px-8 py-4 sm:py-5 text-sm sm:text-base font-bold text-white transition-all hover:bg-accent hover:text-navy hover:scale-[1.02] active:scale-[0.98] w-full shadow-[0_8px_20px_rgba(0,56,101,0.15)] cursor-pointer"
          >
            Submit Another Booking
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen text-navy font-body overflow-x-clip ${isNightDive ? 'bg-[#003865]' : 'bg-[#FAFAFA]'}`} style={{ textShadow: 'none' }}>
      <SEOHead
        title="Book Scuba Diving Courses & Expeditions Online | The Dive Village"
        description="Book certified scuba diving courses, Discovery dives, snorkeling trips, and freediving packages online with instant confirmation at The Dive Village."
        keywords="book scuba dive online, scuba course reservation, dive charter booking, snorkeling trip reservation, dive village booking"
        canonicalUrl="https://thedivevillage.com/book-us"
      />

      {/* 1. HEADER VIDEO HERO (DYNAMIC COMPILED NIGHT DIVE VIDEO - DESKTOP ONLY) */}
      <section className="hidden sm:flex relative h-[56vh] min-h-[420px] lg:h-[60vh] lg:min-h-[460px] w-full items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)'
          }}
        >
          <LazyVideo
            key={isNightDive ? 'night-compiled' : 'day-turtle'}
            src={isNightDive ? compiledNightDiveVideo : turtleAnnaVideo}
            autoPlay
            loop
            muted
            playsInline
            onPlay={(e) => { e.currentTarget.playbackRate = 0.7 }}
            className="w-full h-full object-cover scale-110 origin-center transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001428]/65 via-[#001428]/25 to-transparent pointer-events-none" />
        </div>

        {/* Bottom Ultra-Smooth Dissolve & Merge Layer */}
        <div
          className={`absolute bottom-0 inset-x-0 h-28 sm:h-36 lg:h-44 pointer-events-none z-[5] transition-colors duration-500 ${isNightDive
            ? 'bg-gradient-to-t from-[#003865] via-[#003865]/85 via-45% to-transparent'
            : 'bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 via-45% to-transparent'
            }`}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pt-4 sm:pt-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-white leading-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            Book Your <span className="text-[#FFCD00]">Dive</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl font-medium text-white/90 max-w-xl leading-relaxed drop-shadow-md text-center"
          >
            Select your location, group size, participant details, and programs. Our dive masters will get back to you.
          </motion.p>
        </div>
      </section>

      {/* 2. MAIN 4-STEP BOOKING WIZARD & 2D DIVE EXPLORER MAP */}
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-8 pt-[74px] sm:pt-6 pb-28 sm:pb-40 w-full min-w-0 relative z-20">
        {/* Responsive Grid Layout (Desktop: Form + Map side-by-side; Mobile: Form on top, Map right below) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">

          {/* Column 1: 4-Step Booking Wizard */}
          <div className="lg:col-span-6 xl:col-span-5 w-full min-w-0">
            <div className="flex flex-col w-full min-w-0">
              <form ref={bookingFormRef} id="booking-wizard-form" onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white p-4 sm:p-6 lg:p-8 xl:p-10 rounded-2xl sm:rounded-[36px] border border-navy/10 shadow-sm sm:shadow-card w-full min-w-0 max-w-full min-h-[auto] lg:min-h-[min(560px,calc(100vh-140px))] justify-between">
                <div className="flex-1 space-y-3.5 sm:space-y-6">

                  {/* Mobile Step Header */}
                  {(() => {
                    const hasActiveAddOns = selectedAddOns.some((item) => item !== 'None')
                    const isDirect = (!experience && hasActiveAddOns) || isDirectActivity(experience)
                    const totalSteps = isDirect ? 2 : 3
                    // Map actual step numbers (1, 2, 4) to clean display positions (1, 2, 3)
                    const displayStep = isDirect
                      ? (currentStep === 4 ? 2 : 1)
                      : (currentStep === 4 ? 3 : currentStep)
                    return (
                      <div className="sm:hidden pb-3.5 mb-1 border-b border-navy/5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-navy text-white text-base font-bold flex items-center justify-center shrink-0 shadow-md">
                              {displayStep}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block leading-tight">
                                STEP {displayStep} OF {totalSteps}
                              </span>
                              <h2 className="text-base font-extrabold text-navy truncate block mt-0.5 leading-tight">
                                {currentStep === 1 && 'Location & Experience'}
                                {currentStep === 2 && 'Participants & Programs'}
                                {currentStep === 4 && 'Contact & Details'}
                              </h2>
                              <p className="text-[11px] font-medium text-navy/60 truncate mt-0.5 leading-tight">
                                {currentStep === 1 && 'Where, what, and when would you like to book?'}
                                {currentStep === 2 && 'Add names, diving levels, and select programs'}
                                {currentStep === 4 && 'Please provide your contact information'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pl-1">
                            {(isDirect ? [1, 4] : [1, 2, 4]).map((s) => (
                              <span
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${currentStep === s
                                  ? 'w-7 bg-navy'
                                  : currentStep > s
                                    ? 'w-2 bg-navy'
                                    : 'w-2 bg-slate-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* STEP 1: Location, Experience & Date */}
                  {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 sm:space-y-6">
                      {/* Desktop Step 1 Header */}
                      <div className="hidden sm:block">
                        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-accent mb-0.5 block">
                          Step 1 of {((!experience && selectedAddOns.some((item) => item !== 'None')) || isDirectActivity(experience)) ? 2 : 3}
                        </span>
                        <h3 className="font-heading text-lg sm:text-3xl font-bold text-navy">Location & Experience</h3>
                        <p className="text-[10px] sm:text-xs text-navy/60 mt-0.5">Where, what, and when would you like to book?</p>
                      </div>

                      {/* 1. SELECT DIVE COUNTRY */}
                      <div>
                        <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                          Select Dive Country
                        </label>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            required
                            className="w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-4 pr-8 sm:pr-10 text-[11px] sm:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition cursor-pointer appearance-none"
                          >
                            <option value="">Select a country</option>
                            {countries.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-navy/60">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 2. SELECT ISLAND / REGION */}
                      <div>
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <label className="block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Select Island / Region
                          </label>
                          {country && availableIslands.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-semibold text-navy/50">
                              {availableIslands.length} {availableIslands.length === 1 ? 'island' : 'islands'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <select
                            value={island}
                            onChange={(e) => handleIslandChange(e.target.value)}
                            disabled={!country}
                            required
                            className={`w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-4 pr-8 sm:pr-10 text-[11px] sm:text-sm font-semibold sm:font-bold outline-none focus:ring-2 focus:ring-accent/50 transition cursor-pointer appearance-none ${!country ? 'opacity-60 cursor-not-allowed text-navy/40' : !island ? 'text-navy/50' : 'text-navy'
                              }`}
                          >
                            <option value="">
                              {!country
                                ? 'Select a country first'
                                : availableIslands.length === 0
                                  ? (allDiveSites.length === 0 ? 'Loading islands...' : 'No specific islands listed')
                                  : 'Select an island / region'}
                            </option>
                            {availableIslands.map((isl) => (
                              <option key={isl.name} value={isl.name}>
                                {isl.name} ({isl.count} {isl.count === 1 ? 'site' : 'sites'})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-navy/60">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 3. SELECT DIVE SITE */}
                      <div>
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <label className="block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Select Dive Site
                          </label>
                          {island && availableSitesForIsland.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-semibold text-navy/50">
                              {availableSitesForIsland.length} {availableSitesForIsland.length === 1 ? 'site' : 'sites'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <select
                            value={location}
                            onChange={(e) => handleSiteChange(e.target.value)}
                            disabled={!country || (!island && availableIslands.length > 0)}
                            required
                            className={`w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-4 pr-8 sm:pr-10 text-[11px] sm:text-sm font-semibold sm:font-bold outline-none focus:ring-2 focus:ring-accent/50 transition cursor-pointer appearance-none ${!country || (!island && availableIslands.length > 0)
                                ? 'opacity-60 cursor-not-allowed text-navy/40'
                                : !location
                                  ? 'text-navy/50'
                                  : 'text-navy'
                              }`}
                          >
                            <option value="">
                              {!country
                                ? 'Select a country first'
                                : !island && availableIslands.length > 0
                                  ? 'Select an island / region first'
                                  : availableSitesForIsland.length === 0
                                    ? 'No dive sites listed for this selection'
                                    : `Select a Dive Site (${availableSitesForIsland.length} available)`}
                            </option>
                            {/* Retain selected site if picked from map or search params */}
                            {location && !availableSitesForIsland.some((s) => s.siteName === location) && (
                              <option value={location}>{location}</option>
                            )}
                            {availableSitesForIsland.map((site) => (
                              <option key={site.id || site.siteName} value={site.siteName}>
                                {site.siteName}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-navy/60">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>

                        {/* Selected site indicator pill */}
                        {location && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-navy">{location}</span>
                            {island && <span className="text-navy/50">in {island}</span>}
                          </div>
                        )}
                      </div>

                      {/* 3. SELECT YOUR EXPERIENCE */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-navy/70 uppercase tracking-wider">
                          Select Your Experience
                        </label>
                        <div className="relative">
                          <select
                            value={experience}
                            onChange={(e) => handleExperienceChange(e.target.value)}
                            className={`w-full rounded-2xl bg-[#F0F2F5] px-5 py-4 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/50 transition cursor-pointer appearance-none ${!experience ? 'text-navy/40' : 'text-navy'
                              }`}
                          >
                            <option value="">
                              Select Your Experience
                            </option>
                            {EXPERIENCE_OPTIONS.map((exp) => (
                              <option key={exp} value={exp}>
                                {exp}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-navy/60">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 4. SELECT YOUR ADD ONS */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider">
                            SELECT YOUR ADD ONS
                          </label>
                          <span className="text-[10px] sm:text-xs text-navy/50 font-medium italic">
                            *Add Ons are subjected to location.
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                          {/* Option for None */}
                          <button
                            type="button"
                            onClick={() => handleToggleAddOn('None')}
                            className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left border cursor-pointer ${selectedAddOns.includes('None')
                                ? 'bg-navy text-white border-navy shadow-md ring-1 ring-navy'
                                : 'bg-[#F0F2F5] text-navy/80 border-transparent hover:bg-[#E5E9EF] hover:text-navy'
                              }`}
                          >
                            <span className="truncate pr-2">None</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[9px] transition-all ${selectedAddOns.includes('None')
                                  ? 'border-white bg-white text-navy font-black scale-105'
                                  : 'border-navy/20 bg-white/60 group-hover:border-navy/40'
                                }`}
                            >
                              {selectedAddOns.includes('None') ? '✓' : ''}
                            </span>
                          </button>

                          {ADD_ON_OPTIONS.map((addOn) => {
                            const isSelected = selectedAddOns.includes(addOn)
                            return (
                              <button
                                key={addOn}
                                type="button"
                                onClick={() => handleToggleAddOn(addOn)}
                                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left border cursor-pointer ${isSelected
                                    ? 'bg-navy text-white border-navy shadow-md ring-1 ring-navy'
                                    : 'bg-[#F0F2F5] text-navy/80 border-transparent hover:bg-[#E5E9EF] hover:text-navy'
                                  }`}
                              >
                                <span className="truncate pr-2">{addOn}</span>
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[9px] transition-all ${isSelected
                                      ? 'border-white bg-white text-navy font-black scale-105'
                                      : 'border-navy/20 bg-white/60 group-hover:border-navy/40'
                                    }`}
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* 5. PREFERRED DATE & NUMBER OF PEOPLE */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="relative">
                          <label className="mb-2 block text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Preferred Date
                          </label>
                          <button
                            type="button"
                            ref={datePickerBtnRef}
                            onClick={() => setIsCalendarOpen((prev) => !prev)}
                            className={`w-full rounded-2xl bg-[#F0F2F5] px-5 py-4 text-sm font-bold text-navy outline-none text-left flex items-center justify-between transition cursor-pointer focus:ring-2 ${dateError ? 'border-2 border-red-500 focus:ring-red-300' : 'focus:ring-accent/50'
                              }`}
                          >
                            <span className={date ? 'text-navy' : 'text-navy/40'}>
                              {date ? formatDateToDDMMYYYY(date) : 'dd-mm-yyyy'}
                            </span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy/60 shrink-0">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </button>

                          <CompactTwoMonthCalendarPopover
                            isOpen={isCalendarOpen}
                            onClose={() => setIsCalendarOpen(false)}
                            selectedDate={date}
                            onSelectDate={(formattedDDMMYYYY, yyyyMmDd) => {
                              setDate(yyyyMmDd)
                              if (yyyyMmDd && (yyyyMmDd < cooldownMinDateStr || yyyyMmDd > maxDateStr)) {
                                setDateError('Please select a date after the 7-day advance booking period.')
                              } else {
                                setDateError('')
                                setStepError('')
                              }
                              setIsCalendarOpen(false)
                            }}
                            minDate={cooldownMinDateStr}
                            maxDate={maxDateStr}
                            toggleBtnRef={datePickerBtnRef}
                          />

                          {dateError && (
                            <p className="mt-1 text-xs font-bold text-red-500 flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                              <span>{dateError}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Number of Persons
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={groupSize}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '')
                              setGroupSize(raw)
                              setStepError('')
                            }}
                            onBlur={() => {
                              const val = parseInt(groupSize, 10)
                              if (isNaN(val) || val < 1) {
                                setGroupSize(1)
                              } else if (val > 20) {
                                setGroupSize(20)
                              } else {
                                setGroupSize(val)
                              }
                            }}
                            placeholder="1"
                            required
                            className="w-full rounded-2xl bg-[#F0F2F5] px-5 py-4 text-sm font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Name, Age & Certification Eligibility for Each Person */}
                  {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 sm:space-y-6">
                      <div className="hidden sm:block">
                        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-accent mb-0.5 block">
                          Step 2 of {((!experience && selectedAddOns.some((item) => item !== 'None')) || isDirectActivity(experience)) ? 2 : 3}
                        </span>
                        <h3 className="font-heading text-lg sm:text-3xl font-bold text-navy">
                          {isCourseService ? 'Participant Details' : 'Participants & Programs'}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-navy/60 mt-0.5">
                          {isCourseService
                            ? `Confirm participant details for ${selectedCourseProgram?.name || serviceItem?.title || experience}.`
                            : `Enter age, prior certification, and choose your preferred course for ${experience}.`}
                        </p>
                      </div>

                      <div ref={participantScrollRef} className="space-y-3 sm:space-y-6 max-h-[500px] sm:max-h-[550px] overflow-y-auto overscroll-y-auto pr-1">
                        {participants.map((p, idx) => {
                          const ageNum = parseInt(p.age, 10)
                          const isAgeValid = !isNaN(ageNum) && ageNum >= 8 && ageNum <= 110
                          const eligibleCourses = isAgeValid ? getEligibleCourses(p.age, p.hasCertification, p.certifications, experience) : []
                          const availableCertOptions = sortCoursesByDifficulty(
                            getAvailableCertificationsForAge(p.age, experience)
                          )
                          const programName = selectedCourseProgram?.name || serviceItem?.title || 'Selected Program'

                          return (
                            <div key={p.id} className="rounded-xl sm:rounded-3xl bg-[#FAFAFA] border border-navy/10 p-3 sm:p-6 space-y-2.5 sm:space-y-5">
                              <div className="flex justify-between items-center border-b border-navy/5 pb-2 sm:pb-3">
                                <span className="font-heading font-bold text-navy text-xs sm:text-lg">
                                  Person {idx + 1} Details
                                </span>
                                <span className="text-[8px] sm:text-[11px] text-navy/50 font-bold uppercase tracking-wider">
                                  Participant #{idx + 1}
                                </span>
                              </div>

                              {/* Name and Age Inputs */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                                <div>
                                  <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70">Full Name</label>
                                  <input
                                    type="text"
                                    placeholder={`Name of Person ${idx + 1}`}
                                    value={p.name}
                                    onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                                    required
                                    className="w-full rounded-lg sm:rounded-2xl bg-white border border-navy/10 px-2.5 py-1.5 sm:px-4 sm:py-3.5 text-[11px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70">Age (Years)</label>
                                  <input
                                    type="number"
                                    min="8"
                                    max="110"
                                    placeholder="e.g. 12"
                                    value={p.age}
                                    onChange={(e) => {
                                      let rawVal = e.target.value
                                      if (rawVal !== '') {
                                        const parsed = parseInt(rawVal, 10)
                                        if (!isNaN(parsed) && parsed > 110) {
                                          rawVal = '110'
                                        }
                                      }
                                      handleParticipantChange(idx, 'age', rawVal)
                                    }}
                                    required
                                    className="w-full rounded-lg sm:rounded-2xl bg-white border border-navy/10 px-2.5 py-1.5 sm:px-4 sm:py-3.5 text-[11px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition"
                                  />
                                </div>
                              </div>

                              {/* Compulsory Circular Parental Consent Checkbox for Age < 12 */}
                              {isAgeValid && ageNum < 12 && (
                                <div
                                  onClick={() => handleParticipantChange(idx, 'parentalConsent', !p.parentalConsent)}
                                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${p.parentalConsent
                                      ? 'bg-amber-500/10 border-amber-500/50 text-navy'
                                      : 'bg-white border-amber-300 hover:border-amber-400'
                                    }`}
                                >
                                  <div
                                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${p.parentalConsent
                                        ? 'bg-navy border-navy text-white shadow-sm'
                                        : 'border-amber-500 bg-white'
                                      }`}
                                  >
                                    {p.parentalConsent && (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-[11px] sm:text-xs font-bold text-navy block leading-snug">
                                      Yes I have proper experience and Parental Consent <span className="text-red-500">*</span>
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] text-navy/60 font-medium block mt-0.5">
                                      Compulsory verification for participants under 12 years of age
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Before age is entered */}
                              {p.age === '' && (
                                <div className="rounded-lg sm:rounded-2xl bg-navy/[0.03] border border-navy/10 p-2.5 sm:p-4 text-[10px] sm:text-xs font-medium text-navy/70 flex items-center gap-2">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-navy/50"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                  <span>{isCourseService ? 'Enter age to continue.' : 'Enter age to see available programs.'}</span>
                                </div>
                              )}

                              {/* Invalid age notice */}
                              {p.age !== '' && !isAgeValid && (
                                <div className="rounded-lg sm:rounded-2xl bg-red-50 border border-red-200 p-2.5 sm:p-4 text-[10px] sm:text-xs font-medium text-red-600 flex items-start gap-2">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-600 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                  <div>
                                    <span className="font-bold block mb-0.5">
                                      {ageNum < 8 ? 'Minimum Age Requirement (8 Years)' : 'Maximum Age Limit (110 Years)'}
                                    </span>
                                    <span>
                                      {ageNum < 8
                                        ? 'The minimum age for participating in activities is 8 years old.'
                                        : 'Please enter a valid age up to 110 years.'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* FOR SERVICE FLOW: Show only the automatically filled Program and no certification questions */}
                              {isCourseService ? (
                                isAgeValid && (
                                  <div className="rounded-xl sm:rounded-2xl bg-white border border-navy/10 p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-navy/50 block">
                                        Program
                                      </span>
                                      <span className="font-heading font-bold text-navy text-xs sm:text-base truncate block mt-0.5">
                                        Program - "{programName}"
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-accent/20 text-navy text-[10px] sm:text-xs font-extrabold shrink-0">
                                      Selected
                                    </span>
                                  </div>
                                )
                              ) : (
                                /* FOR REGULAR BOOK US FLOW: Certification Choice & Levels */
                                isAgeValid && (
                                  <div className="space-y-2.5 pt-1">
                                    {/* Certification Choice only for Scuba Diving */}
                                    {normalizeExperienceKey(experience) === 'scuba' && (
                                      <div>
                                        <label className="mb-1.5 block text-[9px] sm:text-xs font-bold text-navy/80 uppercase tracking-wider">
                                          Do you already have a certification?
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                          <button
                                            type="button"
                                            onClick={() => handleParticipantChange(idx, 'hasCertification', false)}
                                            className={`p-2.5 sm:p-4 rounded-lg sm:rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${!p.hasCertification
                                              ? 'bg-navy text-white border-navy shadow-sm'
                                              : 'bg-white text-navy border-navy/15 hover:border-navy/30'
                                              }`}
                                          >
                                            <div>
                                              <span className="font-bold text-[11px] sm:text-sm block">Without Certificate</span>
                                              <span className={`text-[9px] sm:text-[11px] block mt-0.5 ${!p.hasCertification ? 'text-white/70' : 'text-navy/50'}`}>
                                                Beginner, introductory & pathway options
                                              </span>
                                            </div>
                                            <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 ${!p.hasCertification ? 'border-white bg-white text-navy' : 'border-navy/20'
                                              }`}>
                                              {!p.hasCertification && <span className="text-[8px] sm:text-[10px] font-bold">✓</span>}
                                            </div>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleParticipantChange(idx, 'hasCertification', true)}
                                            className={`p-2.5 sm:p-4 rounded-lg sm:rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${p.hasCertification
                                              ? 'bg-navy text-white border-navy shadow-sm'
                                              : 'bg-white text-navy border-navy/15 hover:border-navy/30'
                                              }`}
                                          >
                                            <div>
                                              <span className="font-bold text-[11px] sm:text-sm block">
                                                With Certificate
                                              </span>
                                              <span className={`text-[9px] sm:text-[11px] block mt-0.5 ${p.hasCertification ? 'text-white/70' : 'text-navy/50'}`}>
                                                {ageNum === 8 ? 'Junior certified diver programs' : 'Choose your current diving certificate'}
                                              </span>
                                            </div>
                                            <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 ${p.hasCertification ? 'border-white bg-white text-navy' : 'border-navy/20'
                                              }`}>
                                              {p.hasCertification && <span className="text-[8px] sm:text-[10px] font-bold">✓</span>}
                                            </div>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* If Certified & Above 8+: Ask which certificate (Only Scuba Diving) */}
                                    {normalizeExperienceKey(experience) === 'scuba' && p.hasCertification && ageNum > 8 && availableCertOptions.length > 0 && (
                                      <div className="space-y-1.5 pt-1">
                                        <label className="block text-[9px] sm:text-xs font-bold text-navy/80 uppercase tracking-wider">
                                          Which certificate do you currently have?
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                          {availableCertOptions.map((opt) => {
                                            const isSelected = (p.certifications || []).includes(opt.id)
                                            return (
                                              <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleSelectCertification(idx, opt.id)}
                                                className={`p-2 sm:p-3 rounded-lg border text-left text-[10px] sm:text-xs font-semibold sm:font-bold transition flex items-center justify-between gap-1.5 ${isSelected
                                                  ? 'bg-navy text-white border-navy shadow-sm'
                                                  : 'bg-white text-navy/80 border-navy/10 hover:border-navy/30 hover:bg-navy/[0.02]'
                                                  }`}
                                              >
                                                <span className="truncate">{getCourseDisplayName(opt.name)}</span>
                                                <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border flex items-center justify-center shrink-0 text-[8px] sm:text-[10px] ${isSelected ? 'bg-white text-navy border-white font-bold' : 'border-navy/20'
                                                  }`}>
                                                  {isSelected ? '✓' : ''}
                                                </span>
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Dynamic Eligibility Badge */}
                                    <div className="rounded-lg sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3.5 text-[10px] sm:text-xs text-emerald-800 font-medium flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                        <span>
                                          {eligibleCourses.length} {normalizeExperienceKey(experience) === 'scuba' ? 'course(s)' : 'program(s)'} available for {experience || 'selected experience'}
                                        </span>
                                      </div>
                                      <span className="font-bold text-[9px] sm:text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15">
                                        {eligibleCourses.length} Available
                                      </span>
                                    </div>

                                    {/* INLINE ELIGIBLE COURSES & PROGRAMS (Integrated directly into Step 2) */}
                                    <div className="pt-2 sm:pt-3 border-t border-navy/10 space-y-2.5">
                                      <div className="flex justify-between items-center">
                                        <label htmlFor={`select-program-${p.id}`} className="text-[9px] sm:text-xs font-bold text-navy/80 uppercase tracking-wider">
                                          Select Course / Program <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[9px] sm:text-[11px] text-navy/50 font-medium">Choose from unlocked courses</span>
                                      </div>

                                      {eligibleCourses.length === 0 ? (
                                        <div className="rounded-lg sm:rounded-2xl bg-navy/[0.04] border border-navy/10 p-3 text-[10px] sm:text-xs font-medium text-navy/80">
                                          No courses available for this combination.
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {/* Dropdown Selector */}
                                          <div className="relative">
                                            <select
                                              id={`select-program-${p.id}`}
                                              value={p.selectedProgram}
                                              onChange={(e) => handleParticipantChange(idx, 'selectedProgram', e.target.value)}
                                              required
                                              aria-label={`Select course for ${p.name || `Person ${idx + 1}`}`}
                                              className="w-full rounded-lg sm:rounded-2xl bg-white border border-navy/15 px-2.5 py-2 sm:px-4 sm:py-3.5 text-[11px] sm:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-navy/20 transition appearance-none shadow-sm cursor-pointer pr-8"
                                            >
                                              <option value="" disabled>Select an eligible course...</option>
                                              {eligibleCourses.map((prog) => (
                                                <option key={prog.id} value={prog.id}>
                                                  {getCourseDisplayName(prog.name)} [{prog.category}] — {prog.certLabel}
                                                </option>
                                              ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-navy/40">
                                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                                            </div>
                                          </div>

                                          {/* Quick-Pick Course Cards */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5 pt-1">
                                            {eligibleCourses.map((prog) => {
                                              const isSelected = p.selectedProgram === prog.id
                                              return (
                                                <div
                                                  key={prog.id}
                                                  onClick={() => handleParticipantChange(idx, 'selectedProgram', prog.id)}
                                                  className={`rounded-lg sm:rounded-2xl p-2.5 sm:p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${isSelected
                                                    ? 'bg-navy text-white border-navy shadow-md ring-1 ring-navy'
                                                    : 'bg-white text-navy border-navy/10 hover:border-navy/30 hover:bg-navy/[0.02]'
                                                    }`}
                                                >
                                                  <div className="flex justify-between items-start gap-1.5">
                                                    <div>
                                                      <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${isSelected ? 'text-cyan-300' : 'text-navy/50'}`}>
                                                        {prog.category}
                                                      </span>
                                                      <h5 className="font-heading font-bold text-[11px] sm:text-sm leading-snug">
                                                        {getCourseDisplayName(prog.name)}
                                                      </h5>
                                                    </div>
                                                    <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border shrink-0 flex items-center justify-center mt-0.5 ${isSelected ? 'border-white bg-white text-navy' : 'border-navy/20 bg-transparent'}`}>
                                                      {isSelected && <span className="text-[8px] sm:text-[9px] font-bold">✓</span>}
                                                    </div>
                                                  </div>

                                                  <div className="flex flex-wrap items-center gap-1 pt-1 text-[8px] sm:text-[9px]">

                                                    <span className={`truncate max-w-[200px] sm:max-w-[260px] ${isSelected ? 'text-white/70' : 'text-navy/50'}`}>
                                                      {prog.certLabel}
                                                    </span>
                                                  </div>
                                                </div>
                                              )
                                            })}
                                          </div>

                                          {/* Fun Dives Package Selector if Fun Dives is picked */}
                                          {['fun-day-dive', 'fun-dawn-dive', 'fun-night-dive'].includes(p.selectedProgram) && (
                                            <div className="mt-2.5 pt-2.5 border-t border-navy/10">
                                              <label className="text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider mb-1.5 block">
                                                Select Number of Dives <span className="text-red-500">*</span>
                                              </label>
                                              <div className="relative">
                                                <select
                                                  value={p.funDivesCount || ''}
                                                  onChange={(e) => handleParticipantChange(idx, 'funDivesCount', e.target.value)}
                                                  required
                                                  className="w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] border border-navy/5 px-2.5 py-2 sm:px-4 sm:py-3.5 text-[11px] sm:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition appearance-none shadow-inner cursor-pointer pr-8"
                                                >
                                                  <option value="" disabled>Choose your dive package...</option>
                                                  {FUN_DIVES_PACKAGES.map((pkg) => (
                                                    <option key={pkg.id} value={pkg.id}>{pkg.title} - {pkg.duration}</option>
                                                  ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-navy/50">
                                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Contact Details & Special Requests */}
                  {currentStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5 sm:space-y-6">
                      <div className="hidden sm:block">
                        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-accent mb-0.5 block">
                          Step {((!experience && selectedAddOns.some((item) => item !== 'None')) || isDirectActivity(experience)) ? 2 : 3} of {((!experience && selectedAddOns.some((item) => item !== 'None')) || isDirectActivity(experience)) ? 2 : 3}
                        </span>
                        <h3 className="font-heading text-lg sm:text-3xl font-bold text-navy">Contact & Booking Details</h3>
                        <p className="text-[10px] sm:text-xs text-navy/60 mt-0.5">Please provide your contact information to finalize the booking request.</p>
                      </div>

                      <div>
                        <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Primary Contact Name</label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={contact.name}
                          onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-4 text-[11px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        <div>
                          <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={contact.email}
                            onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                            required
                            className="w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-4 text-[11px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30"
                          />
                        </div>

                        <div>
                          <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Phone Number</label>
                          <div className="w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition">
                            <PhoneInput
                              flags={flags}
                              defaultCountry="IN"
                              international
                              withCountryCallingCode
                              placeholder="Enter 10-digit phone number"
                              value={contact.phone}
                              onCountryChange={(c) => setPhoneCountry(c || 'IN')}
                              onChange={handlePhoneChange}
                              numberInputProps={{
                                inputMode: 'numeric',
                                autoComplete: 'tel',
                                onKeyDown: handlePhoneKeyDown,
                              }}
                              className="w-full text-[11px] sm:text-sm font-semibold sm:font-bold text-navy outline-none placeholder:text-navy/30"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 sm:mb-2 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Special Requests / Notes</label>
                        <textarea
                          placeholder="Any medical conditions, dietary preferences, gear sizes, or custom requests?"
                          value={contact.requests}
                          onChange={(e) => setContact((prev) => ({ ...prev, requests: e.target.value }))}
                          rows="3"
                          className="w-full rounded-lg sm:rounded-2xl bg-[#F0F2F5] px-3 py-2 sm:px-5 sm:py-4 text-[11px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm font-semibold sm:font-bold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 resize-y"
                        ></textarea>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Inline Step Error Message */}
                {stepError && (
                  <div className="mt-3 p-2.5 sm:p-3.5 rounded-lg sm:rounded-2xl bg-red-50 border border-red-200 text-red-600 text-[11px] sm:text-xs font-bold flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    <span>{stepError}</span>
                  </div>
                )}

                {/* Navigation Controls */}
                <div className="pt-3.5 sm:pt-6 mt-3.5 sm:mt-6 border-t border-navy/5 flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="rounded-full px-3.5 py-2 sm:px-6 sm:py-3.5 text-[11px] sm:text-sm font-bold text-navy hover:bg-[#F0F2F5] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>← Back</span>
                    </button>
                  ) : (initialService ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.history.length > 1) {
                          window.history.back()
                        } else {
                          window.location.href = `/services/${initialService}`
                        }
                      }}
                      className="rounded-full px-3.5 py-2 sm:px-5 sm:py-3 text-[11px] sm:text-xs font-bold text-navy/70 hover:text-navy hover:bg-[#F0F2F5] active:scale-95 transition cursor-pointer flex items-center gap-1.5 border border-navy/15"
                      title="Return to selected service page"
                    >
                      <span>← Back to {selectedCourseProgram?.name || serviceItem?.title || 'Program'}</span>
                    </button>
                  ) : <div />)}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="rounded-full bg-navy hover:!bg-accent hover:!text-navy active:scale-95 px-4 py-2 sm:px-8 sm:py-4 text-xs sm:text-sm font-bold text-white transition-all duration-200 shadow-md ml-auto cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue →</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full bg-accent hover:!bg-navy hover:!text-white px-4 py-2 sm:px-8 sm:py-4 text-xs sm:text-sm font-extrabold text-[#001e3d] transition-all duration-200 shadow-md ml-auto cursor-pointer border border-[#FFCD00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-navy border-t-transparent rounded-full animate-spin inline-block" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <span>Confirm Booking Request</span>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Column 2: Interactive 2D Worldwide Dive Map (Beside Booking Form on Desktop, Directly Below on Mobile) */}
          <div id="dive-explorer-map" data-lenis-prevent="true" className="lg:col-span-6 xl:col-span-7 w-full min-w-0 lg:sticky lg:top-28 self-start mt-6 sm:mt-10 lg:mt-0">
            <DiveExplorerMap
              onSelectSite={handleMapSelectSite}
              onBookSite={handleMapSelectSite}
              onSelectCountry={handleMapSelectCountry}
              selectedCountry={country}
              selectedIsland={island}
              selectedSite={location}
              selectedSiteId={locationId}
              title="Dive Explorer"
              subtitle="Explore 3,500+ worldwide dive sites on this interactive 2D map. Click any site to auto-fill your booking location!"
              showHeading={true}
            />
          </div>
        </div>

        {/* 5. ORDER SUMMARY & CONFIRMATION POPUP MODAL */}
        <AnimatePresence>
          {showSummaryModal && (
            <div
              data-lenis-prevent="true"
              className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-hidden"
              style={{ top: 'var(--toolbar-bottom, 64px)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                  setShowSummaryModal(false)
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] flex flex-col shadow-2xl border border-navy/15 overflow-hidden text-navy"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-navy/10 flex items-center justify-between bg-gradient-to-r from-navy to-[#003865] text-white shrink-0">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FFCD00] block mb-0.5">
                      Order Summary & Confirmation
                    </span>
                    <h3 className="font-heading text-base sm:text-xl font-bold">
                      Review Your Booking Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSummaryModal(false)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-90 cursor-pointer text-sm font-bold"
                    aria-label="Close summary modal"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div
                  data-lenis-prevent="true"
                  className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 text-xs sm:text-sm overscroll-contain flex-1"
                >

                  {/* 1. Trip & Location Details */}
                  <div className="rounded-2xl bg-[#FAFAFA] border border-navy/10 p-4 space-y-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy/50 block">
                      1. Destination & Schedule
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-navy">
                      <div>
                        <span className="text-navy/60 block text-[11px]">Country & Island:</span>
                        <strong className="font-bold">{country} {island ? `• ${island}` : ''}</strong>
                      </div>
                      <div>
                        <span className="text-navy/60 block text-[11px]">Dive Site / Location:</span>
                        <strong className="font-bold">{location || 'To Be Arranged'}</strong>
                      </div>
                      <div>
                        <span className="text-navy/60 block text-[11px]">Date:</span>
                        <strong className="font-bold">{formatDateToDDMMYYYY(date)}</strong>
                      </div>
                      <div>
                        <span className="text-navy/60 block text-[11px]">Total Group Size:</span>
                        <strong className="font-bold">{participants.length} Person{participants.length > 1 ? 's' : ''}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2. Experience & Add-Ons */}
                  <div className="rounded-2xl bg-[#FAFAFA] border border-navy/10 p-4 space-y-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy/50 block">
                      2. Experience & Add-Ons
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-navy">
                      <div>
                        <span className="text-navy/60 block text-[11px]">Primary Experience:</span>
                        <strong className="font-bold">{experience || 'Direct Add-On / Custom'}</strong>
                      </div>
                      <div>
                        <span className="text-navy/60 block text-[11px]">Selected Add-Ons:</span>
                        <strong className="font-bold">
                          {selectedAddOns.filter(a => a !== 'None').length > 0
                            ? selectedAddOns.filter(a => a !== 'None').join(', ')
                            : 'None'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 3. Participants & Program Breakdown */}
                  <div className="rounded-2xl bg-[#FAFAFA] border border-navy/10 p-4 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy/50 block">
                      3. Participants & Courses
                    </span>
                    <div className="space-y-2">
                      {participants.map((p, idx) => {
                        const progName = COURSE_CATALOG.find(c => c.id === p.selectedProgram)?.name || p.selectedProgram || 'Standard Activity'
                        const isUnder12 = parseInt(p.age, 10) < 12
                        return (
                          <div key={p.id} className="p-3 bg-white rounded-xl border border-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-navy">
                                {idx + 1}. {p.name || `Participant ${idx + 1}`}
                              </span>
                              <span className="text-navy/60 ml-2 font-medium">
                                (Age: {p.age})
                              </span>
                              {isUnder12 && p.parentalConsent && (
                                <span className="block text-[10px] text-amber-700 font-semibold mt-0.5">
                                  ✓ Parental Consent Confirmed
                                </span>
                              )}
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="px-2.5 py-1 rounded-full bg-navy/5 text-navy font-bold text-[11px] inline-block">
                                {progName}
                              </span>
                              {p.funDivesCount && (
                                <span className="block text-[10px] text-navy/60 font-semibold mt-0.5">
                                  Package: {FUN_DIVES_PACKAGES.find(f => f.id === p.funDivesCount)?.title || p.funDivesCount}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 4. Contact Details & Notes */}
                  <div className="rounded-2xl bg-[#FAFAFA] border border-navy/10 p-4 space-y-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy/50 block">
                      4. Contact Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-navy">
                      <div>
                        <span className="text-navy/60 block text-[11px]">Primary Contact:</span>
                        <strong className="font-bold">{contact.name}</strong>
                      </div>
                      <div>
                        <span className="text-navy/60 block text-[11px]">Email Address:</span>
                        <strong className="font-bold">{contact.email}</strong>
                      </div>
                      <div>
                        <span className="text-navy/60 block text-[11px]">Phone Number:</span>
                        <strong className="font-bold">{contact.phone || 'Not provided'}</strong>
                      </div>
                      {contact.requests && (
                        <div className="sm:col-span-2 mt-1">
                          <span className="text-navy/60 block text-[11px]">Special Notes & Requests:</span>
                          <p className="font-medium text-navy/80 whitespace-pre-line bg-white p-2.5 rounded-lg border border-navy/10 mt-1">
                            {contact.requests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Modal Footer Controls */}
                <div className="p-3 sm:p-4 border-t border-navy/10 bg-[#FAFAFA] flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSummaryModal(false)}
                    className="rounded-full px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-navy hover:bg-navy/10 active:scale-95 transition cursor-pointer"
                  >
                    ← Edit Booking
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="rounded-full bg-accent hover:!bg-navy hover:!text-white active:scale-95 px-5 py-2 sm:px-7 sm:py-2.5 text-xs sm:text-sm font-extrabold text-[#001e3d] transition-all duration-200 shadow-md cursor-pointer border border-[#FFCD00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin inline-block" />
                        <span>Submitting Booking...</span>
                      </>
                    ) : (
                      <span>Confirm & Submit Booking ✓</span>
                    )}
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
