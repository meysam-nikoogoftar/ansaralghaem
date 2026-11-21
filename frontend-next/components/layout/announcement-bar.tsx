'use client'
import { useState } from 'react'
import { Icon } from './icon'
import type { Announcement } from '@/types'
export default function AnnouncementBar({ announcements }: { announcements: Announcement[] }) {
  const [current, setCurrent] = useState(0)
  const item = announcements[current]
  if (!item) return null
  return (
    <div className="an-bar">
      <div className="an-inner">
        <Icon name="info" width={18} />
        <p className="an-text" aria-live="polite">
          {item.text}
        </p>
        {announcements.length > 1 && (
          <div className="an-controls" role="group" aria-label="مرور اطلاعیه‌ها">
            <button
              aria-label="اطلاعیه قبلی"
              onClick={() =>
                setCurrent((current - 1 + announcements.length) % announcements.length)
              }
            >
              ‹
            </button>
            <span>
              {current + 1}/{announcements.length}
            </span>
            <button
              aria-label="اطلاعیه بعدی"
              onClick={() => setCurrent((current + 1) % announcements.length)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
