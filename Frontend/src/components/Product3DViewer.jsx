import { useEffect, useRef, useState } from 'react'
import { precacheMediaAsset } from '../utils/mediaCache'
import { markMediaLoaded } from '../utils/mediaOptimizer'

export default function Product3DViewer({ src, alt = '3D Product Model', productId, poster }) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const modelRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (src) {
      precacheMediaAsset(src)
      markMediaLoaded(src)
    }
  }, [src])

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

  const cameraDistance = isBag ? '108%' : isBottomsCompression ? '108%' : '102%'

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
        viewer.cameraOrbit = `${thetaDeg}deg 75deg ${cameraDistance}`
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
        viewer.cameraOrbit = `${thetaDeg}deg 75deg ${cameraDistance}`
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
  }, [scriptLoaded, cameraDistance])

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

        // 2. Safe traversal across Three.js materials in the scene
        const visited = new Set()
        const threeMaterials = new Set()

        const FORBIDDEN_KEYS = new Set([
          'ref', 'key', '_owner', '_store', 'children',
          'stateNode', 'memoizedProps', 'pendingProps', 'memoizedState',
          'return', 'sibling', 'child', 'alternate',
          'dependencies', 'current', '_debugOwner', '_debugSource',
          'parentNode', 'parentElement', 'childNodes',
          'firstChild', 'lastChild', 'previousSibling', 'nextSibling',
          'ownerDocument', 'defaultView', 'style'
        ])

        const isForbiddenProp = (k) => {
          if (typeof k !== 'string') return false
          if (FORBIDDEN_KEYS.has(k)) return true
          if (k.startsWith('__react') || k.startsWith('_react') || k.startsWith('__v_')) return true
          return false
        }

        const scan = (obj, depth = 0) => {
          if (!obj || depth > 6 || typeof obj !== 'object' || visited.has(obj)) return
          visited.add(obj)

          // Never touch React virtual elements, Fibers, or Window
          if (obj.$$typeof || obj._reactInternals || (obj.stateNode && obj.memoizedProps)) return
          if (typeof Window !== 'undefined' && obj instanceof Window) return

          // Three.js material found
          if (obj.isMaterial) {
            threeMaterials.add(obj)
            return
          }

          // Three.js mesh with material
          if (obj.isMesh && obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m && m.isMaterial && threeMaterials.add(m))
            } else if (obj.material && obj.material.isMaterial) {
              threeMaterials.add(obj.material)
            }
          }

          // Three.js scene / Object3D: use native traverse for speed and safety
          if (obj.isScene || obj.isObject3D) {
            try {
              obj.traverse((node) => {
                if (node && node.isMesh && node.material) {
                  if (Array.isArray(node.material)) {
                    node.material.forEach((m) => m && m.isMaterial && threeMaterials.add(m))
                  } else if (node.material && node.material.isMaterial) {
                    threeMaterials.add(node.material)
                  }
                }
              })
            } catch (e) {}
            return
          }

          // If it is a DOM Node (like <model-viewer>), ONLY inspect its Symbols, never its DOM/React property names!
          const isDomNode = typeof Node !== 'undefined' && obj instanceof Node
          if (!isDomNode) {
            if (Array.isArray(obj) || typeof obj.forEach === 'function') {
              try {
                obj.forEach((item) => scan(item, depth + 1))
              } catch (e) {}
            }

            try {
              const names = Object.getOwnPropertyNames(obj)
              for (let i = 0; i < names.length; i++) {
                const key = names[i]
                if (isForbiddenProp(key)) continue

                try {
                  const descriptor = Object.getOwnPropertyDescriptor(obj, key)
                  if (descriptor && descriptor.get && !descriptor.set) {
                    continue
                  }
                  scan(obj[key], depth + 1)
                } catch (e) {}
              }
            } catch (e) {}
          }

          // Traverse Symbols (model-viewer stores scene, renderer, materials on symbols)
          try {
            const symbols = Object.getOwnPropertySymbols(obj)
            for (let i = 0; i < symbols.length; i++) {
              try {
                scan(obj[symbols[i]], depth + 1)
              } catch (e) {}
            }
          } catch (e) {}
        }

        // Scan model-viewer symbols and model properties safely
        scan(viewer)
        if (viewer.model) {
          scan(viewer.model)
          if (viewer.model.materials && Array.isArray(viewer.model.materials)) {
            viewer.model.materials.forEach((mat) => scan(mat, 1))
          }
        }

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
      className="product-3d-wrapper relative w-full h-full min-h-[320px] bg-white rounded-lg overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: '#ffffff' }}
    >
      <model-viewer
        ref={modelRef}
        data-product-media="true"
        src={src ? src : undefined}
        alt={alt}
        poster={poster || undefined}
        reveal="auto"
        auto-rotate={autoRotate ? true : undefined}
        rotation-per-second="25deg"
        camera-controls
        disable-zoom
        disable-pan
        touch-action="none"
        interaction-prompt="none"
        camera-orbit={`0deg 75deg ${cameraDistance}`}
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
          minHeight: '320px',
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

export { default as OptimizedModelViewer } from './OptimizedModelViewer'
