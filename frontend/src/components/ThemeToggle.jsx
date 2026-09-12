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

  return (
    <div className="theme-toggle" role="group" aria-label="انتخاب تم روز/شب">
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => setPreference(o.key)}
          className={`theme-toggle-btn${preference === o.key ? ' active' : ''}`}
          title={o.label}
          aria-pressed={preference === o.key}
        >
          {o.icon}
        </button>
      ))}

      <style>{`
        .theme-toggle {
          display: inline-flex; align-items: center; gap: 2px;
          padding: 3px; border-radius: 999px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--line);
        }
        .theme-toggle-btn {
          display: grid; place-items: center;
          width: 26px; height: 26px; border-radius: 50%;
          background: none; border: none; cursor: pointer;
          color: var(--ink-faint);
          transition: all .2s ease;
        }
        .theme-toggle-btn:hover { color: var(--ink); }
        .theme-toggle-btn.active {
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          color: #1a1206;
        }
      `}</style>
    </div>
  )
}

export default ThemeToggle