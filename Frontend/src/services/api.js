import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

export const apiBaseUrl =
  rawApiUrl ||
  (import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://thedivevillage-backend.onrender.com')

export const isApiConfigured = Boolean(apiBaseUrl)

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

