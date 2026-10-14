import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

const isLocalhostHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

// In production on the live domain, default cleanly to https://api.thedivevillage.com
export const apiBaseUrl =
  rawApiUrl ||
  (import.meta.env.DEV && isLocalhostHost
    ? 'http://localhost:5000'
    : 'https://api.thedivevillage.com')

export const isApiConfigured = true

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tdv_id_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api

