import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Logo from './Logo'
const LogoImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691225/TDV-Media/UI/Logo.png'
import ThemeToggle from './ThemeToggle'
import ViberQRModal from './ViberQRModal'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../hooks/useAuth'
import { prefetchRoute } from '../utils/routePrefetcher'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/shop', label: 'Shop' },
  { to: '/book-us', label: 'Book Us', highlight: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [isViberQrOpen, setIsViberQrOpen] = useState(false)
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { isAuthenticated, user } = useAuth()
  const reduce = useReducedMotion()

  const location = useLocation()
  const [isNightDive, setIsNightDive] = useState(() => {
    if (typeof document !== 'undefined') {
      try {
        if (localStorage.getItem('tdv_night_dive') === 'true') {
          document.body.classList.add('night-dive')
          return true
        }
      } catch (e) {}
      return document.body.classList.contains('night-dive')
    }
    return false
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tdv_night_dive')
      if (stored === 'true') {
        document.body.classList.add('night-dive')
        setIsNightDive(true)
      } else if (stored === 'false') {
        document.body.classList.remove('night-dive')
        setIsNightDive(false)
      }
    } catch (e) {}

    const observer = new MutationObserver(() => {
      setIsNightDive(document.body.classList.contains('night-dive'))
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    setIsNightDive(document.body.classList.contains('night-dive'))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateToolbarBottom = () => {
      const header = document.getElementById('main-toolbar')
      if (header) {
        const visibleBar = header.querySelector('.pointer-events-auto')
        const bottom = visibleBar ? visibleBar.getBoundingClientRect().bottom : header.getBoundingClientRect().bottom
        if (bottom > 0) {
          document.documentElement.style.setProperty('--toolbar-bottom', `${Math.round(bottom)}px`)
        }
      }
    }

    updateToolbarBottom()
    window.addEventListener('resize', updateToolbarBottom)
    window.addEventListener('orientationchange', updateToolbarBottom)
    return () => {
      window.removeEventListener('resize', updateToolbarBottom)
      window.removeEventListener('orientationchange', updateToolbarBottom)
    }
  }, [])

  const toggleNightDive = () => {
    const isNight = document.body.classList.contains('night-dive')
    if (isNight) {
      document.body.classList.remove('night-dive')
      setIsNightDive(false)
      try { localStorage.setItem('tdv_night_dive', 'false') } catch (e) {}
    } else {
      document.body.classList.add('night-dive')
      setIsNightDive(true)
      try { localStorage.setItem('tdv_night_dive', 'true') } catch (e) {}
    }
  }

  const isHomePage = location.pathname === '/'

  // Night dive gets #001C39 without shadow; Home page keeps original translucent styling; all other pages get full opaque blue
  const containerGlass = isNightDive
    ? 'border border-white/20 bg-[#001C39] text-white shadow-none'
    : isHomePage
      ? 'border border-white/25 bg-[#001e3d]/55 backdrop-blur-2xl text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]'
      : 'border border-white/20 bg-[#003865] text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]'

  const textColor = 'text-white'
  const borderColor = 'border-white/20'
  const btnBg = 'bg-white/10'
  const btnText = 'text-white'

  return (
    <header id="main-toolbar" className="fixed top-0 left-0 right-0 z-[9999] w-full pointer-events-none flex flex-col items-center pt-2.5 sm:pt-0 px-3 xs:px-4 sm:px-4 lg:px-8">
      {/* MOBILE TOOLBAR (sm:hidden - Exact match to design) */}
      <div className={`sm:hidden pointer-events-auto mx-auto flex h-[54px] w-full items-center justify-between rounded-2xl ${containerGlass} px-3 transition-all duration-300`}>
        {/* Left: Hamburger Menu Button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center text-white transition active:scale-95 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Center: Brand Logo Image Only (Mobile Only) */}
        <Link to="/" className="flex items-center justify-center group focus:outline-none" aria-label="The Dive Village">
          <img
            src={LogoImg}
            alt="The Dive Village"
            className="h-7 xs:h-8 w-auto object-contain invert brightness-0 transition duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Right: Neomorphism Night Dive Toggle (Mobile Only) */}
        <button
          type="button"
          onClick={toggleNightDive}
          className="flex flex-col items-center justify-center cursor-pointer transition active:scale-95 px-1 py-0.5 shrink-0 rounded-xl focus:outline-none"
          aria-label="Toggle Night Mode"
          title={isNightDive ? 'Day Mode' : 'Night Mode'}
        >
          <ThemeToggle isNightDive={isNightDive} className="inline-block" />
          <span className="text-[9px] font-extrabold tracking-tight mt-0.5 text-white/90 uppercase whitespace-nowrap leading-none select-none">
            {isNightDive ? 'Day Mode' : 'Night Mode'}
          </span>
        </button>
      </div>

      {/* DESKTOP TOOLBAR (hidden sm:grid - 100% Preserved) */}
      <div className={`hidden sm:grid pointer-events-auto mx-auto sm:grid-cols-[1fr_auto_1fr] h-[64px] lg:h-[68px] w-full max-w-7xl 2xl:max-w-[1700px] items-center rounded-b-2xl sm:rounded-b-3xl ${containerGlass} sm:px-8 lg:px-12 transition-all duration-300`}>

        {/* Left Side: Home, Book Us, Shop (desktop) */}
        <div className="flex items-center justify-start gap-4 sm:gap-4 lg:gap-8 pl-1 sm:pl-2">
          <NavLink
            to="/"
            end
            onMouseEnter={() => prefetchRoute('/')}
            onTouchStart={() => prefetchRoute('/')}
            className={({ isActive }) =>
              `relative whitespace-nowrap font-body text-[15px] sm:text-[15px] font-bold tracking-wide transition-all duration-300 focus:outline-none focus-visible:outline-none ${isActive
                ? 'text-[#FFCD00] after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[2.5px] after:bg-[#FFCD00]'
                : `${textColor} hover:text-[#FFCD00] after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[2.5px] after:bg-[#FFCD00] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300`
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/book-us"
            onMouseEnter={() => prefetchRoute('/book-us')}
            onTouchStart={() => prefetchRoute('/book-us')}
            className={({ isActive }) =>
              `relative whitespace-nowrap font-body text-[15px] sm:text-[15px] font-bold tracking-wide transition-all duration-300 focus:outline-none focus-visible:outline-none ${isActive
                ? 'text-[#FFCD00] after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[2.5px] after:bg-[#FFCD00]'
                : `${textColor} hover:text-[#FFCD00] after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[2.5px] after:bg-[#FFCD00] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300`
              }`
            }
          >
            Book Us
          </NavLink>
          <NavLink
            to="/shop"
            onMouseEnter={() => prefetchRoute('/shop')}
            onTouchStart={() => prefetchRoute('/shop')}
            className={({ isActive }) =>
              `hidden lg:block relative whitespace-nowrap font-body text-[14px] sm:text-[15px] font-bold tracking-wide transition-all duration-300 focus:outline-none focus-visible:outline-none ${isActive
                ? 'text-[#FFCD00] after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[2.5px] after:bg-[#FFCD00]'
                : `${textColor} hover:text-[#FFCD00] after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[2.5px] after:bg-[#FFCD00] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300`
              }`
            }
          >
            Shop
            <span className="absolute -top-1 -right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFCD00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFCD00]"></span>
            </span>
          </NavLink>
        </div>

        {/* Middle: Logo (Desktop Only) */}
        <div className="hidden sm:flex justify-center items-center px-1.5 sm:px-3 shrink-0">
          <Logo light={true} compact={true} className="[&>img]:h-8 xs:[&>img]:h-9 sm:[&>img]:h-11 lg:[&>img]:h-13" />
        </div>

        {/* Right Side: Call, Night toggle (desktop), profile, menu */}
        <div className="flex items-center justify-end gap-2 xs:gap-2.5 sm:gap-3 pr-1 sm:pr-2">

          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className={`flex h-9 w-9 sm:h-10 sm:w-auto items-center justify-center gap-1.5 rounded-full sm:rounded-xl border ${borderColor} ${btnBg} backdrop-blur-md px-0 sm:px-3 ${btnText} transition duration-300 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] cursor-pointer shadow-sm active:scale-95 shrink-0`}
            aria-label="Call & Contact Options"
            title="Call"
          >
            <PhoneIcon />
            <span className="hidden xl:inline text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap">Get In Touch</span>
          </button>

          <button
            type="button"
            onClick={toggleNightDive}
            className={`hidden sm:flex h-8.5 w-8.5 sm:h-10 sm:w-auto items-center justify-center gap-1.5 rounded-xl border ${borderColor} ${btnBg} backdrop-blur-md px-2 sm:px-3 ${btnText} transition duration-300 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shrink-0 cursor-pointer shadow-sm active:scale-95`}
            aria-label="Toggle Night Dive mode"
          >
            <ThemeToggle isNightDive={isNightDive} className="hidden lg:inline-block" />
            <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap select-none">
              {isNightDive ? 'Day Dive' : 'Night Dive'}
            </span>
          </button>

          <Link
            to={isAuthenticated ? '/dashboard/profile' : '/login'}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full sm:rounded-xl border ${borderColor} ${btnBg} backdrop-blur-md ${btnText} transition duration-300 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] shrink-0 shadow-sm active:scale-95`}
            aria-label={isAuthenticated ? 'Account' : 'Login'}
            title={user?.displayName || user?.email || 'Profile'}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="h-5 w-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <UserIcon />
            )}
          </Link>

          <button
            type="button"
            className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border ${borderColor} ${btnBg} backdrop-blur-md ${btnText} transition duration-300 hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] lg:hidden active:scale-95 cursor-pointer`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto mt-2 w-full max-w-7xl 2xl:max-w-[1700px] overflow-hidden rounded-3xl border border-white/20 ${isNightDive ? 'bg-[#001C39] shadow-none' : (!isHomePage ? 'bg-[#003865] shadow-2xl' : 'bg-[#001e3d]/90 shadow-2xl')} backdrop-blur-3xl text-white`}
          >
            <div className="px-5 py-4">
              {/* Quick Actions Strip: Cart & Wishlist */}
              <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-white/15">
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between bg-white/10 hover:bg-[#FFCD00] hover:text-[#001e3d] rounded-2xl px-3.5 py-2.5 text-xs font-bold transition active:scale-95 border border-white/15 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CartIcon />
                    <span>My Cart</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="bg-[#FFCD00] text-[#001e3d] text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between bg-white/10 hover:bg-[#FFCD00] hover:text-[#001e3d] rounded-2xl px-3.5 py-2.5 text-xs font-bold transition active:scale-95 border border-white/15 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-[#FFCD00] text-[#001e3d] text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onMouseEnter={() => prefetchRoute(item.to)}
                    onTouchStart={() => prefetchRoute(item.to)}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 font-heading text-[15px] font-bold transition duration-hover ${isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => {
                    setOpen(false)
                    setIsCallModalOpen(true)
                  }}
                  className="rounded-xl px-4 py-3 font-heading text-[15px] font-bold transition duration-hover text-left flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer"
                >
                  <PhoneIcon />
                  Call / Connect Options
                </button>
                <button
                  onClick={() => {
                    toggleNightDive()
                    setOpen(false)
                  }}
                  className="rounded-xl px-4 py-3 font-heading text-[15px] font-bold transition duration-hover text-left text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <ThemeToggle isNightDive={isNightDive} className="inline-block" />
                  <span>{isNightDive ? 'Switch to Day Dive' : 'Switch to Night Dive'}</span>
                </button>
                <Link
                  to={isAuthenticated ? '/dashboard/profile' : '/login'}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-heading text-[15px] font-bold transition duration-hover text-left flex items-center gap-2.5 text-white hover:bg-white/10"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-5 w-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <UserIcon />
                  )}
                  <span>{isAuthenticated ? (user?.displayName || 'My Profile') : 'Login / Register'}</span>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onOpenViberQr={() => setIsViberQrOpen(true)}
      />
      <ViberQRModal
        isOpen={isViberQrOpen}
        onClose={() => setIsViberQrOpen(false)}
      />
    </header>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h3l1.5 5-2 1.5a12 12 0 005 5L16 13l5 1.5V18a2 2 0 01-2 2A15 15 0 015 5a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h2l2.2 10h9.6L20 8H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CallModal({ isOpen, onClose, onOpenViberQr }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const options = [
    {
      id: 'phone',
      title: 'Phone Call',
      subtitle: '+91 7338257002',
      href: 'tel:+917338257002',
      icon: (
        <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    {
      id: 'email',
      title: 'Mail',
      subtitle: 'sanjeev.bajaj@thedivevillage.com',
      href: 'mailto:sanjeev.bajaj@thedivevillage.com',
      icon: (
        <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Message',
      subtitle: 'Instant Chat (+91 7338257002)',
      href: 'https://wa.me/917338257002',
      icon: (
        <svg className="w-5 h-5 text-navy" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      )
    },
    {
      id: 'facebook',
      title: 'Facebook',
      subtitle: 'Connect on Facebook',
      href: 'https://www.facebook.com/profile.php?id=61595366960524',
      icon: (
        <svg className="w-5 h-5 text-navy" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.074-2.238c1.099.304 2.262.47 3.454.47 6.627 0 12-4.975 12-11.121C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.963z" />
        </svg>
      )
    },
    {
      id: 'viber',
      title: 'Viber',
      subtitle: 'Connect via Viber (+91 7338257002)',
      href: 'viber://add?number=917338257002',
      icon: (
        <svg className="w-5 h-5 text-navy" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.39 14.88c-.64-.26-3.76-1.85-4.35-2.07-.59-.22-1.02-.33-1.45.33-.43.66-1.68 2.07-2.07 2.51-.39.44-.78.5-1.42.22-3.64-1.57-6.03-5.26-6.42-5.92-.39-.66.39-.66 1.13-2.14.15-.3.07-.56-.04-.78-.11-.22-.98-2.36-1.34-3.23-.35-.85-.71-.73-1-.75l-.85-.02c-.3 0-.78.11-1.19.56-.41.45-1.56 1.52-1.56 3.71 0 2.19 1.6 4.31 1.82 4.61.22.3 3.15 4.81 7.63 6.75 3.7 1.6 4.45 1.28 5.25 1.2.8-.08 2.57-1.05 2.93-2.07.36-1.02.36-1.89.25-2.07-.11-.18-.41-.29-1.05-.55z" />
        </svg>
      )
    }
  ]

  const handleCardClick = (opt, e) => {
    if (opt.id === 'viber') {
      e.preventDefault()
      onClose()

      const isMobilePhone = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobilePhone) {
        const start = Date.now()
        window.location.href = 'viber://add?number=917338257002'
        setTimeout(() => {
          if (!document.hidden && Date.now() - start < 2000) {
            onOpenViberQr()
          }
        }, 1200)
      } else {
        onOpenViberQr()
      }
      return
    }

    if (!opt.href || opt.href === '#') {
      e.preventDefault()
    }
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-center justify-center p-4 pointer-events-auto overflow-hidden"
          style={{ top: 'var(--toolbar-bottom, 64px)' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-[32px] p-5 xs:p-6 sm:p-8 shadow-2xl border border-navy/10 z-10 text-navy pointer-events-auto max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy/10 pb-4 mb-6">
              <div>
                <h3 className="font-heading text-2xl font-bold text-navy">Get In Touch</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="w-9 h-9 rounded-full bg-navy/5 text-navy font-bold flex items-center justify-center hover:bg-navy hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Options Grid */}
            <div className="space-y-3">
              {options.map((opt) => (
                <a
                  key={opt.id}
                  href={opt.href || '#'}
                  target={['whatsapp', 'messenger'].includes(opt.id) ? '_blank' : '_self'}
                  rel={['whatsapp', 'messenger'].includes(opt.id) ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleCardClick(opt, e)}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-navy/5 hover:bg-navy/10 border border-navy/10 transition duration-200 group shadow-sm cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-navy/10 flex items-center justify-center shadow-sm shrink-0">
                      {opt.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-navy text-sm sm:text-base group-hover:text-black transition-colors">{opt.title}</h4>
                      <p className="text-xs sm:text-[13px] text-navy/70 font-medium truncate sm:whitespace-normal">{opt.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-navy/40 group-hover:text-navy group-hover:translate-x-1 transition-all shrink-0">
                    →
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}



