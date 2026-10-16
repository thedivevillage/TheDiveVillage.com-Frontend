import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import {
  getLqipUrl,
  getOptimizedImageUrl,
  getPresetImageUrl,
  getResponsiveSrcSet,
  isMediaLoaded,
  markMediaLoaded,
} from '../utils/mediaOptimizer'
import { MEDIA_CONFIG } from '../config/mediaConfig'

function FallbackPlaceholder({ alt, className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-[#00172b] text-white/50 ${className}`}
      role="img"
      aria-label={alt || 'Image unavailable'}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#00AEC7" strokeWidth="1.5" />
        <path
          d="M7 14c2-3 4-4.5 6-5 0 2.5-.5 5-2 7-2 .6-3.5.2-4-2z"
          fill="#003865"
          opacity="0.85"
        />
        <circle cx="15.5" cy="8.5" r="1.5" fill="#FF6106" />
      </svg>
      <span className="text-[11px] font-heading font-semibold text-white/50">The Dive Village</span>
    </div>
  )
}

/**
 * Reusable OptimizedImage component for Cloudinary assets.
 * Implements f_auto, q_auto:good, c_limit, responsive srcset/sizes, LQIP blur-up, and CLS protection.
 */
export default function OptimizedImage({
  src,
  alt = '',
  preset = null,
  targetWidth = 900,
  quality = 'auto:good',
  responsive = true,
  widths = [320, 640, 960, 1280, 1600],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  lqip = true,
  aspectRatio = null,
  width = undefined,
  height = undefined,
  className = '',
  imgClassName = '',
  disableParallax = true,
  ...props
}) {
  const targetSrc = useMemo(() => {
    if (!src) return ''
    if (preset) {
      return getPresetImageUrl(src, preset) || src
    }
    return getOptimizedImageUrl(src, { width: targetWidth, quality }) || src
  }, [src, preset, targetWidth, quality])

  const srcSetString = useMemo(() => {
    if (!responsive || !src || !src.includes('res.cloudinary.com')) return undefined
    return getResponsiveSrcSet(src, widths)
  }, [responsive, src, widths])

  const alreadyCached = useMemo(() => isMediaLoaded(targetSrc), [targetSrc])
  const [loaded, setLoaded] = useState(alreadyCached)
  const [failed, setFailed] = useState(false)
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const reduce = useReducedMotion()

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

  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  const lqipUrl = useMemo(() => {
    if (!lqip || !src || alreadyCached || priority) return null
    return getLqipUrl(src)
  }, [src, lqip, alreadyCached, priority])

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
      <div
        className={`overflow-hidden relative bg-[#00172b] ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <FallbackPlaceholder alt={alt} className="w-full h-full" />
      </div>
    )
  }

  const useParallax = !reduce && !disableParallax

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative bg-[#00172b] ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* 1. Low Quality Image Placeholder (LQIP): Instant ~300-500 byte blurred micro-preview */}
      {lqipUrl && !alreadyCached && (
        <img
          src={lqipUrl}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full ${
            imgClassName?.includes('object-') ? '' : 'object-cover'
          } filter blur-[12px] scale-110 pointer-events-none z-0 ${imgClassName}`}
        />
      )}

      {/* 2. High-Performance Modern Image */}
      {useParallax ? (
        <motion.img
          ref={imgRef}
          style={{ y, scale: 1.2 }}
          src={targetSrc}
          srcSet={srcSetString}
          sizes={srcSetString ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={handleLoadSuccess}
          onError={() => setFailed(true)}
          className={`h-full w-full ${
            imgClassName?.includes('object-') ? '' : 'object-cover'
          } relative z-[1] ${loaded ? 'opacity-100' : 'opacity-0'} ${
            alreadyCached ? '' : 'transition-opacity duration-300 ease-out'
          } ${imgClassName}`}
          {...props}
        />
      ) : (
        <img
          ref={imgRef}
          src={targetSrc}
          srcSet={srcSetString}
          sizes={srcSetString ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={handleLoadSuccess}
          onError={() => setFailed(true)}
          className={`h-full w-full ${
            imgClassName?.includes('object-') ? '' : 'object-cover'
          } relative z-[1] ${loaded ? 'opacity-100' : 'opacity-0'} ${
            alreadyCached ? '' : 'transition-opacity duration-300 ease-out'
          } ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  )
}
