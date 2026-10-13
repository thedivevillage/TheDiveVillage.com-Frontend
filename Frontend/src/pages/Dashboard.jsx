import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useMyOrders } from '../hooks/useOrders'
import { useUserRequests } from '../hooks/useUserRequests'
import { formatCurrency } from '../utils/formatCurrency'

export default function Dashboard() {
  const { user } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const { itemCount: cartCount, subtotal: cartSubtotal } = useCart()
  const { data: myOrders, loading: ordersLoading } = useMyOrders()
  const { requests, count: requestCount, loading: requestsLoading, refresh } = useUserRequests()

  const orderCount = Array.isArray(myOrders) ? myOrders.length : 0

  const stats = [
    {
      label: 'Your Orders',
      value: ordersLoading ? '...' : `${orderCount}`,
      subtext: orderCount === 1 ? '1 past order' : `${orderCount} past orders`,
      to: '/dashboard/orders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: 'Saved Wishlist',
      value: `${wishlistCount}`,
      subtext: wishlistCount === 1 ? '1 saved item' : `${wishlistCount} saved items`,
      to: '/dashboard/wishlist',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      label: 'Cart Items',
      value: `${cartCount}`,
      subtext: cartCount > 0 ? formatCurrency(cartSubtotal) : '0 items in cart',
      to: '/dashboard/cart',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: 'Booking Requests & Enquiries',
      value: requestsLoading ? '...' : `${requestCount}`,
      subtext: requestCount === 1 ? '1 active request' : `${requestCount} active requests`,
      to: '#bookings-section',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5 block">Overview</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {user?.displayName || 'Diver'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track your dive bookings, special custom requests, and general enquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/book-us"
            className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-xs whitespace-nowrap"
          >
            + Book a Dive
          </Link>
          <Link
            to="/contact"
            className="rounded-lg border border-gray-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-xs whitespace-nowrap"
          >
            Send Enquiry
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.to.startsWith('#') ? stat.to : undefined}
            onClick={
              stat.to.startsWith('#')
                ? (e) => {
                    e.preventDefault()
                    document.getElementById(stat.to.substring(1))?.scrollIntoView({ behavior: 'smooth' })
                  }
                : undefined
            }
            className="group rounded-xl bg-slate-50/70 hover:bg-slate-100/80 p-4 sm:p-5 border border-gray-200 hover:border-gray-300 transition-all duration-150 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide truncate pr-2">
                {stat.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-2xs shrink-0">
                {stat.icon}
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 flex items-center justify-between">
                <span className="truncate">{stat.subtext}</span>
                <span className="group-hover:translate-x-0.5 text-slate-900 transition-transform ml-1">→</span>
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Booking Requests / Enquiries Main Section */}
      <div id="bookings-section" className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Booking Requests & Enquiries
            </h3>
            {requestCount > 0 && (
              <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">
                {requestCount} Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-slate-50 transition cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>

        {requestsLoading ? (
          <div className="p-12 text-center text-sm text-slate-500 rounded-xl bg-slate-50/50 border border-gray-200">
            Loading your bookings and enquiries...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl bg-slate-50/50 border border-dashed border-gray-200 p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">No Booking Requests or Enquiries yet</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                When you reserve a dive or submit a custom ocean experience enquiry, your responses and status will appear right here.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/book-us"
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition shadow-xs"
              >
                Book Your Dive Adventure →
              </Link>
              <Link
                to="/contact"
                className="rounded-lg bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs sm:text-sm font-semibold transition shadow-xs"
              >
                Send Custom Enquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, idx) => (
              <div
                key={req.id || idx}
                className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs hover:border-gray-300 transition space-y-4"
              >
                {/* Header Row: ID, Type, Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-gray-200 px-2.5 py-1 rounded-md">
                      {req.id}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      req.type === 'Booking Request'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {req.type || 'Booking Request'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                      req.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : req.status === 'Inquiry Received'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {req.status || 'Pending Review'}
                    </span>
                  </div>
                </div>

                {/* Content Row */}
                {req.type === 'Booking Request' ? (
                  <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs font-medium">Destination / Site</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{req.location || 'Havelock Island'}</span>
                      <span className="text-xs text-slate-500">{req.country || 'India'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs font-medium">Date & Group</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {req.date ? new Date(req.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible Dates'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {req.groupSize ? `${req.groupSize} Diver${req.groupSize > 1 ? 's' : ''}` : '1 Diver'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs font-medium">Contact Person</span>
                      <span className="font-bold text-slate-900 mt-0.5 block truncate">{req.contactName || user?.displayName || 'Lead Diver'}</span>
                      <span className="text-xs text-slate-500 truncate block">{req.contactEmail || user?.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs font-medium">Subject</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{req.subject || 'General Enquiry'}</span>
                    </div>
                    {req.message && (
                      <div>
                        <span className="text-slate-400 block text-xs font-medium">Your Message</span>
                        <p className="text-slate-700 mt-0.5 bg-slate-50 p-3 rounded-lg border border-gray-100 text-xs sm:text-sm leading-relaxed">
                          {req.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Participants or Special Requests if any */}
                {req.participants && req.participants.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-500 mr-1">Enrolled Programs:</span>
                    {req.participants.map((p, pIdx) => (
                      <span key={pIdx} className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md border border-gray-200">
                        {p.name}: <strong className="text-slate-900">{p.selectedProgram}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {req.specialRequests && (
                  <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <strong className="text-blue-900 font-semibold">Special Request: </strong>
                    {req.specialRequests}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
