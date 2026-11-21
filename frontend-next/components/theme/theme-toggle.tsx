'use client'
import { useTheme } from './theme-provider'
import { Icon } from '@/components/layout/icon'
import type { ThemePreference } from '@/types'
const preferences: ThemePreference[] = ['light', 'dark', 'auto']
const labels = { light: 'روز', dark: 'شب', auto: 'خودکار' }
const icons = { light: 'sun', dark: 'moon', auto: 'clock' } as const
export default function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const next = preferences[(preferences.indexOf(preference) + 1) % preferences.length] || 'auto'
  return (
    <button
      type="button"
      className="theme-cycle"
      data-preference={preference}
      title={`${labels[preference]} / ${labels[next]}`}
      aria-label={`${labels[preference]}؛ تغییر به ${labels[next]}`}
      onClick={() => setPreference(next)}
    >
      <span>
        <Icon name={icons[preference]} />
      </span>
    </button>
  )
}
