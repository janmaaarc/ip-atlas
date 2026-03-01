import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  withCredentials: true,
})

let isRefreshing = false
let pendingRequests: (() => void)[] = []

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config

    const skipUrls = ['/api/refresh', '/api/me', '/api/login', '/api/register']
    const shouldRetry = error.response?.status === 401
      && !originalRequest._retry
      && !skipUrls.some((url: string) => originalRequest.url?.includes(url))

    if (shouldRetry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          await api.post('/api/refresh')
          isRefreshing = false
          pendingRequests.forEach(cb => cb())
          pendingRequests = []
          return api(originalRequest)
        } catch {
          isRefreshing = false
          pendingRequests = []
          localStorage.removeItem('user')
          return Promise.reject(error)
        }
      }

      return new Promise(resolve => {
        pendingRequests.push(() => resolve(api(originalRequest)))
      })
    }

    return Promise.reject(error)
  }
)

export default api
