import api from './api'

export const bookingService = {
  createBooking: (payload) => api.post('/api/bookings', payload),
  getBookings: (params) => api.get('/api/bookings', { params }),
  getBookingById: (id) => api.get(`/api/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status }),
}
