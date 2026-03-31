import axios from 'axios'
import { tokenUtils } from './tokenUtils'

// --- Instance 1: Direct Backend (Java Spring Boot) ---
export const apiJava = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// --- Instance 2: Next.js API Proxy ---
export const apiNext = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// JWT request interceptor for direct calls
apiJava.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = tokenUtils.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
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

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
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
