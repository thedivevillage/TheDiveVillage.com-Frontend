import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Map, setWorkerUrl, NavigationControl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { loadDiveSites } from '../utils/diveSitesLoader'
<<<<<<< Updated upstream
import { getIslandForSite } from '../utils/diveIslandCatalog'
import localPinIconUrl from '../assets/pin.png'
import { PIN_DATA_URI } from '../utils/pinBase64'
=======
import { getIslandForSite, getIslandCentroidsForCountry, getIslandsForCountry } from '../utils/diveIslandCatalog'
>>>>>>> Stashed changes

const pinIconUrl = 'https://res.cloudinary.com/q7b4kjd9/image/upload/v1792425523/pin-CG20ymQb.png'

// Official Vite worker setup for MapLibre GL JS
setWorkerUrl(workerUrl)

const DEFAULT_CENTER = [15, 20]
const DEFAULT_ZOOM = 1.8

// Preload the yellow dive goggles pin icon (#FFD500)
// Directly uses the embedded Base64 Data URI to guarantee 100% synchronous in-memory availability
// with zero network latency, zero CORS restrictions, and zero missing image drops.
let activeMapInstance = null
let preloadedPinImg = null
if (typeof window !== 'undefined') {
  const img = new Image()
  img.onload = () => {
    preloadedPinImg = img
    if (activeMapInstance) {
      try {
        ensurePinImages(activeMapInstance, true)
      } catch {}
    }
  }
  img.src = PIN_DATA_URI
  if (img.complete && img.naturalWidth > 0) {
    preloadedPinImg = img
  }
}

const preloadPinImage = () => {
  if (preloadedPinImg && preloadedPinImg.complete && preloadedPinImg.naturalWidth > 0) {
    return Promise.resolve(preloadedPinImg)
  }
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      preloadedPinImg = img
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = PIN_DATA_URI
    if (img.complete && img.naturalWidth > 0) {
      preloadedPinImg = img
      resolve(img)
    }
  })
}

/**
 * Generates a crisp #FFD500 yellow dive goggles pin icon from assets/pin.png for MapLibre WebGL.
 * Features a subtle dark drop shadow so it pops cleanly over both deep blue ocean and light coastlines.
 * Includes a pure vector canvas fallback in case the source image is tainted or temporarily unavailable.
 */
function createDiveGogglesPinIcon(img, width = 30, height = 17) {
  const dpr = 2
  const pad = 3
  const canvas = document.createElement('canvas')
  canvas.width = (width + pad * 2) * dpr
  canvas.height = (height + pad * 2) * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  ctx.shadowColor = 'rgba(0, 15, 30, 0.75)'
  ctx.shadowBlur = 3
  ctx.shadowOffsetY = 1.5

  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    try {
      ctx.drawImage(img, pad, pad, width, height)
      return ctx.getImageData(0, 0, canvas.width, canvas.height)
    } catch (e) {
      console.warn('[DiveExplorerMap] Canvas getImageData notice, using vector goggles fallback:', e)
    }
  }

  // Pure vector yellow dive goggles fallback (guaranteed never to throw SecurityError or return blank)
  ctx.clearRect(0, 0, width + pad * 2, height + pad * 2)
  ctx.save()
  ctx.fillStyle = '#FFD500'
  ctx.strokeStyle = '#001428'
  ctx.lineWidth = 1.2
  // Outer mask frame
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(pad, pad + 1, width, height - 2, 4)
  } else {
    ctx.rect(pad, pad + 1, width, height - 2)
  }
  ctx.fill()
  ctx.stroke()
  // Dual dark lenses
  ctx.fillStyle = '#001E3D'
  const lensW = (width - 7) / 2
  const lensH = height - 6
  if (ctx.roundRect) {
    ctx.beginPath(); ctx.roundRect(pad + 2, pad + 3, lensW, lensH, 2); ctx.fill()
    ctx.beginPath(); ctx.roundRect(pad + 5 + lensW, pad + 3, lensW, lensH, 2); ctx.fill()
  } else {
    ctx.fillRect(pad + 2, pad + 3, lensW, lensH)
    ctx.fillRect(pad + 5 + lensW, pad + 3, lensW, lensH)
  }
  ctx.restore()

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Generates a classic red drop pin (teardrop map marker with white center dot and shadow)
 * for MapLibre WebGL canvas.
 */
function createRedDropPinIcon(width = 15, height = 21) {
  const dpr = 2
  const padX = 3
  const padTop = 2.5
  const padBottom = 1
  const canvas = document.createElement('canvas')
  canvas.width = (width + padX * 2) * dpr
  canvas.height = (height + padTop + padBottom) * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const cx = padX + width / 2
  const r = width / 2 - 1.2
  const cy = padTop + r
  const tipY = padTop + height - 0.5

  // 1. Soft drop shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0, 15, 30, 0.6)'
  ctx.shadowBlur = 3
  ctx.shadowOffsetY = 1.5

  // 2. Drop pin teardrop path with mathematically smooth tangents
  const d = Math.max(r + 1, tipY - cy)
  const cosAlpha = Math.min(0.95, r / d)
  const alpha = Math.acos(cosAlpha)

  ctx.beginPath()
  ctx.arc(cx, cy, r, Math.PI / 2 - alpha, Math.PI / 2 + alpha, true)
  ctx.lineTo(cx, tipY)
  ctx.closePath()

  // 3. Rich red gradient fill
  const grad = ctx.createLinearGradient(cx - r, padTop, cx + r, tipY)
  grad.addColorStop(0, '#FF4D4D')
  grad.addColorStop(0.5, '#EA3838')
  grad.addColorStop(1, '#C62828')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  // 4. Clean white border
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // 5. Classic white center dot
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()

  // 6. Subtle inner core dot
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = '#991B1B'
  ctx.fill()

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Ensures all custom dive goggles and red drop pin images are registered synchronously in the MapLibre instance.
 * Safe to call repeatedly across country changes and map style loads.
 */
function ensurePinImages(map, forceUpdate = false) {
  if (!map) return

  // 1. Red drop pins (synchronous)
  if (!map.hasImage('country-pin-red')) {
    map.addImage('country-pin-red', createRedDropPinIcon(18, 25), { pixelRatio: 2 })
  }
  if (!map.hasImage('site-pin-red')) {
    map.addImage('site-pin-red', createRedDropPinIcon(14, 20), { pixelRatio: 2 })
  }

  // 2. Custom dive goggles pins
  const customIds = ['country-pin-custom', 'site-pin-custom', 'country-pin-icon', 'site-pin-icon']
  const allExist = customIds.every((id) => map.hasImage(id))
  if (allExist && !forceUpdate) return

  const img = (preloadedPinImg && preloadedPinImg.complete && preloadedPinImg.naturalWidth > 0)
    ? preloadedPinImg
    : null

  try {
    const countryImgData = createDiveGogglesPinIcon(img, 30, 17)
    const siteImgData = createDiveGogglesPinIcon(img, 22, 12.5)

    if (!map.hasImage('country-pin-custom')) {
      map.addImage('country-pin-custom', countryImgData, { pixelRatio: 2 })
    } else if (forceUpdate) {
      map.updateImage('country-pin-custom', countryImgData)
    }

    if (!map.hasImage('site-pin-custom')) {
      map.addImage('site-pin-custom', siteImgData, { pixelRatio: 2 })
    } else if (forceUpdate) {
      map.updateImage('site-pin-custom', siteImgData)
    }

    if (!map.hasImage('country-pin-icon')) {
      map.addImage('country-pin-icon', countryImgData, { pixelRatio: 2 })
    } else if (forceUpdate) {
      map.updateImage('country-pin-icon', countryImgData)
    }

    if (!map.hasImage('site-pin-icon')) {
      map.addImage('site-pin-icon', siteImgData, { pixelRatio: 2 })
    } else if (forceUpdate) {
      map.updateImage('site-pin-icon', siteImgData)
    }
  } catch (e) {
    console.warn('[DiveExplorerMap] Error adding pin image to map:', e)
  }
}

// Clean country name string for reliable matching across basemap labels and geojson properties
function cleanCountryName(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const COUNTRY_NAME_ALIASES = {
  usa: 'United States of America (USA)',
  unitedstates: 'United States of America (USA)',
  unitedstatesofamerica: 'United States of America (USA)',
  us: 'United States of America (USA)',
  uk: 'United Kingdom',
  greatbritain: 'United Kingdom',
  britain: 'United Kingdom',
  england: 'United Kingdom',
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  uae: 'United Arab Emirates',
  unitedarabemirates: 'United Arab Emirates',
  russia: 'Russia',
  russianfederation: 'Russia',
  southkorea: 'South Korea',
  korea: 'South Korea',
  republicofkorea: 'South Korea',
  tanzania: 'Tanzania',
  unitedrepublicoftanzania: 'Tanzania',
  micronesia: 'Federated States of Micronesia',
  federatedstatesofmicronesia: 'Federated States of Micronesia',
  stkittsandnevis: 'Saint Kitts & Nevis',
  stkittsnevis: 'Saint Kitts & Nevis',
  saintkittsandnevis: 'Saint Kitts & Nevis',
  stvincentandthegrenadines: 'Saint Vincent & the Grenadines',
  stvincent: 'Saint Vincent & the Grenadines',
  saintvincentandthegrenadines: 'Saint Vincent & the Grenadines',
  saintvincentthegrenadines: 'Saint Vincent & the Grenadines',
  turksandcaicos: 'Turks and Caicos Islands',
  turksandcaicosislands: 'Turks and Caicos Islands',
  britishvirginislands: 'British Virgin Islands',
  virginislandsbritish: 'British Virgin Islands',
  usvirginislands: 'U.S. Virgin Islands',
  virginislandsus: 'U.S. Virgin Islands',
  unitedstatesvirginislands: 'U.S. Virgin Islands',
  caymanislands: 'Cayman Islands',
  curacao: 'Curaçao',
  reunion: 'Réunion',
  republicofmauritius: 'Republic of Mauritius',
  mauritius: 'Republic of Mauritius',
  guadeloupe: 'The Guadeloupe Islands',
  theguadeloupeislands: 'The Guadeloupe Islands',
  timorleste: 'Timor Leste (East Timor)',
  easttimor: 'Timor Leste (East Timor)',
  trinidadandtobago: 'Trinidad and Tobago',
  trinidadtobago: 'Trinidad and Tobago',
  caribbeannetherlands: 'Caribbean Netherlands',
  bonaire: 'Caribbean Netherlands',
  sintmaarten: 'Sint Maarten',
  saintmartin: 'Sint Maarten',
  northernmarianaislands: 'Northern Mariana Islands',
  frenchpolynesia: 'French Polynesia',
  tahiti: 'French Polynesia',
  capeverde: 'Cape Verde',
  caboverde: 'Cape Verde',
}

function findMatchingCountry(candidateName, countriesList) {
  if (!candidateName || !countriesList || countriesList.length === 0) return null
  const cleaned = cleanCountryName(candidateName)
  if (!cleaned) return null

  // 1. Direct alias check
  if (COUNTRY_NAME_ALIASES[cleaned]) {
    const aliased = COUNTRY_NAME_ALIASES[cleaned]
    const found = countriesList.find((c) => cleanCountryName(c) === cleanCountryName(aliased))
    if (found) return found
    return aliased
  }

  // 2. Exact match in countries list
  const exact = countriesList.find((c) => cleanCountryName(c) === cleaned)
  if (exact) return exact

  // 3. Substring match
  const sub = countriesList.find((c) => {
    const cClean = cleanCountryName(c)
    return (
      (cleaned.includes(cClean) && cClean.length >= 4) ||
      (cClean.includes(cleaned) && cleaned.length >= 4)
    )
  })
  if (sub) return sub

  return null
}

export default function DiveExplorerMap({
  onSelectSite,
  onSelectCountry = null,
  onSelectIsland = null,
  selectedCountry: controlledCountry = undefined,
  selectedIsland: controlledIsland = undefined,
  selectedSite: controlledSite = null,
  selectedSiteId = null,
  compact = false,
  className = '',
  title = 'Dive Explorer',
  subtitle = 'Discover verified scuba and ocean dive locations across the globe',
  showHeading = true,
  onBookSite = null,
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const isMapReadyRef = useRef(false)
  const pendingCountryZoomRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allSites, setAllSites] = useState([])
  const [countryCentroids, setCountryCentroids] = useState([])
  const [geojsonCountries, setGeojsonCountries] = useState({ type: 'FeatureCollection', features: [] })
  const [countriesList, setCountriesList] = useState([])

  // Three-tier navigation state:
  // Tier 1: selectedCountry === null -> World overview (country badges visible)
  // Tier 2: selectedCountry !== null && selectedIsland === null -> Country zoom view (islands/mainland visible)
  // Tier 3: selectedCountry !== null && selectedIsland !== null -> Island zoom view (individual dive sites visible)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedIsland, setSelectedIsland] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Selected site detail card
  const [activeSite, setActiveSite] = useState(null)
  const [tooltipInfo, setTooltipInfo] = useState(null)

  // Pin marker style state: 'custom' (yellow dive goggles) | 'red' (normal red drop pin)
  const [pinStyle, setPinStyle] = useState(() => {
    try {
      return localStorage.getItem('tdv_dive_map_pin_style') || 'custom'
    } catch {
      return 'custom'
    }
  })
  const pinStyleRef = useRef(pinStyle)

  const handleTogglePinStyle = useCallback((newStyle) => {
    setPinStyle(newStyle)
    pinStyleRef.current = newStyle
    try {
      localStorage.setItem('tdv_dive_map_pin_style', newStyle)
    } catch {}

    const map = mapRef.current
    if (!map || !isMapReadyRef.current) return
    const countryIcon = newStyle === 'red' ? 'country-pin-red' : 'country-pin-custom'
    const islandIcon = newStyle === 'red' ? 'country-pin-red' : 'country-pin-custom'
    const siteIcon = newStyle === 'red' ? 'site-pin-red' : 'site-pin-custom'
    try {
      if (map.getLayer('country-pin')) {
        map.setLayoutProperty('country-pin', 'icon-image', countryIcon)
      }
      if (map.getLayer('island-pin')) {
        map.setLayoutProperty('island-pin', 'icon-image', islandIcon)
      }
      if (map.getLayer('site-pin')) {
        map.setLayoutProperty('site-pin', 'icon-image', siteIcon)
      }
    } catch (e) {
      console.warn('[DiveExplorer] Pin style toggle error:', e)
    }
  }, [])

  // Keep latest state in refs so asynchronous MapLibre callbacks always access fresh data
  const geojsonCountriesRef = useRef(geojsonCountries)
  const countryCentroidsRef = useRef(countryCentroids)
  const islandCentroidsRef = useRef([])
  const islandsGeoJSONRef = useRef({ type: 'FeatureCollection', features: [] })
  const countrySitesGeoJSONRef = useRef({ type: 'FeatureCollection', features: [] })
  const selectedCountryRef = useRef(selectedCountry)
  const selectedIslandRef = useRef(selectedIsland)
  const searchQueryRef = useRef(searchQuery)
  const countriesListRef = useRef(countriesList)
  const onSelectCountryRef = useRef(onSelectCountry)
  const onSelectIslandRef = useRef(onSelectIsland)
  const onSelectSiteRef = useRef(onSelectSite)
  const onBookSiteRef = useRef(onBookSite)

  geojsonCountriesRef.current = geojsonCountries
  countryCentroidsRef.current = countryCentroids
  selectedCountryRef.current = selectedCountry
  selectedIslandRef.current = selectedIsland
  searchQueryRef.current = searchQuery
  countriesListRef.current = countriesList
  onSelectCountryRef.current = onSelectCountry
  onSelectIslandRef.current = onSelectIsland
  onSelectSiteRef.current = onSelectSite
  onBookSiteRef.current = onBookSite

  // 1. Available islands in currently active country
  const availableIslands = useMemo(() => {
    if (!selectedCountry || !allSites.length) return []
    return getIslandsForCountry(selectedCountry, allSites)
  }, [selectedCountry, allSites])

  // 2. Compute island centroids for the active country (Tier 2 markers)
  const islandCentroids = useMemo(() => {
    if (!selectedCountry || !allSites.length) return []
    return getIslandCentroidsForCountry(selectedCountry, allSites)
  }, [selectedCountry, allSites])

  islandCentroidsRef.current = islandCentroids

  // 3. GeoJSON for Islands / Mainland (Tier 2)
  const islandsGeoJSON = useMemo(() => {
    if (!islandCentroids.length) {
      return { type: 'FeatureCollection', features: [] }
    }
    return {
      type: 'FeatureCollection',
      features: islandCentroids.map((isl) => ({
        type: 'Feature',
        id: isl.name,
        geometry: {
          type: 'Point',
          coordinates: [isl.longitude, isl.latitude],
        },
        properties: {
          island: isl.name,
          country: isl.country,
          count: isl.count,
          latitude: isl.latitude,
          longitude: isl.longitude,
        },
      })),
    }
  }, [islandCentroids])

  islandsGeoJSONRef.current = islandsGeoJSON

  // 4. GeoJSON for Individual Dive Sites (Tier 3 or Search)
  const countrySitesGeoJSON = useMemo(() => {
    if (!allSites.length) {
      return { type: 'FeatureCollection', features: [] }
    }

    // Direct search mode: filter sites globally or in selected country
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const filtered = allSites.filter((site) => {
        if (selectedCountry && site.country?.trim().toLowerCase() !== selectedCountry.trim().toLowerCase()) {
          return false
        }
        if (selectedIsland && getIslandForSite(site) !== selectedIsland) {
          return false
        }
        const nameMatch = (site.siteName || '').toLowerCase().includes(q)
        const countryMatch = (site.country || '').toLowerCase().includes(q)
        const typeMatch = (site.naturalTypes || '').toLowerCase().includes(q)
        return nameMatch || countryMatch || typeMatch
      })

      return {
        type: 'FeatureCollection',
        features: filtered.map((site) => ({
          type: 'Feature',
          id: site.id,
          geometry: {
            type: 'Point',
            coordinates: [site.longitude, site.latitude],
          },
          properties: {
            id: site.id,
            siteName: site.siteName,
            country: site.country,
            island: getIslandForSite(site),
            latitude: site.latitude,
            longitude: site.longitude,
            naturalTypes: site.naturalTypes,
            sourceUrl: site.sourceUrl,
          },
        })),
      }
    }

    // Tier 3: Show individual dive sites ONLY when an island is selected!
    if (!selectedCountry || !selectedIsland) {
      return { type: 'FeatureCollection', features: [] }
    }

    const filtered = allSites.filter(
      (site) =>
        site.country?.trim().toLowerCase() === selectedCountry.trim().toLowerCase() &&
        getIslandForSite(site) === selectedIsland
    )

    return {
      type: 'FeatureCollection',
      features: filtered.map((site) => ({
        type: 'Feature',
        id: site.id,
        geometry: {
          type: 'Point',
          coordinates: [site.longitude, site.latitude],
        },
        properties: {
          id: site.id,
          siteName: site.siteName,
          country: site.country,
          island: getIslandForSite(site),
          latitude: site.latitude,
          longitude: site.longitude,
          naturalTypes: site.naturalTypes,
          sourceUrl: site.sourceUrl,
        },
      })),
    }
  }, [allSites, selectedCountry, selectedIsland, searchQuery])

  countrySitesGeoJSONRef.current = countrySitesGeoJSON

  // Camera zoom to country framing
  const zoomToCountry = useCallback((countryName) => {
    const map = mapRef.current
    if (!map || !countryName) return

<<<<<<< Updated upstream
    ensurePinImages(map)

    // If map has not completed its initial layer setup yet, queue zoom
    if (!isMapReadyRef.current) {
      pendingCountryZoomRef.current = countryName
=======
    if (!map.loaded()) {
      map.once('load', () => {
        zoomToCountry(countryName)
      })
>>>>>>> Stashed changes
      return
    }

    const canonicalCountry = findMatchingCountry(countryName, countriesListRef.current) || countryName
    const countryData = countryCentroidsRef.current.find(
      (c) =>
        cleanCountryName(c.country) === cleanCountryName(canonicalCountry) ||
        cleanCountryName(c.country) === cleanCountryName(countryName)
    )

    if (!countryData) return

    if (countryData.bounds && Array.isArray(countryData.bounds) && countryData.bounds.length === 2) {
      const [sw, ne] = countryData.bounds
      const dLng = Math.abs(ne[0] - sw[0])
      const dLat = Math.abs(ne[1] - sw[1])
      const centerLng = (sw[0] + ne[0]) / 2
      const centerLat = (sw[1] + ne[1]) / 2

      const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640
      const dynamicPadding = isSmallScreen
        ? { top: 85, bottom: 65, left: 55, right: 55 }
        : { top: 110, bottom: 90, left: 95, right: 95 }

      if (dLng < 0.05 && dLat < 0.05) {
        map.flyTo({ center: [sw[0], sw[1]], zoom: 5.2, duration: 1100 })
        return
      }

      if (dLng < 0.6 && dLat < 0.6) {
        map.flyTo({ center: [centerLng, centerLat], zoom: 5.4, duration: 1100 })
        return
      }

      let targetZoom = 4.4
      let targetCenter = [centerLng, centerLat]

      try {
        const camera = map.cameraForBounds(countryData.bounds, { padding: dynamicPadding })
        if (camera && typeof camera.zoom === 'number') {
          const maxAllowedZoom = dLng < 1.5 && dLat < 1.5 ? 4.9 : 4.6
          targetZoom = Math.max(2.2, Math.min(maxAllowedZoom, camera.zoom - 0.55))
          if (camera.center) {
            targetCenter = [
              camera.center.lng ?? (Array.isArray(camera.center) ? camera.center[0] : centerLng),
              camera.center.lat ?? (Array.isArray(camera.center) ? camera.center[1] : centerLat),
            ]
          }
        }
      } catch (err) {
        console.warn('[DiveExplorer] cameraForBounds notice:', err)
      }

      map.flyTo({
        center: targetCenter,
        zoom: targetZoom,
        duration: 1200,
      })
      return
    }

    map.flyTo({
      center: [countryData.longitude, countryData.latitude],
      zoom: 4.4,
      duration: 1200,
    })
  }, [])

  // Camera zoom to island framing (Tier 3)
  const zoomToIsland = useCallback((islandName) => {
    const map = mapRef.current
    if (!map || !islandName) return

    const islandData = islandCentroidsRef.current.find(
      (isl) => isl.name.toLowerCase() === islandName.toLowerCase()
    )

    if (!islandData) return

    if (islandData.bounds && Array.isArray(islandData.bounds) && islandData.bounds.length === 2) {
      const [sw, ne] = islandData.bounds
      const dLng = Math.abs(ne[0] - sw[0])
      const dLat = Math.abs(ne[1] - sw[1])

      if (dLng < 0.04 && dLat < 0.04) {
        map.flyTo({
          center: [islandData.longitude, islandData.latitude],
          zoom: 10.5,
          duration: 1100,
        })
        return
      }

      try {
        map.fitBounds(islandData.bounds, {
          padding: { top: 90, bottom: 90, left: 90, right: 90 },
          maxZoom: 11.5,
          duration: 1200,
        })
        return
      } catch (e) {
        console.warn('[DiveExplorer] fitBounds error for island:', e)
      }
    }

    map.flyTo({
      center: [islandData.longitude, islandData.latitude],
      zoom: 10.0,
      duration: 1100,
    })
  }, [])

  // Tier 1 -> Tier 2: Transition from World View to Country View (shows islands)
  const navigateToCountry = useCallback((rawCountryName) => {
    if (!rawCountryName) return
    const canonical = findMatchingCountry(rawCountryName, countriesListRef.current) || rawCountryName

    if (mapRef.current) {
      ensurePinImages(mapRef.current)
    }

    setSelectedCountry(canonical)
    selectedCountryRef.current = canonical
    setSelectedIsland(null)
    selectedIslandRef.current = null
    setActiveSite(null)
    setTooltipInfo(null)

    if (onSelectSiteRef.current) onSelectSiteRef.current(null)
    if (onSelectIslandRef.current) onSelectIslandRef.current(null)
    if (onSelectCountryRef.current) onSelectCountryRef.current(canonical)

    zoomToCountry(canonical)
  }, [zoomToCountry])

  // Tier 2 -> Tier 3: Transition from Country View to Island View (shows dive sites)
  const navigateToIsland = useCallback((islandName) => {
    if (!islandName) return

    setSelectedIsland(islandName)
    selectedIslandRef.current = islandName
    setActiveSite(null)
    setTooltipInfo(null)

    if (onSelectSiteRef.current) onSelectSiteRef.current(null)
    if (onSelectIslandRef.current) onSelectIslandRef.current(islandName)

    zoomToIsland(islandName)
  }, [zoomToIsland])

  // Return from Tier 3 back to Tier 2 (Country View showing islands)
  const handleReturnToCountryIslands = useCallback(() => {
    setSelectedIsland(null)
    selectedIslandRef.current = null
    setActiveSite(null)
    setTooltipInfo(null)

    if (onSelectSiteRef.current) onSelectSiteRef.current(null)
    if (onSelectIslandRef.current) onSelectIslandRef.current(null)

    if (selectedCountryRef.current) {
      zoomToCountry(selectedCountryRef.current)
    }
  }, [zoomToCountry])

  // Return to World Overview (Tier 1)
  const handleResetWorldView = useCallback(() => {
    setSelectedCountry(null)
    selectedCountryRef.current = null
    setSelectedIsland(null)
    selectedIslandRef.current = null
    setSearchQuery('')
    searchQueryRef.current = ''
    setActiveSite(null)
    setTooltipInfo(null)

    if (onSelectSiteRef.current) onSelectSiteRef.current(null)
    if (onSelectIslandRef.current) onSelectIslandRef.current(null)
    if (onSelectCountryRef.current) onSelectCountryRef.current('')

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 1000,
      })
    }
  }, [])

  const navigateToCountryRef = useRef(navigateToCountry)
  navigateToCountryRef.current = navigateToCountry
  const navigateToIslandRef = useRef(navigateToIsland)
  navigateToIslandRef.current = navigateToIsland
  const zoomToCountryRef = useRef(zoomToCountry)
  zoomToCountryRef.current = zoomToCountry
  const zoomToIslandRef = useRef(zoomToIsland)
  zoomToIslandRef.current = zoomToIsland

  // Synchronize MapLibre sources and 3-tier layer visibilities
  const syncMapData = useCallback((mapInstance) => {
    const map = mapInstance || mapRef.current
    if (!map || !map.isStyleLoaded()) return

    try {
      const cs = map.getSource('country-centroids-source')
      if (cs) cs.setData(geojsonCountriesRef.current)

      const is = map.getSource('island-centroids-source')
      if (is) is.setData(islandsGeoJSONRef.current)

      const ds = map.getSource('dive-sites-source')
      if (ds) ds.setData(countrySitesGeoJSONRef.current)

      const hasSearch = Boolean(searchQueryRef.current)
      const hasCountry = Boolean(selectedCountryRef.current)
      const hasIsland = Boolean(selectedIslandRef.current)

      // 3-Tier Visibility Rules:
      // Tier 1 (World View): Country polygons and pins visible
      const countryVis = !hasCountry && !hasSearch ? 'visible' : 'none'
      // Tier 2 (Country View): Island pins visible
      const islandVis = hasCountry && !hasIsland && !hasSearch ? 'visible' : 'none'
      // Tier 3 (Island View) or Search View: Individual dive site pins visible
      const siteVis = (hasCountry && hasIsland) || hasSearch ? 'visible' : 'none'

      if (map.getLayer('country-pin')) {
        map.setLayoutProperty('country-pin', 'visibility', countryVis)
      }
      if (map.getLayer('country-polygons-fill')) {
        map.setLayoutProperty('country-polygons-fill', 'visibility', countryVis)
      }
      if (map.getLayer('country-polygons-stroke')) {
        map.setLayoutProperty('country-polygons-stroke', 'visibility', countryVis)
      }

      if (map.getLayer('island-halo')) {
        map.setLayoutProperty('island-halo', 'visibility', islandVis)
      }
      if (map.getLayer('island-pin')) {
        map.setLayoutProperty('island-pin', 'visibility', islandVis)
      }

      if (map.getLayer('site-pin')) {
        map.setLayoutProperty('site-pin', 'visibility', siteVis)
      }
    } catch (e) {
      console.warn('[DiveExplorer] syncMapData warning:', e)
    }
  }, [])

  const syncMapDataRef = useRef(syncMapData)
  syncMapDataRef.current = syncMapData

  // Sync pin icons dynamically when pinStyle changes
  useEffect(() => {
    pinStyleRef.current = pinStyle
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const countryIcon = pinStyle === 'red' ? 'country-pin-red' : 'country-pin-custom'
    const siteIcon = pinStyle === 'red' ? 'site-pin-red' : 'site-pin-custom'
    try {
      if (map.getLayer('country-pin')) {
        map.setLayoutProperty('country-pin', 'icon-image', countryIcon)
      }
      if (map.getLayer('island-pin')) {
        map.setLayoutProperty('island-pin', 'icon-image', countryIcon)
      }
      if (map.getLayer('site-pin')) {
        map.setLayoutProperty('site-pin', 'icon-image', siteIcon)
      }
    } catch (e) {
      console.warn('[DiveExplorer] Pin style sync error:', e)
    }
  }, [pinStyle])

  // 1. Load CSV/JSON data on mount
  useEffect(() => {
    let mounted = true
    async function initData() {
      try {
        setLoading(true)
        const data = await loadDiveSites()
        if (!mounted) return
        if (data.error) {
          setError(data.error)
        } else {
          setAllSites(data.sites || [])
          setCountryCentroids(data.countryCentroids || [])
          countryCentroidsRef.current = data.countryCentroids || []
          setGeojsonCountries(data.geojsonCountries || { type: 'FeatureCollection', features: [] })
          geojsonCountriesRef.current = data.geojsonCountries || { type: 'FeatureCollection', features: [] }
          setCountriesList(data.countries || [])
          countriesListRef.current = data.countries || []

          if (selectedCountryRef.current && zoomToCountryRef.current) {
            zoomToCountryRef.current(selectedCountryRef.current)
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to initialize dive site dataset.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    initData()
    return () => {
      mounted = false
    }
  }, [])

<<<<<<< Updated upstream
  // 2. Compute individual dive sites GeoJSON (filtered by selected country or search)
  const countrySitesGeoJSON = useMemo(() => {
    if (!allSites.length) {
      return { type: 'FeatureCollection', features: [] }
    }

    // Only show dive sites when a specific country is active or search query is entered
    if (!selectedCountry && !searchQuery) {
      return { type: 'FeatureCollection', features: [] }
    }

    const q = searchQuery.trim().toLowerCase()
    const targetClean = cleanCountryName(selectedCountry)
    const canonicalTarget = selectedCountry ? (findMatchingCountry(selectedCountry, countriesList) || selectedCountry) : ''
    const canonicalTargetClean = cleanCountryName(canonicalTarget)

    const filtered = allSites.filter((site) => {
      // Must match selected country if active
      if (selectedCountry) {
        const siteClean = cleanCountryName(site.country)
        const siteCanonicalClean = cleanCountryName(findMatchingCountry(site.country, countriesList) || site.country)
        const isMatch =
          siteClean === targetClean ||
          siteClean === canonicalTargetClean ||
          siteCanonicalClean === canonicalTargetClean ||
          siteCanonicalClean === targetClean
        if (!isMatch) return false
      }
      // Search query
      if (q) {
        const nameMatch = (site.siteName || '').toLowerCase().includes(q)
        const countryMatch = (site.country || '').toLowerCase().includes(q)
        const typeMatch = (site.naturalTypes || '').toLowerCase().includes(q)
        if (!nameMatch && !countryMatch && !typeMatch) return false
      }
      return true
    })

    return {
      type: 'FeatureCollection',
      features: filtered.map((site) => ({
        type: 'Feature',
        id: site.id,
        geometry: {
          type: 'Point',
          coordinates: [site.longitude, site.latitude],
        },
        properties: {
          id: site.id,
          siteName: site.siteName,
          country: site.country,
          latitude: site.latitude,
          longitude: site.longitude,
          naturalTypes: site.naturalTypes,
          sourceUrl: site.sourceUrl,
        },
      })),
    }
  }, [allSites, selectedCountry, searchQuery, countriesList])

  countrySitesGeoJSONRef.current = countrySitesGeoJSON

  useEffect(() => {
    countrySitesGeoJSONRef.current = countrySitesGeoJSON
  }, [countrySitesGeoJSON])

  // Helper: Synchronize MapLibre sources and layer visibilities safely
  const syncMapData = useCallback((mapInstance) => {
    const map = mapInstance || mapRef.current
    if (!map || !isMapReadyRef.current) return

    // Ensure custom and red pin images exist in map before changing layer visibility
    ensurePinImages(map)

    try {
      const cs = map.getSource('country-centroids-source')
      if (cs) {
        cs.setData(geojsonCountriesRef.current)
      }

      const ds = map.getSource('dive-sites-source')
      if (ds) {
        ds.setData(countrySitesGeoJSONRef.current)
      }

      const isCountryView = Boolean(selectedCountryRef.current || searchQueryRef.current)
      const countryVis = isCountryView ? 'none' : 'visible'
      const siteVis = isCountryView ? 'visible' : 'none'

      const countryIcon = pinStyleRef.current === 'red' ? 'country-pin-red' : 'country-pin-custom'
      const siteIcon = pinStyleRef.current === 'red' ? 'site-pin-red' : 'site-pin-custom'

      if (map.getLayer('country-pin')) {
        map.setLayoutProperty('country-pin', 'visibility', countryVis)
        map.setLayoutProperty('country-pin', 'icon-image', countryIcon)
      }
      if (map.getLayer('country-polygons-fill')) {
        map.setLayoutProperty('country-polygons-fill', 'visibility', countryVis)
      }
      if (map.getLayer('country-polygons-stroke')) {
        map.setLayoutProperty('country-polygons-stroke', 'visibility', countryVis)
      }
      if (map.getLayer('site-pin')) {
        map.setLayoutProperty('site-pin', 'visibility', siteVis)
        map.setLayoutProperty('site-pin', 'icon-image', siteIcon)
      }

      map.triggerRepaint()
    } catch (e) {
      console.warn('[DiveExplorer] syncMapData warning:', e)
    }
  }, [])

  const syncMapDataRef = useRef(syncMapData)
  syncMapDataRef.current = syncMapData

  // 3. Initialize MapLibre GL Map with OpenFreeMap Liberty Style
=======
  // 2. Initialize MapLibre GL Map with OpenFreeMap Liberty Style
>>>>>>> Stashed changes
  useEffect(() => {
    if (!mapContainerRef.current) return

    let map = null
    let isCancelled = false

    try {
      map = new Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 1.2,
        maxZoom: 18,
        clickTolerance: 12,
        attributionControl: true,
        renderWorldCopies: true,
        dragRotate: false,
        touchPitch: false,
        scrollZoom: false,
      })

      mapRef.current = map

      if (map.touchPitch) map.touchPitch.disable()
      if (map.touchZoomRotate) map.touchZoomRotate.disableRotation()
      if (map.scrollZoom) map.scrollZoom.disable()

      map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'top-right')

      // Handle missing image dynamically as safety guard
      map.on('styleimagemissing', (e) => {
        const id = e.id
        if (id === 'country-pin-red') {
          if (!map.hasImage(id)) map.addImage(id, createRedDropPinIcon(18, 25), { pixelRatio: 2 })
          return
        }
        if (id === 'site-pin-red') {
          if (!map.hasImage(id)) map.addImage(id, createRedDropPinIcon(14, 20), { pixelRatio: 2 })
          return
        }

        if (id === 'country-pin-custom' || id === 'country-pin-icon') {
          if (preloadedPinImg && preloadedPinImg.complete && preloadedPinImg.naturalWidth > 0 && !map.hasImage(id)) {
            try {
              map.addImage(id, createDiveGogglesPinIcon(preloadedPinImg, 30, 17), { pixelRatio: 2 })
              return
            } catch (err) {
              console.warn('[DiveExplorerMap] Sync addImage notice:', err)
            }
          }
          ensurePinImages(map)
        } else if (id === 'site-pin-custom' || id === 'site-pin-icon') {
          if (preloadedPinImg && preloadedPinImg.complete && preloadedPinImg.naturalWidth > 0 && !map.hasImage(id)) {
            try {
              map.addImage(id, createDiveGogglesPinIcon(preloadedPinImg, 22, 12.5), { pixelRatio: 2 })
              return
            } catch (err) {
              console.warn('[DiveExplorerMap] Sync addImage notice:', err)
            }
          }
          ensurePinImages(map)
        }
      })

      map.on('load', async () => {
        if (isCancelled) return

        mapRef.current = map

        // 1. Force English ONLY on all basemap place names & ensure clean Havelock Island name
        try {
          const styleLayers = map.getStyle().layers || []
          styleLayers.forEach((layer) => {
            if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
              map.setLayoutProperty(layer.id, 'text-field', [
                'case',
                [
                  'any',
                  ['in', 'Swaraj', ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name'], '']],
                  ['in', 'swaraj', ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name'], '']],
                  ['in', 'Swarajdeep', ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name'], '']],
                  ['in', 'swarajdeep', ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name'], '']],
                ],
                'Havelock Island',
                [
                  'coalesce',
                  ['get', 'name:en'],
                  ['get', 'name_en'],
                  ['get', 'name:latin'],
                  ['get', 'name'],
                ],
              ])
            }
          })
        } catch (e) {
          console.warn('[DiveExplorer] English text setting notice:', e)
        }

        // 2. Saturated ocean & water colors + sharp coastline stroke
        try {
          if (map.getLayer('water')) {
            map.setPaintProperty('water', 'fill-color', '#1a75bb')
          }
          if (map.getLayer('waterway_river')) {
            map.setPaintProperty('waterway_river', 'line-color', '#1a75bb')
          }
          if (!map.getLayer('coastline-stroke') && map.getSource('openmaptiles')) {
            map.addLayer(
              {
                id: 'coastline-stroke',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'water',
                paint: {
                  'line-color': '#0d47a1',
                  'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    3, 0.4,
                    6, 0.8,
                    9, 1.5,
                    12, 2.2,
                  ],
                  'line-opacity': 0.75,
                },
              },
              'waterway_line_label'
            )
          }
        } catch (e) {
          console.warn('[DiveExplorer] Water styling notice:', e)
        }

        // 3. Register pin icons
        try {
<<<<<<< Updated upstream
          await ensurePinImages(map)
=======
          const pinImg = await preloadPinImage()
          if (pinImg) {
            if (!map.hasImage('country-pin-custom')) {
              map.addImage('country-pin-custom', createDiveGogglesPinIcon(pinImg, 30, 17), { pixelRatio: 2 })
            }
            if (!map.hasImage('site-pin-custom')) {
              map.addImage('site-pin-custom', createDiveGogglesPinIcon(pinImg, 22, 12.5), { pixelRatio: 2 })
            }
            if (!map.hasImage('country-pin-icon')) {
              map.addImage('country-pin-icon', createDiveGogglesPinIcon(pinImg, 30, 17), { pixelRatio: 2 })
            }
            if (!map.hasImage('site-pin-icon')) {
              map.addImage('site-pin-icon', createDiveGogglesPinIcon(pinImg, 22, 12.5), { pixelRatio: 2 })
            }
          } else {
            const res = await map.loadImage(pinIconUrl)
            if (res && res.data) {
              if (!map.hasImage('country-pin-custom')) map.addImage('country-pin-custom', res.data, { pixelRatio: 4.1 })
              if (!map.hasImage('site-pin-custom')) map.addImage('site-pin-custom', res.data, { pixelRatio: 5.6 })
              if (!map.hasImage('country-pin-icon')) map.addImage('country-pin-icon', res.data, { pixelRatio: 4.1 })
              if (!map.hasImage('site-pin-icon')) map.addImage('site-pin-icon', res.data, { pixelRatio: 5.6 })
            }
          }

          if (!map.hasImage('country-pin-red')) {
            map.addImage('country-pin-red', createRedDropPinIcon(18, 25), { pixelRatio: 2 })
          }
          if (!map.hasImage('site-pin-red')) {
            map.addImage('site-pin-red', createRedDropPinIcon(14, 20), { pixelRatio: 2 })
          }
>>>>>>> Stashed changes
        } catch (e) {
          console.warn('[DiveExplorer] Icon registration notice:', e)
        }

        const initialCountryIcon = pinStyleRef.current === 'red' ? 'country-pin-red' : 'country-pin-custom'
        const initialSiteIcon = pinStyleRef.current === 'red' ? 'site-pin-red' : 'site-pin-custom'

        // ----------------------------------------------------
        // TIER 1: Country Boundary Polygons & Centroids
        // ----------------------------------------------------
        map.addSource('countries-polygons-source', {
          type: 'geojson',
          data: '/data/countries.geojson',
        })

        map.addLayer({
          id: 'country-polygons-fill',
          type: 'fill',
          source: 'countries-polygons-source',
          paint: {
            'fill-color': '#0284c7',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.16,
              0.001,
            ],
          },
        })

        map.addLayer({
          id: 'country-polygons-stroke',
          type: 'line',
          source: 'countries-polygons-source',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 1.5,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8,
              0,
            ],
          },
        })

        map.addSource('country-centroids-source', {
          type: 'geojson',
          data: geojsonCountriesRef.current,
        })

        map.addLayer({
          id: 'country-pin',
          type: 'symbol',
          source: 'country-centroids-source',
          layout: {
            'icon-image': initialCountryIcon,
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              1.5, 0.72,
              3.5, 0.95,
              6.5, 1.25,
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'text-field': ['get', 'country'],
            'text-font': ['Noto Sans Bold'],
            'text-size': [
              'interpolate', ['linear'], ['zoom'],
              1.5, 8.5,
              4.0, 10,
              6.5, 11.5,
            ],
            'text-offset': [0, 0.35],
            'text-anchor': 'top',
            'text-optional': true,
          },
          paint: {
            'text-color': '#001428',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 2.5,
          },
        })

        // ----------------------------------------------------
        // TIER 2: Island / Mainland Regional Hubs
        // ----------------------------------------------------
        map.addSource('island-centroids-source', {
          type: 'geojson',
          data: islandsGeoJSONRef.current,
        })

        map.addLayer({
          id: 'island-halo',
          type: 'circle',
          source: 'island-centroids-source',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              2.5, 14,
              5.0, 20,
              8.0, 28,
            ],
            'circle-color': '#0284c7',
            'circle-opacity': 0.18,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#38bdf8',
            'circle-stroke-opacity': 0.7,
          },
        })

        map.addLayer({
          id: 'island-pin',
          type: 'symbol',
          source: 'island-centroids-source',
          layout: {
            'icon-image': initialCountryIcon,
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              2.5, 0.75,
              5.0, 0.95,
              8.5, 1.25,
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'text-field': ['concat', ['get', 'island'], '\n(', ['get', 'count'], ' dive sites)'],
            'text-font': ['Noto Sans Bold'],
            'text-size': [
              'interpolate', ['linear'], ['zoom'],
              2.5, 9.5,
              5.0, 11,
              8.0, 13,
            ],
            'text-offset': [0, 0.45],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#001428',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 3,
          },
        })

        // ----------------------------------------------------
        // TIER 3: Individual Dive Sites (Island Zoom View)
        // ----------------------------------------------------
        map.addSource('dive-sites-source', {
          type: 'geojson',
          data: countrySitesGeoJSONRef.current,
        })

        map.addLayer({
          id: 'site-pin',
          type: 'symbol',
          source: 'dive-sites-source',
          layout: {
            'icon-image': initialSiteIcon,
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              2.0, 0.55,
              4.0, 0.70,
              7.5, 0.95,
              10.5, 1.20,
              13.5, 1.50,
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'text-field': ['get', 'siteName'],
            'text-font': ['Noto Sans Bold'],
            'text-size': [
              'interpolate', ['linear'], ['zoom'],
              2.0, 7.0,
              4.0, 8.5,
              8.0, 10.0,
              12.0, 11.5,
            ],
            'text-offset': [0, 0.35],
            'text-anchor': 'top',
            'text-optional': true,
          },
          paint: {
            'text-color': '#001428',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 2,
          },
        })

        // ----------------------------------------------------
        // TIER 1 CLICK & HOVER: Country Selection
        // ----------------------------------------------------
        map.on('click', 'country-pin', (e) => {
          if (!e.features || !e.features.length) return
          if (e.originalEvent) e.originalEvent._countryHandled = true
          const p = e.features[0].properties
          if (navigateToCountryRef.current && p?.country) {
            navigateToCountryRef.current(p.country)
          }
        })

        map.on('click', 'country-polygons-fill', (e) => {
          if (!e.features || !e.features.length) return
          if (e.originalEvent) e.originalEvent._countryHandled = true
          const p = e.features[0].properties || {}
          const candidate = p.name_long || p.name || p.admin || p.sovereignt || p.formal_en
          const matched = findMatchingCountry(candidate, countriesListRef.current)
          if (matched && navigateToCountryRef.current) {
            navigateToCountryRef.current(matched)
          }
        })

        // ----------------------------------------------------
        // TIER 2 CLICK & HOVER: Island Selection
        // ----------------------------------------------------
        map.on('click', 'island-pin', (e) => {
          if (!e.features || !e.features.length) return
          if (e.originalEvent) e.originalEvent._islandHandled = true
          const p = e.features[0].properties
          if (navigateToIslandRef.current && p?.island) {
            navigateToIslandRef.current(p.island)
          }
        })

        map.on('mouseenter', 'island-pin', (e) => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = 'pointer'
          if (e.features && e.features[0]) {
            const p = e.features[0].properties
            setTooltipInfo({
              x: e.point.x,
              y: e.point.y,
              name: p.island,
              subtitle: `${p.count} Dive Sites • Click to explore dive sites`,
            })
          }
        })

        map.on('mouseleave', 'island-pin', () => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = ''
          setTooltipInfo(null)
        })

        // ----------------------------------------------------
        // TIER 3 CLICK & HOVER: Dive Site Selection
        // ----------------------------------------------------
        map.on('click', 'site-pin', (e) => {
          if (!e.features || !e.features.length) return
          const p = e.features[0].properties
          const coords = e.features[0].geometry.coordinates
          const site = {
            id: p.id,
            siteName: p.siteName,
            country: p.country,
            island: p.island || getIslandForSite({ country: p.country, latitude: coords[1], longitude: coords[0], siteName: p.siteName }),
            latitude: parseFloat(p.latitude) || coords[1],
            longitude: parseFloat(p.longitude) || coords[0],
            naturalTypes: p.naturalTypes || '',
            sourceUrl: p.sourceUrl || '',
          }
          setActiveSite(site)
          if (onSelectSiteRef.current) onSelectSiteRef.current(site)

          map.flyTo({
            center: coords,
            zoom: Math.max(map.getZoom(), 9.2),
            duration: 1000,
          })
        })

        map.on('mouseenter', 'site-pin', (e) => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = 'pointer'
          if (e.features && e.features[0]) {
            const p = e.features[0].properties
            setTooltipInfo({
              x: e.point.x,
              y: e.point.y,
              name: p.siteName,
              subtitle: p.naturalTypes ? `${p.naturalTypes} • ${p.island || p.country}` : (p.island || p.country),
            })
          }
        })

        map.on('mouseleave', 'site-pin', () => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = ''
          setTooltipInfo(null)
        })

<<<<<<< Updated upstream
        activeMapInstance = map
        isMapReadyRef.current = true

        // Re-assert layer data and pin layout on camera stop and tile idle
        map.on('moveend', () => {
          if (syncMapDataRef.current) {
            syncMapDataRef.current(map)
          }
        })
        map.on('idle', () => {
          if (syncMapDataRef.current) {
            syncMapDataRef.current(map)
          }
        })

=======
        // Comprehensive single-tap detection (Touchscreen padding & Island / Country fallbacks)
        map.on('click', (e) => {
          if (e.originalEvent?._countryHandled || e.originalEvent?._islandHandled) return

          const pad = 24
          const bbox = [
            [e.point.x - pad, e.point.y - pad],
            [e.point.x + pad, e.point.y + pad],
          ]

          // 1. If inside a country and no island selected yet -> check island taps
          if (selectedCountryRef.current && !selectedIslandRef.current && !searchQueryRef.current) {
            const islandFeatures = map.queryRenderedFeatures(bbox, { layers: ['island-pin'] })
            if (islandFeatures.length > 0 && islandFeatures[0].properties?.island) {
              if (navigateToIslandRef.current) {
                navigateToIslandRef.current(islandFeatures[0].properties.island)
              }
              return
            }

            // Proximity fallback to closest island within 75px
            let closestIsland = null
            let minScreenDist = Infinity
            for (const isl of islandCentroidsRef.current) {
              const pt = map.project([isl.longitude, isl.latitude])
              const dist = Math.hypot(pt.x - e.point.x, pt.y - e.point.y)
              if (dist < minScreenDist) {
                minScreenDist = dist
                closestIsland = isl.name
              }
            }
            if (minScreenDist <= 75 && closestIsland && navigateToIslandRef.current) {
              navigateToIslandRef.current(closestIsland)
            }
            return
          }

          // 2. If at World View -> check country taps
          if (!selectedCountryRef.current && !searchQueryRef.current) {
            const pinFeatures = map.queryRenderedFeatures(bbox, { layers: ['country-pin'] })
            if (pinFeatures.length > 0 && pinFeatures[0].properties?.country) {
              if (navigateToCountryRef.current) {
                navigateToCountryRef.current(pinFeatures[0].properties.country)
              }
              return
            }

            const polyFeatures = map.queryRenderedFeatures(e.point, { layers: ['country-polygons-fill'] })
            if (polyFeatures.length > 0) {
              const p = polyFeatures[0].properties || {}
              const candidate = p.name_long || p.name || p.admin || p.sovereignt || p.formal_en
              const matched = findMatchingCountry(candidate, countriesListRef.current)
              if (matched && navigateToCountryRef.current) {
                navigateToCountryRef.current(matched)
                return
              }
            }

            let closestCountry = null
            let minScreenDist = Infinity
            for (const c of countryCentroidsRef.current) {
              const pt = map.project([c.longitude, c.latitude])
              const dist = Math.hypot(pt.x - e.point.x, pt.y - e.point.y)
              if (dist < minScreenDist) {
                minScreenDist = dist
                closestCountry = c.country
              }
            }

            if (minScreenDist <= 65 && closestCountry && navigateToCountryRef.current) {
              navigateToCountryRef.current(closestCountry)
            }
          }
        })

        // Desktop hover tooltip for countries
        map.on('mousemove', 'country-polygons-fill', (e) => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          if (selectedCountryRef.current || searchQueryRef.current) return
          if (e.features && e.features.length > 0) {
            const p = e.features[0].properties || {}
            const candidate = p.name_long || p.name || p.admin || p.sovereignt
            const matched = findMatchingCountry(candidate, countriesListRef.current)
            if (matched) {
              map.getCanvas().style.cursor = 'pointer'
              const cData = countryCentroidsRef.current.find(
                (c) => cleanCountryName(c.country) === cleanCountryName(matched)
              )
              setTooltipInfo({
                x: e.point.x,
                y: e.point.y,
                name: matched,
                subtitle: cData ? `${cData.count} Dive Sites • Click to view islands` : 'Click to view islands',
              })
            }
          }
        })
        map.on('mouseleave', 'country-polygons-fill', () => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = ''
          setTooltipInfo(null)
        })

        map.on('mouseenter', 'country-pin', (e) => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = 'pointer'
          if (e.features && e.features[0]) {
            const p = e.features[0].properties
            setTooltipInfo({
              x: e.point.x,
              y: e.point.y,
              name: p.country,
              subtitle: `${p.count} Dive Sites • Click to view islands`,
            })
          }
        })
        map.on('mouseleave', 'country-pin', () => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = ''
          setTooltipInfo(null)
        })

>>>>>>> Stashed changes
        // Initial sync of layers and data
        if (syncMapDataRef.current) {
          syncMapDataRef.current(map)
        }

        // Process any queued camera flight requested before map load completed
        if (pendingCountryZoomRef.current) {
          const queuedCountry = pendingCountryZoomRef.current
          pendingCountryZoomRef.current = null
          if (zoomToCountryRef.current) {
            zoomToCountryRef.current(queuedCountry)
          }
        }
      })
    } catch (err) {
      if (!isCancelled) {
        console.error('[DiveExplorer] Map initialization error:', err)
        setError('Unable to load map basemap. Please check your network connection.')
      }
    }

    return () => {
      isCancelled = true
      isMapReadyRef.current = false
      if (activeMapInstance === map) {
        activeMapInstance = null
      }
      if (map) {
        map.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Auto-resize MapLibre GL whenever map container dimensions change
  useEffect(() => {
    const el = mapContainerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Trackpad 2-finger Pan & Touchscreen gesture handling
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return
    const wrapper = container.parentElement || container

    let lastTrackpadStreamTime = 0
    let twoFingerTouchState = {
      active: false,
      prevMidX: 0,
      prevMidY: 0,
      prevDist: 0,
    }

    const handleWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()

      const map = mapRef.current
      if (!map) return

      if (e.ctrlKey) {
        const zoomDelta = -e.deltaY * 0.008
        const currentZoom = map.getZoom()
        const targetZoom = Math.min(Math.max(currentZoom + zoomDelta, map.getMinZoom()), map.getMaxZoom())
        const rect = container.getBoundingClientRect()
        const anchor = map.unproject([e.clientX - rect.left, e.clientY - rect.top])
        map.zoomTo(targetZoom, { around: anchor, duration: 0 })
        return
      }

      const isTrackpad =
        e.deltaMode === 0 &&
        (Math.abs(e.deltaX) > 0 ||
          !Number.isInteger(e.deltaY) ||
          Math.abs(e.deltaY) < 60 ||
          Date.now() - lastTrackpadStreamTime < 300)

      if (isTrackpad) {
        lastTrackpadStreamTime = Date.now()
        map.panBy([e.deltaX, e.deltaY], { duration: 0 })
        return
      }

      const zoomStep = e.deltaY < 0 ? 0.35 : -0.35
      const currentZoom = map.getZoom()
      const targetZoom = Math.min(Math.max(currentZoom + zoomStep, map.getMinZoom()), map.getMaxZoom())
      const rect = container.getBoundingClientRect()
      const anchor = map.unproject([e.clientX - rect.left, e.clientY - rect.top])
      map.zoomTo(targetZoom, { around: anchor, duration: 150 })
    }

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0]
        const t1 = e.touches[1]
        const midX = (t0.clientX + t1.clientX) / 2
        const midY = (t0.clientY + t1.clientY) / 2
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        twoFingerTouchState = {
          active: true,
          prevMidX: midX,
          prevMidY: midY,
          prevDist: dist,
        }
      } else {
        twoFingerTouchState.active = false
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        e.stopPropagation()

        const map = mapRef.current
        if (!map) return

        const t0 = e.touches[0]
        const t1 = e.touches[1]
        const midX = (t0.clientX + t1.clientX) / 2
        const midY = (t0.clientY + t1.clientY) / 2
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)

        if (twoFingerTouchState.active) {
          const dx = midX - twoFingerTouchState.prevMidX
          const dy = midY - twoFingerTouchState.prevMidY

          if (dx !== 0 || dy !== 0) {
            map.panBy([-dx, -dy], { duration: 0 })
          }

          if (twoFingerTouchState.prevDist > 0 && Math.abs(dist - twoFingerTouchState.prevDist) > 1.2) {
            const scale = dist / twoFingerTouchState.prevDist
            const zoomDelta = Math.log2(scale)
            if (Math.abs(zoomDelta) > 0.003) {
              const rect = container.getBoundingClientRect()
              const anchor = map.unproject([midX - rect.left, midY - rect.top])
              const currentZoom = map.getZoom()
              const targetZoom = Math.min(Math.max(currentZoom + zoomDelta, map.getMinZoom()), map.getMaxZoom())
              map.zoomTo(targetZoom, { around: anchor, duration: 0 })
            }
          }
        }

        twoFingerTouchState.prevMidX = midX
        twoFingerTouchState.prevMidY = midY
        twoFingerTouchState.prevDist = dist
        twoFingerTouchState.active = true
      } else {
        twoFingerTouchState.active = false
      }
    }

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        twoFingerTouchState.active = false
      }
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true })
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false })
    wrapper.addEventListener('touchend', handleTouchEnd, { passive: true })
    wrapper.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      wrapper.removeEventListener('wheel', handleWheel)
      wrapper.removeEventListener('touchstart', handleTouchStart)
      wrapper.removeEventListener('touchmove', handleTouchMove)
      wrapper.removeEventListener('touchend', handleTouchEnd)
      wrapper.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [])

  // Reactive updates when data, country, island, or search filters change
  useEffect(() => {
    syncMapData()
  }, [geojsonCountries, islandsGeoJSON, countrySitesGeoJSON, selectedCountry, selectedIsland, searchQuery, syncMapData])

  // External controlledCountry synchronization (Booking Form -> Map)
  useEffect(() => {
    if (controlledCountry === undefined) return
    const target = controlledCountry ? controlledCountry.trim() : null
    const current = selectedCountry ? selectedCountry.trim() : null
    if ((target || '').toLowerCase() !== (current || '').toLowerCase()) {
      setSelectedCountry(target)
      selectedCountryRef.current = target
      setSelectedIsland(null)
      selectedIslandRef.current = null
      setActiveSite(null)

      if (mapRef.current) {
        ensurePinImages(mapRef.current)
      }

      if (!target) {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            duration: 1000,
          })
        }
      } else if (mapRef.current) {
        zoomToCountry(target)
      }
    }
  }, [controlledCountry, selectedCountry, zoomToCountry])

  // External controlledIsland synchronization (Booking Form -> Map)
  useEffect(() => {
    if (controlledIsland === undefined) return
    const target = controlledIsland ? controlledIsland.trim() : null
    const current = selectedIsland ? selectedIsland.trim() : null
    if ((target || '').toLowerCase() !== (current || '').toLowerCase()) {
      setSelectedIsland(target)
      selectedIslandRef.current = target
      setActiveSite(null)

      if (target && mapRef.current) {
        zoomToIsland(target)
      } else if (!target && selectedCountry && mapRef.current) {
        zoomToCountry(selectedCountry)
      }
    }
  }, [controlledIsland, selectedIsland, selectedCountry, zoomToIsland, zoomToCountry])

  // External controlledSite / selectedSiteId synchronization (Booking Form -> Map)
  useEffect(() => {
    const query = controlledSite || selectedSiteId
    if (!query || allSites.length === 0) return

    const strQuery = typeof query === 'string' ? query.trim() : ''
    if (!strQuery) return

    const cleanQuery = strQuery.toLowerCase()
    const prefixWord = strQuery.includes('(') ? strQuery.split('(')[0].trim().toLowerCase() : ''
    const insideParen = strQuery.includes('(') && strQuery.includes(')') ? strQuery.split('(')[1].split(')')[0].trim().toLowerCase() : ''

    let match = allSites.find((s) => s.id === query)

    if (!match && selectedCountry) {
      match = allSites.find(
        (s) => s.country.toLowerCase() === selectedCountry.toLowerCase() && s.siteName.toLowerCase() === cleanQuery
      ) || allSites.find(
        (s) => s.country.toLowerCase() === selectedCountry.toLowerCase() && s.siteName.toLowerCase().includes(cleanQuery)
      ) || (prefixWord && allSites.find(
        (s) => s.country.toLowerCase() === selectedCountry.toLowerCase() && (s.siteName.toLowerCase().includes(prefixWord) || prefixWord.includes(s.siteName.toLowerCase()))
      )) || (insideParen && allSites.find(
        (s) => s.country.toLowerCase() === selectedCountry.toLowerCase() && s.siteName.toLowerCase().includes(insideParen)
      ))
    }

    if (!match) {
      match = allSites.find((s) => s.siteName.toLowerCase() === cleanQuery) ||
        allSites.find((s) => s.siteName.toLowerCase().includes(cleanQuery)) ||
        (prefixWord && allSites.find((s) => s.siteName.toLowerCase().includes(prefixWord))) ||
        (insideParen && allSites.find((s) => s.siteName.toLowerCase().includes(insideParen)))
    }

    if (match && mapRef.current) {
      if (match.country && match.country.toLowerCase() !== (selectedCountry || '').toLowerCase()) {
        setSelectedCountry(match.country)
        selectedCountryRef.current = match.country
        if (onSelectCountry) onSelectCountry(match.country)
      }
      const siteIsland = getIslandForSite(match)
      if (siteIsland) {
        setSelectedIsland(siteIsland)
        selectedIslandRef.current = siteIsland
        if (onSelectIsland) onSelectIsland(siteIsland)
      }
      setActiveSite(match)
      mapRef.current.flyTo({
        center: [match.longitude, match.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 10.5),
        duration: 1000,
      })
    }
  }, [controlledSite, selectedSiteId, allSites, selectedCountry, onSelectCountry, onSelectIsland])

  // When user picks a country from dropdown
  const handleDropdownCountryChange = (c) => {
    if (c === 'all' || !c) {
      handleResetWorldView()
      return
    }
    navigateToCountry(c)
  }

  // When user picks an island from dropdown
  const handleDropdownIslandChange = (isl) => {
    if (isl === 'all' || !isl) {
      handleReturnToCountryIslands()
      return
    }
    navigateToIsland(isl)
  }

  return (
    <div
      className={`w-full normal-cursor ${className}`}
      data-normal-cursor
      data-dive-map="true"
    >
      {/* Mobile Standalone Search Bar Pill & Controls */}
      <div className="sm:hidden mb-3.5 flex flex-col gap-2">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dive site by name..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-navy text-xs font-bold cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile Country & Island selector + Pin Toggle Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Country Selector */}
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={selectedCountry || 'all'}
              onChange={(e) => handleDropdownCountryChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 rounded-2xl bg-white border border-navy/15 text-xs font-bold text-navy outline-none focus:border-accent shadow-xs truncate"
              aria-label="Select country"
            >
              <option value="all">All Countries ({countriesList.length})</option>
              {countriesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-navy/50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Island Selector (Visible when Country is chosen) */}
          {selectedCountry && availableIslands.length > 0 && (
            <div className="relative flex-1 min-w-[140px] animate-in fade-in">
              <select
                value={selectedIsland || 'all'}
                onChange={(e) => handleDropdownIslandChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 rounded-2xl bg-sky-50 border border-sky-300 text-xs font-bold text-navy outline-none focus:border-accent shadow-xs truncate"
                aria-label="Select island or region"
              >
                <option value="all">All Islands ({availableIslands.length})</option>
                {availableIslands.map((isl) => (
                  <option key={isl.name} value={isl.name}>
                    {isl.name} ({isl.count})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-navy/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          )}

          {/* Pin Style Toggle */}
          <div
            className="flex items-center bg-white p-0.5 rounded-2xl border border-navy/15 shadow-xs shrink-0 select-none"
            role="group"
            aria-label="Toggle pin style"
          >
            <button
              type="button"
              onClick={() => handleTogglePinStyle('custom')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                pinStyle === 'custom'
                  ? 'bg-navy text-[#FFD500] shadow-xs'
                  : 'text-navy/60 hover:text-navy'
              }`}
              title="Custom Pin"
              aria-pressed={pinStyle === 'custom'}
            >
              <img
                src={pinIconUrl}
                alt=""
                className="w-3.5 h-2 object-contain"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.src = localPinIconUrl
                }}
              />
              <span>Custom</span>
            </button>
            <button
              type="button"
              onClick={() => handleTogglePinStyle('red')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                pinStyle === 'red'
                  ? 'bg-navy text-rose-400 shadow-xs'
                  : 'text-navy/60 hover:text-navy'
              }`}
              title="Red Pin"
              aria-pressed={pinStyle === 'red'}
            >
              <svg width="10" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
              </svg>
              <span>Red</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Card */}
      <div className="flex flex-col bg-white rounded-3xl sm:rounded-[36px] border border-navy/10 shadow-card overflow-hidden w-full">
        {/* Header Banner (Desktop Only) */}
        {showHeading && (
          <div className="hidden sm:flex px-5 py-4 sm:px-7 sm:py-5 border-b border-navy/10 bg-white flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">3-Tier Oceanic Navigation</span>
              </div>
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-navy mt-0.5">{title}</h2>
              <p className="text-xs text-navy/70 mt-0.5 max-w-xl">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetWorldView}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-navy/5 hover:bg-navy hover:text-white border border-navy/15 text-navy text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                title="Reset map view to the whole world"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <span>World View</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Control Bar */}
        <div className="hidden sm:flex p-4 bg-slate-50/70 border-b border-navy/10 flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-navy/40">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dive site by name..."
              className="w-full pl-10 pr-8 py-2.5 rounded-full bg-white border border-slate-200/90 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-navy/40 hover:text-navy text-xs font-bold cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdowns & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Country Selector */}
            <div className="relative">
              <select
                value={selectedCountry || 'all'}
                onChange={(e) => handleDropdownCountryChange(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl bg-white border border-navy/15 text-xs font-bold text-navy outline-none focus:border-accent cursor-pointer shadow-xs max-w-[170px] sm:max-w-[200px] truncate"
                aria-label="Select country"
              >
                <option value="all">All Countries ({countriesList.length})</option>
                {countriesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-navy/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Island Selector (Visible when Country is chosen) */}
            {selectedCountry && availableIslands.length > 0 && (
              <div className="relative animate-in fade-in">
                <select
                  value={selectedIsland || 'all'}
                  onChange={(e) => handleDropdownIslandChange(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl bg-sky-50 border border-sky-300 text-xs font-bold text-navy outline-none focus:border-accent cursor-pointer shadow-xs max-w-[180px] sm:max-w-[220px] truncate"
                  aria-label="Select island or region"
                >
                  <option value="all">All Islands / Regions ({availableIslands.length})</option>
                  {availableIslands.map((isl) => (
                    <option key={isl.name} value={isl.name}>
                      {isl.name} ({isl.count})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-navy/50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            )}

            {/* Reset button if filtered */}
            {(selectedCountry || searchQuery) && (
              <button
                type="button"
                onClick={handleResetWorldView}
                className="px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 shadow-xs cursor-pointer"
              >
                Reset
              </button>
            )}

            {/* Pin Style Toggle Switch */}
            <div
              className="ml-auto md:ml-0 flex items-center bg-white p-1 rounded-2xl border border-navy/15 shadow-xs shrink-0 select-none"
              role="group"
              aria-label="Toggle pin style"
            >
              <button
                type="button"
                onClick={() => handleTogglePinStyle('custom')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pinStyle === 'custom'
                    ? 'bg-navy text-[#FFD500] shadow-xs'
                    : 'text-navy/60 hover:text-navy hover:bg-slate-100'
                }`}
                title="Custom Dive Goggles Pin"
                aria-pressed={pinStyle === 'custom'}
              >
                <img
                  src={pinIconUrl}
                  alt=""
                  className="w-3.5 h-2 object-contain"
                  aria-hidden="true"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = localPinIconUrl
                  }}
                />
                <span>Custom Pin</span>
              </button>
              <button
                type="button"
                onClick={() => handleTogglePinStyle('red')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pinStyle === 'red'
                    ? 'bg-navy text-rose-400 shadow-xs'
                    : 'text-navy/60 hover:text-navy hover:bg-slate-100'
                }`}
                title="Normal Red Drop Pin"
                aria-pressed={pinStyle === 'red'}
              >
                <svg
                  width="11"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />
                  <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
                </svg>
                <span>Red Pin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Map Container */}
        <div
          className="relative w-full h-[400px] xs:h-[460px] sm:h-[540px] lg:h-[600px] bg-[#1a75bb] overflow-hidden normal-cursor"
          data-normal-cursor
          data-dive-map="true"
          data-lenis-prevent="true"
          style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
        >
          {/* MapLibre Canvas Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-full normal-cursor"
            style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
            data-normal-cursor
            data-dive-map="true"
            data-lenis-prevent="true"
          />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 border-4 border-navy border-t-accent rounded-full animate-spin mb-3" />
              <h4 className="font-heading text-sm font-bold text-navy">Loading Dive Map...</h4>
              <p className="text-xs text-navy/60 mt-1">Reading 3,500+ coordinates from dataset</p>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold mb-3">!</div>
              <h4 className="font-heading text-base font-bold text-navy">Could Not Load Map</h4>
              <p className="text-xs text-rose-600 max-w-md mt-1">{error}</p>
            </div>
          )}

          {/* 3-Tier Floating Breadcrumbs & Indicators */}

          {/* Tier 1: World Overview */}
          {!selectedCountry && !searchQuery && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-navy/15 shadow-sm text-[11px] font-bold text-navy max-w-[calc(100%-4.5rem)]">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping shrink-0" />
              <span className="truncate">Tap any country to explore its islands</span>
            </div>
          )}

          {/* Tier 2: Inside Country (Showing Islands & Mainland) */}
          {selectedCountry && !selectedIsland && !searchQuery && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 bg-navy/95 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-float border border-white/20 animate-in fade-in max-w-[calc(100%-4.5rem)]">
              <button
                type="button"
                onClick={handleResetWorldView}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-accent hover:text-navy text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                title="Return to world overview"
              >
                <span>← All Countries</span>
              </button>
              <div className="h-3.5 w-px bg-white/20 shrink-0" />
              <div className="text-xs font-semibold truncate text-white/95">
                <span className="hidden sm:inline">Showing </span>
                <strong className="text-accent">{availableIslands.length}</strong> islands in <strong className="text-white">{selectedCountry}</strong>
                <span className="hidden md:inline text-white/70"> • Tap an island to view dive sites</span>
              </div>
            </div>
          )}

          {/* Tier 3: Inside Island (Showing Individual Dive Sites) */}
          {selectedCountry && selectedIsland && !searchQuery && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 bg-navy/95 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-float border border-white/20 animate-in fade-in max-w-[calc(100%-4.5rem)]">
              <button
                type="button"
                onClick={handleReturnToCountryIslands}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-accent text-navy hover:bg-white text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                title="Return to country islands"
              >
                <span>← Back to Islands</span>
              </button>
              <button
                type="button"
                onClick={handleResetWorldView}
                className="hidden xs:inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-white/15 hover:bg-white hover:text-navy text-xs font-medium transition active:scale-95 cursor-pointer shrink-0"
                title="Return to world overview"
              >
                <span>World</span>
              </button>
              <div className="h-3.5 w-px bg-white/20 shrink-0" />
              <div className="text-xs font-semibold truncate text-white/95">
                <strong className="text-accent">{countrySitesGeoJSON.features.length}</strong> sites on <strong className="text-white">{selectedIsland}</strong>
              </div>
            </div>
          )}

          {/* Search Query Results Banner */}
          {searchQuery && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 bg-navy/95 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-float border border-white/20 animate-in fade-in max-w-[calc(100%-4.5rem)]">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-accent hover:text-navy text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                title="Clear search"
              >
                <span>✕ Clear Search</span>
              </button>
              <div className="h-3.5 w-px bg-white/20 shrink-0" />
              <div className="text-xs font-semibold truncate text-white/95">
                Found <strong className="text-accent">{countrySitesGeoJSON.features.length}</strong> sites matching &quot;{searchQuery}&quot;
              </div>
            </div>
          )}

          {/* Hover Tooltip */}
          {tooltipInfo && !activeSite && (
            <div
              className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-navy/95 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-white/20 whitespace-nowrap"
              style={{ left: `${tooltipInfo.x}px`, top: `${tooltipInfo.y}px` }}
            >
              <div className="font-bold text-[#FFCD00]">{tooltipInfo.name}</div>
              {tooltipInfo.subtitle && (
                <div className="text-[10px] text-white/80 mt-0.5">{tooltipInfo.subtitle}</div>
              )}
            </div>
          )}

          {/* Recenter & Reset Buttons */}
          <div className="absolute bottom-5 left-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={selectedIsland ? handleReturnToCountryIslands : handleResetWorldView}
              className="w-10 h-10 rounded-full bg-white text-navy shadow-float border border-navy/15 flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md hover:bg-slate-50"
              title={selectedIsland ? 'Back to Islands' : 'Reset Map / Recenter'}
              aria-label={selectedIsland ? 'Back to Islands' : 'Reset Map'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="2" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-5 right-4 z-10">
            <button
              type="button"
              onClick={handleResetWorldView}
              className="w-10 h-10 rounded-full bg-[#001e3d] text-white shadow-float flex items-center justify-center transition active:scale-95 cursor-pointer hover:bg-navy"
              title="World View"
              aria-label="World View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </button>
          </div>

          {/* Selected Dive Site Drawer / Detail Card */}
          {activeSite && (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-white/98 backdrop-blur-xl rounded-3xl border border-navy/15 p-4 sm:p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                    {activeSite.island ? `${activeSite.island} • ` : ''}{activeSite.country}
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-navy leading-snug mt-0.5">
                    {activeSite.siteName}
                  </h3>
                  {activeSite.naturalTypes && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-navy/5 text-navy border border-navy/10">
                      {activeSite.naturalTypes}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSite(null)}
                  className="w-7 h-7 rounded-full bg-navy/10 hover:bg-navy hover:text-white text-navy flex items-center justify-center text-xs font-bold transition shrink-0 cursor-pointer"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3.5 flex items-center gap-2">
                {onBookSite && (
                  <button
                    type="button"
                    onClick={() => {
                      onBookSite(activeSite)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-accent text-navy px-4 py-2 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer active:scale-95 hover:bg-accent/90"
                  >
                    <span>Select for Booking</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReturnToCountryIslands}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-navy/10 hover:bg-navy hover:text-white text-navy px-3.5 py-2 text-xs font-bold transition cursor-pointer active:scale-95"
                  title="View all islands in this country"
                >
                  <span>Islands</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dataset Attribution Footer */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-navy/10 flex items-center justify-between text-[10px] text-navy/60 font-semibold">
          <span>Source: Local dive site dataset (3,518 verified coordinates in 101 countries)</span>
          <span className="text-navy/40">OpenFreeMap Liberty • MapLibre GL</span>
        </div>
      </div>
    </div>
  )
}
