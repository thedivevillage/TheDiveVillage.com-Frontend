import api, { isApiConfigured } from './api'

export const productService = {
  list: (params = {}) => {
    if (!isApiConfigured) return Promise.resolve({ data: { data: { products: [] } } })
    return api.get('/api/v1/products', { params })
  },
  getProducts: (params = {}) => {
    if (!isApiConfigured) return Promise.resolve({ data: { data: [] } })
    return api.get('/api/v1/products', { params })
  },
  getById: (id) => {
    if (!isApiConfigured) return Promise.resolve({ data: { data: null } })
    return api.get(`/api/v1/products/${id}`)
  },
  create: (payload) => {
    if (!isApiConfigured) return Promise.reject(new Error('Backend API is not configured.'))
    return api.post('/api/v1/products', payload)
  },
  update: (id, payload) => {
    if (!isApiConfigured) return Promise.reject(new Error('Backend API is not configured.'))
    return api.put(`/api/v1/products/${id}`, payload)
  },
  remove: (id) => {
    if (!isApiConfigured) return Promise.reject(new Error('Backend API is not configured.'))
    return api.delete(`/api/v1/products/${id}`)
  },
  getCategories: () => {
    if (!isApiConfigured) return Promise.resolve({ data: { data: { categories: [] } } })
    return api.get('/api/v1/products/categories')
  },
  getInventory: (productId) => {
    if (!isApiConfigured) return Promise.resolve({ data: { data: null } })
    return api.get(`/api/v1/inventory/${productId}`)
  },
  updateInventory: (id, payload) => {
    if (!isApiConfigured) return Promise.reject(new Error('Backend API is not configured.'))
    return api.put(`/api/v1/inventory/${id}`, payload)
  },
}

