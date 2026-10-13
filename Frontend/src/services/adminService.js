import api from './api'

export const adminService = {
  getUsers: (params = {}) => api.get('/api/admin/users', { params }),
  getRoles: () => api.get('/api/admin/roles'),
  updateUserRole: (id, payload) => api.put(`/api/admin/users/${id}/role`, payload),
  getAuditLogs: (params = {}) => api.get('/api/admin/audit-logs', { params }),
}

export default adminService
