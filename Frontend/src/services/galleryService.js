import api from './api'

export const galleryService = {
  getGalleryItems: (params) => api.get('/api/v1/content/gallery', { params }),
  upsertGalleryItem: (payload) => api.post('/api/v1/content/gallery', payload),
  deleteGalleryItem: (id) => api.delete(`/api/v1/content/gallery/${id}`),
}

