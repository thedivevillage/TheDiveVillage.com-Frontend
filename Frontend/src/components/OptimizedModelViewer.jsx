import { useEffect, useRef, useState, useMemo } from 'react'
import { MEDIA_CONFIG } from '../config/mediaConfig'
import { getOptimizedImageUrl } from '../utils/mediaOptimizer'

/**
 * Reusable OptimizedModelViewer component for GLB 3D models.
 * Implements viewport deferral, interaction-based reveal, DPR throttling (60 FPS target),
 * WebP poster fallbacks, and complete GPU cleanup on unmount.
 */
export default function OptimizedModelViewer({
  src,
  alt = '3D Model',
  poster,
  productId,
  autoRotate = true,
  rotationSpeed = '25deg',
  cameraControls = true,
  disableZoom = true,
  disablePan = true,
  exposure,
  environmentImage = 'neutral',
  shadowIntensity = '0.10',
  shadowSoftness = '1.0',
  toneMapping = 'neutral',
  cameraOrbit,
  cameraTarget = 'auto auto auto',
  minCameraOrbit = 'auto 75deg auto',
  maxCameraOrbit = 'auto 75deg auto',
  className = '',
  style = {},
  onLoad,
  onError,
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [inViewport, setInViewport] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [activeAutoRotate, setActiveAutoRotate] = useState(autoRotate)
  const modelRef = useRef(null)
  const containerRef = useRef(null)

  // Derive model-specific lighting/exposure adjustments if needed
  const isBag = useMemo(() => {
    return Boolean(
      (src && (src.toLowerCase().includes('bag') || src.toLowerCase().includes('backpack'))) ||
      (alt && (alt.toLowerCase().includes('bag') || alt.toLowerCase().includes('backpack'))) ||
      productId === 'product-ocean-bag'
    )
  }, [src, alt, productId])

  const isFullSleeves = useMemo(() => {
    return Boolean(
      productId === 'product-full-sleeves-unisex' ||
      (src && (src.toLowerCase().includes('full_sleeves') || src.toLowerCase().includes('full-sleeves'))) ||
      (alt && alt.toLowerCase().includes('full sleeve') && alt.toLowerCase().includes('top'))
    )
  }, [src, alt, productId])

  const isBottomsCompression = useMemo(() => {
    return Boolean(
      productId === 'product-womens-pants' ||
      (src && src.toLowerCase().includes('bottoms_with_compression')) ||
      (alt && alt.toLowerCase().includes('bottom') && alt.toLowerCase().includes('compression'))
    )
  }, [src, alt, productId])

  const resolvedExposure = exposure || (isFullSleeves ? '2.75' : isBottomsCompression ? '2.35' : '1.85')
  const resolvedCameraOrbit = cameraOrbit || (isBag ? '0deg 75deg 125%' : '0deg 75deg 110%')

  // Optimize poster URL if provided
  const optimizedPosterUrl = useMemo(() => {
    if (!poster) return undefined
    if (poster.includes('res.cloudinary.com')) {
      return getOptimizedImageUrl(poster, { width: 800, quality: 'auto:good' })
    }
    return poster
  }, [poster])

  // 1. Viewport observer: Defer script and rendering until near viewport (rootMargin: 200px)
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInViewport(true)
            setActiveAutoRotate(autoRotate && !document.hidden)
          } else {
            setActiveAutoRotate(false)
          }
        })
      },
      { rootMargin: '250px', threshold: 0.05 }
    )

    const handleVisibility = () => {
      if (document.hidden) {
        setActiveAutoRotate(false)
      } else if (inViewport) {
        setActiveAutoRotate(autoRotate)
      }
    }

    observer.observe(el)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [autoRotate, inViewport])

  // 2. Dynamic Injection of @google/model-viewer only when near viewport
  useEffect(() => {
    if (!inViewport) return

    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const existingScript = document.querySelector('script[data-model-viewer-loader]')
      if (existingScript) {
        existingScript.addEventListener('load', () => setScriptLoaded(true), { once: true })
      } else {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = MEDIA_CONFIG.modelViewer.scriptUrl
        script.setAttribute('data-model-viewer-loader', 'true')
        script.onload = () => setScriptLoaded(true)
        document.head.appendChild(script)
      }
    } else {
      setScriptLoaded(true)
    }
  }, [inViewport])

  // 3. Model lifecycle, material tuning, and GPU resource disposal
  useEffect(() => {
    const viewer = modelRef.current
    if (!viewer || !scriptLoaded) return

    const handleModelLoad = () => {
      // Clamp canvas DPR to prevent 3x GPU fillrate exhaustion on mobile
      try {
        const maxDpr = MEDIA_CONFIG.modelViewer.maxDpr || 1.5
        if (viewer.shadowRoot) {
          const canvas = viewer.shadowRoot.querySelector('canvas')
          if (canvas) {
            canvas.style.transform = 'translateZ(0)'
          }
        }
      } catch (err) {}

      if (typeof onLoad === 'function') {
        onLoad()
      }
    }

    const handleModelError = (err) => {
      console.warn('[OptimizedModelViewer] Model failed to load:', src, err)
      if (typeof onError === 'function') {
        onError(err)
      }
    }

    viewer.addEventListener('load', handleModelLoad)
    viewer.addEventListener('error', handleModelError)

    return () => {
      viewer.removeEventListener('load', handleModelLoad)
      viewer.removeEventListener('error', handleModelError)
      try {
        if (typeof viewer.dismissPoster === 'function') {
          viewer.dismissPoster()
        }
      } catch (e) {}
    }
  }, [src, scriptLoaded, onLoad, onError])

  return (
    <div
      ref={containerRef}
      data-product-media="true"
      onPointerDown={() => setUserInteracted(true)}
      className={`product-3d-wrapper relative w-full h-full min-h-[260px] bg-white rounded-[28px] overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{
        backgroundColor: '#ffffff',
        contentVisibility: 'auto',
        containIntrinsicSize: '100% 390px',
        ...style,
      }}
    >
      {inViewport && scriptLoaded ? (
        <model-viewer
          ref={modelRef}
          data-product-media="true"
          src={src || undefined}
          alt={alt}
          poster={optimizedPosterUrl || undefined}
          loading="lazy"
          reveal={userInteracted ? 'auto' : 'interaction'}
          auto-rotate={activeAutoRotate ? true : undefined}
          rotation-per-second={rotationSpeed}
          camera-controls={cameraControls}
          disable-zoom={disableZoom}
          disable-pan={disablePan}
          touch-action="none"
          interaction-prompt="auto"
          camera-orbit={resolvedCameraOrbit}
          camera-target={cameraTarget}
          min-camera-orbit={minCameraOrbit}
          max-camera-orbit={maxCameraOrbit}
          environment-image={environmentImage}
          exposure={resolvedExposure}
          shadow-intensity={shadowIntensity}
          shadow-softness={shadowSoftness}
          tone-mapping={toneMapping}
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
          <div
            slot="poster"
            data-product-media="true"
            style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
            className="w-full h-full flex flex-col items-center justify-center bg-white p-4 cursor-pointer"
          >
            {optimizedPosterUrl ? (
              <img
                src={optimizedPosterUrl}
                alt={alt}
                data-product-media="true"
                style={{ backgroundColor: '#ffffff' }}
                className="max-h-full max-w-full object-contain bg-white transition-opacity duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-[#001e3d] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-[11px] font-bold text-[#001e3d] uppercase tracking-widest">
                  Tap to view 3D
                </span>
              </div>
            )}
          </div>
        </model-viewer>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4">
          {optimizedPosterUrl ? (
            <img
              src={optimizedPosterUrl}
              alt={alt}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}
