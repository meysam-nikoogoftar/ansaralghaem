import { create } from 'zustand'

const STORAGE_KEY = 'theme_preference' // 'light' | 'dark' | 'auto'
const DAY_START_HOUR = 6   // از ساعت ۶ صبح
const DAY_END_HOUR = 19    // تا ساعت ۱۹ (۷ عصر) روزه، بعدش شب

function getSystemTheme() {
  const hour = new Date().getHours()
  return (hour >= DAY_START_HOUR && hour < DAY_END_HOUR) ? 'light' : 'dark'
}

function resolveTheme(preference) {
  return preference === 'auto' ? getSystemTheme() : preference
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

let autoCheckInterval = null

const useThemeStore = create((set, get) => ({
  preference: 'auto',   // انتخاب ذخیره‌شده‌ی کاربر: light / dark / auto
  activeTheme: 'dark',  // تمی که الان واقعاً روی صفحه اعمال شده

  initTheme: () => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'auto'
    const active = resolveTheme(saved)
    applyTheme(active)
    set({ preference: saved, activeTheme: active })

    // اگه حالت auto فعاله، هر ۵ دقیقه چک کن که مثلاً از روز به شب رد نشده باشیم
    clearInterval(autoCheckInterval)
    if (saved === 'auto') {
      autoCheckInterval = setInterval(() => {
        if (get().preference !== 'auto') {
          clearInterval(autoCheckInterval)
          return
        }
        const newActive = resolveTheme('auto')
        if (newActive !== get().activeTheme) {
          applyTheme(newActive)
          set({ activeTheme: newActive })
        }
      }, 5 * 60 * 1000)
    }
  },

  setPreference: (pref) => {
    localStorage.setItem(STORAGE_KEY, pref)
    const active = resolveTheme(pref)
    applyTheme(active)
    set({ preference: pref, activeTheme: active })

    clearInterval(autoCheckInterval)
    if (pref === 'auto') {
      autoCheckInterval = setInterval(() => {
        if (get().preference !== 'auto') {
          clearInterval(autoCheckInterval)
          return
        }
        const newActive = resolveTheme('auto')
        if (newActive !== get().activeTheme) {
          applyTheme(newActive)
          set({ activeTheme: newActive })
        }
      }, 5 * 60 * 1000)
    }
  },
}))

export default useThemeStore