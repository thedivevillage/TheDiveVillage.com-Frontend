import { useEffect, useRef, useState, useCallback } from 'react'
import { COUNTRY_CENTROIDS } from '../data/countryCentroids'
import { diveSiteService, getLocationDisplayName, normalizeCountryKey } from '../services/diveSiteService'
import { getDiveSiteImage, getDiveSiteCreatureInfo } from '../data/diveSiteImages'
import { loadCesium } from '../services/cesiumLoader'
import pinIconUrl from '../assets/pin.png'

// Memoization cache for generated marker SVG data URIs
const svgCache = new Map()

// Generate billboard pin for countries and dive locations from assets/pin.png (#FFD500 yellow)
const createSitePinSvg = (_isSelected = false, _isDimmed = false) => {
  return pinIconUrl
}

export default function InteractiveDiveMap({
  selectedCountry = '',
  countryLocations = [],
  selectedLocation = null,
  onLocationSelect,
  onCountrySelect
}) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const isCesiumReady = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [popupSite, setPopupSite] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const tooltipRef = useRef(null)
  const popupRef = useRef(null)
  const popupSiteRef = useRef(null)
  const isPopupOpenRef = useRef(false)

  const countryLocationsRef = useRef(countryLocations)
  const selectedLocationRef = useRef(selectedLocation)
  const selectedCountryRef = useRef(selectedCountry)
  const onLocationSelectRef = useRef(onLocationSelect)
  const onCountrySelectRef = useRef(onCountrySelect)
  const isProgrammaticFlightRef = useRef(false)
  const isUserInteractingRef = useRef(false)
  const lastInteractionTimeRef = useRef(Date.now())

  const prevCountryRef = useRef(selectedCountry)
  const lastFramedCountryKeyRef = useRef(null)
  const prevLocationIdRef = useRef(selectedLocation?.id ?? null)

  const activeCountryTransactionRef = useRef(0)
  const cameraTransactionVersionRef = useRef(0)

  countryLocationsRef.current = countryLocations
  selectedLocationRef.current = selectedLocation
  selectedCountryRef.current = selectedCountry
  onLocationSelectRef.current = onLocationSelect
  onCountrySelectRef.current = onCountrySelect
  popupSiteRef.current = popupSite
  isPopupOpenRef.current = isPopupOpen

  // Deterministic camera view to Global Overview
  const flyToGlobalOverview = useCallback(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium) return

    const currentVersion = ++cameraTransactionVersionRef.current
    try {
      viewer.camera.cancelFlight()
    } catch {}

    isProgrammaticFlightRef.current = true
    try {
      viewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(80.0, 15.0, 11500000),
        orientation: {
          heading: 0.0,
          pitch: window.Cesium.Math.toRadians(-90),
          roll: 0.0
        },
        duration: 2.4,
        complete: () => {
          if (currentVersion === cameraTransactionVersionRef.current) {
            isProgrammaticFlightRef.current = false
          }
        },
        cancel: () => {
          if (currentVersion === cameraTransactionVersionRef.current) {
            isProgrammaticFlightRef.current = false
          }
        }
      })
    } catch (err) {
      console.warn('Camera overview flight notice:', err)
      isProgrammaticFlightRef.current = false
    }
  }, [])

  // Reset globe view and clear selection
  const handleResetGlobe = useCallback((e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    lastFramedCountryKeyRef.current = null
    setIsPopupOpen(false)
    setPopupSite(null)
    if (popupRef.current) {
      popupRef.current.style.display = 'none'
    }
    onLocationSelectRef.current?.(null)
    onCountrySelectRef.current?.('')
    flyToGlobalOverview()
  }, [flyToGlobalOverview])

  // Dateline-safe longitude and bounds calculator for country camera framing
  const getCountryCameraTarget = useCallback((countryName, locs) => {
    const cKey = normalizeCountryKey(countryName)
    if (!cKey) return null

    // Filter and validate locations belonging strictly to this canonical country
    const validLocs = (locs || []).filter((l) => {
      if (!l) return false
      const lat = Number(l.latitude)
      const lon = Number(l.longitude)
      if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return false
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false
      const lKey = normalizeCountryKey(l.country)
      if (lKey && lKey !== cKey) return false
      return true
    })

    if (validLocs.length > 0) {
      const lats = validLocs.map((l) => Number(l.latitude))
      const lons = validLocs.map((l) => Number(l.longitude))
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const latSpan = maxLat - minLat
      const centerLat = (minLat + maxLat) / 2

      let centerLon = 0
      let lonSpan = 0

      if (validLocs.length === 1) {
        centerLon = lons[0]
        lonSpan = 0
      } else {
        const sortedLons = [...lons].sort((a, b) => a - b)
        let maxGap = 0
        let gapIdx = 0
        for (let i = 0; i < sortedLons.length - 1; i++) {
          const gap = sortedLons[i + 1] - sortedLons[i]
          if (gap > maxGap) {
            maxGap = gap
            gapIdx = i
          }
        }
        const wrapGap = 360 + sortedLons[0] - sortedLons[sortedLons.length - 1]
        if (wrapGap > maxGap) {
          maxGap = wrapGap
          gapIdx = sortedLons.length - 1
        }

        if (maxGap > 180) {
          let gapMid = 0
          if (gapIdx === sortedLons.length - 1) {
            gapMid = (sortedLons[sortedLons.length - 1] + (360 + sortedLons[0])) / 2
          } else {
            gapMid = (sortedLons[gapIdx] + sortedLons[gapIdx + 1]) / 2
          }
          if (gapMid > 180) gapMid -= 360
          centerLon = gapMid > 0 ? gapMid - 180 : gapMid + 180
          lonSpan = 360 - maxGap
        } else {
          const minLon = sortedLons[0]
          const maxLon = sortedLons[sortedLons.length - 1]
          lonSpan = maxLon - minLon
          centerLon = (minLon + maxLon) / 2
        }
      }

      const maxSpan = Math.max(latSpan, lonSpan)
      let targetAltitude = 2500000

      if (validLocs.length === 1 || maxSpan < 0.1) {
        targetAltitude = 350000
      } else if (maxSpan < 4) {
        targetAltitude = Math.max(450000, maxSpan * 160000 + 200000)
      } else {
        targetAltitude = Math.min(4800000, Math.max(800000, maxSpan * 125000 + 350000))
      }

      return { centerLon, centerLat, targetAltitude, validLocs }
    }

    // Fallback to centroid if zero dive sites in dataset array
    const centroid = COUNTRY_CENTROIDS.find((c) => normalizeCountryKey(c.name) === cKey)
    if (centroid) {
      return {
        centerLon: Number(centroid.lon),
        centerLat: Number(centroid.lat),
        targetAltitude: 2800000,
        validLocs: []
      }
    }

    return null
  }, [])

  // Deterministic camera view execution to target with flight race cancellation
  const flyToCountryTarget = useCallback((target) => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium || !target) return

    const currentVersion = ++cameraTransactionVersionRef.current
    try {
      viewer.camera.cancelFlight()
    } catch {}

    const { centerLon, centerLat, targetAltitude } = target
    if (!isFinite(centerLon) || !isFinite(centerLat) || !isFinite(targetAltitude)) return

    isProgrammaticFlightRef.current = true
    try {
      viewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(centerLon, centerLat, targetAltitude),
        orientation: {
          heading: 0.0,
          pitch: window.Cesium.Math.toRadians(-88),
          roll: 0.0
        },
        duration: 2.4,
        complete: () => {
          if (currentVersion === cameraTransactionVersionRef.current) {
            isProgrammaticFlightRef.current = false
          }
        },
        cancel: () => {
          if (currentVersion === cameraTransactionVersionRef.current) {
            isProgrammaticFlightRef.current = false
          }
        }
      })
    } catch (err) {
      console.warn('Camera flight notice:', err)
      isProgrammaticFlightRef.current = false
    }
  }, [])

  // Deterministic camera view to Dive Center Location
  const flyToLocationPoint = useCallback((loc) => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium || !loc) return
    const lat = Number(loc.latitude)
    const lon = Number(loc.longitude)
    if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return

    const currentVersion = ++cameraTransactionVersionRef.current
    try {
      viewer.camera.cancelFlight()
    } catch {}

    isProgrammaticFlightRef.current = true
    try {
      viewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(lon, lat, 180000),
        orientation: {
          heading: 0.0,
          pitch: window.Cesium.Math.toRadians(-75),
          roll: 0.0
        },
        duration: 2.0,
        complete: () => {
          if (currentVersion === cameraTransactionVersionRef.current) {
            isProgrammaticFlightRef.current = false
          }
        },
        cancel: () => {
          if (currentVersion === cameraTransactionVersionRef.current) {
            isProgrammaticFlightRef.current = false
          }
        }
      })
    } catch (err) {
      console.warn('Camera location flight notice:', err)
      isProgrammaticFlightRef.current = false
    }
  }, [])

  // 1. ONE-TIME INITIALIZATION: Load Cesium asynchronously and build Viewer ONCE
  useEffect(() => {
    let viewer = null
    let handler = null
    let resizeObserver = null
    let removePostRender = null
    let removeWheelListener = null
    let isUnmounted = false

    loadCesium()
      .then((Cesium) => {
        if (isUnmounted || !containerRef.current) return

        Cesium.Ion.defaultAccessToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IkVxY1lQVGlOMVp4M3NtdWMiLCJqdGkiOiI2MDI2Yjg2NS0zZTA5LTQ4ODQtOGM0Mi0yYjgxOTQ1MzA4NDciLCJpZCI6NDY4NjA1LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODY5MDc0MzF9.EatbbDckxW4VVoTQ4aXQQ3mlBCvxIp1-XpM0YaLxNUM'

        viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          infoBox: false,
          selectionIndicator: false,
          fullscreenButton: false,
          requestRenderMode: false,
        })

        if (isUnmounted) {
          viewer.destroy()
          return
        }

        viewerRef.current = viewer
        isCesiumReady.current = true

        // ResizeObserver
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            if (viewer && !viewer.isDestroyed()) {
              viewer.resize()
            }
          })
          resizeObserver.observe(containerRef.current)
        }

        const dpr = window.devicePixelRatio || 1
        const isMobile = window.innerWidth < 768

        // Adaptive resolution scaling: Crisp high-DPI on desktop (up to 1.75x), lightweight on mobile (up to 1.25x)
        viewer.resolutionScale = isMobile ? Math.min(dpr, 1.25) : Math.min(dpr, 1.75)

        // Tune base imagery layer
        const tuneImageryLayer = (layer) => {
          if (!layer) return
          layer.brightness = 1.05
          layer.contrast = 1.15
          layer.gamma = 1.04
          layer.saturation = 1.12
        }

        const baseLayer = viewer.imageryLayers.get(0)
        if (baseLayer) tuneImageryLayer(baseLayer)
        viewer.imageryLayers.layerAdded.addEventListener(tuneImageryLayer)

        // Globe rendering config
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#021426')
        viewer.scene.globe.enableLighting = false
        viewer.scene.globe.showGroundAtmosphere = true
        viewer.scene.globe.depthTestAgainstTerrain = false
        viewer.scene.globe.tileCacheSize = 400
        viewer.scene.globe.loadingDescendantLimit = 16
        viewer.scene.globe.preloadAncestors = true
        viewer.scene.globe.preloadSiblings = false
        viewer.scene.globe.maximumScreenSpaceError = isMobile ? 2.0 : 1.5

        if (viewer.scene.skyAtmosphere) {
          viewer.scene.skyAtmosphere.show = true
          viewer.scene.skyAtmosphere.brightnessShift = 0.12
          viewer.scene.skyAtmosphere.saturationShift = 0.05
        }
        if (viewer.scene.fog) {
          viewer.scene.fog.enabled = true
          viewer.scene.fog.density = 0.00008
          viewer.scene.fog.screenSpaceErrorFactor = 2.0
        }

        if (viewer.scene.postProcessStages?.fxaa) {
          viewer.scene.postProcessStages.fxaa.enabled = true
        }

        // Camera controller bounds & inertia
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 15000
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 25000000
        viewer.scene.screenSpaceCameraController.enableCollisionDetection = true
        viewer.scene.screenSpaceCameraController.enableZoom = true
        viewer.scene.screenSpaceCameraController.enableRotate = true
        viewer.scene.screenSpaceCameraController.enableTilt = true
        viewer.scene.screenSpaceCameraController.enableTranslate = false
        viewer.scene.screenSpaceCameraController.inertiaSpin = 0.85
        viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.85
        viewer.scene.screenSpaceCameraController.inertiaZoom = 0.8

        // Full camera events: enable Pinch, Wheel, and Drag for unrestricted zooming and rotation
        viewer.scene.screenSpaceCameraController.zoomEventTypes = [
          Cesium.CameraEventType.RIGHT_DRAG,
          Cesium.CameraEventType.WHEEL,
          Cesium.CameraEventType.PINCH
        ]
        viewer.scene.screenSpaceCameraController.rotateEventTypes = [
          Cesium.CameraEventType.LEFT_DRAG
        ]
        viewer.scene.screenSpaceCameraController.tiltEventTypes = [
          Cesium.CameraEventType.MIDDLE_DRAG,
          {
            eventType: Cesium.CameraEventType.LEFT_DRAG,
            modifier: Cesium.KeyboardEventModifier.CTRL
          }
        ]

        // Adaptive SSE for 60fps interaction
        const handleMoveStart = () => {
          isUserInteractingRef.current = true
          lastInteractionTimeRef.current = Date.now()
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.globe.maximumScreenSpaceError = isMobile ? 3.0 : 2.5
          }
        }
        const handleMoveEnd = () => {
          isUserInteractingRef.current = false
          lastInteractionTimeRef.current = Date.now()
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.globe.maximumScreenSpaceError = isMobile ? 2.0 : 1.5
          }
        }

        viewer.camera.moveStart.addEventListener(handleMoveStart)
        viewer.camera.moveEnd.addEventListener(handleMoveEnd)

        // Subtle idle rotation when completely idle on world view + 60fps smooth popup positioning
        removePostRender = viewer.scene.postRender.addEventListener(() => {
          if (!viewer || viewer.isDestroyed()) return

          // 1. Screen-space coordinate tracking for dive site popup
          try {
            const popupEl = popupRef.current
            const site = popupSiteRef.current
            const isOpen = isPopupOpenRef.current

            if (popupEl) {
              if (!isOpen || !site || !viewer.scene || !viewer.camera) {
                popupEl.style.display = 'none'
              } else {
                const lat = Number(site.latitude)
                const lon = Number(site.longitude)
                if (isNaN(lat) || isNaN(lon)) {
                  popupEl.style.display = 'none'
                } else {
                  const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, 10.0)
                  const cameraPos = viewer.camera.position
                  const toPoint = Cesium.Cartesian3.subtract(cartesian, cameraPos, new Cesium.Cartesian3())
                  const dot = Cesium.Cartesian3.dot(viewer.camera.direction, toPoint)

                  const occluder = new Cesium.EllipsoidalOccluder(viewer.scene.globe.ellipsoid, cameraPos)
                  const isOccluded = !occluder.isPointVisible(cartesian)

                  if (dot <= 0 || isOccluded) {
                    popupEl.style.display = 'none'
                  } else {
                    let windowPosition = null
                    if (Cesium.SceneTransforms) {
                      if (typeof Cesium.SceneTransforms.worldToWindowCoordinates === 'function') {
                        windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, cartesian)
                      } else if (typeof Cesium.SceneTransforms.wgs84ToWindowCoordinates === 'function') {
                        windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian)
                      }
                    }

                    if (!windowPosition) {
                      popupEl.style.display = 'none'
                    } else {
                      const canvas = viewer.scene.canvas
                      const canvasWidth = canvas.clientWidth
                      const canvasHeight = canvas.clientHeight
                      const x = windowPosition.x
                      const y = windowPosition.y

                      if (x < -80 || x > canvasWidth + 80 || y < -80 || y > canvasHeight + 80) {
                        popupEl.style.display = 'none'
                      } else {
                        popupEl.style.display = 'block'
                        const isMobile = canvasWidth < 640
                        const popupWidth = isMobile ? 210 : 250
                        const popupHeight = isMobile ? 190 : 240
                        const halfWidth = popupWidth / 2
                        const margin = 10

                        // Clamp horizontal coordinate so it never clips off left or right screen
                        const clampedX = Math.max(halfWidth + margin, Math.min(canvasWidth - halfWidth - margin, x))

                        // Flip below pin if placed too close to top edge
                        const minTopSpaceNeeded = popupHeight + margin + 45
                        let topPos = y - 36
                        let isFlipped = false

                        if (y < minTopSpaceNeeded) {
                          topPos = y + 16
                          isFlipped = true
                        }

                        // Ensure topPos stays strictly within visible canvas boundaries
                        if (!isFlipped) {
                          topPos = Math.max(popupHeight + margin, Math.min(canvasHeight - margin, topPos))
                          popupEl.style.transform = 'translate(-50%, -100%)'
                        } else {
                          topPos = Math.max(margin + 40, Math.min(canvasHeight - popupHeight - margin, topPos))
                          popupEl.style.transform = 'translate(-50%, 0)'
                        }

                        popupEl.style.left = `${Math.round(clampedX)}px`
                        popupEl.style.top = `${Math.round(topPos)}px`

                        const needleEl = popupEl.querySelector('.popup-needle')
                        if (needleEl) {
                          if (isFlipped) {
                            needleEl.className = 'popup-needle absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00192e] rotate-45 border-l border-t border-cyan-400/35 pointer-events-none'
                          } else {
                            needleEl.className = 'popup-needle absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00192e] rotate-45 border-r border-b border-cyan-400/35 pointer-events-none'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            if (popupRef.current) popupRef.current.style.display = 'none'
          }

          // 2. Idle world rotation
          if (
            selectedCountryRef.current ||
            isProgrammaticFlightRef.current ||
            isUserInteractingRef.current
          ) {
            return
          }
          if (Date.now() - lastInteractionTimeRef.current > 3500) {
            viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.0001)
          }

          // 3. Camera bounds & initial world-view camera restoration
          if (viewer.camera && viewer.camera.positionCartographic) {
            const carto = viewer.camera.positionCartographic
            if (carto) {
              // Safety altitude floor
              if (carto.height < 15000) {
                viewer.camera.position = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, 15000)
              }
              // High-altitude camera normalization (roll safety)
              if (carto.height > 2000000) {
                if (Math.abs(viewer.camera.roll) > 0.01) {
                  viewer.camera.setView({
                    orientation: {
                      heading: viewer.camera.heading,
                      pitch: viewer.camera.pitch,
                      roll: 0.0
                    }
                  })
                }
              }
            }
          }
        })

        // World terrain progressive loading
        try {
          if (typeof Cesium.createWorldTerrainAsync === 'function') {
            Cesium.createWorldTerrainAsync({
              requestVertexNormals: true,
              requestWaterMask: true
            })
              .then((terrainProvider) => {
                if (viewer && !viewer.isDestroyed()) {
                  viewer.terrainProvider = terrainProvider
                }
              })
              .catch(() => {})
          }
        } catch {}

        // Initial view setup
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(80.0, 15.0, 11500000),
          orientation: {
            heading: 0.0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          }
        })

        // Add Country Billboard Pins & Labels in a single batched event
        viewer.entities.suspendEvents()
        try {
          COUNTRY_CENTROIDS.forEach((country) => {
            const cKey = normalizeCountryKey(country.name)
            viewer.entities.add({
              id: `country-${cKey}`,
              name: country.name,
              position: Cesium.Cartesian3.fromDegrees(Number(country.lon), Number(country.lat)),
              show: true,
              billboard: {
                image: createSitePinSvg(),
                width: 42,
                height: 24,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                eyeOffset: new Cesium.Cartesian3(0, 0, -50),
                scaleByDistance: new Cesium.NearFarScalar(1.0e6, 1.0, 1.8e7, 0.48),
                translucencyByDistance: new Cesium.NearFarScalar(1.0e6, 1.0, 2.0e7, 0.8)
              },
              label: {
                text: country.name,
                font: 'bold 11px Outfit, Inter, system-ui, sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.fromCssColorString('#00223D'),
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, 4),
                scaleByDistance: new Cesium.NearFarScalar(1.0e6, 1.0, 1.8e7, 0.5),
                translucencyByDistance: new Cesium.NearFarScalar(1.0e6, 1.0, 2.0e7, 0.8),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100000, 20000000)
              },
              properties: {
                countryName: country.name,
                countryKey: cKey
              }
            })
          })
        } finally {
          viewer.entities.resumeEvents()
        }

        // Mark globe ready right after initial scene construction
        setIsLoaded(true)

        // Interaction handlers
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        let lastHoverCheckTime = 0

        handler.setInputAction((movement) => {
          lastInteractionTimeRef.current = Date.now()
          const now = performance.now()
          if (now - lastHoverCheckTime < 30) return
          lastHoverCheckTime = now

          const pickedObjects = viewer.scene.drillPick(movement.endPosition, 3)
          let isPointer = false
          let foundHover = null

          if (pickedObjects && pickedObjects.length > 0) {
            for (const obj of pickedObjects) {
              if (obj && obj.id) {
                const idStr = String(obj.id.id || '')
                if (idStr.startsWith('site-')) {
                  isPointer = true
                  const locId = idStr.replace('site-', '')
                  let loc = null
                  if (obj.id.properties && obj.id.properties.siteLocation) {
                    const propVal = obj.id.properties.siteLocation
                    loc = typeof propVal.getValue === 'function' ? propVal.getValue(window.Cesium?.JulianDate?.now?.() || new Date()) : propVal
                  }
                  if (!loc) {
                    const cleanId = String(locId).trim()
                    loc = countryLocationsRef.current.find(
                      (l) => l && (String(l.id).trim() === cleanId || (l.siteId && String(l.siteId).trim() === cleanId))
                    )
                  }
                  if (loc) {
                    const creatureInfo = getDiveSiteCreatureInfo(loc)
                    const placeName = getLocationDisplayName(loc) || loc.title || loc.name
                    foundHover = {
                      type: 'site',
                      title: placeName,
                      depth: loc.depth || loc.maxDepth || (loc.minDepth ? `${loc.minDepth}-${loc.maxDepth || 30}m` : '12m - 30m'),
                      visibility: loc.visibility || '20m - 40m',
                      creatureName: creatureInfo?.name || 'Marine Life',
                      creatureFunFact: creatureInfo?.fact || '',
                      x: movement.endPosition.x,
                      y: movement.endPosition.y
                    }
                  }
                  break
                } else if (idStr.startsWith('country-') && idStr !== 'country-envelope') {
                  isPointer = true
                  let cName = null
                  if (obj.id.properties && obj.id.properties.countryName) {
                    const propVal = obj.id.properties.countryName
                    cName = typeof propVal.getValue === 'function' ? propVal.getValue(window.Cesium?.JulianDate?.now?.() || new Date()) : propVal
                  }
                  if (!cName) cName = obj.id.name
                  if (cName && cName !== 'envelope') {
                    foundHover = {
                      type: 'country',
                      title: cName,
                      x: movement.endPosition.x,
                      y: movement.endPosition.y
                    }
                  }
                  break
                }
              }
            }
          }
          viewer.scene.canvas.style.cursor = isPointer ? 'pointer' : 'default'

          const tEl = tooltipRef.current
          if (tEl) {
            if (!foundHover || isPopupOpenRef.current) {
              tEl.style.display = 'none'
            } else {
              tEl.style.display = 'block'
              const containerWidth = containerRef.current ? containerRef.current.clientWidth : 400
              const leftPos = Math.min(Math.max(12, foundHover.x + 14), containerWidth - 230)
              const topPos = Math.max(12, foundHover.y - 75)
              tEl.style.left = `${leftPos}px`
              tEl.style.top = `${topPos}px`

              const titleEl = tEl.querySelector('.tooltip-title')
              const subtitleEl = tEl.querySelector('.tooltip-subtitle')
              const detailsEl = tEl.querySelector('.tooltip-details')
              const depthEl = tEl.querySelector('.tooltip-depth')
              const visEl = tEl.querySelector('.tooltip-vis')

              if (titleEl) titleEl.textContent = foundHover.title || ''
              if (subtitleEl) {
                subtitleEl.textContent = foundHover.type === 'site' ? 'Dive Site • Click to inspect' : 'Country • Click to explore'
              }
              if (detailsEl) {
                if (foundHover.type === 'site') {
                  detailsEl.style.display = 'flex'
                  if (depthEl) depthEl.textContent = foundHover.depth || '12m - 30m'
                  if (visEl) visEl.textContent = foundHover.visibility || '20m - 40m'
                } else {
                  detailsEl.style.display = 'none'
                }
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        handler.setInputAction((click) => {
          lastInteractionTimeRef.current = Date.now()
          const pickedObjects = viewer.scene.drillPick(click.position, 5)

          if (pickedObjects && pickedObjects.length > 0) {
            // 1. Check if user clicked a Dive Location marker first
            for (const pickedObject of pickedObjects) {
              if (pickedObject && pickedObject.id) {
                const idStr = String(pickedObject.id.id || '')
                if (idStr.startsWith('site-')) {
                  const locId = idStr.replace('site-', '')
                  let loc = null
                  if (pickedObject.id.properties && pickedObject.id.properties.siteLocation) {
                    const propVal = pickedObject.id.properties.siteLocation
                    loc = typeof propVal.getValue === 'function' ? propVal.getValue(window.Cesium?.JulianDate?.now?.() || new Date()) : propVal
                  }
                  if (!loc) {
                    const cleanId = String(locId).trim()
                    loc = countryLocationsRef.current.find(
                      (l) => l && (String(l.id).trim() === cleanId || (l.siteId && String(l.siteId).trim() === cleanId))
                    )
                  }
                  if (loc) {
                    prevLocationIdRef.current = loc.id ?? null
                    setPopupSite(loc)
                    setIsPopupOpen(true)
                    onLocationSelectRef.current?.(loc)
                    // View box appears right there without zooming out or resetting camera altitude
                  }
                  return
                }
              }
            }

            // 2. Check if user clicked a Country Pin Badge
            for (const pickedObject of pickedObjects) {
              if (pickedObject && pickedObject.id) {
                const idStr = String(pickedObject.id.id || '')
                if (idStr.startsWith('country-') && idStr !== 'country-envelope') {
                  let cName = null
                  if (pickedObject.id.properties && pickedObject.id.properties.countryName) {
                    const propVal = pickedObject.id.properties.countryName
                    cName = typeof propVal.getValue === 'function' ? propVal.getValue(window.Cesium?.JulianDate?.now?.() || new Date()) : propVal
                  }
                  if (!cName) cName = pickedObject.id.name
                  if (cName && cName !== 'envelope') {
                    onCountrySelectRef.current?.(cName)
                  }
                  return
                }
              }
            }
          }

          // 3. Clicked empty terrain / ocean / non-selectable object
          setIsPopupOpen(false)
          setPopupSite(null)
          prevLocationIdRef.current = null
          onLocationSelectRef.current?.(null)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // Multi-touch Gesture & Wheel Controller (Supports Pinch-In, Pinch-Out, Pan, and Wheel Zoom)
        const containerEl = containerRef.current
        let safariInitialScale = 1.0
        let touchStartX = null
        let touchStartY = null
        let initialPinchDistance = null

        const getTouchDistance = (t1, t2) => {
          const dx = t1.clientX - t2.clientX
          const dy = t1.clientY - t2.clientY
          return Math.sqrt(dx * dx + dy * dy)
        }

        const handleWheel = (e) => {
          if (!containerEl) return

          // Prevent page scroll when interacting over the globe container
          if (e.cancelable) e.preventDefault()
          e.stopPropagation()

          const currentViewer = viewerRef.current
          if (!currentViewer || currentViewer.isDestroyed() || !window.Cesium) return

          const camera = currentViewer.camera
          const scene = currentViewer.scene
          const height = camera.positionCartographic ? camera.positionCartographic.height : 10000000
          const minDist = scene.screenSpaceCameraController.minimumZoomDistance || 15000
          const maxDist = scene.screenSpaceCameraController.maximumZoomDistance || 25000000

          // Smooth exponential zoom factor based on altitude
          const zoomFactor = Math.min(Math.max(height * 0.002, 500), 500000)
          const zoomAmount = Math.abs(e.deltaY) * zoomFactor

          if (e.deltaY < 0) {
            // Zoom IN towards cursor & pan target region towards screen center
            const maxAllowedZoomIn = Math.max(0, height - minDist)
            const actualZoom = Math.min(zoomAmount, maxAllowedZoomIn)

            if (actualZoom > 0) {
              const rect = containerEl.getBoundingClientRect()
              const mouseWindowPos = new window.Cesium.Cartesian2(e.clientX - rect.left, e.clientY - rect.top)
              const ray = camera.getPickRay(mouseWindowPos)
              let targetPoint = null
              if (ray) {
                targetPoint = scene.globe.pick(ray, scene)
                if (!targetPoint) {
                  targetPoint = camera.pickEllipsoid(mouseWindowPos, scene.globe.ellipsoid)
                }
              }

              if (targetPoint) {
                // Vector from camera to target point on globe
                const toTarget = window.Cesium.Cartesian3.subtract(
                  targetPoint,
                  camera.position,
                  new window.Cesium.Cartesian3()
                )
                const distToTarget = window.Cesium.Cartesian3.magnitude(toTarget)
                const step = Math.min(actualZoom, distToTarget * 0.6)

                if (step > 0) {
                  const moveDir = window.Cesium.Cartesian3.normalize(toTarget, new window.Cesium.Cartesian3())
                  const moveVec = window.Cesium.Cartesian3.multiplyByScalar(
                    moveDir,
                    step,
                    new window.Cesium.Cartesian3()
                  )
                  camera.position = window.Cesium.Cartesian3.add(
                    camera.position,
                    moveVec,
                    new window.Cesium.Cartesian3()
                  )
                }
              } else {
                camera.zoomIn(actualZoom)
              }
            }
          } else if (e.deltaY > 0) {
            // Zoom OUT smoothly
            const maxAllowedZoomOut = Math.max(0, maxDist - height)
            const actualZoom = Math.min(zoomAmount, maxAllowedZoomOut)
            if (actualZoom > 0) camera.zoomOut(actualZoom)
          }

          lastInteractionTimeRef.current = Date.now()
        }

        // Two-Finger Touch Pinch-To-Zoom & Pan (Mobile / Tablet)
        const handleTouchStart = (e) => {
          if (e.touches.length === 2) {
            initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1])
            touchStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2
          } else {
            initialPinchDistance = null
            touchStartX = null
            touchStartY = null
          }
        }

        const handleTouchMove = (e) => {
          if (e.touches.length === 2 && initialPinchDistance !== null) {
            if (e.cancelable) e.preventDefault()
            e.stopPropagation()

            const currentViewer = viewerRef.current
            if (!currentViewer || currentViewer.isDestroyed() || !window.Cesium) return
            const camera = currentViewer.camera
            const height = camera.positionCartographic ? camera.positionCartographic.height : 10000000
            const minDist = currentViewer.scene.screenSpaceCameraController.minimumZoomDistance || 15000
            const maxDist = currentViewer.scene.screenSpaceCameraController.maximumZoomDistance || 25000000

            const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
            const distanceDelta = currentDistance - initialPinchDistance

            // Pinch-to-zoom calculation
            if (Math.abs(distanceDelta) > 1.0) {
              const zoomFactor = Math.min(Math.max(height * 0.006, 1000), 250000)
              const zoomDelta = -distanceDelta * zoomFactor

              if (zoomDelta < 0) {
                // Fingers moving apart (pinch out) -> Zoom In towards touch midpoint
                const maxAllowedZoomIn = Math.max(0, height - minDist)
                const actualZoom = Math.min(Math.abs(zoomDelta), maxAllowedZoomIn)
                if (actualZoom > 0) {
                  const rect = containerEl.getBoundingClientRect()
                  const touchPos = new window.Cesium.Cartesian2(currentX - rect.left, currentY - rect.top)
                  const ray = camera.getPickRay(touchPos)
                  let targetPoint = null
                  if (ray) {
                    targetPoint = currentViewer.scene.globe.pick(ray, currentViewer.scene)
                    if (!targetPoint) {
                      targetPoint = camera.pickEllipsoid(touchPos, currentViewer.scene.globe.ellipsoid)
                    }
                  }
                  if (targetPoint) {
                    const toTarget = window.Cesium.Cartesian3.subtract(
                      targetPoint,
                      camera.position,
                      new window.Cesium.Cartesian3()
                    )
                    const distToTarget = window.Cesium.Cartesian3.magnitude(toTarget)
                    const step = Math.min(actualZoom, distToTarget * 0.6)
                    if (step > 0) {
                      const moveDir = window.Cesium.Cartesian3.normalize(toTarget, new window.Cesium.Cartesian3())
                      const moveVec = window.Cesium.Cartesian3.multiplyByScalar(moveDir, step, new window.Cesium.Cartesian3())
                      camera.position = window.Cesium.Cartesian3.add(camera.position, moveVec, new window.Cesium.Cartesian3())
                    }
                  } else {
                    camera.zoomIn(actualZoom)
                  }
                }
              } else if (zoomDelta > 0) {
                // Fingers moving together (pinch in) -> Zoom Out
                const maxAllowedZoomOut = Math.max(0, maxDist - height)
                const actualZoom = Math.min(zoomDelta, maxAllowedZoomOut)
                if (actualZoom > 0) camera.zoomOut(actualZoom)
              }
              initialPinchDistance = currentDistance
            }

            // Two-finger Pan / Rotation
            const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2

            if (touchStartX !== null && touchStartY !== null) {
              const deltaX = currentX - touchStartX
              const deltaY = currentY - touchStartY

              const rotateFactor = Math.min(Math.max(height / 4500000000, 0.0004), 0.003)
              const verticalRotateFactor = rotateFactor * 0.25

              if (Math.abs(deltaX) > 1.0) {
                camera.rotateLeft(-deltaX * rotateFactor)
              }
              if (Math.abs(deltaY) > 1.0) {
                camera.rotate(camera.right, deltaY * verticalRotateFactor)
              }
            }

            touchStartX = currentX
            touchStartY = currentY
            lastInteractionTimeRef.current = Date.now()
          }
        }

        const handleTouchEnd = (e) => {
          if (e.touches.length < 2) {
            initialPinchDistance = null
            touchStartX = null
            touchStartY = null
          }
        }

        const handleGestureStart = (e) => {
          if (e.cancelable) e.preventDefault()
          safariInitialScale = 1.0
        }

        const handleGestureChange = (e) => {
          if (e.cancelable) e.preventDefault()
          const currentViewer = viewerRef.current
          if (!currentViewer || currentViewer.isDestroyed() || !window.Cesium) return

          const camera = currentViewer.camera
          const scaleDelta = e.scale - safariInitialScale
          safariInitialScale = e.scale

          const height = camera.positionCartographic ? camera.positionCartographic.height : 10000000
          const minDist = currentViewer.scene.screenSpaceCameraController.minimumZoomDistance || 15000
          const maxDist = currentViewer.scene.screenSpaceCameraController.maximumZoomDistance || 25000000
          const zoomFactor = Math.min(Math.max(height * 0.8, 5000), 2000000)

          if (scaleDelta > 0) {
            const maxAllowedZoomIn = Math.max(0, height - minDist)
            const actualZoom = Math.min(scaleDelta * zoomFactor, maxAllowedZoomIn)
            if (actualZoom > 0) camera.zoomIn(actualZoom)
          } else if (scaleDelta < 0) {
            const maxAllowedZoomOut = Math.max(0, maxDist - height)
            const actualZoom = Math.min(Math.abs(scaleDelta) * zoomFactor, maxAllowedZoomOut)
            if (actualZoom > 0) camera.zoomOut(actualZoom)
          }

          lastInteractionTimeRef.current = Date.now()
        }

        if (containerEl) {
          containerEl.addEventListener('wheel', handleWheel, { passive: false })
          containerEl.addEventListener('touchstart', handleTouchStart, { passive: false })
          containerEl.addEventListener('touchmove', handleTouchMove, { passive: false })
          containerEl.addEventListener('touchend', handleTouchEnd, { passive: false })
          containerEl.addEventListener('touchcancel', handleTouchEnd, { passive: false })
          containerEl.addEventListener('gesturestart', handleGestureStart, { passive: false })
          containerEl.addEventListener('gesturechange', handleGestureChange, { passive: false })

          removeWheelListener = () => {
            containerEl.removeEventListener('wheel', handleWheel)
            containerEl.removeEventListener('touchstart', handleTouchStart)
            containerEl.removeEventListener('touchmove', handleTouchMove)
            containerEl.removeEventListener('touchend', handleTouchEnd)
            containerEl.removeEventListener('touchcancel', handleTouchEnd)
            containerEl.removeEventListener('gesturestart', handleGestureStart)
            containerEl.removeEventListener('gesturechange', handleGestureChange)
          }
        }
      })
      .catch((err) => {
        console.warn('Cesium load notice:', err)
      })

    return () => {
      isUnmounted = true
      isCesiumReady.current = false
      if (removeWheelListener) removeWheelListener()
      if (removePostRender) removePostRender()
      if (resizeObserver) resizeObserver.disconnect()
      if (handler) handler.destroy()
      if (viewer && !viewer.isDestroyed()) viewer.destroy()
      viewerRef.current = null
    }
  }, [flyToLocationPoint])

  // 2. COUNTRY & LOCATIONS UPDATE EFFECT (Preserves Viewer instance)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium || !isLoaded) return

    const Cesium = window.Cesium
    const currentTransaction = ++activeCountryTransactionRef.current
    const canonicalSelectedCountryKey = normalizeCountryKey(selectedCountry)

    // Filter valid coordinates strictly belonging to the selected country
    const validLocs = (countryLocations || []).filter((l) => {
      if (!l) return false
      const lat = Number(l.latitude)
      const lon = Number(l.longitude)
      if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return false
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false

      if (canonicalSelectedCountryKey) {
        const lKey = normalizeCountryKey(l.country)
        if (lKey && lKey !== canonicalSelectedCountryKey) {
          return false
        }
      }
      return true
    })

    const selLoc = selectedLocationRef.current
    const hasSelection = Boolean(selLoc)

    // A. Remove existing dive location markers and country highlight envelope
    viewer.entities.suspendEvents()
    try {
      const idsToRemove = []
      const currentEntities = viewer.entities.values
      for (let i = 0; i < currentEntities.length; i++) {
        const ent = currentEntities[i]
        if (ent && ent.id) {
          const idStr = String(ent.id)
          if (idStr.startsWith('site-') || idStr === 'country-envelope') {
            idsToRemove.push(idStr)
          }
        }
      }
      idsToRemove.forEach((id) => viewer.entities.removeById(id))

      // B. Keep all 123 persistent country pins visible and highlight active country badge
      COUNTRY_CENTROIDS.forEach((c) => {
        const cKey = normalizeCountryKey(c.name)
        const countryEntity = viewer.entities.getById(`country-${cKey}`)
        if (countryEntity) {
          const isActive = canonicalSelectedCountryKey && cKey === canonicalSelectedCountryKey
          countryEntity.show = true
          if (countryEntity.label) {
            countryEntity.label.fillColor = isActive
              ? Cesium.Color.fromCssColorString('#FFCD00')
              : Cesium.Color.WHITE
          }
        }
      })

      // C. When country is selected, add all validated dive location markers (NO TEXT LABELS)
      if (canonicalSelectedCountryKey) {
        validLocs.forEach((loc) => {
          const isSel = selLoc && String(selLoc.id) === String(loc.id)
          const isDimmed = hasSelection && !isSel
          const displayName = getLocationDisplayName(loc)

          viewer.entities.add({
            id: `site-${loc.id}`,
            name: displayName || loc.title || loc.name,
            position: Cesium.Cartesian3.fromDegrees(Number(loc.longitude), Number(loc.latitude)),
            billboard: {
              image: createSitePinSvg(isSel, isDimmed),
              width: isSel ? 46 : 34,
              height: isSel ? 26 : 19,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              eyeOffset: new Cesium.Cartesian3(0, 0, isSel ? -250 : -80),
              scaleByDistance: new Cesium.NearFarScalar(2.0e4, 1.0, 1.2e7, 0.5),
              translucencyByDistance: new Cesium.NearFarScalar(2.0e4, 1.0, 1.5e7, 0.85)
            },
            properties: {
              siteLocation: loc,
              displayName,
              countryKey: canonicalSelectedCountryKey
            }
          })
        })

        // D. Add subtle glowing country territory envelope on globe surface
        if (validLocs.length > 0) {
          const lats = validLocs.map((l) => Number(l.latitude))
          const lons = validLocs.map((l) => Number(l.longitude))
          const minLat = Math.min(...lats)
          const maxLat = Math.max(...lats)
          const minLon = Math.min(...lons)
          const maxLon = Math.max(...lons)

          const latPadding = Math.max(0.8, (maxLat - minLat) * 0.25)
          const lonPadding = Math.max(0.8, (maxLon - minLon) * 0.25)

          try {
            viewer.entities.add({
              id: 'country-envelope',
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(
                  Math.max(-180, minLon - lonPadding),
                  Math.max(-85, minLat - latPadding),
                  Math.min(180, maxLon + lonPadding),
                  Math.min(85, maxLat + latPadding)
                ),
                material: new Cesium.Color(0.0, 0.68, 0.78, 0.06),
                outline: false
              }
            })
          } catch {}
        }
      }
    } finally {
      viewer.entities.resumeEvents()
    }

    // Verify transaction is still active before executing camera flight
    if (currentTransaction !== activeCountryTransactionRef.current) return

    // E. Camera Flight Transitions on Country Change & Async Location Load
    const countryKey = canonicalSelectedCountryKey
    const countryChanged = prevCountryRef.current !== selectedCountry
    prevCountryRef.current = selectedCountry

    const needsFraming = countryChanged || (countryKey && lastFramedCountryKeyRef.current !== countryKey && validLocs.length > 0)

    if (needsFraming) {
      if (selectedCountry) {
        const target = getCountryCameraTarget(selectedCountry, validLocs)
        if (target) {
          if (!selLoc) {
            flyToCountryTarget(target)
          } else {
            flyToLocationPoint(selLoc)
          }
          if (validLocs.length > 0) {
            lastFramedCountryKeyRef.current = countryKey
          }
        }
      } else {
        flyToGlobalOverview()
        lastFramedCountryKeyRef.current = null
      }
    }
  }, [selectedCountry, countryLocations, isLoaded, getCountryCameraTarget, flyToCountryTarget, flyToGlobalOverview, flyToLocationPoint])

  // 3. TARGETED LOCATION SELECTION EFFECT (Updates only marker visual state + camera flight)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium || !isLoaded) return

    const currentLocationId = selectedLocation?.id ?? null
    if (prevLocationIdRef.current === currentLocationId) return
    prevLocationIdRef.current = currentLocationId

    const hasSelection = Boolean(selectedLocation)

    // Update billboard pins & labels state in place without entity recreation
    countryLocations.forEach((loc) => {
      const entity = viewer.entities.getById(`site-${loc.id}`)
      if (entity) {
        const isSel = selectedLocation && String(selectedLocation.id) === String(loc.id)
        const isDimmed = hasSelection && !isSel
        if (entity.billboard) {
          entity.billboard.image = createSitePinSvg(isSel, isDimmed)
          entity.billboard.width = isSel ? 46 : 34
          entity.billboard.height = isSel ? 26 : 19
          entity.billboard.eyeOffset = new window.Cesium.Cartesian3(0, 0, isSel ? -250 : -80)
        }
      }
    })

    if (selectedLocation) {
      setPopupSite(selectedLocation)
      setIsPopupOpen(true)
      flyToLocationPoint(selectedLocation)
    } else {
      setPopupSite(null)
      setIsPopupOpen(false)
    }
  }, [selectedLocation, countryLocations, isLoaded, flyToLocationPoint])

  // Reset popup when country changes
  useEffect(() => {
    setIsPopupOpen(false)
    setPopupSite(null)
  }, [selectedCountry])

  return (
    <div id="dive-map-container" data-globe="true" className="normal-cursor relative w-full h-full min-h-[450px] overflow-hidden bg-[#021426] pointer-events-auto">
      {/* Cleanup Cesium UI */}
      <style>{`
        .cesium-viewer-bottom,
        .cesium-viewer-toolbar,
        .cesium-viewer-animationContainer,
        .cesium-viewer-timelineContainer,
        .cesium-viewer-fullscreenContainer {
          display: none !important;
        }
        .cesium-viewer,
        .cesium-widget,
        .cesium-widget canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          outline: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
      `}</style>

      {/* Cesium Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Sleek Loading Overlay while Cesium starts */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#021426] text-cyan-400 gap-3 pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300/80 animate-pulse">
            Loading 3D Ocean Globe...
          </span>
        </div>
      )}

      {/* Reset Globe / Instruction Button */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 pointer-events-auto z-10">
        <button
          type="button"
          onClick={handleResetGlobe}
          title="Reset to full globe view"
          className="inline-flex items-center gap-2 rounded-full bg-black/70 hover:bg-[#FFCD00] text-white hover:text-[#001e3d] backdrop-blur-md px-3.5 sm:px-4 py-2 text-xs font-bold border border-white/20 hover:border-[#FFCD00] shadow-lg transition-all duration-200 active:scale-95 cursor-pointer select-none group"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:rotate-180 group-active:-rotate-90 text-cyan-400 group-hover:text-[#001e3d]"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.32-9.26l-5.37 5.37" />
          </svg>
          <span>Drag to explore in 3D</span>
        </button>
      </div>

      {/* Floating Dive Site Image Popup Card */}
      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className="absolute z-30 pointer-events-auto transform -translate-x-1/2 -translate-y-full w-[195px] xs:w-[215px] sm:w-60 bg-[#00192e]/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.75)] overflow-hidden border border-cyan-400/40 transition-all duration-150"
      >
        {popupSite && (() => {
          const creature = getDiveSiteCreatureInfo(popupSite.id, popupSite)
          return (
            <div className="relative">
              {/* 1. Resident Creature & Dive Photo with Dynamic Badge & Floating Close Button */}
              <div className="w-full h-24 xs:h-28 sm:h-32 bg-[#021426] overflow-hidden relative group">
                {/* Floating Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPopupOpen(false)
                    setPopupSite(null)
                    prevLocationIdRef.current = null
                    onLocationSelectRef.current?.(null)
                  }}
                  className="absolute top-2 right-2 z-20 text-white/80 hover:text-white w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md transition cursor-pointer text-[10px] sm:text-xs font-bold border border-white/20 shadow-md"
                  aria-label="Close"
                >
                  ✕
                </button>

                <img
                  key={popupSite.id}
                  src={creature?.image || getDiveSiteImage(popupSite.id, popupSite)}
                  alt={creature?.creatureName || getLocationDisplayName(popupSite) || 'Marine Life'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00192e] via-transparent to-black/40 pointer-events-none" />

                {/* Creature Badge */}
                {creature?.creatureName && (
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-[#00192e]/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9.5px] font-bold text-accent border border-accent/40 shadow-sm max-w-[90%] truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                      <span className="truncate">{creature.creatureName}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Place Name & Country at Bottom */}
              <div className="px-2.5 sm:px-3 py-2 bg-[#00192e]/95 text-left">
                <h3 className="font-heading font-bold text-xs sm:text-sm text-white leading-tight truncate">
                  {popupSite.title || popupSite.name || 'Dive Site'}
                </h3>
                {popupSite.country && (
                  <p className="text-[8.5px] sm:text-[9.5px] font-medium text-cyan-400 flex items-center gap-1 mt-0.5 truncate">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <span className="truncate">{popupSite.country}</span>
                  </p>
                )}
              </div>

              {/* Marker Pointer Needle */}
              <div className="popup-needle absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00192e] rotate-45 border-r border-b border-cyan-400/35 pointer-events-none" />
            </div>
          )
        })()}
      </div>

      {/* Desktop Hover Pin Preview Tooltip (Direct DOM element driven for 0 React re-renders) */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-30 transition-transform duration-75 hidden md:block"
        style={{ display: 'none', top: 0, left: 0 }}
      >
        <div className="bg-[#00192e]/95 backdrop-blur-xl border border-cyan-400/40 rounded-xl p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-white max-w-[220px]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="tooltip-title font-heading text-xs font-bold text-white truncate leading-tight"></h4>
              <span className="tooltip-subtitle text-[9px] font-semibold text-cyan-300 block uppercase tracking-wider"></span>
            </div>
          </div>
          <div className="tooltip-details mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-white/80">
            <span>Depth: <strong className="tooltip-depth text-amber-300"></strong></span>
            <span>Vis: <strong className="tooltip-vis text-cyan-300"></strong></span>
          </div>
        </div>
      </div>

      {/* Joystick Overlay */}
      <GlobeJoystick viewerRef={viewerRef} />
    </div>
  )
}

function GlobeJoystick({ viewerRef }) {
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const animFrameId = useRef(null)
  const velocityRef = useRef({ x: 0, y: 0 })
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 })
  const MAX_RADIUS = 14

  const tick = () => {
    if (isDragging.current) {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        const vx = velocityRef.current.x
        const vy = velocityRef.current.y
        if (Math.abs(vx) > 0.001 || Math.abs(vy) > 0.001) {
          viewerRef.current.camera.rotateLeft(vx * 0.007)
          viewerRef.current.camera.rotateUp(vy * 0.007)
        }
      }
      animFrameId.current = requestAnimationFrame(tick)
    }
  }

  const startLoop = () => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(tick)
    }
  }

  const stopLoop = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current)
      animFrameId.current = null
    }
  }

  useEffect(() => {
    return () => stopLoop()
  }, [])

  const updateJoystick = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    let dx = e.clientX - centerX
    let dy = e.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > MAX_RADIUS) {
      dx = (dx / distance) * MAX_RADIUS
      dy = (dy / distance) * MAX_RADIUS
    }
    setThumbPos({ x: dx, y: dy })
    velocityRef.current = {
      x: dx / MAX_RADIUS,
      y: dy / MAX_RADIUS
    }
  }

  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (e.cancelable) e.preventDefault()
    isDragging.current = true
    updateJoystick(e)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    startLoop()
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    e.stopPropagation()
    if (e.cancelable) e.preventDefault()
    updateJoystick(e)
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    isDragging.current = false
    velocityRef.current = { x: 0, y: 0 }
    setThumbPos({ x: 0, y: 0 })
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    stopLoop()
  }

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center gap-2 pointer-events-auto">
      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-navy/50 px-2 py-1 rounded-md backdrop-blur-md select-none">
        360° Control
      </span>
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="group/map-toggle relative w-16 h-16 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing touch-none select-none [clip-path:circle(50%)]"
      >
        <div
          className="w-8 h-8 rounded-full bg-white/80 shadow-soft border border-white/50 transition-colors duration-200 group-hover/map-toggle:!bg-[#001e3d] group-hover/map-toggle:border-white/70 pointer-events-none"
          style={{ 
            transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)`, 
            transition: isDragging.current ? 'none' : 'transform 0.2s ease-out, background-color 0.2s ease, border-color 0.2s ease' 
          }}
        />
      </div>
    </div>
  )
}
