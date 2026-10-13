import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import Badge from './Badge'
import SafeImage from './SafeImage'
import { formatCurrency } from '../utils/formatCurrency'

export default function ExperienceCard({ item }) {
  const reduce = useReducedMotion()

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -8, scale: 1.03 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-card bg-white/10 backdrop-blur-md border border-white/20 shadow-card hover:shadow-lift"
    >
      <Link to="/shop" className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
        <div className="relative aspect-[4/5] overflow-hidden">
          <SafeImage
            src={item.image}
            alt={item.title}
            className="absolute inset-0 h-full w-full"
            imgClassName="transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 z-10">
            <Badge tone={item.badgeTone || 'accent'}>{item.badge}</Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent p-4 pt-16">
            <h3 className="font-heading text-base font-bold text-white">{item.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/85">
              <PinIcon />
              {item.location}
            </p>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  )
}
