'use client'
import { useState, useRef, useEffect, useCallback, type PointerEvent } from 'react'
import Image from 'next/image'
import Link from '@/components/navigation/app-link'
import useMediaQuery from '@/hooks/use-media-query'
import type { HomeSlide } from '@/types/home'
export default function HeroSlider({
  slides: displaySliders,
  authenticated: isAuthenticated,
}: {
  slides: HomeSlide[]
  authenticated: boolean
}) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [sliderFocused, setSliderFocused] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const swipeRef = useRef<{ id: number; x: number; y: number; horizontal: boolean } | null>(null)
  const suppressSlideClick = useRef(false)
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startSlider = useCallback(() => {
    clearInterval(slideIntervalRef.current)
    if (sliderFocused || reducedMotion || displaySliders.length < 2) return
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySliders.length)
    }, 6000)
  }, [displaySliders.length, sliderFocused, reducedMotion])

  useEffect(() => {
    startSlider()
    return () => clearInterval(slideIntervalRef.current)
  }, [startSlider])

  const changeSlide = (dir: number) => {
    setCurrentSlide((prev) => (prev + dir + displaySliders.length) % displaySliders.length)
    startSlider()
  }

  const startSwipe = (event: PointerEvent<HTMLElement>) => {
    suppressSlideClick.current = false
    if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('a, button'))
      return
    swipeRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
    }
    suppressSlideClick.current = false
    clearInterval(slideIntervalRef.current)
  }
  const moveSwipe = (event: PointerEvent<HTMLElement>) => {
    const gesture = swipeRef.current
    if (!gesture || gesture.id !== event.pointerId) return
    const dx = event.clientX - gesture.x
    const dy = event.clientY - gesture.y
    if (!gesture.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      swipeRef.current = null
      startSlider()
      return
    }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      gesture.horizontal = true
      suppressSlideClick.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }
  const finishSwipe = (event: PointerEvent<HTMLElement>) => {
    const gesture = swipeRef.current
    if (!gesture || gesture.id !== event.pointerId) return
    swipeRef.current = null
    const dx = event.clientX - gesture.x
    if (event.type !== 'pointercancel' && gesture.horizontal && Math.abs(dx) >= 48) {
      changeSlide(dx < 0 ? 1 : -1)
    } else startSlider()
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    setTimeout(() => {
      suppressSlideClick.current = false
    }, 0)
  }

  return (
    <>
      {/* Hero Slider */}
      <section
        className="hero-slider"
        aria-label="اسلایدر معرفی هیئت"
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={finishSwipe}
        onPointerCancel={finishSwipe}
        onClickCapture={(event) => {
          if (suppressSlideClick.current) {
            event.preventDefault()
            event.stopPropagation()
            suppressSlideClick.current = false
          }
        }}
        onFocusCapture={() => setSliderFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setSliderFocused(false)
        }}
      >
        <div className="slides">
          {displaySliders.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="اسلاید"
              aria-label={`${i + 1} از ${displaySliders.length}`}
              inert={i !== currentSlide}
              aria-hidden={i !== currentSlide}
              className={`slide${i === currentSlide ? ' active' : ''}`}
            >
              {(i === 0 || i === currentSlide) && (
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="100vw"
                  quality={60}
                  loading="eager"
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  className="slide-bg"
                  style={{ objectFit: 'cover' }}
                />
              )}
              <div className="slide-overlay" />
              <div className="slide-content">
                <span className="slide-badge">
                  {slide.badge || slide.summary?.substring(0, 40)}
                </span>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-desc">{slide.summary}</p>
                <div className="slide-actions">
                  <Link href={slide.link || '/'} className="btn btn-gold">
                    {slide.btnLabel || 'مشاهده جزئیات'}
                  </Link>
                  <Link href={isAuthenticated ? '/dashboard' : '/#about'} className="btn btn-ghost">
                    {isAuthenticated ? 'پنل کاربری' : 'آشنایی با هیئت'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          aria-label="اسلاید قبلی"
          className="slider-arrow prev"
          onClick={() => changeSlide(-1)}
        >
          ‹
        </button>
        <button
          aria-label="اسلاید بعدی"
          className="slider-arrow next"
          onClick={() => changeSlide(1)}
        >
          ›
        </button>

        <div className="slider-dots">
          {displaySliders.map((_, i) => (
            <button
              type="button"
              key={i}
              aria-label={`نمایش اسلاید ${i + 1}`}
              aria-pressed={i === currentSlide}
              className={`dot${i === currentSlide ? ' active' : ''}`}
              onClick={() => {
                setCurrentSlide(i)
                startSlider()
              }}
            />
          ))}
        </div>
        <svg
          className="hero-wave"
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path d="M0 66C150 6 270 6 440 48C560 78 640 108 720 108C800 108 880 78 1000 48C1170 6 1290 6 1440 66V120H0Z" />
        </svg>
      </section>
    </>
  )
}
