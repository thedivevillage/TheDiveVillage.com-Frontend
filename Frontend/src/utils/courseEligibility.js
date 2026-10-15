/**
 * TDV Course & Certification Eligibility Engine
 * Updated to precise custom age & certification rules requested by user.
 */

// Main Course-Based Experience Options
export const EXPERIENCE_OPTIONS = [
  'Scuba Diving',
  'FreeDiving',
  'Snorkeling',
  'Surfing',
]

// Add-On Options (Direct activities)
export const ADD_ON_OPTIONS = [
  'Canyoneering',
  'Safari',
  'Trekking',
  'Surfing',
  'Local Sightseeing',
  'Snorkeling',
  'Camping / Camper',
  'Liveaboard',
]

// Direct activities that skip participant cert & course eligibility stages
export const DIRECT_ACTIVITIES = [
  'Canyoneering',
  'Safari',
  'Trekking',
  'Local Sightseeing',
  'Camping / Camper',
  'Liveaboard',
]

export function isDirectActivity(experience) {
  if (!experience) return false
  const clean = experience.trim().toLowerCase()
  return DIRECT_ACTIVITIES.some((d) => d.toLowerCase() === clean)
}

export function getCourseDisplayName(courseOrName) {
  if (!courseOrName) return ''
  const name = typeof courseOrName === 'string' ? courseOrName : (courseOrName.name || '')
  return name.trim()
}

/**
 * Selectable certificate choices for age > 8 (with certificate)
 */
export const SCUBA_CERTIFICATES = [
  { id: 'scuba-diver', name: 'Scuba Diver' },
  { id: 'skin-diver', name: 'Skin Diver' },
  { id: 'open-water-diver', name: 'Open Water Diver' },
  { id: 'advanced-open-water-diver', name: 'Advanced Open Water Diver' },
  { id: 'adventure-diver', name: 'Adventure Diver' },
  { id: 'rescue-diver', name: 'Rescue Diver' },
  { id: 'efr', name: 'Emergency First Response (EFR)' },
  { id: 'dive-master', name: 'Dive Master' },
]

export const CERTIFICATION_OPTIONS = SCUBA_CERTIFICATES

/**
 * Specialty courses unlocked for divers holding Open Water, Advanced Open Water, Rescue, EFR, or Dive Master certifications:
 * - Peak Performance Buoyancy
 * - Deep Diver
 * - Wreck Diver
 * - Night Diver
 * - Enriched Air Nitrox
 * - Project AWARE
 * - Drift Diver
 */
export const SPECIALTY_COURSE_IDS = [
  'peak-buoyancy',
  'deep-diver',
  'wreck-diver',
  'night-diver',
  'enriched-air-nitrox',
  'project-aware',
  'drift-diver',
]

/**
 * Comprehensive Course Catalog with user-specified titles and metadata
 */
export const COURSE_CATALOG = [
  // Core Beginner & Introductory
  {
    id: 'try-dive',
    name: 'Try Dive',
    category: 'Introductory Programs',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'dsd-lite',
    name: 'Discover Scuba Dive Lite',
    category: 'Introductory Programs',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'dsd',
    name: 'Discover Scuba Dive',
    category: 'Introductory Programs',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'dsd-ow-combo',
    name: 'Discover Scuba Dive + Open Water Dive',
    category: 'Bundled Pathways',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'zero-to-hero',
    name: 'Zero to Hero',
    category: 'Professional Track',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'open-water',
    name: 'Open Water Dive',
    category: 'Certification Courses',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'scuba-diver',
    name: 'Scuba Dive',
    category: 'Certification Courses',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'Junior / Certified Diver',
    experience: 'Scuba Diving',
  },

  // Certified Courses
  {
    id: 'skin-diver',
    name: 'Skin Dive',
    category: 'Snorkeling',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'ow-aow-combo',
    name: 'Open Water + Advanced Open Water',
    category: 'Bundled Pathways',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Scuba Diver certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'reactivate',
    name: 'Reactivate (with dive)',
    category: 'Refreshers',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Prior certification required',
    experience: 'Scuba Diving',
  },
  {
    id: 'advanced-ow',
    name: 'Advanced Open Water',
    category: 'Continuing Education',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Open Water Diver certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'adventure-diver',
    name: 'Adventure Dive',
    category: 'Continuing Education',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Advanced Open Water certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'rescue-diver',
    name: 'Rescue Diver',
    category: 'Continuing Education',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Adventure Diver / AOW certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'efr-rescue-combo',
    name: 'Emergency First Response + Rescue Diver',
    category: 'Bundled Pathways',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Adventure Diver certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'efr-rescue-dm-prereqs',
    name: 'Emergency First Response + Rescue Diver + Dive Master (Prerequisites)',
    category: 'Professional Track',
    minimumAge: 18,
    maxAge: null,
    certLabel: 'Adventure Diver certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'efr-rescue-dm-combo',
    name: 'Emergency First Response + Rescue Diver + Dive Master',
    category: 'Professional Track',
    minimumAge: 18,
    maxAge: null,
    certLabel: 'Adventure Diver certification',
    experience: 'Scuba Diving',
  },
  {
    id: 'efr-primary-secondary',
    name: 'Emergency First Response Primary & Secondary Care',
    category: 'First Aid & CPR',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Rescue Diver track',
    experience: 'Scuba Diving',
  },
  {
    id: 'lite-refresher',
    name: 'Lite Refresher (confined only)',
    category: 'Refreshers',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Rescue Diver track',
    experience: 'Scuba Diving',
  },
  {
    id: 'full-refresher',
    name: 'Full Refresher (with Dive)',
    category: 'Refreshers',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Rescue Diver track',
    experience: 'Scuba Diving',
  },
  {
    id: 'divemaster',
    name: 'Dive Master',
    category: 'Professional Track',
    minimumAge: 18,
    maxAge: null,
    certLabel: 'Rescue Diver certification',
    experience: 'Scuba Diving',
  },

  // Dive Master Specialty Track
  {
    id: 'peak-buoyancy',
    name: 'Peak Performance Buoyancy',
    category: 'Specialties',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    category: 'Specialties',
    minimumAge: 15,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'wreck-diver',
    name: 'Wreck Diver',
    category: 'Specialties',
    minimumAge: 15,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'night-diver',
    name: 'Night Diver',
    category: 'Specialties',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'enriched-air-nitrox',
    name: 'Enriched Air Nitrox',
    category: 'Specialties',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'project-aware',
    name: 'Project AWARE',
    category: 'Conservation',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver / Conservation track',
    experience: 'Scuba Diving',
  },
  {
    id: 'drift-diver',
    name: 'Drift Diver',
    category: 'Specialties',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },

  // Fun Dives Packages
  {
    id: 'fun-dives',
    name: 'Fun Dives',
    category: 'Fun Dives',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Open Water to Dive Master',
    experience: 'Scuba Diving',
  },
  {
    id: 'fun-day-dive',
    name: 'Day Fun Dives',
    category: 'Fun Dives',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'fun-dawn-dive',
    name: 'Dawn Fun Dives',
    category: 'Fun Dives',
    minimumAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },
  {
    id: 'fun-night-dive',
    name: 'Night Fun Dives',
    category: 'Fun Dives',
    minimumAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
  },

  // Snorkeling
  {
    id: 'discover-snorkeling',
    name: 'Discover Snorkeling',
    category: 'Snorkeling',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Snorkeling',
  },
  {
    id: 'reef-explorer',
    name: 'Reef Explorer',
    category: 'Snorkeling',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Snorkeling',
  },
  {
    id: 'ocean-explorer',
    name: 'Ocean Explorer',
    category: 'Snorkeling',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Snorkeling',
  },

  // Freediving & Surfing
  {
    id: 'basic-freediver',
    name: 'Basic Freediver',
    category: 'Freediving',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'FreeDiving',
  },
  {
    id: 'freediver',
    name: 'Freediver',
    category: 'Freediving',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'Freediving program',
    experience: 'FreeDiving',
  },
  {
    id: 'discover-surfing',
    name: 'Discover Surfing',
    category: 'Surfing',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Surfing',
  },
  {
    id: '3-day-surf-academy',
    name: '3 Day Surf Academy Course',
    category: 'Surfing',
    minimumAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Surfing',
  },
]

export function normalizeExperienceKey(exp) {
  if (!exp) return 'scuba'
  const clean = String(exp).toLowerCase().replace(/[\s_-]+/g, '')
  if (clean.includes('scuba')) return 'scuba'
  if (clean.includes('snorkel')) return 'snorkeling'
  if (clean.includes('freediv')) return 'freediving'
  if (clean.includes('surf')) return 'surfing'
  return clean
}

/**
 * Returns available certification options for participant based on age and experience.
 * Rule:
 * - If exact age 8: No certificate prompt needed (treated under exact 8 with cert or without cert).
 * - If age > 8: Returns the 7 certificates: Scuba Diver, Skin Diver, Open Water Diver, Advanced Open Water Diver, Adventure Diver, Rescue Diver, Dive Master.
 */
export function getAvailableCertificationsForAge(age, experience = 'Scuba Diving') {
  const numericAge = parseInt(age, 10)
  if (isNaN(numericAge) || numericAge < 8 || numericAge > 110) return []

  const normExp = normalizeExperienceKey(experience)
  // Only Scuba Diving asks for certifications
  if (normExp !== 'scuba') return []

  // If exact age 8, they don't choose from the 7 adult certs
  if (numericAge === 8) {
    return []
  }

  // If age > 8 (above 8+): Show the 7 certificates
  return SCUBA_CERTIFICATES
}

/**
 * Master Course Eligibility Function based on user's exact specification:
 *
 * 1. User is 8 and above (without certificate):
 *    - Try Dive
 *    - Discover Scuba Dive Lite
 *    - Discover Scuba Dive
 *    - Discover Scuba Dive + Open Water Dive
 *    - Zero to Hero
 *    - Open Water Dive
 *
 * 2. User is exact 8 (with certificate):
 *    - Try Dive
 *    - Discover Scuba Dive Lite
 *    - Discover Scuba Dive
 *    - Zero to Hero
 *    - Open Water Dive
 *    - Scuba Dive
 *
 * 3. User is above 8+ (with certificate): ask which certificate:
 *    - Scuba Diver: Zero to Hero, Skin Dive, Open Water Dive, Open Water + Advanced Open Water, Reactivate (with dive)
 *    - Skin Diver: Reactivate (with dive), Open Water Dive
 *    - Open Water Diver: Advanced Open Water + all specialties (Peak Performance Buoyancy, Deep Diver, Wreck Diver, Night Diver, Enriched Air Nitrox, Project AWARE, Drift Diver)
 *    - Advanced Open Water Diver: Adventure Dive + all specialties
 *    - Adventure Diver: Rescue Diver, Emergency First Response + Rescue Diver, Emergency First Response + Rescue Diver+ Dive Master(Prerequisites), Emergency First Response + Rescue Diver+ Dive Master
 *    - Rescue Diver: Emergency First Response Primary & Secondary Care, Lite Refresher (confined only), Full Refresher (with Dive), Dive Master + all specialties
 *    - Emergency First Response (EFR): all specialties
 *    - Dive Master: all specialties
 */
export function getEligibleCourses(age, hasCert = false, userCerts = [], experience = 'Scuba Diving', catalog = COURSE_CATALOG) {
  const numericAge = parseInt(age, 10)
  if (isNaN(numericAge) || numericAge < 8 || numericAge > 110) {
    return []
  }

  if (isDirectActivity(experience)) {
    return []
  }

  const normExp = normalizeExperienceKey(experience)

  // Handle Freediving: Two programs - Basic Freediver and Freediver (no certificate asked)
  if (normExp === 'freediving') {
    return catalog.filter((c) => c.experience === 'FreeDiving')
  }

  // Handle Snorkeling: Three programs - Discover Snorkeling, Reef Explorer and Ocean Explorer
  if (normExp === 'snorkeling') {
    return catalog.filter((c) => c.experience === 'Snorkeling')
  }

  // Handle Surfing: Two programs - Discover Surfing and 3 Day Surf Academy Course
  if (normExp === 'surfing') {
    return catalog.filter((c) => c.experience === 'Surfing')
  }

  // --- SCUBA DIVING RULES ---
  const certList = Array.isArray(userCerts) ? userCerts : (userCerts ? [userCerts] : [])

  // Case 1: Without Certificate (Age 8 and above)
  if (!hasCert) {
    const targetIds = [
      'try-dive',
      'dsd-lite',
      'dsd',
      'dsd-ow-combo',
      'zero-to-hero',
      'open-water',
    ]
    return targetIds
      .map((id) => catalog.find((c) => c.id === id))
      .filter(Boolean)
  }

  // Case 2: Exact 8 with certificate (Try Dive, DSD Lite, and DSD removed)
  if (numericAge === 8) {
    const targetIds = [
      'zero-to-hero',
      'open-water',
      'scuba-diver',
    ]
    return targetIds
      .map((id) => catalog.find((c) => c.id === id))
      .filter(Boolean)
  }

  // Case 3: Above 8+ with certificate (based on selected certificate)
  const allTargetIds = []

  for (const cert of (certList.length > 0 ? certList : [''])) {
    const normCert = String(cert).toLowerCase().replace(/[\s_-]+/g, '')
    if (!normCert) continue

    if (normCert.includes('scubadiver')) {
      // Scuba Diver: Zero to Hero, Skin Dive, Open Water Dive, Open Water + Advanced Open Water, Reactivate (with dive)
      allTargetIds.push(
        'zero-to-hero',
        'skin-diver',
        'open-water',
        'ow-aow-combo',
        'reactivate'
      )
    } else if (normCert.includes('skindiver')) {
      // Skin Diver: Reactivate (with dive), Open Water Dive
      allTargetIds.push(
        'reactivate',
        'open-water'
      )
    } else if (normCert.includes('openwater') && !normCert.includes('advanced')) {
      // Open Water Diver: Fun Dives, Advanced Open Water + all specialties
      allTargetIds.push(
        'fun-dives',
        'advanced-ow',
        ...SPECIALTY_COURSE_IDS
      )
    } else if (normCert.includes('advancedopenwater') || normCert.includes('aow')) {
      // Advanced Open Water Diver: Fun Dives, Adventure Dive + all specialties
      allTargetIds.push(
        'fun-dives',
        'adventure-diver',
        ...SPECIALTY_COURSE_IDS
      )
    } else if (normCert.includes('adventurediver')) {
      // Adventure Diver: Fun Dives, Rescue Diver, Emergency First Response + Rescue Diver, Emergency First Response + Rescue Diver+ Dive Master(Prerequisites), Emergency First Response + Rescue Diver+ Dive Master
      allTargetIds.push(
        'fun-dives',
        'rescue-diver',
        'efr-rescue-combo',
        'efr-rescue-dm-prereqs',
        'efr-rescue-dm-combo'
      )
    } else if (normCert.includes('rescue')) {
      // Rescue Diver: Fun Dives, Emergency First Response Primary & Secondary Care, Lite Refresher (confined only), Full Refresher (with Dive), Dive Master + all specialties
      allTargetIds.push(
        'fun-dives',
        'efr-primary-secondary',
        'lite-refresher',
        'full-refresher',
        'divemaster',
        ...SPECIALTY_COURSE_IDS
      )
    } else if (normCert.includes('efr') || normCert.includes('emergencyfirstresponse')) {
      // Emergency First Response (EFR): Fun Dives + all specialties
      allTargetIds.push(
        'fun-dives',
        ...SPECIALTY_COURSE_IDS
      )
    } else if (normCert.includes('divemaster')) {
      // Dive Master: Fun Dives + all specialties
      allTargetIds.push(
        'fun-dives',
        ...SPECIALTY_COURSE_IDS
      )
    }
  }

  // Deduplicate while preserving insertion order
  const targetIds = Array.from(new Set(allTargetIds))

  return targetIds
    .map((id) => catalog.find((c) => c.id === id))
    .filter(Boolean)
}

export function getRecommendedCourses(age, hasCert = false, userCerts = [], experience = 'Scuba Diving', catalog = COURSE_CATALOG) {
  return getEligibleCourses(age, hasCert, userCerts, experience, catalog)
}

export function sortCoursesByDifficulty(items) {
  if (!Array.isArray(items)) return []
  return [...items]
}

/**
 * Validate participant booking object for integrity before submission.
 */
export function validateParticipantBooking(participant, experience = 'Scuba Diving', catalog = COURSE_CATALOG) {
  if (!participant) return { valid: false, error: 'Participant data missing.' }

  if (isDirectActivity(experience)) {
    return { valid: true }
  }

  const age = parseInt(participant.age, 10)
  if (isNaN(age) || age < 8 || age > 110) {
    return { valid: false, error: `Invalid age for ${participant.name || 'participant'}. Age must be between 8 and 110 years.` }
  }

  if (normalizeExperienceKey(experience) === 'scuba' && participant.hasCertification && age > 8) {
    const certs = participant.certifications || []
    if (certs.length === 0) {
      return { valid: false, error: `Please choose a certificate for ${participant.name || 'participant'}.` }
    }
  }

  if (!participant.selectedProgram) {
    return { valid: false, error: `Please select a program for ${participant.name || 'participant'}.` }
  }

  const course = catalog.find((c) => c.id === participant.selectedProgram)
  if (!course) {
    return { valid: false, error: `Selected course (${participant.selectedProgram}) does not exist.` }
  }

  return { valid: true }
}

export function isFunDivesProgram(courseId) {
  if (!courseId) return false
  return ['fun-dives', 'fun-day-dive', 'fun-dawn-dive', 'fun-night-dive'].includes(courseId)
}

export default {
  EXPERIENCE_OPTIONS,
  ADD_ON_OPTIONS,
  DIRECT_ACTIVITIES,
  isDirectActivity,
  getCourseDisplayName,
  SCUBA_CERTIFICATES,
  CERTIFICATION_OPTIONS,
  SPECIALTY_COURSE_IDS,
  COURSE_CATALOG,
  getAvailableCertificationsForAge,
  getEligibleCourses,
  getRecommendedCourses,
  sortCoursesByDifficulty,
  validateParticipantBooking,
  normalizeExperienceKey,
  isFunDivesProgram,
}
