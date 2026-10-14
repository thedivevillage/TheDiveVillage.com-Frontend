import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

const isLocalhostHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const isApiConfigured = Boolean(
  rawApiUrl || (import.meta.env.DEV && isLocalhostHost)
)

export const apiBaseUrl =
  rawApiUrl ||
  (isApiConfigured
    ? 'http://localhost:5000'
    : 'https://api.thedivevillage.com')

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  if (!isApiConfigured) {
    const controller = new AbortController()
    config.signal = controller.signal
    controller.abort('API base URL is not configured in production.')
    return config
  }

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

