import api from './api'

export const paymentService = {
  initiate: (payload) => api.post('/api/payments/initiate', payload),
}
