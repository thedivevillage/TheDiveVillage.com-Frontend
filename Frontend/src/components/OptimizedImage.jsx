import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

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
 * OptimizedImage component (All Optimizations & Loading Priorities Removed)
 * Directly renders raw image without LQIP placeholders, downscaling, or fetchpriority.
 */
export default function OptimizedImage({
  src,
  alt = '',
  aspectRatio = null,
  width = undefined,
  height = undefined,
  className = '',
  imgClassName = '',
  disableParallax = true,
  priority = false,
  ...props
}) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

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
      {useParallax ? (
        <motion.img
          ref={imgRef}
          style={{ y, scale: 1.2 }}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className={`h-full w-full ${
            imgClassName?.includes('object-') ? '' : 'object-cover'
          } relative z-[1] ${imgClassName}`}
          {...props}
        />
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className={`h-full w-full ${
            imgClassName?.includes('object-') ? '' : 'object-cover'
          } relative z-[1] ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  )
}
