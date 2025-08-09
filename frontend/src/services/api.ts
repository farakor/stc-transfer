import axios from 'axios'

// API Configuration
// Всегда используем относительный путь, чтобы запросы шли через прокси Vite.
const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url
    })

    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.warn('🔒 Unauthorized access')
    }

    if (error.response?.status === 500) {
      // Handle server errors
      console.error('🚨 Server error')
    }

    return Promise.reject(error)
  }
)

export default api
