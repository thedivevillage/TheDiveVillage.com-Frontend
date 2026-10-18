import { useEffect, useRef, useState, useMemo } from 'react'

/**
 * ModelViewer component (Optimizations & Lazy Deferral Removed)
 * Loads 3D viewer directly without IntersectionObserver delay, interaction-based reveal, or poster downsampling.
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
  const modelRef = useRef(null)

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

  // Direct script injection on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const existingScript = document.querySelector('script[data-model-viewer-loader]')
      if (existingScript) {
        existingScript.addEventListener('load', () => setScriptLoaded(true), { once: true })
      } else {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
        script.setAttribute('data-model-viewer-loader', 'true')
        script.onload = () => setScriptLoaded(true)
        document.head.appendChild(script)
      }
    } else {
      setScriptLoaded(true)
    }
  }, [])

  useEffect(() => {
    const viewer = modelRef.current
    if (!viewer || !scriptLoaded) return

    const handleModelLoad = () => {
      if (typeof onLoad === 'function') {
        onLoad()
      }
    }

    const handleModelError = (err) => {
      console.warn('[ModelViewer] Model failed to load:', src, err)
      if (typeof onError === 'function') {
        onError(err)
      }
    }

    viewer.addEventListener('load', handleModelLoad)
    viewer.addEventListener('error', handleModelError)

    return () => {
      viewer.removeEventListener('load', handleModelLoad)
      viewer.removeEventListener('error', handleModelError)
    }
  }, [src, scriptLoaded, onLoad, onError])

  return (
    <div
      data-product-media="true"
      className={`product-3d-wrapper relative w-full h-full min-h-[260px] bg-white rounded-[28px] overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{
        backgroundColor: '#ffffff',
        ...style,
      }}
    >
      {scriptLoaded ? (
        <model-viewer
          ref={modelRef}
          data-product-media="true"
          src={src || undefined}
          alt={alt}
          poster={poster || undefined}
          auto-rotate={autoRotate ? true : undefined}
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
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4">
          {poster ? (
            <img
              src={poster}
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
