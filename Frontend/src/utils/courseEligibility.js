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
 * Comprehensive Course Catalog with user-specified titles, durations, and metadata
 */
export const COURSE_CATALOG = [
  // Core Beginner & Introductory
  {
    id: 'try-dive',
    name: 'Try Dive',
    category: 'Introductory Programs',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'dsd-lite',
    name: 'Discover Scuba Dive Lite',
    category: 'Introductory Programs',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'dsd',
    name: 'Discover Scuba Dive',
    category: 'Introductory Programs',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'dsd-ow-combo',
    name: 'DSD + Open Water',
    category: 'Bundled Pathways',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
    duration: '3–4 Days',
    durationDays: '3–4 Days',
    minDays: 3,
    maxDays: 4,
  },
  {
    id: 'zero-to-hero',
    name: 'Zero to Hero (Open Water to Divemaster)',
    category: 'Professional Track',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
    duration: '90–120 Days',
    durationDays: '90–120 Days',
    minDays: 90,
    maxDays: 120,
  },
  {
    id: 'open-water',
    name: 'Open Water Diver',
    category: 'Certification Courses',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Scuba Diving',
    duration: '3–4 Days',
    durationDays: '3–4 Days',
    minDays: 3,
    maxDays: 4,
  },
  {
    id: 'scuba-diver',
    name: 'Scuba Diver',
    category: 'Certification Courses',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'Junior / Certified Diver',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },

  // Certified Courses
  {
    id: 'skin-diver',
    name: 'Skin Diver',
    category: 'Snorkeling',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'ow-aow-combo',
    name: 'Open Water + Advanced',
    category: 'Bundled Pathways',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Scuba Diver certification',
    experience: 'Scuba Diving',
    duration: '5–7 Days',
    durationDays: '5–7 Days',
    minDays: 5,
    maxDays: 7,
  },
  {
    id: 'reactivate',
    name: 'Reactivate (with dive)',
    category: 'Refreshers',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Prior certification required',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'advanced-ow',
    name: 'Advanced Open Water',
    category: 'Continuing Education',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Open Water Diver certification',
    experience: 'Scuba Diving',
    duration: '2–3 Days',
    durationDays: '2–3 Days',
    minDays: 2,
    maxDays: 3,
  },
  {
    id: 'adventure-diver',
    name: 'Adventure Diver',
    category: 'Continuing Education',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Advanced Open Water certification',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'rescue-diver',
    name: 'Rescue Diver',
    category: 'Continuing Education',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Adventure Diver / AOW certification',
    experience: 'Scuba Diving',
    duration: '3–4 Days',
    durationDays: '3–4 Days',
    minDays: 3,
    maxDays: 4,
  },
  {
    id: 'efr-rescue-combo',
    name: 'EFR + Rescue Diver',
    category: 'Bundled Pathways',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Adventure Diver certification',
    experience: 'Scuba Diving',
    duration: '4–6 Days',
    durationDays: '4–6 Days',
    minDays: 4,
    maxDays: 6,
  },
  {
    id: 'efr-rescue-dm-prereqs',
    name: 'EFR + Rescue + Divemaster (Prerequisites)',
    category: 'Professional Track',
    minimumAge: 18,
    minAge: 18,
    maxAge: null,
    certLabel: 'Adventure Diver certification',
    experience: 'Scuba Diving',
    duration: '24–31 Days',
    durationDays: '24–31 Days',
    minDays: 24,
    maxDays: 31,
  },
  {
    id: 'efr-rescue-dm-combo',
    name: 'EFR + Rescue + Divemaster',
    category: 'Professional Track',
    minimumAge: 18,
    minAge: 18,
    maxAge: null,
    certLabel: 'Adventure Diver certification',
    experience: 'Scuba Diving',
    duration: '24–31 Days',
    durationDays: '24–31 Days',
    minDays: 24,
    maxDays: 31,
  },
  {
    id: 'efr-primary-secondary',
    name: 'EFR Primary & Secondary Care',
    category: 'First Aid & CPR',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Rescue Diver track',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'lite-refresher',
    name: 'Lite Refresher (confined only)',
    category: 'Refreshers',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Rescue Diver track',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'full-refresher',
    name: 'Full Refresher (with dive)',
    category: 'Refreshers',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Rescue Diver track',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'divemaster',
    name: 'Divemaster',
    category: 'Professional Track',
    minimumAge: 18,
    minAge: 18,
    maxAge: null,
    certLabel: 'Rescue Diver certification',
    experience: 'Scuba Diving',
    duration: '20–25 Days',
    durationDays: '20–25 Days',
    minDays: 20,
    maxDays: 25,
  },

  // Dive Master Specialty Track
  {
    id: 'peak-buoyancy',
    name: 'Peak Performance Buoyancy',
    category: 'Specialties',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    category: 'Specialties',
    minimumAge: 15,
    minAge: 15,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '2 Days',
    durationDays: '2 Days',
    minDays: 2,
    maxDays: 2,
  },
  {
    id: 'wreck-diver',
    name: 'Wreck Diver',
    category: 'Specialties',
    minimumAge: 15,
    minAge: 15,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'night-diver',
    name: 'Night Diver',
    category: 'Specialties',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '2 Days',
    durationDays: '2 Days',
    minDays: 2,
    maxDays: 2,
  },
  {
    id: 'enriched-air-nitrox',
    name: 'Enriched Air Nitrox',
    category: 'Specialties',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'project-aware',
    name: 'Project AWARE',
    category: 'Conservation',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver / Conservation track',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'drift-diver',
    name: 'Drift Diver',
    category: 'Specialties',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },

  // Fun Dives Packages
  {
    id: 'fun-dives',
    name: 'Fun Dives',
    category: 'Fun Dives',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Open Water to Dive Master',
    experience: 'Scuba Diving',
    duration: '1–3 Days',
    durationDays: '1–3 Days',
    minDays: 1,
    maxDays: 3,
  },
  {
    id: 'fun-day-dive',
    name: 'Day Fun Dives',
    category: 'Fun Dives',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'fun-dawn-dive',
    name: 'Dawn Fun Dives',
    category: 'Fun Dives',
    minimumAge: 10,
    minAge: 10,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'fun-night-dive',
    name: 'Night Fun Dives',
    category: 'Fun Dives',
    minimumAge: 12,
    minAge: 12,
    maxAge: null,
    certLabel: 'Certified Diver',
    experience: 'Scuba Diving',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },

  // Snorkeling
  {
    id: 'discover-snorkeling',
    name: 'Discover Snorkeling',
    category: 'Snorkeling',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Snorkeling',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'reef-explorer',
    name: 'Reef Explorer',
    category: 'Snorkeling',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Snorkeling',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: 'ocean-explorer',
    name: 'Ocean Explorer',
    category: 'Snorkeling',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Snorkeling',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },

  // Freediving & Surfing
  {
    id: 'basic-freediver',
    name: 'Basic Freediver',
    category: 'Freediving',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'FreeDiving',
    duration: '1–2 Days',
    durationDays: '1–2 Days',
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'freediver',
    name: 'Freediver',
    category: 'Freediving',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'Freediving program',
    experience: 'FreeDiving',
    duration: '2–3 Days',
    durationDays: '2–3 Days',
    minDays: 2,
    maxDays: 3,
  },
  {
    id: 'discover-surfing',
    name: 'Discover Surfing',
    category: 'Surfing',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Surfing',
    duration: '1 Day',
    durationDays: '1 Day',
    minDays: 1,
    maxDays: 1,
  },
  {
    id: '3-day-surf-academy',
    name: '3 Day Surf Academy Course',
    category: 'Surfing',
    minimumAge: 8,
    minAge: 8,
    maxAge: null,
    certLabel: 'No prior certification required',
    experience: 'Surfing',
    duration: '3 Days',
    durationDays: '3 Days',
    minDays: 3,
    maxDays: 3,
  },
]

/**
 * Standard duration mapping for each program (minDays, maxDays, durationLabel)
 */
export const PROGRAM_DURATION_MAP = {
  // 1 Skin Diver 1–2
  'skin-diver': { title: 'Skin Diver', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 2 Scuba Diver 1–2
  'scuba-diver': { title: 'Scuba Diver', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 3 Open Water Diver 3–4
  'open-water': { title: 'Open Water Diver', minDays: 3, maxDays: 4, durationLabel: '3–4 Days' },
  // 4 Adventure Diver 1–2
  'adventure-diver': { title: 'Adventure Diver', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 5 Advanced Open Water 2–3
  'advanced-ow': { title: 'Advanced Open Water', minDays: 2, maxDays: 3, durationLabel: '2–3 Days' },
  // 6 EFR Primary & Secondary Care 1–2
  'efr-primary-secondary': { title: 'EFR Primary & Secondary Care', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 7 Rescue Diver 3–4
  'rescue-diver': { title: 'Rescue Diver', minDays: 3, maxDays: 4, durationLabel: '3–4 Days' },
  // 8 Reactivate (with dive) 1
  'reactivate': { title: 'Reactivate (with dive)', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  // 9 Full Refresher (with dive) 1
  'full-refresher': { title: 'Full Refresher (with dive)', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  // 10 Lite Refresher (confined only) 1
  'lite-refresher': { title: 'Lite Refresher (confined only)', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  // 11 Peak Performance Buoyancy 1–2
  'peak-buoyancy': { title: 'Peak Performance Buoyancy', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 12 Project AWARE 1–2
  'project-aware': { title: 'Project AWARE', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 13 Deep Diver 2
  'deep-diver': { title: 'Deep Diver', minDays: 2, maxDays: 2, durationLabel: '2 Days' },
  // 14 Wreck Diver 1–2
  'wreck-diver': { title: 'Wreck Diver', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 15 Night Diver 2
  'night-diver': { title: 'Night Diver', minDays: 2, maxDays: 2, durationLabel: '2 Days' },
  // 16 Enriched Air Nitrox 1
  'enriched-air-nitrox': { title: 'Enriched Air Nitrox', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  // 17 DSD + Open Water 3–4
  'dsd-ow-combo': { title: 'DSD + Open Water', minDays: 3, maxDays: 4, durationLabel: '3–4 Days' },
  // 18 Open Water + Advanced 5–7
  'ow-aow-combo': { title: 'Open Water + Advanced', minDays: 5, maxDays: 7, durationLabel: '5–7 Days' },
  // 19 EFR + Rescue Diver 4–6
  'efr-rescue-combo': { title: 'EFR + Rescue Diver', minDays: 4, maxDays: 6, durationLabel: '4–6 Days' },
  // 20 Divemaster 20–25
  'divemaster': { title: 'Divemaster', minDays: 20, maxDays: 25, durationLabel: '20–25 Days' },
  // 21 EFR + Rescue + Divemaster 24–31
  'efr-rescue-dm-combo': { title: 'EFR + Rescue + Divemaster', minDays: 24, maxDays: 31, durationLabel: '24–31 Days' },
  'efr-rescue-dm-prereqs': { title: 'EFR + Rescue + Divemaster (Prerequisites)', minDays: 24, maxDays: 31, durationLabel: '24–31 Days' },
  // 23 Zero to Hero (Open Water to Divemaster) 90–120
  'zero-to-hero': { title: 'Zero to Hero (Open Water to Divemaster)', minDays: 90, maxDays: 120, durationLabel: '90–120 Days' },
  // 24 Basic Freediver 1–2
  'basic-freediver': { title: 'Basic Freediver', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  // 25 Freediver 2–3
  'freediver': { title: 'Freediver', minDays: 2, maxDays: 3, durationLabel: '2–3 Days' },

  // Supplementary / Introductory
  'try-dive': { title: 'Try Dive', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  'dsd-lite': { title: 'Discover Scuba Dive Lite', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  'dsd': { title: 'Discover Scuba Dive', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  'drift-diver': { title: 'Drift Diver', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' },
  'discover-snorkeling': { title: 'Discover Snorkeling', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  'reef-explorer': { title: 'Reef Explorer', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  'ocean-explorer': { title: 'Ocean Explorer', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  'discover-surfing': { title: 'Discover Surfing', minDays: 1, maxDays: 1, durationLabel: '1 Day' },
  '3-day-surf-academy': { title: '3 Day Surf Academy', minDays: 3, maxDays: 3, durationLabel: '3 Days' },
  'fun-dives': { title: 'Fun Dives', minDays: 1, maxDays: 3, durationLabel: '1–3 Days' },
}

/**
 * Retrieve duration metadata for a given program ID or program title.
 */
export function getProgramDurationInfo(programIdOrName, participant = null) {
  let target = programIdOrName
  if (!target && participant?.selectedProgram) {
    target = participant.selectedProgram
  }
  if (!target) {
    return { title: 'Standard Program', minDays: 1, maxDays: 1, durationLabel: '1 Day' }
  }

  // Fun Dives package specialization (supports user-typed days & dives or preset packages)
  if (target === 'fun-dives' || String(target).toLowerCase().includes('fun dive')) {
    const rawDays = participant?.funDays || participant?.days || participant?.funDivesDays
    const customDays = parseInt(rawDays, 10)
    const rawDives = participant?.funDives || participant?.funDivesCount || participant?.funDayDivesCount
    const customDives = parseInt(rawDives, 10)

    if (!isNaN(customDays) && customDays > 0) {
      const divesText = !isNaN(customDives) && customDives > 0 ? `${customDives} Dive${customDives > 1 ? 's' : ''}` : 'Fun Dives'
      const daysText = `${customDays} Day${customDays > 1 ? 's' : ''}`
      return {
        title: `Fun Dives (${divesText} / ${daysText})`,
        minDays: customDays,
        maxDays: customDays,
        durationLabel: daysText,
      }
    }

    const pkgId = participant?.funDivesCount || participant?.funDayDivesCount
    if (pkgId === 'fun-1') return { title: 'Fun Dives (1 Dive / Half Day)', minDays: 1, maxDays: 1, durationLabel: '1 Day' }
    if (pkgId === 'fun-2') return { title: 'Fun Dives (2 Dives / 1 Day)', minDays: 1, maxDays: 1, durationLabel: '1 Day' }
    if (pkgId === 'fun-4') return { title: 'Fun Dives (4 Dives / 1 Day)', minDays: 1, maxDays: 1, durationLabel: '1 Day' }
    if (pkgId === 'fun-6') return { title: 'Fun Dives (6 Dives / 2 Days)', minDays: 2, maxDays: 2, durationLabel: '2 Days' }
    if (pkgId === 'fun-8') return { title: 'Fun Dives (8 Dives / 2 Days)', minDays: 2, maxDays: 2, durationLabel: '2 Days' }
    if (pkgId === 'fun-10') return { title: 'Fun Dives (10 Dives / 3 Days)', minDays: 3, maxDays: 3, durationLabel: '3 Days' }
    if (pkgId === 'fun-12') return { title: 'Fun Dives (12 Dives / 3 Days)', minDays: 3, maxDays: 3, durationLabel: '3 Days' }
    return { title: 'Fun Dives', minDays: 1, maxDays: 2, durationLabel: '1–2 Days' }
  }

  // 1. Direct ID lookup
  if (PROGRAM_DURATION_MAP[target]) {
    return PROGRAM_DURATION_MAP[target]
  }

  const targetStr = String(target).trim().toLowerCase()
  const clean = targetStr.replace(/[^a-z0-9]/g, '')

  // 2. Catalog ID or exact Name lookup
  const catalogItem = COURSE_CATALOG.find(
    (c) => c.id === target || c.name.toLowerCase() === targetStr || c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  )
  if (catalogItem && PROGRAM_DURATION_MAP[catalogItem.id]) {
    return PROGRAM_DURATION_MAP[catalogItem.id]
  }

  // 3. Exact Normalized Name / Title lookup in PROGRAM_DURATION_MAP
  for (const [key, val] of Object.entries(PROGRAM_DURATION_MAP)) {
    const cleanKey = key.replace(/[^a-z0-9]/g, '')
    const cleanTitle = val.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (clean === cleanKey || clean === cleanTitle) {
      return val
    }
  }

  // 4. Substring match: sorted by specificity (longest title/key first)
  const sortedEntries = Object.entries(PROGRAM_DURATION_MAP).sort((a, b) => {
    const lenA = Math.max(a[0].length, a[1].title.length)
    const lenB = Math.max(b[0].length, b[1].title.length)
    return lenB - lenA
  })

  for (const [key, val] of sortedEntries) {
    const cleanKey = key.replace(/[^a-z0-9]/g, '')
    const cleanTitle = val.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (clean.includes(cleanTitle) || clean.includes(cleanKey)) {
      return val
    }
  }

  return { title: String(target), minDays: 1, maxDays: 1, durationLabel: '1 Day' }
}

/**
 * Calculate start date, possible end date range, and duration for a single program.
 */
export function calculateCourseSchedule(startDateStr, programIdOrName, participant = null) {
  const durationInfo = getProgramDurationInfo(programIdOrName, participant)
  const { minDays, maxDays, durationLabel, title } = durationInfo

  const pad = (n) => String(n).padStart(2, '0')
  const formatDDMMYYYY = (d) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`

  if (!startDateStr) {
    return {
      title,
      durationLabel,
      minDays,
      maxDays,
      startDate: null,
      formattedStartDate: '',
      minEndDate: null,
      maxEndDate: null,
      formattedMinEndDate: '',
      formattedMaxEndDate: '',
      possibleEndRange: 'Date to be selected',
      fullScheduleText: `Duration: ${durationLabel}`,
    }
  }

  const parts = String(startDateStr).split('-')
  if (parts.length !== 3) {
    return {
      title,
      durationLabel,
      minDays,
      maxDays,
      startDate: null,
      formattedStartDate: startDateStr,
      minEndDate: null,
      maxEndDate: null,
      formattedMinEndDate: '',
      formattedMaxEndDate: '',
      possibleEndRange: '',
      fullScheduleText: `Duration: ${durationLabel}`,
    }
  }

  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) - 1
  const d = parseInt(parts[2], 10)

  const startObj = new Date(y, m, d)
  const formattedStart = formatDDMMYYYY(startObj)

  // Day 1 is start date.
  // Day minDays is start date + (minDays - 1) days.
  const minEndObj = new Date(y, m, d)
  minEndObj.setDate(minEndObj.getDate() + Math.max(0, minDays - 1))
  const formattedMinEnd = formatDDMMYYYY(minEndObj)

  const maxEndObj = new Date(y, m, d)
  maxEndObj.setDate(maxEndObj.getDate() + Math.max(0, maxDays - 1))
  const formattedMaxEnd = formatDDMMYYYY(maxEndObj)

  const possibleEndRange = minDays === maxDays
    ? formattedMinEnd
    : `${formattedMinEnd} – ${formattedMaxEnd}`

  let fullScheduleText = ''
  if (minDays === 1 && maxDays === 1) {
    fullScheduleText = `${formattedStart} (1 Day)`
  } else if (minDays === maxDays) {
    fullScheduleText = `${formattedStart} to ${formattedMaxEnd} (${durationLabel})`
  } else {
    fullScheduleText = `${formattedStart} to ${formattedMaxEnd} (${durationLabel})`
  }

  return {
    title,
    durationLabel,
    minDays,
    maxDays,
    startDate: startObj,
    formattedStartDate: formattedStart,
    minEndDate: minEndObj,
    maxEndDate: maxEndObj,
    formattedMinEndDate: formattedMinEnd,
    formattedMaxEndDate: formattedMaxEnd,
    possibleEndRange,
    fullScheduleText,
  }
}

/**
 * Calculate group schedule across all participants, determining individual timelines
 * and overall group duration window.
 */
export function calculateGroupCourseSchedule(startDateStr, participants = [], defaultExperience = '') {
  if (!Array.isArray(participants) || participants.length === 0) {
    const single = calculateCourseSchedule(startDateStr, defaultExperience || 'Scuba Diving')
    return {
      ...single,
      participantSchedules: [],
      overallDurationLabel: single.durationLabel,
      overallPossibleEndRange: single.possibleEndRange,
      overallMaxDays: single.maxDays,
    }
  }

  const participantSchedules = participants.map((p, idx) => {
    const progId = p.selectedProgram || defaultExperience
    const sched = calculateCourseSchedule(startDateStr, progId, p)
    return {
      participantIndex: idx,
      participantName: p.name || `Participant ${idx + 1}`,
      programName: sched.title,
      ...sched,
    }
  })

  // Calculate overall window
  const allMinDays = participantSchedules.map((s) => s.minDays)
  const allMaxDays = participantSchedules.map((s) => s.maxDays)
  const overallMinDays = Math.min(...allMinDays)
  const overallMaxDays = Math.max(...allMaxDays)

  let overallDurationLabel = ''
  if (overallMinDays === overallMaxDays) {
    overallDurationLabel = overallMinDays === 1 ? '1 Day' : `${overallMinDays} Days`
  } else {
    overallDurationLabel = `${overallMinDays}–${overallMaxDays} Days`
  }

  // Formatted end range for overall window
  let overallPossibleEndRange = ''
  if (!startDateStr) {
    overallPossibleEndRange = 'Date to be selected'
  } else {
    const maxEndSchedule = participantSchedules.find((s) => s.maxDays === overallMaxDays) || participantSchedules[0]
    const minEndSchedule = participantSchedules.find((s) => s.minDays === overallMinDays) || participantSchedules[0]
    if (overallMinDays === overallMaxDays) {
      overallPossibleEndRange = maxEndSchedule.formattedMaxEndDate
    } else {
      overallPossibleEndRange = `${minEndSchedule.formattedMinEndDate} – ${maxEndSchedule.formattedMaxEndDate}`
    }
  }

  const firstSched = participantSchedules[0] || {}

  return {
    durationLabel: overallDurationLabel,
    overallDurationLabel,
    overallMaxDays,
    minDays: overallMinDays,
    maxDays: overallMaxDays,
    startDate: firstSched.startDate || null,
    formattedStartDate: firstSched.formattedStartDate || '',
    possibleEndRange: overallPossibleEndRange,
    overallPossibleEndRange,
    fullScheduleText: firstSched.formattedStartDate
      ? `${firstSched.formattedStartDate} to ${overallPossibleEndRange} (${overallDurationLabel})`
      : `Duration: ${overallDurationLabel}`,
    participantSchedules,
  }
}

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
  PROGRAM_DURATION_MAP,
  getProgramDurationInfo,
  calculateCourseSchedule,
  calculateGroupCourseSchedule,
  getAvailableCertificationsForAge,
  getEligibleCourses,
  getRecommendedCourses,
  sortCoursesByDifficulty,
  validateParticipantBooking,
  normalizeExperienceKey,
  isFunDivesProgram,
}
