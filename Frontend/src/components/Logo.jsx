import { Link } from 'react-router'
const LogoImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691225/TDV-Media/UI/Logo.png'

export default function Logo({ className = '', compact = false, light = false }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      aria-label="TheDiveVillage home"
    >
      <img 
        src={LogoImg} 
        alt="The Dive Village" 
        className={`h-9 w-auto object-contain transition duration-hover group-hover:scale-105 ${light ? 'invert brightness-0' : ''}`} 
      />
      {!compact && (
        <div className="flex flex-col items-center justify-center -mt-1">
          <span className={`font-heading text-lg sm:text-xl tracking-wider leading-none ${light ? 'text-white' : 'text-navy'}`}>
            THE DIVE VILLAGE
          </span>
          <span className={`font-body text-[8px] sm:text-[9px] font-bold tracking-[0.2em] leading-none ${light ? 'text-white/80' : 'text-navy/80'}`}>
            SCUBA EXPERIENCES
          </span>
        </div>
      )}
    </Link>
  )
}
