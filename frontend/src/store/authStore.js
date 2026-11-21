import { create } from 'zustand'
import api from '../services/api'
import { announceSessionChange, clearLegacyTokens } from '../../../shared/session-client'
let authGeneration = 0
const useAuthStore = create((set, get) => ({
  user: null, isAuthenticated: false, isLoading: false, error: null, authChecked: false, authError: null,
  login: async (mobile, password) => get().authenticate('/accounts/login/', { mobile, password }),
  register: async data => get().authenticate('/accounts/register/', data),
  authenticate: async (path, data) => {
    const generation = ++authGeneration
    set({ isLoading: true, error: null })
    try {
      const response = await api.post(path, data)
      if (generation !== authGeneration) return false
      set({ user: response.data.user, isAuthenticated: true, isLoading: false, authChecked: true })
      announceSessionChange()
      return true
    } catch (err) { set({ error: err.response?.data || 'خطا در ورود', isLoading: false }); return false }
  },
  logout: async () => {
    ++authGeneration
    try {
      await api.post('/accounts/logout/', {})
      set({ user: null, isAuthenticated: false, authChecked: true, authError: null })
      announceSessionChange()
      return true
    } catch { set({ authError: 'خروج انجام نشد. دوباره تلاش کنید.' }); return false }
  },
  getProfile: async (generation = authGeneration) => {
    try {
      const response = await api.get('/accounts/session/')
      if (generation !== authGeneration) return
      set({ user: response.data.user, isAuthenticated: Boolean(response.data.user) })
    } catch {
      if (generation === authGeneration) set({ user: null, isAuthenticated: false, authError: 'بررسی ورود انجام نشد. دوباره تلاش کنید.' })
    }
  },
  updateProfile: async data => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.put('/accounts/profile/', data)
      set({ user: response.data, isLoading: false }); return true
    } catch (err) { set({ error: err.response?.data || 'خطا در بروزرسانی', isLoading: false }); return false }
  },
  initAuth: () => {
    clearLegacyTokens()
    const generation = ++authGeneration
    set({ authChecked: false, authError: null })
    return get().getProfile(generation).finally(() => { if (generation === authGeneration) set({ authChecked: true }) })
  },
}))
export default useAuthStore
