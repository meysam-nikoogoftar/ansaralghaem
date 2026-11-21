'use client'
import { useEffect, useId, useRef, useState } from 'react'
import {
  gregorianToJalali,
  jalaliToGregorian,
  jalaliMonthLength,
  toPersianDigits,
  JALALI_MONTHS,
  WEEKDAYS_FA,
} from '@/lib/jalali'
import '@/styles/jalali.css'
import type { ButtonHTMLAttributes, KeyboardEvent } from 'react'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> & {
  value?: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}
function JalaliDatePicker({ value, onChange, placeholder, id, label, ...props }: Props) {
  const generatedId = useId()
  const triggerId = id || `date-${generatedId}`
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [focusedDay, setFocusedDay] = useState(1)
  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState<number | null>(null)
  const [viewMonth, setViewMonth] = useState(1)
  const wrapRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const [todayJy, todayJm, todayJd] = gregorianToJalali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  )

  const selectedJalali = (() => {
    if (!value) return null
    const [gy, gm, gd] = value.split('-').map(Number)
    if (!gy || !gm || !gd) return null
    return gregorianToJalali(gy, gm, gd)
  })()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && e.target instanceof Node && !wrapRef.current.contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayText = selectedJalali
    ? toPersianDigits(
        `${selectedJalali[0]}/${String(selectedJalali[1]).padStart(2, '0')}/${String(selectedJalali[2]).padStart(2, '0')}`,
      )
    : ''

  const goPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear((viewYear || todayJy) - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }
  const goNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear((viewYear || todayJy) + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handlePick = (jd: number) => {
    if (viewYear === null) return
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, jd)
    onChange(`${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`)
    close()
  }

  const daysInMonth = viewYear !== null ? jalaliMonthLength(viewYear, viewMonth) : 0
  let firstDayOffset = 0
  if (viewYear !== null) {
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1)
    firstDayOffset = (new Date(gy, gm - 1, gd).getDay() + 1) % 7
  }

  useEffect(() => {
    if (open && viewYear !== null)
      popupRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${Math.min(focusedDay, daysInMonth)}"]`)
        ?.focus()
  }, [open, viewYear, viewMonth, focusedDay, daysInMonth])
  const handleCalendarKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }
    if (event.key === 'Tab') {
      const buttons = Array.from(popupRef.current?.querySelectorAll('button') || []).filter(
        (button) => button.tabIndex !== -1,
      )
      const index = buttons.findIndex((button) => button === document.activeElement)
      if (event.shiftKey && index === 0) {
        event.preventDefault()
        buttons.at(-1)?.focus()
      } else if (!event.shiftKey && index === buttons.length - 1) {
        event.preventDefault()
        buttons[0]?.focus()
      }
      return
    }
    if (!(event.target instanceof HTMLElement) || !event.target.dataset.day) return
    const deltas: Record<string, number> = {
      ArrowLeft: 1,
      ArrowRight: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    }
    const delta = deltas[event.key]
    if (delta) {
      event.preventDefault()
      setFocusedDay((day) => Math.max(1, Math.min(daysInMonth, day + delta)))
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setFocusedDay(1)
    }
    if (event.key === 'End') {
      event.preventDefault()
      setFocusedDay(daysInMonth)
    }
    if (event.key === 'PageDown') {
      event.preventDefault()
      setFocusedDay(1)
      goNextMonth()
    }
    if (event.key === 'PageUp') {
      event.preventDefault()
      setFocusedDay(1)
      goPrevMonth()
    }
  }

  return (
    <div className="jdp-wrap" ref={wrapRef}>
      <button
        {...props}
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${triggerId}-popup`}
        aria-label={label ? `${label}: ${displayText || 'انتخاب تاریخ'}` : undefined}
        onClick={() => {
          setViewYear(selectedJalali?.[0] || todayJy)
          setViewMonth(selectedJalali?.[1] || todayJm)
          setFocusedDay(selectedJalali?.[2] || todayJd)
          setOpen(!open)
        }}
        className="jdp-input"
      >
        {displayText || placeholder || 'انتخاب تاریخ'}
      </button>
      {open && viewYear !== null && (
        <div
          className="jdp-popup"
          ref={popupRef}
          id={`${triggerId}-popup`}
          role="dialog"
          aria-label="انتخاب تاریخ شمسی"
          onKeyDown={handleCalendarKey}
        >
          <div className="jdp-header">
            <button
              type="button"
              onClick={() => {
                setFocusedDay(1)
                goNextMonth()
              }}
              aria-label="ماه بعد"
              className="jdp-nav"
            >
              ›
            </button>
            <span className="jdp-month-label" aria-live="polite">
              {JALALI_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}
            </span>
            <button
              type="button"
              onClick={() => {
                setFocusedDay(1)
                goPrevMonth()
              }}
              aria-label="ماه قبل"
              className="jdp-nav"
            >
              ‹
            </button>
          </div>
          <div className="jdp-weekdays">
            {WEEKDAYS_FA.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
          <div className="jdp-grid">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const isSelected =
                selectedJalali &&
                selectedJalali[0] === viewYear &&
                selectedJalali[1] === viewMonth &&
                selectedJalali[2] === dayNum
              const isToday = todayJy === viewYear && todayJm === viewMonth && todayJd === dayNum
              return (
                <button
                  type="button"
                  key={dayNum}
                  data-day={dayNum}
                  tabIndex={dayNum === Math.min(focusedDay, daysInMonth) ? 0 : -1}
                  aria-label={`${toPersianDigits(dayNum)} ${JALALI_MONTHS[viewMonth - 1]} ${toPersianDigits(viewYear)}`}
                  aria-pressed={Boolean(isSelected)}
                  aria-current={isToday ? 'date' : undefined}
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
    </div>
  )
}

export default JalaliDatePicker
