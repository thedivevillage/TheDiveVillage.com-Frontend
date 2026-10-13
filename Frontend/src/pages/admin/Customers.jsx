import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionReveal from '../../components/SectionReveal'
import { bookingService } from '../../services/bookingService'
import { adminService } from '../../services/adminService'
import { contentService } from '../../services/contentService'

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED']

export default function AdminCustomers() {
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' | 'users' | 'contact'

  // Toast State
  const [toast, setToast] = useState(null)
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // 1. BOOKINGS STATE
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')
  const [bookingSearch, setBookingSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // 2. REGISTERED USERS STATE
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roles, setRoles] = useState([])
  const [editingUserRole, setEditingUserRole] = useState(null)
  const [selectedNewRole, setSelectedNewRole] = useState('')

  // 3. CONTACT MESSAGES STATE
  const [contactMessages, setContactMessages] = useState([])
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')
  const [selectedContactMessage, setSelectedContactMessage] = useState(null)

  // Fetch Bookings
  const fetchBookings = async () => {
    setBookingsLoading(true)
    setBookingsError('')
    try {
      const statusParam = selectedStatus !== 'ALL' ? selectedStatus : undefined
      const res = await bookingService.getBookings({ search: bookingSearch, status: statusParam })
      const data = res.data?.data
      const list = Array.isArray(data) ? data : (Array.isArray(data?.bookings) ? data.bookings : [])
      setBookings(list)
    } catch {
      setBookingsError('Failed to load booking requests.')
    } finally {
      setBookingsLoading(false)
    }
  }

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const [usersRes, rolesRes] = await Promise.allSettled([
        adminService.getUsers({ search: userSearch }),
        adminService.getRoles(),
      ])
      if (usersRes.status === 'fulfilled') {
        const uList = usersRes.value?.data?.data?.users || []
        setUsers(uList)
      } else {
        setUsersError('Failed to load user directory.')
      }
      if (rolesRes.status === 'fulfilled') {
        const rList = rolesRes.value?.data?.data?.roles || []
        setRoles(rList)
      }
    } catch {
      setUsersError('Failed to load users.')
    } finally {
      setUsersLoading(false)
    }
  }

  // Fetch Contact Messages
  const fetchContactMessages = async () => {
    setContactLoading(true)
    setContactError('')
    try {
      const res = await contentService.getContactMessages()
      const mList = res.data?.data?.messages || []
      setContactMessages(mList)
    } catch {
      setContactError('Failed to load contact submissions.')
    } finally {
      setContactLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings()
    } else if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'contact') {
      fetchContactMessages()
    }
  }, [activeTab, selectedStatus])

  const handleBookingSearchSubmit = (e) => {
    e.preventDefault()
    fetchBookings()
  }

  const handleUserSearchSubmit = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingStatus(true)
    try {
      await bookingService.updateStatus(bookingId, newStatus)
      showToast('success', `Booking marked as ${newStatus}`)
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }))
      }
      fetchBookings()
    } catch {
      showToast('error', 'Failed to update booking status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveUserRole = async () => {
    if (!editingUserRole || !selectedNewRole) return
    try {
      await adminService.updateUserRole(editingUserRole.id, { roleName: selectedNewRole })
      showToast('success', `User role updated to ${selectedNewRole}`)
      setEditingUserRole(null)
      fetchUsers()
    } catch {
      showToast('error', 'Failed to update user role.')
    }
  }

  const handleMarkContactRead = async (msgId) => {
    try {
      await contentService.markContactRead(msgId)
      showToast('success', 'Message marked as read')
      setContactMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isRead: true } : m))
      )
      if (selectedContactMessage && selectedContactMessage.id === msgId) {
        setSelectedContactMessage((prev) => ({ ...prev, isRead: true }))
      }
    } catch {
      showToast('error', 'Failed to mark message as read.')
    }
  }

  return (
    <SectionReveal>
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

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-200/90 p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-0.5">Directory & Inquiries</span>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'bookings' && `Booking Requests (${bookings.length})`}
              {activeTab === 'users' && `Registered Accounts (${users.length})`}
              {activeTab === 'contact' && `Contact Inquiries (${contactMessages.length})`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'contact'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Messages ({contactMessages.filter((m) => !m.isRead).length} new)
              </button>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'bookings') fetchBookings()
                else if (activeTab === 'users') fetchUsers()
                else fetchContactMessages()
              }}
              className="bg-white border border-gray-300 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* TAB 1: BOOKING REQUESTS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <form onSubmit={handleBookingSearchSubmit} className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search by customer name, email, or location..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="sm:col-span-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 transition shadow-2xs"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-slate-900 transition cursor-pointer shadow-2xs"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </form>

            {bookingsLoading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Loading booking requests...</p>
              </div>
            ) : bookingsError ? (
              <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm font-semibold">
                {bookingsError}
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-sm font-bold text-slate-900 mb-1">No booking requests found</p>
                <p className="text-xs text-slate-500">No submissions match the current filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm text-slate-800">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Customer</th>
                      <th className="px-6 py-3.5 font-bold">Location</th>
                      <th className="px-6 py-3.5 font-bold">Preferred Date</th>
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
                          {b.contactPhone && <p className="text-[11px] text-slate-400 font-mono">{b.contactPhone}</p>}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                          >
                            Inspect Request
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

        {/* TAB 2: REGISTERED USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <form onSubmit={handleUserSearchSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="Search registered user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 transition shadow-2xs"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Search
              </button>
            </form>

            {usersLoading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Loading user accounts...</p>
              </div>
            ) : usersError ? (
              <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm font-semibold">
                {usersError}
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-sm font-bold text-slate-900 mb-1">No registered users found</p>
                <p className="text-xs text-slate-500">No customer records matching your query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm text-slate-800">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">User</th>
                      <th className="px-6 py-3.5 font-bold">Role</th>
                      <th className="px-6 py-3.5 font-bold">Joined</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                      <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{u.fullName || 'User'}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                            u.role?.name === 'admin' || u.role?.name === 'super_admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-gray-200'
                          }`}>
                            {u.role?.name || 'customer'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              setEditingUserRole(u)
                              setSelectedNewRole(u.role?.name || 'customer')
                            }}
                            className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                          >
                            Change Role
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

        {/* TAB 3: CONTACT INQUIRIES */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            {contactLoading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Loading contact submissions...</p>
              </div>
            ) : contactError ? (
              <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm font-semibold">
                {contactError}
              </div>
            ) : contactMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-sm font-bold text-slate-900 mb-1">No contact inquiries found</p>
                <p className="text-xs text-slate-500">No submissions from the public Contact form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm text-slate-800">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Sender</th>
                      <th className="px-6 py-3.5 font-bold">Subject</th>
                      <th className="px-6 py-3.5 font-bold">Date</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                      <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {contactMessages.map((msg) => (
                      <tr key={msg.id} className={`hover:bg-slate-50/60 transition ${!msg.isRead ? 'bg-blue-50/20' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{msg.name}</p>
                          <p className="text-xs text-slate-500">{msg.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{msg.subject || 'Inquiry'}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{msg.message}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                            msg.isRead
                              ? 'bg-slate-100 text-slate-600 border border-gray-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {msg.isRead ? 'Read' : 'New'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => setSelectedContactMessage(msg)}
                            className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                          >
                            View
                          </button>
                          {!msg.isRead && (
                            <button
                              onClick={() => handleMarkContactRead(msg.id)}
                              className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition cursor-pointer shadow-2xs"
                            >
                              Mark Read
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Change Role Modal */}
        <AnimatePresence>
          {editingUserRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Change User Role</h3>
                  <button onClick={() => setEditingUserRole(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">User: <strong>{editingUserRole.fullName || editingUserRole.email}</strong></p>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Role</label>
                  <select
                    value={selectedNewRole}
                    onChange={(e) => setSelectedNewRole(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-slate-900 text-xs font-semibold outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                    <option value="editor">Editor</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingUserRole(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUserRole}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    Save Role
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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

                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Update Booking Status</span>
                    <div className="flex flex-wrap gap-2">
                      {['NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED'].map((st) => (
                        <button
                          key={st}
                          disabled={updatingStatus}
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

        {/* View Contact Message Modal */}
        <AnimatePresence>
          {selectedContactMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Message Details</span>
                    <h3 className="text-xl font-bold text-slate-900">{selectedContactMessage.name}</h3>
                  </div>
                  <button onClick={() => setSelectedContactMessage(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-slate-500 block font-semibold mb-0.5">Email</span>
                    <span className="font-bold text-slate-900">{selectedContactMessage.email}</span>
                  </div>

                  {selectedContactMessage.subject && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-slate-500 block font-semibold mb-0.5">Subject</span>
                      <span className="font-bold text-slate-900">{selectedContactMessage.subject}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                    <span className="text-slate-500 block font-semibold mb-1 uppercase tracking-wider text-[10px]">Message Content</span>
                    <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line">{selectedContactMessage.message}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  {!selectedContactMessage.isRead && (
                    <button
                      onClick={() => handleMarkContactRead(selectedContactMessage.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedContactMessage(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
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
