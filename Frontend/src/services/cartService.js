import api from './api'

export const cartService = {
  get: () => api.get('/api/v1/cart'),
  addItem: ({ inventoryId, quantity = 1, productSnapshot, product } = {}) =>
    api.post('/api/v1/cart/items', { inventoryId, quantity, productSnapshot, product }),
  updateQuantity: (id, quantity) =>
    api.patch(`/api/v1/cart/items/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/api/v1/cart/items/${id}`),
  clear: () => api.delete('/api/v1/cart'),
}

