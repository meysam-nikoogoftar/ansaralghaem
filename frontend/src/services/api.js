import axios from 'axios'
import { getCsrfToken, invalidateCsrf, notifySessionExpired, setCsrfToken } from '../../../shared/session-client'
const api = axios.create({ baseURL: '/api', timeout: 15000, withCredentials: true })
api.interceptors.request.use(async config => {
  if (!['get', 'head', 'options'].includes(config.method || 'get')) config.headers.set('X-CSRFToken', await getCsrfToken())
  config.headers.delete('Authorization')
  return config
})
api.interceptors.response.use(response => {
  setCsrfToken(response.data?.csrfToken)
  return response
}, async error => {
  const original = error.config
  if (error.response?.status === 403 && error.response.data?.code === 'csrf_failed' && original && !original._csrfRetried) {
    original._csrfRetried = true
    invalidateCsrf()
    return api(original)
  }
  if (error.response?.status === 401 && !original?.url?.includes('/accounts/login/')) notifySessionExpired()
  return Promise.reject(error)
})
export default api
