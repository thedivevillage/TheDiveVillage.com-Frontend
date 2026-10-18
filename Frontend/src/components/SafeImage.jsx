import { useState, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

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

function MotionParallaxImg({ src, alt, priority, imgClassName, setFailed, ...props }) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative">
      <motion.img
        style={{ y, scale: 1.25 }}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
        className={`h-full w-full ${imgClassName?.includes('object-') ? '' : 'object-cover'} relative z-[1] ${imgClassName}`}
        {...props}
      />
    </div>
  )
}

/**
 * SafeImage component
 * Renders native hardware-accelerated <img> with lazy-loading and fallback placeholder.
 * Parallax is opt-in to avoid creating dozens of scroll listeners.
 */
export default function SafeImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  disableParallax = false,
  parallax = false,
  priority = false,
  ...props
}) {
  const [failed, setFailed] = useState(false)
  const reduce = useReducedMotion()

  if (!src || failed) {
    return (
      <div className={`overflow-hidden relative bg-[#00172b] ${className}`}>
        <Placeholder alt={alt} className="w-full h-full" />
      </div>
    )
  }

  const useParallaxMotion = parallax && !disableParallax && !reduce

  return (
    <div className={`overflow-hidden relative bg-[#00172b] ${className}`}>
      {useParallaxMotion ? (
        <MotionParallaxImg
          src={src}
          alt={alt}
          priority={priority}
          imgClassName={imgClassName}
          setFailed={setFailed}
          {...props}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className={`h-full w-full ${imgClassName?.includes('object-') ? '' : 'object-cover'} relative z-[1] ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  )
}

export { default as OptimizedImage } from './OptimizedImage'
