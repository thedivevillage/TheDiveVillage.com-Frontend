import api from './api'

export const orderService = {
  getMyOrders: () => api.get('/api/orders'),
  create: (payload) => api.post('/api/orders', payload),
  getById: (id) => api.get(`/api/orders/${id}`),
  adminList: (params) => api.get('/api/orders/admin/list', { params }),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
}

