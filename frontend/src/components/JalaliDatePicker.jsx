import { useEffect, useRef, useState } from 'react'
import {
  gregorianToJalali, jalaliToGregorian, jalaliMonthLength,
  toPersianDigits, JALALI_MONTHS, WEEKDAYS_FA,
} from '../utils/jalali'

function JalaliDatePicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(null)
  const [viewMonth, setViewMonth] = useState(null)
  const wrapRef = useRef(null)

  const today = new Date()
  const [todayJy, todayJm, todayJd] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const selectedJalali = (() => {
    if (!value) return null
    const [gy, gm, gd] = value.split('-').map(Number)
    if (!gy || !gm || !gd) return null
    return gregorianToJalali(gy, gm, gd)
  })()

  useEffect(() => {
    if (open) {
      if (selectedJalali) {
        setViewYear(selectedJalali[0])
        setViewMonth(selectedJalali[1])
      } else {
        setViewYear(todayJy)
        setViewMonth(todayJm)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayText = selectedJalali
    ? toPersianDigits(`${selectedJalali[0]}/${String(selectedJalali[1]).padStart(2, '0')}/${String(selectedJalali[2]).padStart(2, '0')}`)
    : ''

  const goPrevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1) } else { setViewMonth(viewMonth - 1) }
  }
  const goNextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1) } else { setViewMonth(viewMonth + 1) }
  }

  const handlePick = (jd) => {
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, jd)
    onChange(`${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`)
    setOpen(false)
  }

  const daysInMonth = viewYear !== null ? jalaliMonthLength(viewYear, viewMonth) : 0
  let firstDayOffset = 0
  if (viewYear !== null) {
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1)
    firstDayOffset = (new Date(gy, gm - 1, gd).getDay() + 1) % 7
  }

  return (
    <div className="jdp-wrap" ref={wrapRef}>
      <input
        type="text"
        readOnly
        value={displayText}
        onClick={() => setOpen(!open)}
        placeholder={placeholder || 'انتخاب تاریخ'}
        className="jdp-input"
      />
      {open && viewYear !== null && (
        <div className="jdp-popup">
          <div className="jdp-header">
            <button type="button" onClick={goNextMonth} className="jdp-nav">›</button>
            <span className="jdp-month-label">{JALALI_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}</span>
            <button type="button" onClick={goPrevMonth} className="jdp-nav">‹</button>
          </div>
          <div className="jdp-weekdays">
            {WEEKDAYS_FA.map((w, i) => <span key={i}>{w}</span>)}
          </div>
          <div className="jdp-grid">
            {Array.from({ length: firstDayOffset }).map((_, i) => <span key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const isSelected = selectedJalali && selectedJalali[0] === viewYear && selectedJalali[1] === viewMonth && selectedJalali[2] === dayNum
              const isToday = todayJy === viewYear && todayJm === viewMonth && todayJd === dayNum
              return (
                <button
                  type="button"
                  key={dayNum}
                  onClick={() => handlePick(dayNum)}
                  className={`jdp-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                >
                  {toPersianDigits(dayNum)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        .jdp-wrap { position: relative; }
        .jdp-input {
          width: 100%; padding: 10px 13px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body);
          font-size: 13px; outline: none; cursor: pointer;
        }
        .jdp-input:focus { border-color: var(--teal-glow); }
        .jdp-popup {
          position: absolute; top: calc(100% + 6px); right: 0; z-index: 50; width: 260px;
          background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-md);
          padding: 12px; box-shadow: 0 16px 36px -10px rgba(0,0,0,0.5);
        }
        .jdp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .jdp-nav {
          width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); cursor: pointer; font-size: 14px;
        }
        .jdp-nav:hover { border-color: var(--teal-glow); color: var(--teal-glow); }
        .jdp-month-label { color: var(--teal-glow); font-size: 13px; font-weight: 600; }
        .jdp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px; }
        .jdp-weekdays span { text-align: center; color: var(--ink-faint); font-size: 10.5px; }
        .jdp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
        .jdp-day {
          aspect-ratio: 1; border-radius: 8px; border: none; background: transparent;
          color: var(--ink); font-size: 12px; cursor: pointer; font-family: var(--font-body);
        }
        .jdp-day:hover { background: rgba(15,111,92,0.15); }
        .jdp-day.today { color: var(--teal-glow); font-weight: 700; }
        .jdp-day.selected { background: var(--teal); color: #eefaf5; }
      `}</style>
    </div>
  )
}

export default JalaliDatePicker