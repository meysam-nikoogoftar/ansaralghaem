import useThemeStore from '../store/themeStore'

const options = [
  {
    key: 'light',
    label: 'روز',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    key: 'auto',
    label: 'خودکار',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    key: 'dark',
    label: 'شب',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
]

function ThemeToggle() {
  const { preference, setPreference } = useThemeStore()

  const cycle = ['light', 'dark', 'auto']
  const current = options.find(option => option.key === preference) || options[1]
  const next = options.find(option => option.key === cycle[(cycle.indexOf(current.key) + 1) % cycle.length])
  return (
    <button type="button" className="theme-cycle" data-preference={current.key}
      title={`${current.label} / ${next.label}`}
      aria-label={`${current.label}؛ تغییر به ${next.label}`}
      onClick={() => setPreference(next.key)}>
      <span aria-hidden="true">{current.icon}</span>
    </button>
  )
}

export default ThemeToggle
