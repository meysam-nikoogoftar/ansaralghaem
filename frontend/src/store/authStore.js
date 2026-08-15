import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (mobile, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/accounts/login/', { mobile, password })
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      set({ user: res.data.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'خطا در ورود', isLoading: false })
      return false
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/accounts/register/', data)
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      set({ user: res.data.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data || 'خطا در ثبت‌نام', isLoading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },

  getProfile: async () => {
    try {
      const res = await api.get('/accounts/profile/')
      set({ user: res.data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true })
    try {
      const res = await api.put('/accounts/profile/', data)
      set({ user: res.data, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data || 'خطا در بروزرسانی', isLoading: false })
      return false
    }
  },

  initAuth: () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      get().getProfile()
    }
  },
}))

export default useAuthStore