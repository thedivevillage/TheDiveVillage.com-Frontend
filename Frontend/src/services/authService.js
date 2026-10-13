import api from './api'

export const authService = {
  sync: () => api.post('/api/auth/sync'),
  register: (payload) => api.post('/api/auth/register', payload),
  logout: () => api.post('/api/auth/logout'),
}
