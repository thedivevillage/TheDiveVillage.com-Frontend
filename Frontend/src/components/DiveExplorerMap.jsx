import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Map, setWorkerUrl, NavigationControl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { loadDiveSites } from '../utils/diveSitesLoader'
import { getIslandForSite } from '../utils/diveIslandCatalog'

import pinIconUrl from '../assets/pin.png'

// Official Vite worker setup for MapLibre GL JS
setWorkerUrl(workerUrl)

const DEFAULT_CENTER = [15, 20]
const DEFAULT_ZOOM = 1.8

// Preload the yellow dive goggles pin icon from assets/pin.png (#FFD500)
let preloadedPinImg = null
const preloadPinImage = () => {
  if (preloadedPinImg && preloadedPinImg.complete && preloadedPinImg.naturalWidth > 0) {
    return Promise.resolve(preloadedPinImg)
  }
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      preloadedPinImg = img
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = pinIconUrl
    if (img.complete && img.naturalWidth > 0) {
      preloadedPinImg = img
      resolve(img)
    }
  })
}

// Trigger preload immediately in browser environment
if (typeof window !== 'undefined') {
  preloadPinImage()
}

/**
 * Generates a crisp #FFD500 yellow dive goggles pin icon from assets/pin.png for MapLibre WebGL.
 * Features a subtle dark drop shadow so it pops cleanly over both deep blue ocean and light coastlines.
 */
function createDiveGogglesPinIcon(img, width = 30, height = 17) {
  const dpr = 2
  const pad = 3
  const canvas = document.createElement('canvas')
  canvas.width = (width + pad * 2) * dpr
  canvas.height = (height + pad * 2) * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // Soft dark drop shadow for maximum crispness and depth against any basemap background
  ctx.shadowColor = 'rgba(0, 15, 30, 0.75)'
  ctx.shadowBlur = 3
  ctx.shadowOffsetY = 1.5

  ctx.drawImage(img, pad, pad, width, height)

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
  // Start from right tangent, draw arc over top to left tangent (counter-clockwise)
  ctx.arc(cx, cy, r, Math.PI / 2 - alpha, Math.PI / 2 + alpha, true)
  // Straight line down to pointed tip
  ctx.lineTo(cx, tipY)
  ctx.closePath()

  // 3. Rich red gradient fill (classic map drop pin lighting)
  const grad = ctx.createLinearGradient(cx - r, padTop, cx + r, tipY)
  grad.addColorStop(0, '#FF4D4D')
  grad.addColorStop(0.5, '#EA3838')
  grad.addColorStop(1, '#C62828')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  // 4. Clean white border for contrast against ocean blue and terrain
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
  selectedCountry: controlledCountry = undefined,
  selectedIsland = null,
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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allSites, setAllSites] = useState([])
  const [countryCentroids, setCountryCentroids] = useState([])
  const [geojsonCountries, setGeojsonCountries] = useState({ type: 'FeatureCollection', features: [] })
  const [countriesList, setCountriesList] = useState([])
  // Two-tier navigation state:
  // selectedCountry === null -> World overview (country badges visible)
  // selectedCountry !== null -> Country zoom view (individual dive site points visible)
  const [selectedCountry, setSelectedCountry] = useState(null)
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
    if (!map || !map.isStyleLoaded()) return
    const countryIcon = newStyle === 'red' ? 'country-pin-red' : 'country-pin-custom'
    const siteIcon = newStyle === 'red' ? 'site-pin-red' : 'site-pin-custom'
    try {
      if (map.getLayer('country-pin')) {
        map.setLayoutProperty('country-pin', 'icon-image', countryIcon)
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
  const countrySitesGeoJSONRef = useRef({ type: 'FeatureCollection', features: [] })
  const selectedCountryRef = useRef(selectedCountry)
  const searchQueryRef = useRef(searchQuery)
  const countriesListRef = useRef(countriesList)
  const onSelectCountryRef = useRef(onSelectCountry)
  const onSelectSiteRef = useRef(onSelectSite)
  const onBookSiteRef = useRef(onBookSite)

  geojsonCountriesRef.current = geojsonCountries
  countryCentroidsRef.current = countryCentroids
  selectedCountryRef.current = selectedCountry
  searchQueryRef.current = searchQuery
  countriesListRef.current = countriesList
  onSelectCountryRef.current = onSelectCountry
  onSelectSiteRef.current = onSelectSite
  onBookSiteRef.current = onBookSite

  // Unified helper: camera zoom to country with guaranteed minZoom & bounds handling
  const zoomToCountry = useCallback((countryName, clickedLngLat = null) => {
    const map = mapRef.current
    if (!map || !countryName) return

    // If map style is still loading, wait for load event
    if (!map.loaded()) {
      map.once('load', () => {
        zoomToCountry(countryName, clickedLngLat)
      })
      return
    }

    const canonicalCountry = findMatchingCountry(countryName, countriesListRef.current) || countryName
    const countryData = countryCentroidsRef.current.find(
      (c) => cleanCountryName(c.country) === cleanCountryName(canonicalCountry)
    )

    if (!countryData) {
      if (clickedLngLat) {
        map.flyTo({
          center: [clickedLngLat.lng ?? clickedLngLat[0], clickedLngLat.lat ?? clickedLngLat[1]],
          zoom: 6.5,
          duration: 1200,
        })
      }
      return
    }

    // Check bounds
    if (countryData.bounds && Array.isArray(countryData.bounds) && countryData.bounds.length === 2) {
      const [sw, ne] = countryData.bounds
      const dLng = Math.abs(ne[0] - sw[0])
      const dLat = Math.abs(ne[1] - sw[1])

      // Single-site or zero-area bounding box (e.g. Libya, Iran, Russia, Romania, Senegal)
      if (dLng < 0.05 && dLat < 0.05) {
        map.flyTo({
          center: [sw[0], sw[1]],
          zoom: 7.5,
          duration: 1200,
        })
        return
      }

      // Very wide territory spanning oceans (e.g. USA with Hawaii, huge archipelago)
      if (dLng > 65) {
        const centerCoord = clickedLngLat
          ? [clickedLngLat.lng ?? clickedLngLat[0], clickedLngLat.lat ?? clickedLngLat[1]]
          : [countryData.longitude, countryData.latitude]
        map.flyTo({
          center: centerCoord,
          zoom: 5.2,
          duration: 1200,
        })
        return
      }

      // Normal multi-site country: compute camera ensuring minZoom >= 4.5
      try {
        const camera = map.cameraForBounds(countryData.bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 8.5,
        })
        if (camera && camera.center) {
          const clampedZoom = Math.max(4.5, Math.min(8.5, camera.zoom))
          const centerCoord = [
            camera.center.lng ?? (Array.isArray(camera.center) ? camera.center[0] : countryData.longitude),
            camera.center.lat ?? (Array.isArray(camera.center) ? camera.center[1] : countryData.latitude),
          ]
          map.flyTo({
            center: centerCoord,
            zoom: clampedZoom,
            duration: 1200,
          })
          return
        }
      } catch (err) {
        console.warn('[DiveExplorer] cameraForBounds notice:', err)
      }

      map.fitBounds(countryData.bounds, {
        padding: 60,
        maxZoom: 8.5,
        duration: 1200,
      })
      return
    }

    // Fallback if no bounds: center on centroid
    map.flyTo({
      center: [countryData.longitude, countryData.latitude],
      zoom: 6.8,
      duration: 1200,
    })
  }, [])

  // Two-tier navigation trigger (World View -> Specific Country)
  const navigateToCountry = useCallback((rawCountryName, clickedLngLat = null) => {
    if (!rawCountryName) return
    const canonical = findMatchingCountry(rawCountryName, countriesListRef.current) || rawCountryName

    setSelectedCountry(canonical)
    selectedCountryRef.current = canonical
    setActiveSite(null)
    setTooltipInfo(null)
    if (onSelectCountryRef.current) onSelectCountryRef.current(canonical)

    zoomToCountry(canonical, clickedLngLat)
  }, [zoomToCountry])

  const navigateToCountryRef = useRef(navigateToCountry)
  navigateToCountryRef.current = navigateToCountry
  const zoomToCountryRef = useRef(zoomToCountry)
  zoomToCountryRef.current = zoomToCountry

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
      if (map.getLayer('site-pin')) {
        map.setLayoutProperty('site-pin', 'icon-image', siteIcon)
      }
    } catch (e) {
      console.warn('[DiveExplorer] Pin style sync error:', e)
    }
  }, [pinStyle])

  // 1. Load CSV data on mount
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
    const filtered = allSites.filter((site) => {
      // Must match selected country if active
      if (selectedCountry && site.country?.trim().toLowerCase() !== selectedCountry.trim().toLowerCase()) {
        return false
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
  }, [allSites, selectedCountry, searchQuery])

  countrySitesGeoJSONRef.current = countrySitesGeoJSON

  useEffect(() => {
    countrySitesGeoJSONRef.current = countrySitesGeoJSON
  }, [countrySitesGeoJSON])

  // Helper: Synchronize MapLibre sources and layer visibilities safely
  const syncMapData = useCallback((mapInstance) => {
    const map = mapInstance || mapRef.current
    if (!map || !map.isStyleLoaded()) return

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

      if (map.getLayer('country-pin')) {
        map.setLayoutProperty('country-pin', 'visibility', countryVis)
      }
      if (map.getLayer('country-polygons-fill')) {
        map.setLayoutProperty('country-polygons-fill', 'visibility', countryVis)
      }
      if (map.getLayer('country-polygons-stroke')) {
        map.setLayoutProperty('country-polygons-stroke', 'visibility', countryVis)
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

  // 3. Initialize MapLibre GL Map with OpenFreeMap Liberty Style
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
        clickTolerance: 12, // Critical for mobile touch - prevents natural finger drift from cancelling single tap!
        attributionControl: true,
        renderWorldCopies: true,
        dragRotate: false,
        touchPitch: false,
        scrollZoom: false,
      })

      mapRef.current = map

      // Ensure touchPitch, rotation, and scrollZoom are disabled so 2-finger gestures move the map cleanly
      if (map.touchPitch) map.touchPitch.disable()
      if (map.touchZoomRotate) map.touchZoomRotate.disableRotation()
      if (map.scrollZoom) map.scrollZoom.disable()

      // Add navigation controls
      map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'top-right')

      // Handle missing image dynamically as safety guard
      map.on('styleimagemissing', async (e) => {
        const id = e.id
        if (id === 'country-pin-custom' || id === 'country-pin-icon') {
          const pinImg = await preloadPinImage()
          if (pinImg && !map.hasImage(id)) {
            map.addImage(id, createDiveGogglesPinIcon(pinImg, 30, 17), { pixelRatio: 2 })
          }
        } else if (id === 'site-pin-custom' || id === 'site-pin-icon') {
          const pinImg = await preloadPinImage()
          if (pinImg && !map.hasImage(id)) {
            map.addImage(id, createDiveGogglesPinIcon(pinImg, 22, 12.5), { pixelRatio: 2 })
          }
        } else if (id === 'country-pin-red') {
          if (!map.hasImage(id)) {
            map.addImage(id, createRedDropPinIcon(18, 25), { pixelRatio: 2 })
          }
        } else if (id === 'site-pin-red') {
          if (!map.hasImage(id)) {
            map.addImage(id, createRedDropPinIcon(14, 20), { pixelRatio: 2 })
          }
        }
      })

      map.on('load', async () => {
        if (isCancelled) return

        mapRef.current = map

        // 1. Force English ONLY on all basemap place names & ensure clean Havelock Island name (removes "Swaraj Dweep / Swarajdeep")
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
            map.addLayer({
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
                  12, 2.2
                ],
                'line-opacity': 0.75,
              },
            }, 'waterway_line_label')
          }
        } catch (e) {
          console.warn('[DiveExplorer] Water styling notice:', e)
        }

        // 3. Register pin icons: both custom #FFD500 yellow dive goggles and classic red drop pins
        try {
          const pinImg = await preloadPinImage()
          if (pinImg) {
            if (!map.hasImage('country-pin-custom')) {
              map.addImage('country-pin-custom', createDiveGogglesPinIcon(pinImg, 30, 17), { pixelRatio: 2 })
            }
            if (!map.hasImage('site-pin-custom')) {
              map.addImage('site-pin-custom', createDiveGogglesPinIcon(pinImg, 22, 12.5), { pixelRatio: 2 })
            }
            // Backwards-compatible aliases
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

          // Register classic red drop pins
          if (!map.hasImage('country-pin-red')) {
            map.addImage('country-pin-red', createRedDropPinIcon(18, 25), { pixelRatio: 2 })
          }
          if (!map.hasImage('site-pin-red')) {
            map.addImage('site-pin-red', createRedDropPinIcon(14, 20), { pixelRatio: 2 })
          }
        } catch (e) {
          console.warn('[DiveExplorer] Icon registration notice:', e)
        }

        const initialCountryIcon = pinStyleRef.current === 'red' ? 'country-pin-red' : 'country-pin-custom'
        const initialSiteIcon = pinStyleRef.current === 'red' ? 'site-pin-red' : 'site-pin-custom'

        // ----------------------------------------------------
        // SOURCE 0: Country Boundary Polygons (World Overview)
        // ----------------------------------------------------
        map.addSource('countries-polygons-source', {
          type: 'geojson',
          data: '/data/countries.geojson',
        })

        // Subtle interactive country boundary fill (captures taps/clicks anywhere on land)
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

        // ----------------------------------------------------
        // SOURCE 1: Country Centroid Points (World Overview)
        // ----------------------------------------------------
        map.addSource('country-centroids-source', {
          type: 'geojson',
          data: geojsonCountriesRef.current,
        })

        // 1. Main Country Pin (Custom Goggles or Red Drop Pin with White Border Halo Text)
        map.addLayer({
          id: 'country-pin',
          type: 'symbol',
          source: 'country-centroids-source',
          layout: {
            'icon-image': initialCountryIcon,
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
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
              'interpolate',
              ['linear'],
              ['zoom'],
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
        // SOURCE 2: Individual Dive Sites (Country Zoom View)
        // ----------------------------------------------------
        map.addSource('dive-sites-source', {
          type: 'geojson',
          data: countrySitesGeoJSONRef.current,
        })

        // 2. Individual Dive Site Location Pin (Smaller Custom Goggles or Red Drop Pin)
        map.addLayer({
          id: 'site-pin',
          type: 'symbol',
          source: 'dive-sites-source',
          layout: {
            'icon-image': initialSiteIcon,
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4.0, 0.65,
              7.5, 0.90,
              10.5, 1.20,
              13.5, 1.50,
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'text-field': ['get', 'siteName'],
            'text-font': ['Noto Sans Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4.0, 8.0,
              8.0, 9.5,
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
        // INTERACTION HANDLERS: Country Click & Hover
        // ----------------------------------------------------
        // A) Direct tap / click on country pin marker
        map.on('click', 'country-pin', (e) => {
          if (!e.features || !e.features.length) return
          if (e.originalEvent) e.originalEvent._countryHandled = true
          const p = e.features[0].properties
          if (navigateToCountryRef.current && p?.country) {
            navigateToCountryRef.current(p.country, e.lngLat)
          }
        })

        // B) Direct tap / click anywhere on country landmass polygon
        map.on('click', 'country-polygons-fill', (e) => {
          if (!e.features || !e.features.length) return
          if (e.originalEvent) e.originalEvent._countryHandled = true
          const p = e.features[0].properties || {}
          const candidate = p.name_long || p.name || p.admin || p.sovereignt || p.formal_en
          const matched = findMatchingCountry(candidate, countriesListRef.current)
          if (matched && navigateToCountryRef.current) {
            navigateToCountryRef.current(matched, e.lngLat)
          }
        })

        // C) Comprehensive single-tap detection:
        // Catches touches near pins, on basemap country text labels, and near islands
        map.on('click', (e) => {
          if (e.originalEvent?._countryHandled) return
          // If already in country-specific view or searching, dive site clicks are handled by site-pin
          if (selectedCountryRef.current || searchQueryRef.current) return

          // 1. Touch hit box (24px padding around tap)
          const pad = 24
          const bbox = [
            [e.point.x - pad, e.point.y - pad],
            [e.point.x + pad, e.point.y + pad],
          ]

          // Check country-pin hit within touch radius
          const pinFeatures = map.queryRenderedFeatures(bbox, { layers: ['country-pin'] })
          if (pinFeatures.length > 0 && pinFeatures[0].properties?.country) {
            if (navigateToCountryRef.current) {
              navigateToCountryRef.current(pinFeatures[0].properties.country, e.lngLat)
            }
            return
          }

          // Check country polygon fill
          const polyFeatures = map.queryRenderedFeatures(e.point, { layers: ['country-polygons-fill'] })
          if (polyFeatures.length > 0) {
            const p = polyFeatures[0].properties || {}
            const candidate = p.name_long || p.name || p.admin || p.sovereignt || p.formal_en
            const matched = findMatchingCountry(candidate, countriesListRef.current)
            if (matched && navigateToCountryRef.current) {
              navigateToCountryRef.current(matched, e.lngLat)
              return
            }
          }

          // Check basemap place country/state labels
          const labelLayers = ['label_country_1', 'label_country_2', 'label_country_3', 'label_state'].filter(
            (id) => map.getLayer(id)
          )
          if (labelLayers.length > 0) {
            const labelFeatures = map.queryRenderedFeatures(bbox, { layers: labelLayers })
            for (const feat of labelFeatures) {
              const p = feat.properties || {}
              const candidate = p['name:en'] || p.name_en || p.name || p['name:latin']
              const matched = findMatchingCountry(candidate, countriesListRef.current)
              if (matched && navigateToCountryRef.current) {
                navigateToCountryRef.current(matched, e.lngLat)
                return
              }
            }
          }

          // Island & proximity fallback: if tap landed in ocean near an island country (within 65px on screen)
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
            navigateToCountryRef.current(closestCountry, e.lngLat)
          }
        })

        // Desktop hover handlers: guarded so they NEVER trigger on touch devices (pointer: coarse)
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
                subtitle: cData ? `${cData.count} Dive Sites • Click to explore` : 'Click to explore',
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
              subtitle: `${p.count} Dive Sites • Click to explore`,
            })
          }
        })
        map.on('mouseleave', 'country-pin', () => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = ''
          setTooltipInfo(null)
        })

        // ----------------------------------------------------
        // INTERACTION HANDLERS: Individual Site Click & Hover
        // ----------------------------------------------------
        map.on('click', 'site-pin', (e) => {
          if (!e.features || !e.features.length) return
          const p = e.features[0].properties
          const coords = e.features[0].geometry.coordinates
          const site = {
            id: p.id,
            siteName: p.siteName,
            country: p.country,
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
              subtitle: p.naturalTypes ? p.naturalTypes : p.country,
            })
          }
        })
        map.on('mouseleave', 'site-pin', () => {
          if (window.matchMedia('(pointer: coarse)').matches) return
          map.getCanvas().style.cursor = ''
          setTooltipInfo(null)
        })

        // Initial sync of layers and data
        if (syncMapDataRef.current) {
          syncMapDataRef.current(map)
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

  // 3b. Two-finger Pan & Zoom Navigation (Trackpad 2-finger move & Touchscreen 2-finger drag)
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

    // --- A) TRACKPAD 2-FINGER PAN & PINCH ZOOM / MOUSE WHEEL ---
    const handleWheel = (e) => {
      // Prevent browser from scrolling the webpage while interacting with the map
      e.preventDefault()
      e.stopPropagation()

      const map = mapRef.current
      if (!map) return

      // 1. Pinch-to-zoom on trackpad (or Ctrl + mouse wheel)
      // Browsers set e.ctrlKey to true when the user pinches on a laptop touchpad
      if (e.ctrlKey) {
        const zoomDelta = -e.deltaY * 0.008
        const currentZoom = map.getZoom()
        const targetZoom = Math.min(Math.max(currentZoom + zoomDelta, map.getMinZoom()), map.getMaxZoom())
        const rect = container.getBoundingClientRect()
        const anchor = map.unproject([e.clientX - rect.left, e.clientY - rect.top])
        map.zoomTo(targetZoom, { around: anchor, duration: 0 })
        return
      }

      // 2. Trackpad detection (pixel mode deltaMode === 0, horizontal delta, continuous stream, or small/fractional values)
      const isTrackpad =
        e.deltaMode === 0 &&
        (Math.abs(e.deltaX) > 0 ||
          !Number.isInteger(e.deltaY) ||
          Math.abs(e.deltaY) < 60 ||
          Date.now() - lastTrackpadStreamTime < 300)

      if (isTrackpad) {
        lastTrackpadStreamTime = Date.now()
        // Two fingers moving up, down, left, or right -> PAN THE MAP!
        map.panBy([e.deltaX, e.deltaY], { duration: 0 })
        return
      }

      // 3. Discrete physical mouse wheel notch: smooth zoom centered at cursor
      const zoomStep = e.deltaY < 0 ? 0.35 : -0.35
      const currentZoom = map.getZoom()
      const targetZoom = Math.min(Math.max(currentZoom + zoomStep, map.getMinZoom()), map.getMaxZoom())
      const rect = container.getBoundingClientRect()
      const anchor = map.unproject([e.clientX - rect.left, e.clientY - rect.top])
      map.zoomTo(targetZoom, { around: anchor, duration: 150 })
    }

    // --- B) TOUCHSCREEN 2-FINGER PAN & PINCH ZOOM ---
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
        // Prevent browser page from scrolling or pinch-zooming while two fingers move on map
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

          // 1. Two fingers moving up, down, left, or right -> PAN THE MAP!
          if (dx !== 0 || dy !== 0) {
            map.panBy([-dx, -dy], { duration: 0 })
          }

          // 2. Pinch zoom if distance between the two fingers changes
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

  // 4. Reactive updates when data, country, or search filters change
  useEffect(() => {
    syncMapData()
  }, [geojsonCountries, countrySitesGeoJSON, selectedCountry, searchQuery, syncMapData])

  // 5. External controlledCountry synchronization (Booking Form -> Map)
  useEffect(() => {
    if (controlledCountry === undefined) return
    const target = controlledCountry ? controlledCountry.trim() : null
    const current = selectedCountry ? selectedCountry.trim() : null
    if ((target || '').toLowerCase() !== (current || '').toLowerCase()) {
      setSelectedCountry(target)
      selectedCountryRef.current = target
      setActiveSite(null)

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

  // 5b. External selectedIsland synchronization (Booking Form -> Map)
  useEffect(() => {
    if (!selectedIsland || controlledSite || selectedSiteId || allSites.length === 0 || !mapRef.current) return
    const countryToUse = selectedCountry || controlledCountry
    if (!countryToUse) return

    const islandSites = allSites.filter(
      (s) => s.country && s.country.toLowerCase() === countryToUse.toLowerCase() && getIslandForSite(s) === selectedIsland
    )
    if (islandSites.length === 0) return

    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
    islandSites.forEach((s) => {
      const lng = parseFloat(s.longitude)
      const lat = parseFloat(s.latitude)
      if (!isNaN(lng) && !isNaN(lat)) {
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    })

    if (minLng !== Infinity) {
      if (minLng === maxLng && minLat === maxLat) {
        mapRef.current.flyTo({ center: [minLng, minLat], zoom: 9.5, duration: 1000 })
      } else {
        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 10.5, duration: 1200 }
        )
      }
    }
  }, [selectedIsland, selectedCountry, controlledCountry, controlledSite, selectedSiteId, allSites])

  // 6. External controlledSite / selectedSiteId synchronization (Booking Form -> Map)
  useEffect(() => {
    const query = controlledSite || selectedSiteId
    if (!query || allSites.length === 0) return

    const strQuery = typeof query === 'string' ? query.trim() : ''
    if (!strQuery) return

    const cleanQuery = strQuery.toLowerCase()
    const prefixWord = strQuery.includes('(') ? strQuery.split('(')[0].trim().toLowerCase() : ''
    const insideParen = strQuery.includes('(') && strQuery.includes(')') ? strQuery.split('(')[1].split(')')[0].trim().toLowerCase() : ''

    // 1. Check exact ID match
    let match = allSites.find((s) => s.id === query)

    // 2. Search in current country first
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

    // 3. Fallback search across all sites
    if (!match) {
      match = allSites.find((s) => s.siteName.toLowerCase() === cleanQuery) ||
        allSites.find((s) => s.siteName.toLowerCase().includes(cleanQuery)) ||
        (prefixWord && allSites.find((s) => s.siteName.toLowerCase().includes(prefixWord))) ||
        (insideParen && allSites.find((s) => s.siteName.toLowerCase().includes(insideParen)))
    }

    if (match && mapRef.current) {
      if (match.country && match.country.toLowerCase() !== (selectedCountry || '').toLowerCase()) {
        setSelectedCountry(match.country)
        if (onSelectCountry) onSelectCountry(match.country)
      }
      setActiveSite(match)
      mapRef.current.flyTo({
        center: [match.longitude, match.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 9.2),
        duration: 1000,
      })
    }
  }, [controlledSite, selectedSiteId, allSites, selectedCountry, onSelectCountry])

  // Return to World Overview (show all countries)
  const handleResetWorldView = useCallback(() => {
    setSelectedCountry(null)
    selectedCountryRef.current = null
    setSearchQuery('')
    searchQueryRef.current = ''
    setActiveSite(null)
    if (onSelectCountryRef.current) onSelectCountryRef.current('')
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 1000,
      })
    }
  }, [])

  // When a user picks a country from the dropdown
  const handleDropdownCountryChange = (c) => {
    if (c === 'all' || !c) {
      handleResetWorldView()
      return
    }
    navigateToCountry(c)
  }

  // Count of currently visible items
  const activeCountryStats = useMemo(() => {
    if (!selectedCountry) return null
    return countryCentroids.find((c) => c.country?.toLowerCase() === selectedCountry.toLowerCase()) || null
  }, [selectedCountry, countryCentroids])

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

        {/* Mobile Country selector + Pin Toggle Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-0">
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
              <img src={pinIconUrl} alt="" className="w-3.5 h-2 object-contain" />
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
        {/* Optional Header Banner (Desktop Only) */}
        {showHeading && (
          <div className="hidden sm:flex px-5 py-4 sm:px-7 sm:py-5 border-b border-navy/10 bg-white flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Worldwide 2D Map</span>
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

        {/* Desktop Control Bar: Search & Country / Natural Type Filters */}
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

          {/* Dropdowns & Filter Controls (Desktop Only) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Country Filter */}
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

            {/* Pin Style Toggle Switch (Replaces 101 countries / 3,451 dive sites badge) */}
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

          {/* Level 2 Floating Banner: When inside a specific country */}
          {selectedCountry && (
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
                <strong className="text-accent">{countrySitesGeoJSON.features.length}</strong> sites in <strong className="text-white">{selectedCountry}</strong>
              </div>
            </div>
          )}

          {/* World View Guidance Banner (when at country level) */}
          {!selectedCountry && !searchQuery && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-navy/15 shadow-sm text-[11px] font-bold text-navy max-w-[calc(100%-4.5rem)]">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping shrink-0" />
              <span className="truncate">Tap any country to explore its dive sites</span>
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

          {/* Floating Controls inside Map (Matching mockup: crosshair on left, map on right) */}
          <div className="absolute bottom-5 left-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResetWorldView}
              className="w-10 h-10 rounded-full bg-white text-navy shadow-float border border-navy/15 flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md"
              title="Reset Map / Recenter"
              aria-label="Reset Map"
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
              className="w-10 h-10 rounded-full bg-[#001e3d] text-white shadow-float flex items-center justify-center transition active:scale-95 cursor-pointer"
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
                    {activeSite.country}
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-navy leading-snug mt-0.5">
                    {activeSite.siteName}
                  </h3>
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

              {/* Return to World Map Button */}
              <button
                type="button"
                onClick={handleResetWorldView}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-navy hover:bg-accent text-white hover:text-navy px-4 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <span>Return to World Map</span>
              </button>
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
