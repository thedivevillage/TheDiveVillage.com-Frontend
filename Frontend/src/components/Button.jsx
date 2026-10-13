import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { prefetchRoute } from '../utils/routePrefetcher'

const variants = {
  primary:
    'bg-[#00223D] text-white border border-[#00223D] shadow-md hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  secondary:
    'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  gold:
    'bg-[#00223D] text-white border border-[#00223D] shadow-md hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  navy:
    'bg-[#00223D] text-white border border-[#00223D] shadow-md hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  accent:
    'bg-[#00223D] text-white border border-[#00223D] shadow-md hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  outline:
    'bg-[#F0F2F5] border border-navy/15 text-navy hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  outlineWhite:
    'bg-white/5 backdrop-blur-md border border-white/25 text-white hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  glass:
    'bg-white/15 backdrop-blur-xl border border-white/30 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  glassSecondary:
    'bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] active:scale-[0.98]',
  ghost:
    'bg-transparent text-navy hover:bg-navy/10 active:scale-[0.98]',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    as,
    ...props
  },
  forwardedRef
) {
  const reduce = useReducedMotion()
  const Comp = as ? motion.create(as) : motion.button

  const handleMouseEnter = (e) => {
    if (props.to) prefetchRoute(props.to)
    if (props.href && props.href.startsWith('/')) prefetchRoute(props.href)
    if (props.onMouseEnter) props.onMouseEnter(e)
  }

  return (
    <Comp
      ref={forwardedRef}
      type={as ? undefined : type}
      onMouseEnter={handleMouseEnter}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-heading text-sm font-bold tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
})

export default Button
