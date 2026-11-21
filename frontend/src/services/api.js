import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// اضافه کردن token به همه درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// refresh token اگه منقضی شد
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry && !/\/accounts\/(login|register|token\/refresh)\//.test(original.url)) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) return Promise.reject(error)
        const res = await axios.post('/api/accounts/token/refresh/', { refresh }, { timeout: 10000 })
        localStorage.setItem('access_token', res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`
      }
    }
    return Promise.reject(error)
  }
)

export default api
