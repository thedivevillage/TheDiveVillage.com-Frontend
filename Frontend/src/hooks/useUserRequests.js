import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { bookingService } from '../services/bookingService'

export function useUserRequests() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    setLoading(true)
    let combined = []

    // 1. Load from localStorage
    try {
      const localBookings = JSON.parse(localStorage.getItem('dive_village_bookings') || '[]')
      const localEnquiries = JSON.parse(localStorage.getItem('dive_village_enquiries') || '[]')
      combined = [...localBookings, ...localEnquiries]
    } catch (e) {
      console.warn('Error reading local requests:', e)
    }

    // 2. Load from server API if user is authenticated
    if (user?.email) {
      try {
        const res = await bookingService.getBookings({ search: user.email })
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiBookings = res.data.data.map((b) => ({
            id: b.id || `BK-${b._id}`,
            type: 'Booking Request',
            country: b.country || 'India',
            location: b.location || 'Havelock Island',
            date: b.date || b.bookingDate,
            groupSize: b.groupSize || (b.participants ? b.participants.length : 1),
            contactName: b.contactName || b.fullName,
            contactEmail: b.contactEmail || b.email,
            contactPhone: b.contactPhone || b.phone,
            specialRequests: b.specialRequests || b.notes,
            participants: b.participants || [],
            status: b.status || 'Confirmed',
            createdAt: b.createdAt || new Date().toISOString(),
          }))

          // Merge without duplicates
          const seenIds = new Set(apiBookings.map((x) => x.id))
          const uniqueLocal = combined.filter((x) => !seenIds.has(x.id))
          combined = [...apiBookings, ...uniqueLocal]
        }
      } catch (err) {
        console.warn('Could not fetch server bookings:', err)
      }
    }

    // Filter by user email if signed in (or include user requests)
    if (user?.email) {
      combined = combined.filter(
        (req) =>
          !req.contactEmail ||
          req.contactEmail.toLowerCase() === user.email.toLowerCase()
      )
    }

    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    setItems(combined)
    setLoading(false)
  }

  useEffect(() => {
    loadRequests()
    const handleStorage = () => loadRequests()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [user?.email])

  return {
    requests: items,
    count: items.length,
    loading,
    refresh: loadRequests,
  }
}

export default useUserRequests
