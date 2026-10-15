import { useEffect, useRef, useState } from 'react'

export default function Product3DViewer({ src, alt = '3D Product Model', productId, poster }) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const modelRef = useRef(null)
  const containerRef = useRef(null)

  const isBag = Boolean(
    (src && (src.toLowerCase().includes('bag') || src.toLowerCase().includes('backpack'))) ||
    (alt && (alt.toLowerCase().includes('bag') || alt.toLowerCase().includes('backpack'))) ||
    productId === 'product-ocean-bag'
  )

  const isFullSleeves = Boolean(
    productId === 'product-full-sleeves-unisex' ||
    (src && (
      src.toLowerCase().includes('full_sleeves') ||
      src.toLowerCase().includes('full-sleeves')
    )) ||
    (alt && (alt.toLowerCase().includes('full sleeve') && alt.toLowerCase().includes('top')))
  )

  const isBottomsCompression = Boolean(
    productId === 'product-womens-pants' ||
    (src && src.toLowerCase().includes('bottoms_with_compression')) ||
    (alt && (alt.toLowerCase().includes('bottom') && alt.toLowerCase().includes('compression')))
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setAutoRotate(entry.isIntersecting && !document.hidden)
        })
      },
      { threshold: 0.1 }
    )

    const handleVisibility = () => {
      if (document.hidden) {
        setAutoRotate(false)
      }
    }

    observer.observe(el)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
      script.onload = () => setScriptLoaded(true)
      document.head.appendChild(script)
    } else {
      setScriptLoaded(true)
    }
  }, [])

  // Handle two-finger horizontal drag on mobile/touchscreens and trackpads
  useEffect(() => {
    const viewer = modelRef.current
    if (!viewer) return

    let isTwoFingerTouch = false
    let lastTouchX = 0
    let thetaDeg = 0

    const readCurrentTheta = () => {
      try {
        if (typeof viewer.getCameraOrbit === 'function') {
          const orbit = viewer.getCameraOrbit()
          if (orbit && typeof orbit.theta === 'number') {
            return (orbit.theta * 180) / Math.PI
          }
        }
      } catch (err) {}
      return thetaDeg
    }

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        isTwoFingerTouch = true
        lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        thetaDeg = readCurrentTheta()
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && isTwoFingerTouch) {
        const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const dx = currentX - lastTouchX
        lastTouchX = currentX

        // Moving fingers right turns model right, moving left turns left
        thetaDeg -= dx * 0.8
        viewer.cameraOrbit = `${thetaDeg}deg 75deg ${isBag ? '125%' : '110%'}`
        if (typeof viewer.jumpCameraToGoal === 'function') {
          viewer.jumpCameraToGoal()
        }
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        isTwoFingerTouch = false
      }
    }

    // Two-finger trackpad horizontal swipe / wheel
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > 1 || (e.shiftKey && Math.abs(e.deltaY) > 1)) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX
        thetaDeg = readCurrentTheta() + delta * 0.45
        viewer.cameraOrbit = `${thetaDeg}deg 75deg ${isBag ? '125%' : '110%'}`
        if (typeof viewer.jumpCameraToGoal === 'function') {
          viewer.jumpCameraToGoal()
        }
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    }

    viewer.addEventListener('touchstart', handleTouchStart, { passive: false })
    viewer.addEventListener('touchmove', handleTouchMove, { passive: false })
    viewer.addEventListener('touchend', handleTouchEnd, { passive: true })
    viewer.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    viewer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      viewer.removeEventListener('touchstart', handleTouchStart)
      viewer.removeEventListener('touchmove', handleTouchMove)
      viewer.removeEventListener('touchend', handleTouchEnd)
      viewer.removeEventListener('touchcancel', handleTouchEnd)
      viewer.removeEventListener('wheel', handleWheel)
    }
  }, [scriptLoaded, isBag])

  // Apply non-glossy, soft matte finish, brighten dark tones, and double-sided rendering to 3D materials
  useEffect(() => {
    const viewer = modelRef.current
    if (!viewer) return

    const applyMatteAndBrighten = () => {
      try {
        // 1. High-level ModelViewer Material API
        if (viewer.model && viewer.model.materials) {
          viewer.model.materials.forEach((mat) => {
            if (typeof mat.setDoubleSided === 'function') {
              mat.setDoubleSided(true)
            } else {
              mat.doubleSided = true
            }

            const pbr = mat.pbrMetallicRoughness
            if (pbr) {
              pbr.setRoughnessFactor(1.0)
              pbr.setMetallicFactor(0.0)

              if (pbr.metallicRoughnessTexture && typeof pbr.metallicRoughnessTexture.setTexture === 'function') {
                try {
                  pbr.metallicRoughnessTexture.setTexture(null)
                } catch (e) {}
              }
            }

            if (mat.clearcoat) {
              if (typeof mat.clearcoat.setClearcoatFactor === 'function') {
                mat.clearcoat.setClearcoatFactor(0.0)
              }
              if (typeof mat.clearcoat.setClearcoatRoughnessFactor === 'function') {
                mat.clearcoat.setClearcoatRoughnessFactor(1.0)
              }
            }
            if (mat.specular) {
              if (typeof mat.specular.setSpecularFactor === 'function') {
                mat.specular.setSpecularFactor(0.0)
              }
              if (typeof mat.specular.setSpecularColorFactor === 'function') {
                mat.specular.setSpecularColorFactor([0, 0, 0])
              }
            }
            if (mat.ior && typeof mat.ior.setIor === 'function') {
              try {
                mat.ior.setIor(1.0)
              } catch (e) {}
            }
          })
        }

        // 2. Deep recursive traversal across all Three.js materials in the scene
        const visited = new Set()
        const threeMaterials = new Set()

        const scan = (obj, depth = 0) => {
          if (!obj || depth > 6 || visited.has(obj) || typeof obj !== 'object') return
          visited.add(obj)

          if (obj.isMaterial) {
            threeMaterials.add(obj)
            return
          }
          if (obj.isMesh && obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => threeMaterials.add(m))
            } else {
              threeMaterials.add(obj.material)
            }
          }
          if (obj.isScene || obj.isObject3D) {
            obj.traverse((node) => {
              if (node.isMesh && node.material) {
                if (Array.isArray(node.material)) {
                  node.material.forEach((m) => threeMaterials.add(m))
                } else {
                  threeMaterials.add(node.material)
                }
              }
            })
            return
          }

          if (typeof obj.forEach === 'function') {
            try {
              obj.forEach((item) => scan(item, depth + 1))
            } catch (e) {}
          }

          Object.getOwnPropertySymbols(obj).forEach((sym) => {
            try {
              scan(obj[sym], depth + 1)
            } catch (e) {}
          })

          Object.getOwnPropertyNames(obj).forEach((key) => {
            try {
              scan(obj[key], depth + 1)
            } catch (e) {}
          })
        }

        scan(viewer)
        if (viewer.model) scan(viewer.model)

        threeMaterials.forEach((threeMat) => {
          if (!threeMat || !threeMat.isMaterial) return

          // Soft matte finish - zero shine/gloss, gentle fabric texture
          threeMat.roughness = 0.9
          threeMat.metalness = 0.0

          // Rich ambient diffuse lighting so garments are brightly lit and fully visible
          threeMat.envMapIntensity = isFullSleeves ? 1.45 : (isBottomsCompression ? 1.25 : 0.95)

          if ('clearcoat' in threeMat) threeMat.clearcoat = 0.0
          if ('clearcoatRoughness' in threeMat) threeMat.clearcoatRoughness = 1.0
          if ('clearcoatMap' in threeMat) threeMat.clearcoatMap = null
          if ('clearcoatNormalMap' in threeMat) threeMat.clearcoatNormalMap = null
          if ('sheen' in threeMat) threeMat.sheen = 0.0
          if ('specularIntensity' in threeMat) threeMat.specularIntensity = 0.0
          if ('specularIntensityMap' in threeMat) threeMat.specularIntensityMap = null
          if (threeMat.specularColor && typeof threeMat.specularColor.set === 'function') {
            threeMat.specularColor.set(0, 0, 0)
          }
          if ('specularColorMap' in threeMat) threeMat.specularColorMap = null
          if ('ior' in threeMat) threeMat.ior = 1.0
          if ('reflectivity' in threeMat) threeMat.reflectivity = 0.0

          // Natural fabric drape and fold definition
          if (threeMat.normalScale && typeof threeMat.normalScale.set === 'function') {
            threeMat.normalScale.set(0.75, 0.75)
          }

          // Lift dark tones: slightly more brighter for full sleeves unisex top, slightly brighter for bottoms with compression
          if (threeMat.color) {
            const minTone = isFullSleeves ? 0.38 : (isBottomsCompression ? 0.32 : 0.22)
            threeMat.color.r = Math.max(threeMat.color.r, minTone)
            threeMat.color.g = Math.max(threeMat.color.g, minTone)
            threeMat.color.b = Math.max(threeMat.color.b, minTone)
          }

          threeMat.needsUpdate = true
        })
      } catch (err) {
        console.warn('Could not configure 3D material properties', err)
      }
    }

    const runMatte = () => {
      applyMatteAndBrighten()
      setTimeout(applyMatteAndBrighten, 150)
      setTimeout(applyMatteAndBrighten, 600)
    }

    const handleLoad = () => {
      runMatte()
    }

    viewer.addEventListener('load', handleLoad)
    if (viewer.modelIsVisible || viewer.loaded) {
      handleLoad()
    }

    return () => {
      viewer.removeEventListener('load', handleLoad)
    }
  }, [src, scriptLoaded])

  return (
    <div 
      ref={containerRef}
      data-product-media="true"
      className="product-3d-wrapper relative w-full h-full min-h-[260px] bg-white rounded-[28px] overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: '#ffffff', contentVisibility: 'auto', containIntrinsicSize: '100% 390px' }}
    >
      <model-viewer
        ref={modelRef}
        data-product-media="true"
        src={src ? src : undefined}
        alt={alt}
        poster={poster || undefined}
        loading="eager"
        reveal="auto"
        auto-rotate={autoRotate ? true : undefined}
        rotation-per-second="25deg"
        camera-controls
        disable-zoom
        disable-pan
        touch-action="none"
        interaction-prompt="auto"
        camera-orbit={isBag ? "0deg 75deg 125%" : "0deg 75deg 110%"}
        camera-target="auto auto auto"
        min-camera-orbit="auto 75deg auto"
        max-camera-orbit="auto 75deg auto"
        environment-image="neutral"
        exposure={isFullSleeves ? "2.75" : (isBottomsCompression ? "2.35" : "1.85")}
        shadow-intensity="0.10"
        shadow-softness="1.0"
        tone-mapping="neutral"
        bounds="tight"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '260px',
          backgroundColor: '#ffffff',
          background: '#ffffff',
          '--poster-color': '#ffffff',
          '--progress-bar-color': 'transparent',
          '--progress-bar-height': '0px',
          '--progress-mask': 'transparent',
        }}
      >
        <div slot="progress-bar" style={{ display: 'none' }} />
        <div slot="poster" data-product-media="true" style={{ backgroundColor: '#ffffff', background: '#ffffff' }} className="w-full h-full flex flex-col items-center justify-center bg-white p-4">
          {poster ? (
            <img src={poster} alt={alt} data-product-media="true" style={{ backgroundColor: '#ffffff' }} className="max-h-full max-w-full object-contain bg-white" />
          ) : (
            <>
              <div className="w-9 h-9 border-4 border-navy border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-bold text-navy uppercase tracking-widest">Loading 3D Model...</span>
            </>
          )}
        </div>
      </model-viewer>
    </div>
  )
}
