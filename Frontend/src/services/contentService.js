import api from './api'

export const contentService = {
  // FAQs
  getFaqs: (params) => api.get('/api/v1/content/faq', { params }),
  upsertFaq: (payload) => api.post('/api/v1/content/faq', payload),
  deleteFaq: (id) => api.delete(`/api/v1/content/faq/${id}`),

  // Gallery
  getGallery: (params) => api.get('/api/v1/content/gallery', { params }),
  upsertGalleryItem: (payload) => api.post('/api/v1/content/gallery', payload),
  deleteGalleryItem: (id) => api.delete(`/api/v1/content/gallery/${id}`),

  // Contact Messages (Admin)
  getContactMessages: () => api.get('/api/v1/content/contact'),
  markContactRead: (id) => api.patch(`/api/v1/content/contact/${id}/read`),

  // Audit Logs
  getAuditLogs: (params) => api.get('/api/admin/audit-logs', { params }),
}


