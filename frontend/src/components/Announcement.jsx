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

  const bgColor = {
    info: 'bg-blue-600',
    warning: 'bg-amber-500',
    welcome: 'bg-green-700',
  }[announcement.announcement_type] || 'bg-green-700'

  return (
    <div className={`${bgColor} text-white py-2 px-4`} dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm text-center flex-1">{announcement.text}</p>
        {announcements.length > 1 && (
          <span className="text-xs opacity-75 mr-4">
            {current + 1}/{announcements.length}
          </span>
        )}
      </div>
    </div>
  )
}

export default Announcement