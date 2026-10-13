import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminOrders } from '../../hooks/useOrders'
import { orderService } from '../../services/orderService'
import { bookingService } from '../../services/bookingService'
import SectionReveal from '../../components/SectionReveal'

const ORDER_STATUSES = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']
const BOOKING_STATUSES = ['ALL', 'NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED']

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'bookings'
  const { data: orders = [], loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useAdminOrders()

  // Orders State
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Bookings State
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updatingBookingId, setUpdatingBookingId] = useState(null)

  // Notification Toast
  const [toast, setToast] = useState(null)
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // Fetch Bookings
  const fetchBookings = async () => {
    setBookingsLoading(true)
    setBookingsError('')
    try {
      const statusParam = bookingStatusFilter !== 'ALL' ? bookingStatusFilter : undefined
      const res = await bookingService.getBookings({ search: bookingSearch, status: statusParam })
      const data = res.data?.data
      const list = Array.isArray(data) ? data : (Array.isArray(data?.bookings) ? data.bookings : [])
      setBookings(list)
    } catch {
      setBookingsError('Failed to load bookings.')
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings()
    }
  }, [activeTab, bookingStatusFilter])

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await orderService.updateStatus(orderId, newStatus)
      showToast('success', `Order status updated to ${newStatus.toUpperCase()}`)
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }))
      }
      refetchOrders()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId)
    try {
      await bookingService.updateStatus(bookingId, newStatus)
      showToast('success', `Booking status updated to ${newStatus}`)
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }))
      }
      fetchBookings()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update booking status.')
    } finally {
      setUpdatingBookingId(null)
    }
  }

  const orderList = Array.isArray(orders) ? orders : []
  const filteredOrders = orderList.filter((ord) => {
    const num = (ord.orderNumber || ord.id || '').toLowerCase()
    const name = (ord.customer?.fullName || ord.shippingFullName || '').toLowerCase()
    const email = (ord.customer?.email || '').toLowerCase()
    const matchesSearch =
      num.includes(orderSearch.toLowerCase()) ||
      name.includes(orderSearch.toLowerCase()) ||
      email.includes(orderSearch.toLowerCase())
    const matchesStatus = orderStatusFilter === 'all' || ord.orderStatus === orderStatusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <SectionReveal className="antialiased">
      <div className="space-y-6 relative">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border shadow-lg transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-200/90 p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-0.5">Order & Reservation Management</span>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'orders' ? `Store Orders (${filteredOrders.length})` : `Dive Bookings (${bookings.length})`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Store Orders ({orderList.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dive Bookings ({bookings.length})
              </button>
            </div>

            <button
              onClick={activeTab === 'orders' ? refetchOrders : fetchBookings}
              className="bg-white border border-gray-300 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* TAB 1: STORE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search by order #, customer, email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="sm:col-span-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 transition shadow-2xs"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-slate-900 transition cursor-pointer shadow-2xs uppercase"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </div>

            {ordersLoading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Loading customer orders...</p>
              </div>
            ) : ordersError ? (
              <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm font-semibold">
                Failed to load orders. Please try again.
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-sm font-bold text-slate-900 mb-1">No orders found</p>
                <p className="text-xs text-slate-500">No store orders match your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm text-slate-800">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Order #</th>
                      <th className="px-6 py-3.5 font-bold">Customer</th>
                      <th className="px-6 py-3.5 font-bold">Date</th>
                      <th className="px-6 py-3.5 font-bold">Total</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                      <th className="px-6 py-3.5 font-bold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {ord.orderNumber || ord.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{ord.customer?.fullName || ord.shippingFullName || 'Customer'}</p>
                          <p className="text-xs text-slate-500">{ord.customer?.email || ord.shippingPhone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                          ₹{ord.totalAmount ? Number(ord.totalAmount).toLocaleString('en-IN') : '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                            ord.orderStatus === 'paid' || ord.orderStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.orderStatus === 'shipped'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : ord.orderStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {ord.orderStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <select
                            disabled={updatingOrderId === ord.id}
                            value={ord.orderStatus || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 transition cursor-pointer shadow-2xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIVE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <form onSubmit={(e) => { e.preventDefault(); fetchBookings(); }} className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search booking customer, email, location..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="sm:col-span-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 transition shadow-2xs"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-slate-900 transition cursor-pointer shadow-2xs"
              >
                {BOOKING_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </form>

            {bookingsLoading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Loading booking reservations...</p>
              </div>
            ) : bookingsError ? (
              <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm font-semibold">
                {bookingsError}
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-sm font-bold text-slate-900 mb-1">No bookings found</p>
                <p className="text-xs text-slate-500">No booking reservations match the current filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm text-slate-800">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Customer</th>
                      <th className="px-6 py-3.5 font-bold">Location</th>
                      <th className="px-6 py-3.5 font-bold">Date</th>
                      <th className="px-6 py-3.5 font-bold">Group</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                      <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{b.contactName}</p>
                          <p className="text-xs text-slate-500">{b.contactEmail}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{b.location}</p>
                          <p className="text-xs text-slate-500">{b.country}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                          {b.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                          {b.groupSize} Person(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                            b.status === 'NEW'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : b.status === 'CONTACTED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detailed Booking Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-xl w-full text-slate-900 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Booking Details</span>
                    <h3 className="text-xl font-bold text-slate-900">{selectedBooking.contactName}</h3>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-slate-500 block font-semibold mb-0.5">Email</span>
                      <span className="font-bold text-slate-900">{selectedBooking.contactEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold mb-0.5">Phone</span>
                      <span className="font-bold text-slate-900">{selectedBooking.contactPhone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-slate-500 block font-semibold mb-0.5">Location</span>
                      <span className="font-bold text-slate-900">{selectedBooking.location} ({selectedBooking.country})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold mb-0.5">Date</span>
                      <span className="font-bold text-slate-900">{selectedBooking.date}</span>
                    </div>
                  </div>

                  {Array.isArray(selectedBooking.participants) && selectedBooking.participants.length > 0 && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                      <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[10px]">
                        Participants ({selectedBooking.participants.length})
                      </span>
                      {selectedBooking.participants.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                          <div>
                            <span className="font-semibold text-slate-900 block">{p.name || `Participant ${idx + 1}`}</span>
                            <span className="text-[10px] text-slate-400">Age: {p.age || 'N/A'}</span>
                          </div>
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md text-[10px]">
                            {p.selectedProgram || 'Program'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBooking.specialRequests && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                      <span className="text-slate-500 block font-semibold mb-1 uppercase tracking-wider text-[10px]">Special Requests</span>
                      <p className="text-slate-700 text-xs leading-relaxed">{selectedBooking.specialRequests}</p>
                    </div>
                  )}

                  {/* Status Updater */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Update Booking Status</span>
                    <div className="flex flex-wrap gap-2">
                      {['NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED'].map((st) => (
                        <button
                          key={st}
                          disabled={updatingBookingId === selectedBooking.id}
                          onClick={() => handleUpdateBookingStatus(selectedBooking.id, st)}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
                            selectedBooking.status === st
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </SectionReveal>
  )
}
