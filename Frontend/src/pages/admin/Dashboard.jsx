import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import SectionReveal from '../../components/SectionReveal'
import { useReviews } from '../../contexts/ReviewsContext'
import SafeImage from '../../components/SafeImage'
import { bookingService } from '../../services/bookingService'
import { productService } from '../../services/productService'
import { contentService } from '../../services/contentService'

export default function AdminDashboard() {
  const { pendingReviews, approvedReviews, approveReview, deleteReview } = useReviews()
  const [activeTab, setActiveTab] = useState('pending')

  // Live DB Stats
  const [stats, setStats] = useState({
    pendingBookings: 0,
    totalBookings: 0,
    totalProducts: 0,
    totalGallery: 0,
    totalFaqs: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [bookingsRes, productsRes, galleryRes, faqsRes] = await Promise.allSettled([
          bookingService.getBookings(),
          productService.getProducts({ includeInactive: 'true' }),
          contentService.getGallery({ includeInactive: 'true' }),
          contentService.getFaqs({ includeInactive: 'true' }),
        ])

        const bookingsData = bookingsRes.status === 'fulfilled' ? bookingsRes.value?.data?.data : null
        const bookings = Array.isArray(bookingsData)
          ? bookingsData
          : (Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : [])

        const productsData = productsRes.status === 'fulfilled' ? productsRes.value?.data?.data : null
        const products = Array.isArray(productsData)
          ? productsData
          : (Array.isArray(productsData?.products) ? productsData.products : [])

        const galleryData = galleryRes.status === 'fulfilled' ? galleryRes.value?.data?.data : null
        const gallery = Array.isArray(galleryData)
          ? galleryData
          : (Array.isArray(galleryData?.items) ? galleryData.items : [])

        const faqsData = faqsRes.status === 'fulfilled' ? faqsRes.value?.data?.data : null
        const faqs = Array.isArray(faqsData)
          ? faqsData
          : (Array.isArray(faqsData?.faqs) ? faqsData.faqs : [])

        // Booking status in schema is NEW, CONTACTED, CONFIRMED, CANCELLED
        const pendingCount = bookings.filter((b) => {
          const s = (b.status || '').toUpperCase()
          return s === 'NEW' || s === 'PENDING'
        }).length

        setStats({
          pendingBookings: pendingCount,
          totalBookings: bookings.length,
          totalProducts: products.length,
          totalGallery: gallery.length,
          totalFaqs: faqs.length,
        })
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      } finally {
        setLoadingStats(false)
      }
    }
    loadStats()
  }, [])

  return (
    <SectionReveal className="space-y-6 antialiased">
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-white border border-gray-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2 border border-gray-200">
              Overview & Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Administration Dashboard
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
              Live monitoring of bookings, inventory catalog, website media assets, and guest reviews.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-slate-50 px-4 py-2 border border-gray-200 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">System Status</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Pending Bookings */}
        <Link
          to="/admin/orders"
          className="group rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 p-5 shadow-xs transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Pending Bookings
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {loadingStats ? '—' : stats.pendingBookings}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-gray-200">
              Total {stats.totalBookings}
            </span>
          </div>
        </Link>

        {/* Catalog Products */}
        <Link
          to="/admin/catalog"
          className="group rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 p-5 shadow-xs transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Active Gear & Items
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {loadingStats ? '—' : stats.totalProducts}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-gray-200">
              Live Products
            </span>
          </div>
        </Link>

        {/* Gallery Media */}
        <Link
          to="/admin/content"
          className="group rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 p-5 shadow-xs transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Gallery Media
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {loadingStats ? '—' : stats.totalGallery}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-gray-200">
              Assets
            </span>
          </div>
        </Link>

        {/* FAQs & CMS */}
        <Link
          to="/admin/content"
          className="group rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 p-5 shadow-xs transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              FAQ Entries
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {loadingStats ? '—' : stats.totalFaqs}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-gray-200">
              Articles
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Review Moderation Panel */}
      <div className="rounded-2xl bg-white border border-gray-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-0.5">Moderation</span>
            <h2 className="text-xl font-bold text-slate-900">
              Customer Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Approve submitted community feedback before displaying on the live website.</p>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-gray-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Pending Approval ({pendingReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Live on Site ({approvedReviews.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <div>
            {pendingReviews.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm font-semibold text-slate-800 mb-1">No pending reviews</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All guest submissions have been reviewed and published.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-gray-200 bg-slate-50/40 hover:bg-slate-50 transition-all duration-150"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
                        <SafeImage src={rev.image} alt={rev.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{rev.name}</h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {rev.role}
                          </span>
                          <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                        </div>
                        <div className="flex gap-0.5 text-amber-500 text-xs">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 pt-0.5 leading-relaxed">
                          "{rev.text}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <button
                        onClick={() => approveReview(rev.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="space-y-3">
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-gray-200 bg-white"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
                    <SafeImage src={rev.image} alt={rev.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{rev.name}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Published
                      </span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500 text-xs">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 pt-0.5 leading-relaxed">
                      "{rev.text}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => deleteReview(rev.id)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionReveal>
  )
}
