import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

const isLocalNetworkHost =
  typeof window !== 'undefined' &&
  (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.') ||
    window.location.hostname.endsWith('.local')
  )

// Prioritize local backend on localhost/dev, otherwise use configured or production API
export const apiBaseUrl =
  (import.meta.env.DEV && isLocalNetworkHost)
    ? (rawApiUrl && (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1'))
        ? rawApiUrl
        : `http://${window.location.hostname}:5000`)
    : (rawApiUrl || 'https://api.thedivevillage.com')

export const isApiConfigured = true

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
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

