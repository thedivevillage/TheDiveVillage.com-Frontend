import { motion, useReducedMotion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = true,
  as: Component = 'div',
  ...props
}) {
  const reduce = useReducedMotion()
  const Comp = motion.create(Component)

  return (
    <Comp
      whileHover={
        hover && !reduce ? { y: -6, scale: 1.02, boxShadow: '0 16px 40px rgba(0, 56, 101, 0.18)' } : undefined
      }
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`rounded-card bg-white/10 backdrop-blur-md border border-white/20 shadow-card ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
