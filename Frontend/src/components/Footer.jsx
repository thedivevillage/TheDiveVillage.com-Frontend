import { useState } from 'react'
import { Link } from 'react-router'
import useNightDive from '../hooks/useNightDive'
const footerLogoImg = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691227/TDV-Media/UI/footer%20logo.png'
import ViberQRModal from './ViberQRModal'

const QUICK = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/book-us', label: 'Book Us' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/shop', label: 'Shop' },
  { to: '/contact', label: 'Contact Us' },
]

const LEGAL = [
  { to: '/contact', label: 'Privacy Policy' },
  { to: '/contact', label: 'Terms of Service' },
  { to: '/contact', label: 'Cancellation Policy' },
  { to: '/contact', label: 'Safety Guidelines' },
]

const SOCIALS = [
  {
    label: 'Instagram',
    to: 'https://www.instagram.com/thedivevillage',
    badgeBg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    icon: (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    to: 'https://www.facebook.com/profile.php?id=61595366960524',
    badgeBg: 'bg-[#1877F2]',
    icon: (
      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    to: 'https://www.linkedin.com/company/the-dive-village/',
    badgeBg: 'bg-[#0A66C2]',
    icon: (
      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    to: 'https://www.youtube.com/@thedivevillage',
    badgeBg: 'bg-[#FF0000]',
    icon: (
      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    to: 'https://wa.me/917338257002',
    badgeBg: 'bg-[#25D366]',
    icon: (
      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    ),
  },
  {
    label: 'Viber',
    to: 'viber://add?number=917338257002',
    isViber: true,
    badgeBg: 'bg-[#7360F2]',
    icon: (
      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.536C18.66.34 14.526.028 12.6 0zM17.48 7.37c-.125.727-.727 1.217-1.366 1.134-.638-.083-1.04-.71-.914-1.437.124-.727.727-1.217 1.366-1.134.638.083 1.04.71.914 1.437zm-4.144-.01c-.124.727-.727 1.217-1.366 1.134-.638-.083-1.04-.71-.914-1.437.125-.727.727-1.217 1.366-1.134.638.083 1.04.71.914 1.437zm-4.144-.01c-.125.727-.727 1.217-1.366 1.134-.638-.083-1.04-.71-.914-1.437.124-.727.727-1.217 1.366-1.134.638.083 1.04.71.914 1.437z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  const [isViberQrOpen, setIsViberQrOpen] = useState(false)
  const isNightDive = useNightDive()

  const handleSocialClick = (s, e) => {
    if (s.isViber) {
      e.preventDefault()
      const isMobilePhone = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobilePhone) {
        const start = Date.now()
        window.location.href = 'viber://add?number=917338257002'
        setTimeout(() => {
          if (!document.hidden && Date.now() - start < 2000) {
            setIsViberQrOpen(true)
          }
        }, 1200)
      } else {
        setIsViberQrOpen(true)
      }
    }
  }

  return (
    <>
      <footer className={`${isNightDive ? 'bg-[#001C39]' : 'bg-navy'} text-white mt-auto relative z-10 pointer-events-auto`}>
        {/* ================= MOBILE FOOTER (md:hidden) ================= */}
        <div className={`md:hidden ${isNightDive ? 'bg-[#001C39]' : 'bg-[#071d37]'} text-white px-5 sm:px-6 pt-10 pb-8`}>
          {/* Centered Brand Block */}
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="inline-block transition-opacity active:opacity-80">
              <img
                src={footerLogoImg}
                alt="The Dive Village"
                className="h-24 w-auto object-contain brightness-0 invert drop-shadow-md"
                loading="lazy"
                width="180"
                height="96"
              />
            </Link>
            <div className="mt-4 text-center">
              <p className="text-[16px] text-white/90 font-light tracking-wide">
                More than a destination.
              </p>
              <p className="text-[16px] text-white/90 font-light tracking-wide mt-1">
                It is a community.
              </p>
            </div>
          </div>

          {/* Quick Links & Legal 2-Column Grid */}
          <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4">
            {/* QUICK LINKS */}
            <div>
              <h3 className={`font-heading text-xl font-bold tracking-wider uppercase mb-3 ${isNightDive ? 'text-[#FFCD00]' : 'text-accent'}`}>
                QUICK LINKS
              </h3>
              <ul className="flex flex-col">
                {QUICK.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`flex items-center justify-between py-1.5 text-[15px] ${isNightDive ? 'text-white hover:text-white' : 'text-white/85 hover:text-white active:text-accent'} transition-colors`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className="w-3.5 h-3.5 text-white/50 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className={`font-heading text-xl font-bold tracking-wider uppercase mb-3 ${isNightDive ? 'text-[#FFCD00]' : 'text-accent'}`}>
                LEGAL
              </h3>
              <ul className="flex flex-col">
                {LEGAL.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`flex items-center justify-between py-1.5 text-[15px] ${isNightDive ? 'text-white hover:text-white' : 'text-white/85 hover:text-white active:text-accent'} transition-colors`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className="w-3.5 h-3.5 text-white/50 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="my-7 border-t border-white/15" />

          {/* CONTACT */}
          <div>
            <h3 className={`font-heading text-xl font-bold tracking-wider uppercase mb-4 ${isNightDive ? 'text-[#FFCD00]' : 'text-accent'}`}>
              CONTACT
            </h3>
            <div className="flex items-center justify-between flex-wrap gap-y-3">
              {/* 6 Social Circles */}
              <div className="flex items-center gap-2 xs:gap-2.5 shrink-0 flex-wrap">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.to}
                    onClick={(e) => handleSocialClick(s, e)}
                    target={s.to.startsWith('http') ? '_blank' : '_self'}
                    rel={s.to.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={s.label}
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${s.badgeBg} shadow-sm active:scale-95 hover:scale-105 transition-transform`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Vertical divider */}
              <div className="hidden min-[360px]:block h-7 w-[1px] bg-white/20 mx-1 shrink-0" />

              {/* Email Link */}
              <a
                href="mailto:sanjeev.bajaj@thedivevillage.com"
                className={`inline-flex items-center gap-2 text-white ${isNightDive ? 'hover:text-white' : 'hover:text-accent'} active:opacity-80 transition-colors group min-w-0`}
              >
                <div className={`w-9 h-9 rounded-full border ${isNightDive ? 'border-white/30' : 'border-sky-400/40 group-hover:border-accent'} flex items-center justify-center shrink-0 transition-colors`}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <span className="text-[13px] sm:text-sm font-normal text-white truncate">
                  sanjeev.bajaj@thedivevillage.com
                </span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="my-7 border-t border-white/15" />

          {/* Bottom Bar */}
          <div className="text-center sm:text-left text-xs text-white/70">
            <p>© {new Date().getFullYear()} The Dive Village. A Brand of CAF Sourcing.</p>
          </div>
        </div>

        {/* ================= DESKTOP FOOTER (hidden md:block) ================= */}
        <div className="hidden md:block">
          <div className="mx-auto grid max-w-7xl gap-8 lg:gap-10 px-4 py-12 sm:py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="flex flex-col items-center sm:items-start justify-between lg:col-span-3">
              <div className="flex flex-col items-center w-fit">
                <Link to="/" className="inline-block transition duration-300 hover:opacity-90">
                  <img
                    src={footerLogoImg}
                    alt="The Dive Village"
                    className="h-20 sm:h-28 lg:h-32 xl:h-36 w-auto object-contain brightness-0 invert drop-shadow-md"
                  />
                </Link>
                <div className="mt-3 w-fit text-white/80">
                  <p className="text-xs sm:text-sm font-light tracking-normal whitespace-nowrap text-center">
                    More than a destination
                  </p>
                  <div className="flex w-full justify-between text-xs sm:text-sm font-light tracking-normal mt-0.5 whitespace-nowrap">
                    <span>It</span>
                    <span>is</span>
                    <span>a</span>
                    <span>community.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: 3 Columns on same row (Quick Links, Legal, Contact) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 lg:col-span-9 lg:grid-cols-3 items-stretch">
              <div className="flex flex-col col-start-1 sm:col-auto h-full">
                <h3 className={`font-heading text-base sm:text-lg font-bold uppercase tracking-wider sm:tracking-widest ${isNightDive ? 'text-[#FFCD00]' : 'text-accent'}`}>
                  Quick Links
                </h3>
                <ul className="mt-3 sm:mt-4 flex flex-1 flex-col justify-between space-y-2 sm:space-y-0">
                  {QUICK.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className={`text-xs sm:text-sm ${isNightDive ? 'text-white hover:text-white' : 'text-white/80 hover:text-accent'} transition duration-hover whitespace-nowrap`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col col-start-2 sm:col-auto h-full">
                <h3 className={`font-heading text-base sm:text-lg font-bold uppercase tracking-wider sm:tracking-widest ${isNightDive ? 'text-[#FFCD00]' : 'text-accent'}`}>
                  Legal
                </h3>
                <ul className="mt-3 sm:mt-4 flex flex-1 flex-col justify-between space-y-2 sm:space-y-0">
                  {LEGAL.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className={`text-xs sm:text-sm ${isNightDive ? 'text-white hover:text-white' : 'text-white/80 hover:text-accent'} transition duration-hover whitespace-nowrap`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col col-start-1 col-span-2 sm:col-span-1 sm:col-start-auto mt-2 sm:mt-0 h-full">
                <h3 className={`font-heading text-base sm:text-lg font-bold uppercase tracking-wider sm:tracking-widest ${isNightDive ? 'text-[#FFCD00]' : 'text-accent'}`}>
                  Contact
                </h3>
                <div className="mt-3 sm:mt-4 flex flex-1 flex-col justify-between space-y-3">
                  <ul className="flex flex-1 flex-col justify-between space-y-2.5 sm:space-y-2">
                    {SOCIALS.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.to}
                          onClick={(e) => handleSocialClick(s, e)}
                          target={s.to.startsWith('http') ? '_blank' : '_self'}
                          rel={s.to.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="group inline-flex items-center gap-3 text-xs sm:text-sm text-white hover:text-white transition duration-200"
                        >
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.badgeBg} text-white shadow-sm transition-transform group-hover:scale-110`}>
                            {s.icon}
                          </span>
                          <span className={`font-medium ${isNightDive ? 'text-white group-hover:text-white' : 'group-hover:text-accent'} transition-colors whitespace-nowrap`}>
                            {s.label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop Email Link */}
                  <div className="pt-2 border-t border-white/10">
                    <a
                      href="mailto:sanjeev.bajaj@thedivevillage.com"
                      className={`inline-flex items-center gap-2 text-white ${isNightDive ? 'hover:text-white' : 'hover:text-accent'} transition-colors group text-xs sm:text-sm`}
                    >
                      <div className={`w-6 h-6 rounded-full border ${isNightDive ? 'border-white/30' : 'border-sky-400/40 group-hover:border-accent'} flex items-center justify-center shrink-0 transition-colors`}>
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <span className="font-medium truncate transition-colors text-white">
                        sanjeev.bajaj@thedivevillage.com
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8 text-xs text-white/60 text-center">
              <p>© {new Date().getFullYear()} TheDiveVillage. A Brand of CAF Sourcing.</p>
            </div>
          </div>
        </div>
      </footer>

      <ViberQRModal
        isOpen={isViberQrOpen}
        onClose={() => setIsViberQrOpen(false)}
      />
    </>
  )
}
