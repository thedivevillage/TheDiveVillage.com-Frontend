import { useState, useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router'
import PhoneInput, { parsePhoneNumber, getCountryCallingCode } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../utils/formatCurrency'
import { LOCATION_DATA, COUNTRY_NAMES } from '../data/locationData'
import { orderService } from '../services/orderService'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [showMobileSummary, setShowMobileSummary] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState('IN')
  const [phoneError, setPhoneError] = useState('')
  const [formError, setFormError] = useState('')
  const [showOrderReviewModal, setShowOrderReviewModal] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    firstName: user?.displayName ? user.displayName.split(' ')[0] : '',
    lastName: user?.displayName && user.displayName.split(' ').length > 1 ? user.displayName.split(' ').slice(1).join(' ') : '',
    address: '',
    apartment: '',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    postalCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    upiId: '',
    saveInfo: true,
  })

  // Synchronize user profile if loaded dynamically
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        firstName: prev.firstName || (user.displayName ? user.displayName.split(' ')[0] : ''),
        lastName: prev.lastName || (user.displayName && user.displayName.split(' ').length > 1 ? user.displayName.split(' ').slice(1).join(' ') : ''),
        phone: prev.phone || user.phone || '',
      }))
    }
  }, [user])

  const shippingCost = shippingMethod === 'express' ? 199 : (subtotal >= 1999 || subtotal === 0 ? 0 : 99)
  const grandTotal = subtotal + shippingCost

  // Cascading States based on selected Country
  const currentStates = useMemo(() => {
    const countryData = LOCATION_DATA[formData.country]
    if (!countryData || !countryData.states) return []
    return Object.keys(countryData.states)
  }, [formData.country])

  // Cascading Cities based on selected State
  const currentCities = useMemo(() => {
    const countryData = LOCATION_DATA[formData.country]
    if (!countryData || !countryData.states || !formData.state) return []
    return countryData.states[formData.state] || []
  }, [formData.country, formData.state])

  // Handle standard text inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormError('')
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Country selection change with automatic cascade
  const handleCountryChange = (selectedCountry) => {
    setFormError('')
    const countryObj = LOCATION_DATA[selectedCountry]
    const availableStates = countryObj?.states ? Object.keys(countryObj.states) : []
    const firstState = availableStates[0] || ''
    const availableCities = firstState && countryObj?.states ? countryObj.states[firstState] || [] : []
    const firstCity = availableCities[0] || ''

    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
      state: firstState,
      city: firstCity,
    }))

    if (countryObj?.code) {
      setPhoneCountry(countryObj.code)
    }
  }

  // State selection change with automatic cascade to cities
  const handleStateChange = (selectedState) => {
    setFormError('')
    const countryObj = LOCATION_DATA[formData.country]
    const availableCities = selectedState && countryObj?.states ? countryObj.states[selectedState] || [] : []
    const firstCity = availableCities[0] || ''

    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      city: firstCity,
    }))
  }

  // City selection change
  const handleCityChange = (selectedCity) => {
    setFormError('')
    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
    }))
  }

  // Strict 10-digit national number phone handling
  const handlePhoneChange = useCallback((val) => {
    setPhoneError('')
    setFormError('')
    if (!val) {
      setFormData((prev) => ({ ...prev, phone: '' }))
      return
    }
    try {
      const parsed = parsePhoneNumber(val)
      if (parsed && parsed.nationalNumber && parsed.nationalNumber.length > 10) {
        const trimmed = parsed.nationalNumber.slice(0, 10)
        const clamped = `+${parsed.countryCallingCode}${trimmed}`
        setFormData((prev) => ({ ...prev, phone: clamped }))
        return
      }
    } catch {}
    setFormData((prev) => ({ ...prev, phone: val }))
  }, [])

  const handlePhoneKeyDown = useCallback((e) => {
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
      return
    }

    const { selectionStart, selectionEnd } = e.currentTarget
    if (selectionStart !== selectionEnd) {
      return
    }

    let callingCodeLen = 2
    try {
      callingCodeLen = getCountryCallingCode(phoneCountry || 'IN').length
    } catch {}

    const currentDigits = (e.currentTarget.value || '').replace(/\D/g, '')
    if (currentDigits.length >= callingCodeLen + 10) {
      e.preventDefault()
    }
  }, [phoneCountry])

  // Prevent background scroll when Order Confirmation Modal is open
  useEffect(() => {
    if (showOrderReviewModal) {
      const origOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = origOverflow
      }
    }
  }, [showOrderReviewModal])

  // Form submit: triggers validation and opens Order Confirmation Popup Modal
  const handleReviewOrder = (e) => {
    e.preventDefault()
    setFormError('')

    if (items.length === 0) {
      setFormError('Your cart is empty. Please add items before checking out.')
      return
    }

    // Phone validation (strictly 10 national digits)
    if (!formData.phone) {
      setPhoneError('Please enter your 10-digit mobile number.')
      return
    }
    try {
      const parsed = parsePhoneNumber(formData.phone)
      if (!parsed || !parsed.nationalNumber || parsed.nationalNumber.length < 10) {
        setPhoneError('Phone number must be at least 10 digits.')
        return
      }
    } catch {
      setPhoneError('Please enter a valid 10-digit phone number.')
      return
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError('Please enter both First Name and Last Name.')
      return
    }

    if (!formData.address.trim()) {
      setFormError('Please enter your Street Address.')
      return
    }

    if (!formData.postalCode.trim()) {
      setFormError('Please enter your PIN / Postal Code.')
      return
    }

    // Open the Order Confirmation Popup Review Modal
    setShowOrderReviewModal(true)
  }

  // Final confirmation: actually places the order and clears user's cart
  const handleFinalPlaceOrder = async () => {
    setIsPlacingOrder(true)
    const generatedId = `DV-${Math.floor(100000 + Math.random() * 900000)}`
    setOrderId(generatedId)

    const orderPayload = {
      orderId: generatedId,
      items: items.map((i) => ({
        id: i.id || i.inventoryId,
        title: i.product?.title || i.product?.name || i.name || 'Dive Product',
        price: i.price ?? i.product?.price ?? 0,
        quantity: i.quantity || 1,
        size: i.product?.selectedSize || 'Standard',
        color: i.product?.selectedColor || 'Standard',
        image: i.product?.image || i.image || '',
      })),
      shipping: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        apartment: formData.apartment,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        postalCode: formData.postalCode,
        shippingMethod,
        shippingCost,
      },
      payment: {
        method: paymentMethod,
        subtotal,
        shippingCost,
        grandTotal,
      },
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }

    try {
      if (user?.uid) {
        const userOrdersKey = `tdv_orders_${user.uid}`
        const existing = JSON.parse(localStorage.getItem(userOrdersKey) || '[]')
        localStorage.setItem(userOrdersKey, JSON.stringify([orderPayload, ...existing]))
      }
      await orderService.create(orderPayload).catch(() => {})
    } catch {}

    // Clear cart and show order placed celebration screen
    clearCart()
    setIsPlacingOrder(false)
    setShowOrderReviewModal(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex flex-col items-center justify-center px-4 py-24 text-navy font-body" style={{ textShadow: 'none' }}>
        <div className="rounded-[40px] bg-white p-8 sm:p-14 shadow-float max-w-xl w-full border border-navy/5 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl shadow-soft">
            ✓
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3 inline-block">
            Order Confirmed
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-2">
            Thank You for Your Order!
          </h2>
          <p className="text-navy/70 text-sm mb-6 leading-relaxed">
            Your official Dive Village merchandise order <strong className="text-navy font-mono font-bold">#{orderId}</strong> has been received and is being prepared for dispatch.
          </p>

          <div className="bg-[#F0F4F8] rounded-3xl p-6 mb-8 text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/60">Estimated Delivery</span>
              <strong className="text-navy">Confirmed via WhatsApp</strong>
            </div>
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/60">Destination</span>
              <strong className="text-navy">{formData.city}, {formData.state}, {formData.country}</strong>
            </div>
            <div className="flex justify-between border-b border-navy/10 pb-2">
              <span className="text-navy/60">Confirmation Sent To</span>
              <strong className="text-navy">{formData.email || 'your registered email'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-navy/60">Payment Method</span>
              <strong className="text-navy uppercase">{paymentMethod}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="rounded-full bg-navy px-8 py-4 text-sm font-bold text-white transition hover:bg-accent shadow-md text-center"
            >
              Continue Shopping →
            </Link>
            <Link
              to="/"
              className="rounded-full bg-[#F0F2F5] px-8 py-4 text-sm font-bold text-navy transition hover:bg-navy/10 text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-navy font-body pt-24 sm:pt-32 pb-24" style={{ textShadow: 'none' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 border-b border-navy/10 pb-6 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 block">Final Step</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-navy tracking-tight">Secure Checkout</h1>
          </div>
          <Link to="/cart" className="text-xs sm:text-sm font-bold text-navy hover:text-accent transition underline">
            ← Return to Cart
          </Link>
        </div>

        {/* Mobile Collapsible Order Summary Accordion */}
        <div className="lg:hidden mb-6 rounded-2xl bg-white border border-navy/10 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMobileSummary((prev) => !prev)}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-navy/5 text-navy font-bold text-xs sm:text-sm active:bg-navy/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>{showMobileSummary ? 'Hide Order Summary' : 'Show Order Summary'}</span>
              <span className="text-[10px] text-navy/60">{showMobileSummary ? '▲' : '▼'}</span>
            </div>
            <span className="font-heading text-base font-bold text-navy">
              {formatCurrency(grandTotal)}
            </span>
          </button>

          {showMobileSummary && (
            <div className="p-4 border-t border-navy/10 space-y-4">
              <div className="divide-y divide-navy/10 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id || item.inventoryId} className="py-2.5 flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-navy/10 p-1 flex items-center justify-center">
                      <img src={item.product?.image || item.image} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-navy truncate">{item.product?.name || item.product?.title || item.title}</p>
                      <p className="text-[10px] text-navy/60 font-semibold">{item.product?.selectedSize || item.size || 'Standard'} • {item.product?.selectedColor || item.color || 'Standard'} • Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-navy">
                      {formatCurrency(((item.product?.price ?? item.price) || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-navy/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-navy/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-navy/70">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-navy font-bold text-sm pt-2 border-t border-navy/10">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Main Checkout Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleReviewOrder} className="space-y-6 sm:space-y-10">

              {/* Validation alert banner */}
              {formError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Contact Info */}
              <section className="bg-white rounded-2xl sm:rounded-[32px] border border-navy/5 p-5 sm:p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">1</span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-navy">Contact Details</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-navy/70">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-navy outline-none focus:ring-2 focus:ring-accent/50 scroll-mt-28"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-navy/70">Phone Number *</label>
                      <span className="text-[10px] text-navy/50 font-semibold">10-digit mobile number</span>
                    </div>
                    <div className={`w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-3 sm:px-4 py-2 sm:py-2.5 transition focus-within:ring-2 focus-within:ring-accent/50 ${phoneError ? 'ring-2 ring-red-400' : ''}`}>
                      <PhoneInput
                        flags={flags}
                        defaultCountry="IN"
                        country={phoneCountry}
                        international
                        withCountryCallingCode
                        placeholder="Enter 10-digit phone number"
                        value={formData.phone}
                        onCountryChange={(c) => setPhoneCountry(c || 'IN')}
                        onChange={handlePhoneChange}
                        numberInputProps={{
                          inputMode: 'numeric',
                          autoComplete: 'tel',
                          onKeyDown: handlePhoneKeyDown,
                        }}
                        className="w-full text-xs sm:text-sm font-semibold sm:font-bold text-navy outline-none placeholder:text-navy/35"
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1.5 text-[11px] font-bold text-red-500">{phoneError}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. Shipping Destination with Cascading Country, State, City */}
              <section className="bg-white rounded-2xl sm:rounded-[32px] border border-navy/5 p-5 sm:p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">2</span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-navy">Shipping Destination</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy/70">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        autoComplete="given-name"
                        required
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-navy outline-none focus:ring-2 focus:ring-accent/50 scroll-mt-28"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy/70">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        autoComplete="family-name"
                        required
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-navy outline-none focus:ring-2 focus:ring-accent/50 scroll-mt-28"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-navy/70">Street Address / Resort Address *</label>
                    <input
                      type="text"
                      name="address"
                      autoComplete="street-address"
                      required
                      placeholder="House/Villa/Resort name, street, locality"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-navy outline-none focus:ring-2 focus:ring-accent/50 scroll-mt-28"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-navy/70">Apartment, Suite, Unit (Optional)</label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Apt, Suite, Floor (optional)"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-navy outline-none focus:ring-2 focus:ring-accent/50 scroll-mt-28"
                    />
                  </div>

                  {/* Cascading Country -> State -> City Dropdowns */}
                  <div className="space-y-4 pt-1">
                    {/* Country Dropdown */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy/70 uppercase tracking-wider">Country *</label>
                      <div className="relative">
                        <select
                          name="country"
                          value={formData.country}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          required
                          className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 pr-10 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 appearance-none cursor-pointer transition"
                        >
                          {COUNTRY_NAMES.map((cName) => (
                            <option key={cName} value={cName}>
                              {cName}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-navy/60">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* State / Region Dropdown (Filtered by Country) */}
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-navy/70 uppercase tracking-wider">State / Region *</label>
                        <div className="relative">
                          <select
                            name="state"
                            value={formData.state}
                            onChange={(e) => handleStateChange(e.target.value)}
                            required
                            disabled={currentStates.length === 0}
                            className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 pr-10 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 appearance-none cursor-pointer transition disabled:opacity-50"
                          >
                            <option value="">Select State / Region</option>
                            {currentStates.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-navy/60">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* City Dropdown (Filtered by State) */}
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-navy/70 uppercase tracking-wider">City *</label>
                        <div className="relative">
                          <select
                            name="city"
                            value={formData.city}
                            onChange={(e) => handleCityChange(e.target.value)}
                            required
                            disabled={currentCities.length === 0}
                            className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 pr-10 text-xs sm:text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-accent/50 appearance-none cursor-pointer transition disabled:opacity-50"
                          >
                            <option value="">Select City</option>
                            {currentCities.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-navy/60">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* PIN / Postal Code */}
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-navy/70 uppercase tracking-wider">PIN / Postal Code *</label>
                        <input
                          type="text"
                          name="postalCode"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength="10"
                          required
                          placeholder="e.g. 560001"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="w-full rounded-xl sm:rounded-2xl bg-[#F0F2F5] px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-navy outline-none focus:ring-2 focus:ring-accent/50 scroll-mt-28"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Delivery Method */}
              <section className="bg-white rounded-[32px] border border-navy/5 p-6 sm:p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">3</span>
                  <h3 className="font-heading text-xl font-bold text-navy">Delivery Speed</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label
                    className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition ${
                      shippingMethod === 'standard' ? 'border-navy bg-navy/5 shadow-sm' : 'border-navy/15 hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="w-4 h-4 text-navy"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-navy">Standard Delivery</p>
                        <p className="text-[11px] text-navy/60">Delivery date and tracking will be confirmed via WhatsApp.</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      {subtotal >= 1999 ? 'FREE' : '₹99'}
                    </span>
                  </label>

                  <label
                    className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition ${
                      shippingMethod === 'express' ? 'border-navy bg-navy/5 shadow-sm' : 'border-navy/15 hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="w-4 h-4 text-navy"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-navy">Express Delivery</p>
                        <p className="text-[11px] text-navy/60">Priority island dispatch with express courier tracking.</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-navy">₹199</span>
                  </label>
                </div>
              </section>

              {/* 4. Payment Methods */}
              <section className="bg-white rounded-[32px] border border-navy/5 p-6 sm:p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">4</span>
                  <h3 className="font-heading text-xl font-bold text-navy">Payment Method</h3>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Payment Options */}
                  <label
                    className={`rounded-2xl border p-4 block cursor-pointer transition ${
                      paymentMethod === 'upi' ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="w-4 h-4 text-navy"
                        />
                        <span className="text-xs sm:text-sm font-bold text-navy">UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">Instant</span>
                    </div>
                  </label>

                  <label
                    className={`rounded-2xl border p-4 block cursor-pointer transition ${
                      paymentMethod === 'card' ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 text-navy"
                        />
                        <span className="text-xs sm:text-sm font-bold text-navy">Credit / Debit Card</span>
                      </div>
                      <div className="flex gap-1 text-[10px] text-navy/60 font-mono">
                        <span>Visa</span> • <span>Mastercard</span> • <span>RuPay</span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`rounded-2xl border p-4 block cursor-pointer transition ${
                      paymentMethod === 'netbanking' ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="netbanking"
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                          className="w-4 h-4 text-navy"
                        />
                        <span className="text-xs sm:text-sm font-bold text-navy">Netbanking</span>
                      </div>
                      <span className="text-xs font-bold text-navy/60">All Major Banks</span>
                    </div>
                  </label>

                  {/* Cash on Delivery / Pay on Island Arrival */}
                  <label
                    className={`rounded-2xl border p-4 block cursor-pointer transition ${
                      paymentMethod === 'cod' ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 text-navy"
                        />
                        <span className="text-xs sm:text-sm font-bold text-navy">Pay on Island Arrival / Cash on Delivery</span>
                      </div>
                      <span className="text-xs font-bold text-navy/60">Island Hubs</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Review & Complete Purchase Button */}
              <button
                type="submit"
                className="w-full rounded-full bg-navy py-5 text-base font-bold text-white transition hover:bg-accent shadow-lift flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Review Order & Complete Purchase ({formatCurrency(grandTotal)})</span>
                <span>→</span>
              </button>

            </form>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-4 sticky top-32 rounded-[36px] bg-white border border-navy/5 p-6 sm:p-8 shadow-float">
            <h3 className="font-heading text-xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
              Order Summary ({items.length})
            </h3>

            {/* Itemized list */}
            <div className="space-y-4 mb-6 max-h-[36vh] overflow-y-auto pr-1 divide-y divide-navy/5">
              {items.map((item) => (
                <div key={item.id || item.inventoryId} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <div className="w-14 h-16 rounded-xl bg-white border border-navy/10 p-1 shrink-0 flex items-center justify-center relative">
                    <img
                      src={item.product?.image || item.image}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-navy text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {item.quantity || 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-navy truncate">{item.product?.name || item.product?.title || item.title}</h4>
                    <p className="text-[10px] text-navy/60">
                      {item.product?.selectedSize || item.size ? `Size: ${item.product?.selectedSize || item.size}` : ''} {item.product?.selectedColor || item.color ? `• ${item.product?.selectedColor || item.color}` : ''}
                    </p>
                    <p className="text-xs font-bold text-navy mt-0.5">
                      {formatCurrency(((item.product?.price ?? item.price) || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-navy/10 pt-4 space-y-2.5 mb-6 text-xs sm:text-sm">
              <div className="flex justify-between text-navy/70">
                <span>Items Subtotal</span>
                <span className="font-semibold text-navy">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-navy/70">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-700">
                  {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-navy font-bold text-base sm:text-lg pt-3 border-t border-navy/10">
                <span>Total Amount</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F0F4F8] p-4 text-[11px] text-navy/70 space-y-1.5">
              <p className="flex items-center gap-1.5 font-bold text-navy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>256-Bit SSL Encrypted</span>
              </p>
              <p>Your transaction is safe and protected by industry-standard protocols.</p>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* ORDER CONFIRMATION POPUP REVIEW MODAL                    */}
      {/* ======================================================== */}
      {showOrderReviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed left-0 right-0 bottom-0 top-[64px] lg:top-[68px] z-[9990] flex items-center justify-center p-3 sm:p-6 bg-navy/80 backdrop-blur-md animate-fade-in overflow-hidden"
          style={{ top: 'var(--toolbar-bottom, 64px)' }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-navy/10 overflow-hidden my-auto max-h-[calc(100vh-var(--toolbar-bottom,64px)-24px)] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-navy/10 flex items-start justify-between bg-gradient-to-r from-navy/[0.03] to-transparent">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#00AEC7] block mb-1">
                  Order Confirmation Review
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-navy">
                  Confirm Your Booking & Order Details
                </h3>
                <p className="text-xs text-navy/60 mt-0.5">
                  Please review all your details carefully before placing your order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderReviewModal(false)}
                className="w-8 h-8 rounded-full bg-navy/5 hover:bg-navy/10 flex items-center justify-center text-navy text-sm font-bold transition cursor-pointer"
                aria-label="Close review modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="px-6 sm:px-8 py-6 space-y-6 overflow-y-auto flex-1">
              
              {/* 1. Customer & Contact Summary */}
              <div className="rounded-2xl bg-[#F8FAFC] border border-navy/10 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 border-b border-navy/10 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Customer Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowOrderReviewModal(false)}
                    className="text-[11px] font-bold text-[#00AEC7] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-navy/50 block font-medium">Full Name</span>
                    <strong className="text-navy text-sm">{formData.firstName} {formData.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-navy/50 block font-medium">Mobile Number</span>
                    <strong className="text-navy text-sm font-mono">{formData.phone}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-navy/50 block font-medium">Email Address</span>
                    <strong className="text-navy text-sm">{formData.email}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address & Destination */}
              <div className="rounded-2xl bg-[#F8FAFC] border border-navy/10 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 border-b border-navy/10 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Shipping Destination
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowOrderReviewModal(false)}
                    className="text-[11px] font-bold text-[#00AEC7] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-xs space-y-1.5">
                  <p className="text-navy font-semibold">
                    {formData.address}{formData.apartment ? `, ${formData.apartment}` : ''}
                  </p>
                  <p className="text-navy/70">
                    {formData.city}, {formData.state} - <strong className="text-navy font-mono">{formData.postalCode}</strong>
                  </p>
                  <p className="text-navy/80 font-bold">
                    {formData.country}
                  </p>
                  <div className="pt-2 mt-2 border-t border-navy/10 flex items-center justify-between text-navy/70">
                    <span>Delivery Speed:</span>
                    <strong className="text-navy">
                      {shippingMethod === 'express' ? 'Express Delivery (₹199)' : 'Standard Delivery (FREE)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. Items to be Ordered */}
              <div className="rounded-2xl bg-[#F8FAFC] border border-navy/10 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 border-b border-navy/10 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Items in Order ({items.length})
                  </h4>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto divide-y divide-navy/10 pr-1">
                  {items.map((item) => (
                    <div key={item.id || item.inventoryId} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-12 rounded-lg bg-white border border-navy/10 p-1 shrink-0 flex items-center justify-center">
                          <img src={item.product?.image || item.image} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-navy truncate">{item.product?.name || item.product?.title || item.title}</p>
                          <p className="text-[10px] text-navy/50">
                            Qty: {item.quantity || 1} • Size: {item.product?.selectedSize || item.size || 'Standard'} • Color: {item.product?.selectedColor || item.color || 'Standard'}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-navy shrink-0 font-mono">
                        {formatCurrency(((item.product?.price ?? item.price) || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Payment Method & Cost Breakdown */}
              <div className="rounded-2xl bg-navy/[0.04] border border-navy/10 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 border-b border-navy/10 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Payment & Summary
                  </h4>
                  <span className="text-[10px] font-bold text-navy uppercase bg-white border border-navy/10 px-2.5 py-0.5 rounded-full">
                    {paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : paymentMethod === 'netbanking' ? 'Netbanking' : 'Cash On Delivery'}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-navy/70">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-navy">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-navy/70">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-emerald-700">
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-navy font-bold text-base pt-2.5 border-t border-navy/10">
                    <span>Final Amount Payable</span>
                    <span className="text-lg text-navy">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 sm:px-8 py-5 border-t border-navy/10 bg-[#FAFAFA] flex flex-col sm:flex-row gap-3 justify-end items-center">
              <button
                type="button"
                onClick={() => setShowOrderReviewModal(false)}
                disabled={isPlacingOrder}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-navy/20 text-navy font-bold text-xs sm:text-sm hover:bg-navy/5 transition cursor-pointer"
              >
                ← Edit Details
              </button>
              <button
                type="button"
                onClick={handleFinalPlaceOrder}
                disabled={isPlacingOrder}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-navy hover:bg-accent text-white font-bold text-xs sm:text-sm transition shadow-lift flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order ({formatCurrency(grandTotal)})</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
