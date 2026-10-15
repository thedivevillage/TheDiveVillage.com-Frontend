import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { getLqipUrl, getOptimizedImageUrl, isMediaLoaded, markMediaLoaded } from '../utils/mediaOptimizer'

function Placeholder({ alt, className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-[#00172b] text-white/50 ${className}`}
      role="img"
      aria-label={alt || 'Image unavailable'}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="#00AEC7" strokeWidth="1.5" />
        <path
          d="M7 14c2-3 4-4.5 6-5 0 2.5-.5 5-2 7-2 .6-3.5.2-4-2z"
          fill="#003865"
          opacity="0.85"
        />
        <circle cx="15.5" cy="8.5" r="1.5" fill="#FF6106" />
      </svg>
      <span className="text-[11px] font-heading font-semibold text-white/50">TheDiveVillage</span>
    </div>
  )
}

export default function SafeImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  dark = false,
  lqip = true,
  targetWidth = 900,
  disableParallax = false,
  ...props
}) {
  const targetSrc = useMemo(() => {
    if (!src) return ''
    return getOptimizedImageUrl(src, { width: targetWidth }) || src
  }, [src, targetWidth])

  // Check if image is already cached or previously loaded in this session
  const alreadyCached = useMemo(() => isMediaLoaded(targetSrc), [targetSrc])
  const [loaded, setLoaded] = useState(alreadyCached)
  const [failed, setFailed] = useState(false)
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const reduce = useReducedMotion()

  // Reset when src changes
  useEffect(() => {
    const isCached = isMediaLoaded(targetSrc)
    if (isCached) {
      setLoaded(true)
    }
    setFailed(false)
  }, [targetSrc])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Parallax shifts image up and down within its bounds
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  // Ultra-lightweight ~400-byte Low Quality Image Placeholder
  const lqipUrl = useMemo(() => {
    if (!lqip || !src || alreadyCached) return null
    return getLqipUrl(src)
  }, [src, lqip, alreadyCached])

  // Check if browser has it in memory cache already on mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0 && !loaded) {
      setLoaded(true)
      markMediaLoaded(targetSrc)
    }
  }, [targetSrc, loaded])

  const handleLoadSuccess = () => {
    setLoaded(true)
    markMediaLoaded(targetSrc)
  }

  if (!src || failed) {
    return (
      <div className={`overflow-hidden relative bg-[#00172b] ${className}`}>
        <Placeholder alt={alt} className="w-full h-full" />
      </div>
    )
  }

  const useParallaxMotion = !reduce && !disableParallax

  return (
    <div ref={containerRef} className={`overflow-hidden relative bg-[#00172b] ${className}`}>
      {/* 1. Low Quality Image Placeholder (LQIP): Instant 400-byte blurred silhouette */}
      {/* Stays permanently mounted underneath at z-0 while image loads. NEVER reveals background. */}
      {lqipUrl && !alreadyCached && (
        <img
          src={lqipUrl}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full ${imgClassName?.includes('object-') ? '' : 'object-cover'} filter blur-[10px] scale-110 pointer-events-none z-0 ${imgClassName}`}
        />
      )}

      {/* 2. Proper High-Resolution Media: Sits directly on top at z-[1] */}
      {useParallaxMotion ? (
        <motion.img
          ref={imgRef}
          style={{ y, scale: 1.25 }}
          src={targetSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoadSuccess}
          onError={() => setFailed(true)}
          className={`h-full w-full ${imgClassName?.includes('object-') ? '' : 'object-cover'} relative z-[1] ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${alreadyCached ? '' : 'transition-opacity duration-300 ease-out'} ${imgClassName}`}
          {...props}
        />
      ) : (
        <img
          ref={imgRef}
          src={targetSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoadSuccess}
          onError={() => setFailed(true)}
          className={`h-full w-full ${imgClassName?.includes('object-') ? '' : 'object-cover'} relative z-[1] ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${alreadyCached ? '' : 'transition-opacity duration-300 ease-out'} ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  )
}
