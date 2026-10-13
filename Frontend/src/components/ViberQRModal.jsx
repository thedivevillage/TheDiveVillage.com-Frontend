import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
const tdvViberQr = 'https://res.cloudinary.com/qvbunv8y/image/upload/v1791691228/TDV-Media/UI/tdv_viber_qr.webp'

export default function ViberQRModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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
            aria-hidden="true"
          />

          {/* Modal Box */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="viber-qr-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-navy/10 z-10 text-navy pointer-events-auto max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] overflow-y-auto text-center"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy/10 pb-4 mb-6">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-navy/60 block">GET IN TOUCH</span>
                <h3 id="viber-qr-title" className="font-heading text-2xl font-bold text-navy">Connect on Viber</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="w-9 h-9 rounded-full bg-navy/5 text-navy font-bold flex items-center justify-center hover:bg-navy hover:text-white transition cursor-pointer shrink-0"
                aria-label="Close Viber QR code"
              >
                ✕
              </button>
            </div>

            {/* Subheading text */}
            <p className="text-xs sm:text-sm text-navy/70 font-medium mb-6">
              Scan the QR code with your phone to connect with us on Viber.
            </p>

            {/* QR Code Container */}
            <div className="flex justify-center mb-4">
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-navy/10 shadow-sm inline-block">
                <img
                  src={tdvViberQr}
                  alt="The Dive Village Viber QR Code"
                  className="w-56 h-56 sm:w-72 sm:h-72 aspect-square object-contain mx-auto select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <p className="font-heading text-lg sm:text-xl font-bold text-navy tracking-wide">
              +91 7338257002
            </p>

            {/* Secondary instruction */}
            <p className="text-xs text-navy/60 font-medium mt-1">
              Open your phone camera and scan the QR code.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
