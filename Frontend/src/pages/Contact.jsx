import LazyVideo from '../components/LazyVideo'
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import PhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'

import { IMAGES, CAROUSEL_IMAGES, PANEL_IMAGES } from '../utils/images'
const compiledNightDiveVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/Night_Dive.mp4'
const bookVideo = 'https://res.cloudinary.com/qvbunv8y/video/upload/TDV-Media/Background/baracuda.mp4'
import useNightDive from '../hooks/useNightDive'
import SEOHead from '../components/SEOHead'
import MerchBannerCTA from '../components/MerchBannerCTA'
import ViberQRModal from '../components/ViberQRModal'
import api from '../services/api'

export default function Contact() {
  const isNightDive = useNightDive()
  const [isViberQrOpen, setIsViberQrOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const getInitialMessage = () => {
    return searchParams.get('message') || searchParams.get('special_requests') || location.state?.message || ''
  }

  const getInitialSubject = () => {
    return searchParams.get('subject') || location.state?.subject || (getInitialMessage() ? 'Special Request' : 'General Enquiry')
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: getInitialSubject(),
    message: getInitialMessage(),
    // Partnership fields
    location: '',
    diveCenterName: '',
    certificationsHeld: '',
    partnershipFiles: [],
    // Careers fields
    positionApplied: '',
    yearsExperience: '',
    portfolioOrLinkedin: '',
    resumeFile: null,
  })

  useEffect(() => {
    const msg = searchParams.get('message') || searchParams.get('special_requests') || location.state?.message
    const subj = searchParams.get('subject') || location.state?.subject
    if (msg !== undefined && msg !== null) {
      setFormData((prev) => ({
        ...prev,
        message: msg,
        subject: subj || prev.subject || 'Special Request'
      }))
    }
  }, [searchParams, location.state])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const reduce = useReducedMotion()

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // File handling for Partnership (Images or PDFs, min 50 KB, max 15 MB)
  const handlePartnershipFiles = (e) => {
    setFileError('')
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    const minSize = 50 * 1024 // 50 KB
    const maxSize = 15 * 1024 * 1024 // 15 MB
    const validFiles = []

    for (const file of selectedFiles) {
      if (file.size < minSize) {
        setFileError(`"${file.name}" is too small (${(file.size / 1024).toFixed(1)} KB). Minimum file size is 50 KB.`)
        return
      }
      if (file.size > maxSize) {
        setFileError(`"${file.name}" exceeds 15 MB limit. Please choose a smaller file.`)
        return
      }
      validFiles.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        file: file,
      })
    }

    setFormData((prev) => ({
      ...prev,
      partnershipFiles: [...prev.partnershipFiles, ...validFiles]
    }))
    e.target.value = ''
  }

  const removePartnershipFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      partnershipFiles: prev.partnershipFiles.filter((_, idx) => idx !== indexToRemove)
    }))
  }

  // File handling for Careers (Resume / CV: PDF/DOC, min 20 KB, max 10 MB)
  const handleResumeFile = (e) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) return

    const minSize = 20 * 1024 // 20 KB
    const maxSize = 10 * 1024 * 1024 // 10 MB

    if (file.size < minSize) {
      setFileError(`"${file.name}" is too small (${(file.size / 1024).toFixed(1)} KB). Minimum resume file size is 20 KB.`)
      return
    }
    if (file.size > maxSize) {
      setFileError(`"${file.name}" exceeds 10 MB limit.`)
      return
    }

    setFormData((prev) => ({
      ...prev,
      resumeFile: {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        file: file,
      }
    }))
    e.target.value = ''
  }

  const removeResumeFile = () => {
    setFormData((prev) => ({ ...prev, resumeFile: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFileError('')
    setSuccess(false)

    try {
      if (!formData.name?.trim()) {
        setError('Please enter your name.')
        setLoading(false)
        return
      }
      if (!formData.email?.trim()) {
        setError('Please enter your email address.')
        setLoading(false)
        return
      }
      if (!formData.message?.trim()) {
        setError('Please enter your message.')
        setLoading(false)
        return
      }

      // Build dynamic summary or attachments details
      const details = {}
      if (formData.subject === 'Partnership') {
        details.location = formData.location
        details.diveCenterName = formData.diveCenterName
        details.certificationsHeld = formData.certificationsHeld
        details.attachedFilesCount = formData.partnershipFiles.length
        details.attachedFileNames = formData.partnershipFiles.map((f) => f.name)
      } else if (formData.subject === 'Careers') {
        details.positionApplied = formData.positionApplied
        details.yearsExperience = formData.yearsExperience
        details.portfolioOrLinkedin = formData.portfolioOrLinkedin
        details.resumeFileName = formData.resumeFile?.name || null
      }

      // Consolidate additional details into message for comprehensive logging/archival
      let combinedMessage = (formData.message || '').trim()
      const extraLines = []
      if (formData.phone) {
        extraLines.push(`Phone: ${formData.phone}`)
      }
      if (formData.subject === 'Partnership') {
        if (formData.location) extraLines.push(`Location: ${formData.location}`)
        if (formData.diveCenterName) extraLines.push(`Dive Center: ${formData.diveCenterName}`)
        if (formData.certificationsHeld) extraLines.push(`Certifications: ${formData.certificationsHeld}`)
        if (formData.partnershipFiles?.length) {
          extraLines.push(`Attached Files: ${formData.partnershipFiles.map((f) => f.name).join(', ')}`)
        }
      } else if (formData.subject === 'Careers') {
        if (formData.positionApplied) extraLines.push(`Position: ${formData.positionApplied}`)
        if (formData.yearsExperience) extraLines.push(`Experience: ${formData.yearsExperience}`)
        if (formData.portfolioOrLinkedin) extraLines.push(`Portfolio/LinkedIn: ${formData.portfolioOrLinkedin}`)
        if (formData.resumeFile?.name) extraLines.push(`Resume: ${formData.resumeFile.name}`)
      }

      if (extraLines.length > 0) {
        combinedMessage = combinedMessage
          ? `${combinedMessage}\n\n--- Additional Details ---\n${extraLines.join('\n')}`
          : extraLines.join('\n')
      }

      const payload = {
        name: formData.name.trim(),
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone || null,
        subject: formData.subject,
        message: combinedMessage,
        details,
      }

      await api.post('/api/content/contact', payload)

      try {
        const newEnquiryRecord = {
          id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
          type: formData.subject || 'Enquiry',
          subject: formData.subject || 'General Enquiry',
          contactName: formData.name,
          contactEmail: formData.email,
          contactPhone: formData.phone || null,
          message: formData.message,
          partnershipDetails: formData.subject === 'Partnership' ? {
            location: formData.location,
            diveCenterName: formData.diveCenterName,
            certificationsHeld: formData.certificationsHeld,
            files: formData.partnershipFiles.map(f => ({ name: f.name, size: f.size }))
          } : null,
          careerDetails: formData.subject === 'Careers' ? {
            positionApplied: formData.positionApplied,
            yearsExperience: formData.yearsExperience,
            portfolioOrLinkedin: formData.portfolioOrLinkedin,
            resume: formData.resumeFile ? { name: formData.resumeFile.name, size: formData.resumeFile.size } : null
          } : null,
          status: 'Inquiry Received',
          createdAt: new Date().toISOString(),
        }
        const existing = JSON.parse(localStorage.getItem('dive_village_enquiries') || '[]')
        localStorage.setItem('dive_village_enquiries', JSON.stringify([newEnquiryRecord, ...existing]))
      } catch (e) {
        console.warn('Could not save enquiry locally:', e)
      }

      setSuccess(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'General Enquiry',
        message: '',
        location: '',
        diveCenterName: '',
        certificationsHeld: '',
        partnershipFiles: [],
        positionApplied: '',
        yearsExperience: '',
        portfolioOrLinkedin: '',
        resumeFile: null,
      })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen text-navy font-body overflow-x-hidden ${isNightDive ? 'bg-[#003865]' : 'bg-[#FAFAFA]'}`} style={{ textShadow: 'none' }}>
      <SEOHead
        title="Contact Us & Custom Dive Charters | The Dive Village"
        description="Get in touch with The Dive Village for custom scuba itineraries, diving course enquiries, private boat charters, partnerships, careers, and island travel logistics."
        keywords="contact dive village, scuba diving inquiry, course booking, dive center partnership, scuba careers, island travel assistance"
        canonicalUrl="https://thedivevillage.com/contact"
      />

      {/* 1. HEADER VIDEO HERO (DYNAMIC COMPILED NIGHT DIVE VIDEO) */}
      <section className="relative h-[56vh] min-h-[420px] lg:h-[60vh] lg:min-h-[460px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)'
          }}
        >
          <LazyVideo
            key={isNightDive ? 'night-compiled' : 'day-book'}
            src={isNightDive ? compiledNightDiveVideo : bookVideo}
            autoPlay
            loop
            muted
            playsInline
            onPlay={(e) => { e.currentTarget.playbackRate = 0.7 }}
            className="w-full h-full object-cover scale-135 sm:scale-145 lg:scale-155 origin-center transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001428]/65 via-[#001428]/25 to-transparent pointer-events-none" />
        </div>

        {/* Bottom Ultra-Smooth Dissolve & Merge Layer */}
        <div 
          className={`absolute bottom-0 inset-x-0 h-28 sm:h-36 lg:h-44 pointer-events-none z-[5] transition-colors duration-500 ${
            isNightDive 
              ? 'bg-gradient-to-t from-[#003865] via-[#003865]/85 via-45% to-transparent' 
              : 'bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 via-45% to-transparent'
          }`} 
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pt-4 sm:pt-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-4xl xs:text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-white leading-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            Contact <span className="text-[#FFCD00]">Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl font-medium text-white/90 max-w-xl leading-relaxed drop-shadow-md text-center"
          >
            Tell us when and where you'd like to dive, partner with us, or join our team and we'll connect within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* 2. MAIN FORM SECTION */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-24 w-full min-w-0">

        {/* Form Container - Wide 2-Column Side-by-Side (Half & Half) Layout */}
        <div id="contact-form-container" className={`max-w-4xl lg:max-w-5xl mx-auto w-full ${isNightDive ? 'bg-[#001e3d] border-white/10 shadow-none' : 'bg-white border-navy/5 shadow-card'} rounded-2xl sm:rounded-[36px] p-5 xs:p-7 sm:p-10 border transition-all duration-300`}>
          <div className="mb-6 sm:mb-8 text-left pb-4 border-b border-navy/10">
            <span className="text-accent font-bold tracking-widest uppercase text-[9px] sm:text-xs mb-1 block">Direct Inquiry</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">Send Us a Message</h2>
            <p className="text-xs sm:text-sm text-navy/70 mt-1">Fill out the details below and our team will get back to you promptly.</p>
          </div>

          {success && (
            <div className="mb-6 rounded-xl sm:rounded-2xl bg-emerald-50 p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-emerald-700 border border-emerald-100 flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Your message has been sent to our team! We will get back to you shortly.</span>
            </div>
          )}
          {error && (
            <div className="mb-6 rounded-xl sm:rounded-2xl bg-red-50 p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-red-700 border border-red-100 flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}
          {fileError && (
            <div className="mb-6 rounded-xl sm:rounded-2xl bg-amber-50 p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-amber-800 border border-amber-200 flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{fileError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch">
              
              {/* LEFT COLUMN: Contact Information */}
              <div className="space-y-3.5 sm:space-y-4 flex flex-col justify-start">
                <div className="flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wider text-navy/70 border-b border-navy/5">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-navy flex items-center justify-center text-[10px] font-extrabold">1</span>
                  <span>Contact Information</span>
                </div>

                <div>
                  <label className="mb-1 sm:mb-1.5 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-[#F0F2F5] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30"
                  />
                </div>

                <div>
                  <label className="mb-1 sm:mb-1.5 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-[#F0F2F5] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30"
                  />
                </div>

                <div>
                  <label className="mb-1 sm:mb-1.5 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Phone Number</label>
                  <div className="w-full rounded-xl bg-[#F0F2F5] px-3.5 py-2.5 sm:px-4 sm:py-3 focus-within:ring-2 focus-within:ring-accent/50 transition">
                    <PhoneInput
                      flags={flags}
                      defaultCountry="IN"
                      international
                      withCountryCallingCode
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(value) => setFormData((prev) => ({ ...prev, phone: value || '' }))}
                      className="w-full text-xs sm:text-sm font-semibold text-navy outline-none placeholder:text-navy/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 sm:mb-1.5 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Select Your Subject</label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#F0F2F5] px-3.5 py-2.5 sm:px-4 sm:py-3 pr-8 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition appearance-none cursor-pointer"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Careers">Careers</option>
                      <option value="Special Request">Special Request</option>
                      <option value="Support">Support</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-navy/60">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Inquiry / Dynamic Details & Message */}
              <div className="flex flex-col justify-between space-y-4 sm:space-y-5">
                <div className="space-y-3.5 sm:space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wider text-navy/70 border-b border-navy/5">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-navy flex items-center justify-center text-[10px] font-extrabold">2</span>
                    <span>Your Message & Details</span>
                  </div>

                  {/* DYNAMIC SECTION: PARTNERSHIP */}
                  {formData.subject === 'Partnership' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3"
                    >
                      <div className="flex items-center gap-2 pb-1 border-b border-amber-500/10">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-navy">
                          Dive Center & Partner Details
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="location"
                            placeholder="e.g. Havelock Island, Andaman"
                            value={formData.location}
                            onChange={handleChange}
                            required={formData.subject === 'Partnership'}
                            className="w-full rounded-xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 border border-navy/10"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Dive Center Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="diveCenterName"
                            placeholder="e.g. Blue Lagoon Dive Resort"
                            value={formData.diveCenterName}
                            onChange={handleChange}
                            required={formData.subject === 'Partnership'}
                            className="w-full rounded-xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 border border-navy/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                          Certifications Held <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="certificationsHeld"
                          placeholder="e.g. 5-Star IDC, SSI Diamond, CMAS, ISO certified"
                          value={formData.certificationsHeld}
                          onChange={handleChange}
                          required={formData.subject === 'Partnership'}
                          className="w-full rounded-xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 border border-navy/10"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Add Pictures / Certifications
                          </label>
                          <span className="text-[10px] font-semibold text-navy/50">
                            Min: <strong className="text-navy/80">50 KB</strong>
                          </span>
                        </div>

                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy/20 hover:border-accent bg-white rounded-xl p-3 sm:p-4 text-center cursor-pointer transition group">
                          <svg className="w-6 h-6 text-navy/40 group-hover:text-accent transition-colors mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="text-xs font-bold text-navy group-hover:text-navy">
                            Click or drag images / PDFs to upload
                          </span>
                          <span className="text-[10px] text-navy/50 mt-0.5">
                            PNG, JPG, WEBP, PDF (Min: 50 KB / file)
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,image/webp,image/jpg,application/pdf"
                            onChange={handlePartnershipFiles}
                            className="sr-only"
                          />
                        </label>

                        {/* List of uploaded files */}
                        {formData.partnershipFiles.length > 0 && (
                          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {formData.partnershipFiles.map((fileObj, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-navy/10 text-xs font-medium text-navy">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-navy/10 text-navy uppercase shrink-0">
                                    {fileObj.name.split('.').pop() || 'FILE'}
                                  </span>
                                  <span className="truncate">{fileObj.name}</span>
                                  <span className="text-navy/40 text-[10px] shrink-0">({fileObj.size})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePartnershipFile(idx)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition ml-2 shrink-0"
                                  title="Remove file"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* DYNAMIC SECTION: CAREERS */}
                  {formData.subject === 'Careers' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3"
                    >
                      <div className="flex items-center gap-2 pb-1 border-b border-blue-500/10">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-navy">
                          Career Application & Resume
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Role / Position <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="positionApplied"
                            placeholder="e.g. Scuba Instructor"
                            value={formData.positionApplied}
                            onChange={handleChange}
                            required={formData.subject === 'Careers'}
                            className="w-full rounded-xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 border border-navy/10"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Years of Experience <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="yearsExperience"
                            placeholder="e.g. 3+ years / 500+ dives"
                            value={formData.yearsExperience}
                            onChange={handleChange}
                            required={formData.subject === 'Careers'}
                            className="w-full rounded-xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 border border-navy/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                          Portfolio / LinkedIn URL (Optional)
                        </label>
                        <input
                          type="url"
                          name="portfolioOrLinkedin"
                          placeholder="https://linkedin.com/in/..."
                          value={formData.portfolioOrLinkedin}
                          onChange={handleChange}
                          className="w-full rounded-xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 border border-navy/10"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">
                            Attach Resume / CV <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] font-semibold text-navy/50">
                            Min: <strong className="text-navy/80">20 KB</strong>
                          </span>
                        </div>

                        {!formData.resumeFile ? (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy/20 hover:border-blue-500 bg-white rounded-xl p-3 sm:p-4 text-center cursor-pointer transition group">
                            <svg className="w-6 h-6 text-navy/40 group-hover:text-blue-500 transition-colors mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <span className="text-xs font-bold text-navy group-hover:text-navy">
                              Click or drag Resume / CV here
                            </span>
                            <span className="text-[10px] text-navy/50 mt-0.5">
                              PDF, DOC, DOCX (Min: 20 KB)
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleResumeFile}
                              className="sr-only"
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-500/30 text-xs font-medium text-navy">
                            <div className="flex items-center gap-2 truncate">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase shrink-0">
                                {formData.resumeFile.name.split('.').pop() || 'PDF'}
                              </span>
                              <span className="font-semibold truncate">{formData.resumeFile.name}</span>
                              <span className="text-navy/40 text-[10px] shrink-0">({formData.resumeFile.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={removeResumeFile}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition ml-2 shrink-0"
                              title="Remove resume"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <label className="mb-1 sm:mb-1.5 block text-[9px] sm:text-xs font-bold text-navy/70 uppercase tracking-wider">Message / Special Requests</label>
                    <textarea
                      name="message"
                      placeholder="Anything else we should know?"
                      rows={formData.subject === 'Partnership' || formData.subject === 'Careers' ? 3 : 7}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full flex-1 rounded-xl sm:rounded-2xl bg-[#F0F2F5] p-3 sm:p-4 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 transition placeholder:text-navy/30 resize-none min-h-[120px]"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-navy text-white hover:!bg-[#FFCD00] hover:!text-[#001e3d] hover:!border-[#FFCD00] px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Info Blocks - 3 buttons in a single line, whole box acts as clickable redirect button */}
        <div className="mt-10 sm:mt-16 lg:mt-20 grid grid-cols-3 gap-2 xs:gap-3 sm:gap-6 text-center max-w-4xl mx-auto w-full min-w-0">
          
          {/* Box 1: Call & WhatsApp */}
          <a
            href="tel:+917338257002"
            className="flex flex-col items-center justify-center bg-white p-2.5 xs:p-3.5 sm:p-6 rounded-xl xs:rounded-2xl sm:rounded-3xl border border-navy/5 shadow-card hover:shadow-float hover:border-[#FFCD00]/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer active:scale-95 text-center min-w-0"
          >
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-navy/5 text-navy group-hover:bg-[#FFCD00] group-hover:text-navy flex items-center justify-center mb-1.5 sm:mb-3 transition-colors shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
            </div>
            <h4 className="font-bold text-navy mb-0.5 sm:mb-1.5 text-[11px] xs:text-xs sm:text-base group-hover:text-navy truncate max-w-full">Call Us</h4>
            <span className="text-[9px] xs:text-[10px] sm:text-sm text-navy/70 group-hover:text-[#FFCD00] font-bold transition-colors truncate max-w-full block">+91 7338257002</span>
          </a>

          {/* Box 2: Write to Us */}
          <a
            href="mailto:sanjeev.bajaj@thedivevillage.com"
            className="flex flex-col items-center justify-center bg-white p-2.5 xs:p-3.5 sm:p-6 rounded-xl xs:rounded-2xl sm:rounded-3xl border border-navy/5 shadow-card hover:shadow-float hover:border-[#FFCD00]/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer active:scale-95 text-center min-w-0"
          >
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-navy/5 text-navy group-hover:bg-[#FFCD00] group-hover:text-navy flex items-center justify-center mb-1.5 sm:mb-3 transition-colors shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
            </div>
            <h4 className="font-bold text-navy mb-0.5 sm:mb-1.5 text-[11px] xs:text-xs sm:text-base group-hover:text-navy truncate max-w-full">Mail Us</h4>
            <span className="text-[9px] xs:text-[10px] sm:text-sm text-navy/70 group-hover:text-[#FFCD00] font-bold transition-colors truncate max-w-full block">sanjeev.bajaj@thedivevillage.com</span>
          </a>

          {/* Box 3: Availability */}
          <a
            href="https://wa.me/917338257002"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center bg-white p-2.5 xs:p-3.5 sm:p-6 rounded-xl xs:rounded-2xl sm:rounded-3xl border border-navy/5 shadow-card hover:shadow-float hover:border-[#FFCD00]/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer active:scale-95 text-center min-w-0"
          >
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-navy/5 text-navy group-hover:bg-[#FFCD00] group-hover:text-navy flex items-center justify-center mb-1.5 sm:mb-3 transition-colors shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
            </div>
            <h4 className="font-bold text-navy mb-0.5 sm:mb-1.5 text-[11px] xs:text-xs sm:text-base group-hover:text-navy truncate max-w-full">Available 24/7</h4>
            <span className="text-[9px] xs:text-[10px] sm:text-sm text-navy/70 group-hover:text-[#FFCD00] font-bold transition-colors truncate max-w-full block">On WhatsApp</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="mt-16 flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/thedivevillage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=61595366960524"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#1877F2] shadow-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
            aria-label="Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/the-dive-village/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#0A66C2] shadow-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
            aria-label="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@thedivevillage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#FF0000] shadow-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
            aria-label="YouTube"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/917338257002"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#25D366] shadow-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>

          {/* Viber */}
          <a
            href="viber://add?number=917338257002"
            onClick={(e) => {
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
            }}
            className="w-11 h-11 rounded-full bg-[#7360F2] shadow-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            aria-label="Viber"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.536C18.66.34 14.526.028 12.6 0zM17.48 7.37c-.125.727-.727 1.217-1.366 1.134-.638-.083-1.04-.71-.914-1.437.124-.727.727-1.217 1.366-1.134.638.083 1.04.71.914 1.437zm-4.144-.01c-.124.727-.727 1.217-1.366 1.134-.638-.083-1.04-.71-.914-1.437.125-.727.727-1.217 1.366-1.134.638.083 1.04.71.914 1.437zm-4.144-.01c-.125.727-.727 1.217-1.366 1.134-.638-.083-1.04-.71-.914-1.437.124-.727.727-1.217 1.366-1.134.638.083 1.04.71.914 1.437z"/>
            </svg>
          </a>
        </div>

        {/* Merchandise Banner CTA */}
        <MerchBannerCTA className="mt-20 sm:mt-28" />

        {/* Viber QR Modal */}
        <ViberQRModal isOpen={isViberQrOpen} onClose={() => setIsViberQrOpen(false)} />

      </div>
    </div>
  )
}
