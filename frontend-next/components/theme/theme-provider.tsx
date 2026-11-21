'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ThemePreference } from '@/types'

const ThemeContext = createContext<{
  preference: ThemePreference
  setPreference: (value: ThemePreference) => void
}>({ preference: 'auto', setPreference: () => {} })
function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem('theme_preference')
    return value === 'light' || value === 'dark' ? value : 'auto'
  } catch {
    return 'auto'
  }
}
function apply(preference: ThemePreference) {
  const hour = new Date().getHours()
  document.documentElement.dataset.theme =
    preference === 'auto' ? (hour >= 6 && hour < 19 ? 'light' : 'dark') : preference
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('auto')
  useEffect(() => {
    const sync = () => {
      const value = readPreference()
      setPreferenceState(value)
      apply(value)
    }
    sync()
    const interval = window.setInterval(sync, 300_000)
    const storage = (event: StorageEvent) => {
      if (!event.key || event.key === 'theme_preference') sync()
    }
    window.addEventListener('storage', storage)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', storage)
    }
  }, [])
  return (
    <ThemeContext.Provider
      value={{
        preference,
        setPreference: (value) => {
          try {
            localStorage.setItem('theme_preference', value)
          } catch {
            /* The chosen theme still applies in this tab. */
          }
          setPreferenceState(value)
          apply(value)
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
export const useTheme = () => useContext(ThemeContext)
