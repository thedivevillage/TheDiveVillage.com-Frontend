import api from './api'

export const productService = {
  list: (params = {}) => api.get('/api/v1/products', { params }),
  getProducts: (params = {}) => api.get('/api/v1/products', { params }),
  getById: (id) => api.get(`/api/v1/products/${id}`),
  create: (payload) => api.post('/api/v1/products', payload),
  update: (id, payload) => api.put(`/api/v1/products/${id}`, payload),
  remove: (id) => api.delete(`/api/v1/products/${id}`),
  getCategories: () => api.get('/api/v1/products/categories'),
  getInventory: (productId) => api.get(`/api/v1/inventory/${productId}`),
  updateInventory: (id, payload) => api.put(`/api/v1/inventory/${id}`, payload),
}
