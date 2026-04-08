import axios from 'axios'
import { tokenUtils } from './tokenUtils'

// Track pending requests for deduplication
const pendingRequests = new Map<string, Promise<any>>()

const getRequestKey = (config: any): string => {
  return `${config.method}-${config.url}`
}

// --- Instance 1: Direct Backend (Java Spring Boot) ---
const getBaseURL = () => {
  // Ưu tiên 8080 theo yêu cầu fix
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  // Normalize: Strip trailing /api/v1 or /api to ensure host-only baseURL
  return url.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '')
}

export const apiJava = axios.create({
  baseURL: getBaseURL(),
  timeout: 12000,  // Reduced from 15s to 12s for better UX responsiveness
  headers: { 'Content-Type': 'application/json' }
})


// --- Instance 2: Next.js API Proxy ---
export const apiNext = axios.create({
  baseURL: '/api/',
  timeout: 8000,  // Reduced from 10s to 8s for proxy
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// JWT request interceptor for direct calls
apiJava.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = tokenUtils.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add AbortSignal with timeout for better control
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)
  config.signal = controller.signal
  
  // Store timeout ID for cleanup
  ;(config as any)._timeoutId = timeoutId
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// Simple error handler for apiNext (no refresh — proxy routes manage cookies)
apiNext.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || 'Có lỗi xảy ra'
    const errorCode = error.response?.data?.errorCode || 'UNKNOWN_ERROR'
    return Promise.reject({ message, errorCode, response: error.response })
  }
)

// Refresh state
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    tokenUtils.removeToken()
    window.location.href = '/login'
  }
}

// Response interceptor for apiJava: 401 → refresh → retry → redirect
apiJava.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // BƯỚC 5: Tránh loop vô tận khi login/refresh bị 401
    const isAuthPath = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthPath && typeof window !== 'undefined') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiJava(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Use vanilla axios to avoid triggering this interceptor again
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        const newToken = data?.accessToken as string | undefined

        if (newToken) {
          tokenUtils.setToken(newToken)
          apiJava.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        processQueue(null, newToken ?? null)
        return apiJava(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const message = error.response?.data?.detail || error.response?.data?.message || 'Có lỗi xảy ra'
    const errorCode = error.response?.data?.errorCode || 'UNKNOWN_ERROR'
    return Promise.reject({ message, errorCode, response: error.response })
  }
)

// Default export for backward compatibility or general use
const api = apiJava
export default api

