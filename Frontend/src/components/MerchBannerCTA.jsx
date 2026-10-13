import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import useNightDive from '../hooks/useNightDive'
const bannerImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791686007/TDV-Media/Merch/banner.jpg';

const pop1 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458274/TDV-Media/Products/pop1.webp';
const pop2 = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791458275/TDV-Media/Products/pop2.webp';

export default function MerchBannerCTA({ className = '' }) {
  const isNightDive = useNightDive()
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/shop')
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        onClick={handleClick}
        data-shop-banner="true"
        className={`shop-hero-banner group relative rounded-[24px] sm:rounded-[36px] lg:rounded-[40px] overflow-hidden bg-[#001428] shadow-lift ${isNightDive ? 'border-2 border-[#001C39]' : 'border border-white/10 hover:border-white/30'} w-full h-[190px] xs:h-[230px] sm:h-[280px] lg:h-[450px] flex items-center justify-end cursor-pointer transition-all duration-300 hover:scale-[1.008]`}
      >
        <img
          src={bannerImg}
          alt="Merchandise Banner"
          className="w-full h-full object-cover object-center pointer-events-none block"
        />

        {/* Left Side Blue Gradient Overlay */}
        <div
          className="absolute inset-y-0 left-0 w-[55%] sm:w-[48%] lg:w-[42%] pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(to right, #003865 0%, rgba(0, 56, 101, 0.96) 20%, rgba(0, 56, 101, 0.82) 42%, rgba(0, 56, 101, 0.58) 64%, rgba(0, 56, 101, 0.28) 82%, rgba(0, 56, 101, 0.08) 93%, transparent 100%)',
          }}
        />

        {/* Left Side Typography and Button */}
        <div className="absolute left-4 xs:left-7 sm:left-10 lg:left-14 top-0 bottom-0 flex flex-col justify-center z-20 pointer-events-none w-[60%] xs:w-[55%] sm:max-w-md pr-2">
          <h2 className="font-heading text-base xs:text-lg sm:text-3xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] text-left sm:text-justify sm:[text-align-last:justify] mb-2 sm:mb-6">
            MADE TO FIT<br />
            <span className="text-[#FFCD00] block mt-0.5 sm:mt-0">ALL BODY TYPES</span>
          </h2>
          <div className="inline-flex w-max items-center gap-1.5 sm:gap-2.5 rounded-full bg-[#00223D] text-white px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 group-hover:bg-[#FFCD00] group-hover:text-[#001e3d] group-hover:scale-105 pointer-events-auto border border-white/20 shadow-md">
            <span>Shop Now</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1 sm:w-3.5 sm:h-3.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Right Column: 3D Flipping Product Tag */}
        <div className="absolute right-3 sm:right-8 lg:right-12 top-0 bottom-0 z-10 shrink-0 h-full hidden sm:flex items-center pointer-events-none">
          <FlippingProductTag />
        </div>
      </div>
    </div>
  )
}

function FlippingProductTag() {
  return (
    <div className="relative h-full flex flex-col items-center justify-center select-none pointer-events-none py-2 sm:py-4">
      {/* Hanging Cord */}
      <div className="w-0.5 h-2.5 sm:h-3.5 lg:h-4 bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.7)] mb-[-2px] relative z-20 shrink-0">
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white -top-1 -left-[2px] sm:-left-[3px] absolute shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
      </div>

      {/* 3D Perspective Container matched to exact 447x864 image aspect ratio */}
      <div className="perspective-1000 h-[110px] xs:h-[135px] sm:h-[175px] lg:h-[220px] aspect-[447/864] relative">
        <motion.div
          animate={{ rotateY: -360 }}
          transition={{
            duration: 18,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}
          className="w-full h-full preserve-3d relative rounded-xl sm:rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT SIDE (pop1.webp) */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden backface-hidden bg-transparent"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={pop1}
              alt="Product Tag Front"
              className="w-full h-full object-fill rounded-xl sm:rounded-2xl"
            />
          </div>

          {/* BACK SIDE (pop2.webp) */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden backface-hidden bg-transparent"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <img
              src={pop2}
              alt="Product Tag Back"
              className="w-full h-full object-fill rounded-xl sm:rounded-2xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
