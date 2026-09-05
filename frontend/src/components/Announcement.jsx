import { useState, useEffect } from 'react'
import api from '../services/api'

function Announcement() {
  const [announcements, setAnnouncements] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get('/content/announcements/')
      .then(res => setAnnouncements(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrent(prev => (prev + 1) % announcements.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [announcements])

  if (announcements.length === 0) return null

  const announcement = announcements[current]

  const typeConfig = {
    info: { icon: 'ℹ️', accent: 'var(--teal-glow)' },
    warning: { icon: '⚠️', accent: 'var(--gold)' },
    welcome: { icon: '✦', accent: 'var(--teal-glow)' },
  }
  const config = typeConfig[announcement.announcement_type] || typeConfig.info

  return (
    <div className="an-bar" dir="rtl" style={{ borderBottomColor: config.accent }}>
      <div className="an-inner">
        <span className="an-icon" style={{ color: config.accent }}>{config.icon}</span>
        <p className="an-text">{announcement.text}</p>
        {announcements.length > 1 && (
          <span className="an-counter">{current + 1}/{announcements.length}</span>
        )}
      </div>

      <style>{`
        .an-bar {
          background: var(--bg-deep);
          border-bottom: 1px solid var(--line);
          border-bottom-width: 2px;
          padding: 9px 16px;
          position: relative;
          z-index: 60;
        }
        .an-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; gap: 10px;
        }
        .an-icon { flex-shrink: 0; font-size: 13px; }
        .an-text {
          flex: 1; text-align: center;
          color: var(--ink-dim);
          font-size: 12.5px;
        }
        .an-counter {
          flex-shrink: 0;
          color: var(--ink-faint);
          font-size: 11px;
        }
      `}</style>
    </div>
  )
}

export default Announcement