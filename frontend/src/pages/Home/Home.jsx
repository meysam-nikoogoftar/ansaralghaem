import Dialog from '../../components/Dialog'
import ShrineAnimation from '../../components/ShrineAnimation'
import useReducedMotion from '../../hooks/useReducedMotion'
import useMediaQuery from '../../hooks/useMediaQuery'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import './home.css'

// تصاویر محلی سایت
import heroDomeSunset from '../../assets/hero/hero-1-dome-sunset.jpg'
import heroAerialNight from '../../assets/hero/hero-2-aerial-night.jpg'
import heroSilhouette from '../../assets/hero/hero-3-silhouette-prayer.jpg'
import galleryPoster from '../../assets/gallery/gallery-1-poster.jpg'
import galleryDomeCloseup from '../../assets/gallery/gallery-2-dome-closeup.jpg'
import galleryTwinMinarets from '../../assets/gallery/gallery-3-twin-minarets.jpg'
import galleryRedInterior from '../../assets/gallery/gallery-4-red-interior.jpg'
import galleryMoonDome from '../../assets/gallery/gallery-5-moon-dome.jpg'
import aboutBookImage from '../../assets/about-book.jpg'

const toFa = (n) => String(n).padStart(2, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: heroDomeSunset,
    title: 'هفتمین کاروان پیاده‌روی اربعین حسینی',
    summary: 'از تهران تا کربلای معلی؛ همراه کاروان دانشجویی انصار القائم در مسیر عشق.',
    badge: 'ثبت‌نام آغاز شد · ظرفیت محدود',
    btnLabel: 'ثبت‌نام کاروان',
    link: '/dashboard/trips/register',
  },
  {
    id: 2,
    image: heroAerialNight,
    title: 'شب‌های حرم، همراه با میلیون‌ها عاشق',
    summary: 'کاروان با نظارت خادمین هیئت، در کنار جمعیت عظیم زائرین اربعین حسینی.',
    badge: 'پیاده‌روی اربعین · نجف تا کربلا',
    btnLabel: 'مشاهده جزئیات کاروان',
    link: '/dashboard/trips/register',
  },
  {
    id: 3,
    image: heroSilhouette,
    title: 'خادمانی کوچک، برای آقایی بزرگ',
    summary: 'هیئت انصار القائم با جمعی از دانشجویان دلباخته اباعبدالله، از سال ۱۳۹۷.',
    badge: 'هیئت دانشجویی · از سال ۱۳۹۷',
    btnLabel: 'آشنایی با هیئت',
    link: '/dashboard',
  },
]

const GALLERY_TABS = [
  { key: 'all', label: 'همه' },
  { key: 'night', label: 'شب‌های مسیر' },
  { key: 'dome', label: 'گنبد و بارگاه' },
  { key: 'servants', label: 'خادمین کاروان' },
  { key: 'mokeb', label: 'موکب اربعین' },
  { key: 'path', label: 'مسیر پیاده‌روی' },
]

const STATIC_GALLERY = [
  { id: 1, image: galleryPoster, title: 'پوستر هفتمین کاروان اربعین', category: 'mokeb', featured: true },
  { id: 2, image: galleryDomeCloseup, title: 'گنبدهای طلایی حرم', category: 'dome' },
  { id: 3, image: galleryTwinMinarets, title: 'مناره‌های حرم در غروب', category: 'dome' },
  { id: 4, image: galleryRedInterior, title: 'رواق حرم مطهر', category: 'night' },
  { id: 5, image: galleryMoonDome, title: 'گنبد طلایی زیر ماه', category: 'night' },
  { id: 6, image: heroDomeSunset, title: 'غروب بر فراز حرم', category: 'dome' },
  { id: 7, image: heroAerialNight, title: 'ازدحام زائرین در شب اربعین', category: 'path' },
  { id: 8, image: heroSilhouette, title: 'دعا در صحن حرم', category: 'servants' },
]

const STATIC_NEWS = [
  {
    id: 1,
    title: 'آغاز ثبت‌نام هفتمین دوره کاروان پیاده اربعین انصار القائم',
    image: galleryPoster,
    excerpt: 'ثبت‌نام کاروان با اولویت دانشجویان و اساتید از امروز آغاز شد. ظرفیت محدود است.',
    date: '۱۴۰۵/۰۲/۱۲',
    category: 'ثبت‌نام کاروان',
    link: '/news',
  },
  {
    id: 2,
    title: 'جلسه توجیهی کاروانیان، ۲۹ تیرماه برگزار می‌شود',
    image: galleryTwinMinarets,
    excerpt: 'حضور در جلسه توجیهی الزامی بوده و عدم حضور به منزله انصراف تلقی می‌گردد.',
    date: '۱۴۰۵/۰۱/۲۸',
    category: 'اطلاعیه',
    link: '/news',
  },
  {
    id: 3,
    title: 'شروع پویش مغناطیس حسینی در آستانه اربعین',
    image: galleryRedInterior,
    excerpt: 'پویشی مردمی برای جذب کمک‌های خیرین جهت پوشش هزینه زائرین کم‌بضاعت.',
    date: '۱۴۰۴/۱۲/۰۵',
    category: 'پویش مردمی',
    link: '/news',
  },
]

function Home() {
  const { isAuthenticated } = useAuthStore()
  const reducedMotion = useReducedMotion()
  const canHover = useMediaQuery('(min-width: 901px) and (hover: hover) and (pointer: fine)')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [sliderFocused, setSliderFocused] = useState(false)
  const swipeRef = useRef(null)
  const suppressSlideClick = useRef(false)

  // API data
  const [sliders, setSliders] = useState([])
  const [news, setNews] = useState([])
  const [contributions, setContributions] = useState([])
  const [trips, setTrips] = useState([])
  const [gallery, setGallery] = useState([])
  const [walletBalance, setWalletBalance] = useState(null)

  // Slider
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideIntervalRef = useRef(null)

  // Countdown
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })

  // Gallery filter
  const [galleryFilter, setGalleryFilter] = useState('all')

  // Stats
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [statsNums, setStatsNums] = useState({ trips: 0, pilgrims: 0, year: 0, percent: 0 })

  // Donate progress
  const [donateVisible, setDonateVisible] = useState(false)
  const donateRef = useRef(null)

  // API calls
  useEffect(() => {
    api.get('/content/sliders/').then(res => setSliders(res.data)).catch(() => {})
    api.get('/content/news/').then(res => setNews(res.data.filter(n => n.is_published).slice(0, 3))).catch(() => {})
    api.get('/financial/contributions/').then(res => setContributions(res.data.filter(c => c.is_active && c.is_public).slice(0, 1))).catch(() => {})
    api.get('/trips/').then(res => setTrips(res.data.filter(t => t.is_active))).catch(() => {})
    api.get('/content/gallery/').then(res => setGallery(res.data.slice(0, 8))).catch(() => {})
    if (isAuthenticated) {
      api.get('/financial/wallet/').then(res => setWalletBalance(res.data.balance)).catch(() => {})
    }
  }, [isAuthenticated])

  const displaySliders = sliders.length > 0 ? sliders : DEFAULT_SLIDES
  const activeTrip = trips.find(t => t.registration_open) || trips[0]
  const activeContribution = contributions[0]

  const displayGallery = gallery.length > 0
    ? gallery.map(g => ({ id: g.id, image: g.image, title: g.title || '', category: g.category || 'all', featured: false }))
    : STATIC_GALLERY

  const filteredGallery = galleryFilter === 'all'
    ? displayGallery
    : displayGallery.filter(g => g.category === galleryFilter)

  const displayNews = news.length > 0 ? news : STATIC_NEWS

  // Slider
  const startSlider = useCallback(() => {
    clearInterval(slideIntervalRef.current)
    if (sliderFocused || reducedMotion) return
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % displaySliders.length)
    }, 6000)
  }, [displaySliders.length, sliderFocused, reducedMotion])

  useEffect(() => {
    startSlider()
    return () => clearInterval(slideIntervalRef.current)
  }, [startSlider])

  const changeSlide = (dir) => {
    setCurrentSlide(prev => (prev + dir + displaySliders.length) % displaySliders.length)
    startSlider()
  }

  const startSwipe = event => {
    suppressSlideClick.current = false
    if (!event.isPrimary || event.button !== 0 || event.target.closest('a, button')) return
    swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false }
    suppressSlideClick.current = false
    clearInterval(slideIntervalRef.current)
  }
  const moveSwipe = event => {
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
  const finishSwipe = event => {
    const gesture = swipeRef.current
    if (!gesture || gesture.id !== event.pointerId) return
    swipeRef.current = null
    const dx = event.clientX - gesture.x
    if (event.type !== 'pointercancel' && gesture.horizontal && Math.abs(dx) >= 48) {
      changeSlide(dx < 0 ? 1 : -1)
    } else startSlider()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setTimeout(() => { suppressSlideClick.current = false }, 0)
  }

  // Countdown
  useEffect(() => {
    const target = new Date('2027-07-27T00:00:00').getTime()
    const tick = () => {
      const diff = Math.max(target - Date.now(), 0)
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // Stats counter
  useEffect(() => {
    if (!statsRef.current) return
    if (reducedMotion) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsVisible) {
        setStatsVisible(true)
        const duration = 2000
        const start = performance.now()
        const targets = { trips: 7, pilgrims: 2000, year: 1397, percent: 100 }
        const animate = (now) => {
          const p = Math.min((now - start) / duration, 1)
          const e = 1 - Math.pow(1 - p, 3)
          setStatsNums({
            trips: Math.floor(targets.trips * e),
            pilgrims: Math.floor(targets.pilgrims * e),
            year: Math.floor(targets.year * e),
            percent: Math.floor(targets.percent * e),
          })
          if (p < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }
    }, { threshold: 0.3 })
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [statsVisible, reducedMotion])

  // Donate progress
  useEffect(() => {
    if (!donateRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setDonateVisible(true)
    }, { threshold: 0.3 })
    observer.observe(donateRef.current)
    return () => observer.disconnect()
  }, [])

  // 3D Tilt
  const handleTilt = (e) => {
    if (reducedMotion) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    card.style.transform = `perspective(1000px) rotateX(${((y - cy) / cy) * -4}deg) rotateY(${((x - cx) / cx) * 4}deg) translateY(-6px)`
  }

  const resetTilt = (e) => {
    e.currentTarget.style.transform = ''
  }

  return (
    <>
      {/* Hero Slider */}
      <section className="hero-slider" aria-label="اسلایدر معرفی هیئت" onPointerDown={startSwipe} onPointerMove={moveSwipe} onPointerUp={finishSwipe} onPointerCancel={finishSwipe} onClickCapture={event => { if (suppressSlideClick.current) { event.preventDefault(); event.stopPropagation(); suppressSlideClick.current = false } }} onFocusCapture={() => setSliderFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSliderFocused(false) }}>
        <div className="slides">
          {displaySliders.map((slide, i) => (
            <div key={slide.id} role="group" aria-roledescription="اسلاید" aria-label={`${i + 1} از ${displaySliders.length}`} inert={i !== currentSlide} aria-hidden={i !== currentSlide} className={`slide${i === currentSlide ? ' active' : ''}`}>
              <div
                className="slide-bg"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
              <div className="slide-overlay" />
              <div className="slide-content">
                <span className="slide-badge">
                  {slide.badge || slide.summary?.substring(0, 40)}
                </span>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-desc">{slide.summary}</p>
                <div className="slide-actions">
                  <Link to={slide.link || '/'} className="btn btn-gold">
                    {slide.btnLabel || 'مشاهده جزئیات'}
                  </Link>
                  <Link to={isAuthenticated ? '/dashboard' : '/#about'} className="btn btn-ghost">
                    {isAuthenticated ? 'پنل کاربری' : 'آشنایی با هیئت'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button aria-label="اسلاید قبلی" className="slider-arrow prev" onClick={() => changeSlide(-1)}>‹</button>
        <button aria-label="اسلاید بعدی" className="slider-arrow next" onClick={() => changeSlide(1)}>›</button>

        <div className="slider-dots">
          {displaySliders.map((_, i) => (
            <button type="button"
              key={i}
              aria-label={`نمایش اسلاید ${i + 1}`} aria-pressed={i === currentSlide}
              className={`dot${i === currentSlide ? ' active' : ''}`}
              onClick={() => { setCurrentSlide(i); startSlider() }}
            />
          ))}
        </div>
        <svg className="hero-wave" aria-hidden="true" focusable="false" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 66C150 6 270 6 440 48C560 78 640 108 720 108C800 108 880 78 1000 48C1170 6 1290 6 1440 66V120H0Z" />
        </svg>
      </section>

      {/* About + Stats */}
      <section id="about">
        <svg className="hero-wave-glow" aria-hidden="true" focusable="false" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <defs>
            <filter id="home-wave-soft-light" x="-20%" y="-100%" width="140%" height="400%"><feGaussianBlur stdDeviation="16" /></filter>
            <clipPath id="home-wave-lower-side"><path d="M0 66C150 6 270 6 440 48C560 78 640 108 720 108C800 108 880 78 1000 48C1170 6 1290 6 1440 66V240H0Z" /></clipPath>
          </defs>
          <g clipPath="url(#home-wave-lower-side)">
            <path d="M0 66C150 6 270 6 440 48C560 78 640 108 720 108C800 108 880 78 1000 48C1170 6 1290 6 1440 66" fill="none" stroke="#26a77d" strokeWidth="32" opacity=".38" filter="url(#home-wave-soft-light)" />
          </g>
        </svg>
        <div className="container">
          <div className="section-head fade-in">
            <h2 className="section-title">خادمانی کوچک، برای آقایی بزرگ</h2>
            <p className="section-desc">هیئت دانشجویی انصار القائم (عج) از سال ۱۳۹۷ با جمعی از دانشجویان دلباخته اباعبدالله‌الحسین (ع) شکل گرفت.</p>
          </div>

          <div className="about-grid">
            <div className="fade-in-left">
              <div className="about-text">
                <p>با یک هدف ساده: هموار کردن مسیر عاشقان برای رسیدن به کربلا و همراهی صمیمانه با زائرین، از لحظه ثبت‌نام تا بازگشت.</p>
                <p>هر سال، کاروان پیاده‌روی اربعین هیئت با اولویت دانشجویان و اساتید دانشگاه‌های تهران برگزار می‌شود.</p>
              </div>
              <dl className="community-principles">
                {[
                  { title: 'خادمی داوطلبانه', desc: 'مدیریت هیئت به‌صورت کاملاً دانشجویی و جهادی است.' },
                  { title: 'اولویت با دانشجویان', desc: 'ثبت‌نام با دانشجویان و اساتید فارغ‌التحصیل تا سه سال اخیر.' },
                  { title: 'همراهی تا انتها', desc: 'از تهران تا کربلا و اسلامشهر تا مرز، همراه کاروانیم.' },
                ].map(f => (
                  <div key={f.title}>
                    <dt>{f.title}</dt>
                    <dd>{f.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="about-visual fade-in-right">
              <img src={aboutBookImage} alt="هیئت انصار القائم" />
              <div className="about-badge">
                <strong>+۷ سال</strong>
                <span>خدمت به زائرین حسینی</span>
              </div>
            </div>
          </div>

          <div className="stats-section fade-in" ref={statsRef}>
            <div className="stats">
              {[
                { icon: <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v3m8-3v3M8 7h8M8 15h.01M16 15h.01"/></></svg>, num: reducedMotion ? 7 : statsNums.trips, label: 'دوره کاروان اربعین', suffix: '' },
                { icon: <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3"/></></svg>, num: reducedMotion ? 2000 : statsNums.pilgrims, label: 'زائر اعزام‌شده', suffix: '+' },
                { icon: <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 5 3 3 5-5"/></></svg>, num: reducedMotion ? 1397 : statsNums.year, label: 'سال تأسیس هیئت', suffix: '' },
                { icon: <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><><path d="m2 10 4-4 4 1 4-1 8 5-5 8-5 2-8-7M8 7l4 4 3-3M7 15l4 4M10 12l5 5"/></></svg>, num: reducedMotion ? 100 : statsNums.percent, label: 'دانشجویی و مردمی', suffix: '٪' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-num">{s.suffix === '+' ? s.suffix : ''}{s.num.toLocaleString('fa-IR')}{s.suffix === '٪' ? s.suffix : ''}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ShrineAnimation />

      {/* Countdown */}
      <section className="countdown-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-head fade-in">
            <h2 className="section-title">تا آغاز هفتمین کاروان اربعین</h2>
            <p className="section-desc">هر ثانیه، قدمی نزدیک‌تر به کربلا</p>
          </div>
          <div className="countdown fade-in">
            {[
              { val: countdown.d, label: 'روز' },
              { val: countdown.h, label: 'ساعت' },
              { val: countdown.m, label: 'دقیقه' },
              { val: countdown.s, label: 'ثانیه' },
            ].map((item, i) => (
              <>
                <div key={item.label} className="count-box">
                  <div className="count-num">{toFa(item.val)}</div>
                  <div className="count-label">{item.label}</div>
                </div>
                {i < 3 && <div key={`sep-${i}`} className="count-sep">:</div>}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Caravan / Trip */}
      <section id="caravan">
        <div className="container">
          <div className="section-head fade-in">
            <h2 className="section-title">{activeTrip ? activeTrip.title : 'کاروان اربعین هیئت'}</h2>
            <p className="section-desc">ثبت‌نام کاروان انصار القائم برای پیاده‌روی اربعین حسینی آغاز شده است.</p>
          </div>

          <div className="trip-overview">
            <div className="trip-overview-head">
              <div>
                <span className="trip-capacity">ظرفیت محدود</span>
                <p className="trip-route">تهران – کربلای معلی – تهران</p>
              </div>
              <Link to="/dashboard/trips/register" className="btn btn-gold">
                مشاهده شرایط و ثبت‌نام
              </Link>
            </div>

            <p className="trip-summary">
              {activeTrip?.conditions?.substring(0, 250) || 'کاروان با نظارت مستقیم خادمین هیئت، از تهران به سمت مرز و کربلا حرکت کرده و پس از پیاده‌روی اربعین، از مسیر زمینی بازمی‌گردد. اولویت ثبت‌نام با دانشجویان و همسر دانشجو خواهد بود.'}
            </p>

            <dl className="trip-facts">
              {[
                { label: 'تاریخ حرکت از تهران', value: activeTrip?.start_date || '—' },
                { label: 'تاریخ بازگشت', value: activeTrip?.end_date || '—' },
                { label: 'هزینه سفر', value: activeTrip?.cost ? `${activeTrip.cost.toLocaleString('fa-IR')} ت` : '—' },
                { label: 'مسیر رفت و برگشت', value: 'اتوبوس VIP' },
              ].map(d => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>

            {isAuthenticated && walletBalance !== null && (
              <div className="trip-wallet">
                <span style={{ color: 'var(--ink-dim)', fontSize: 13 }}>موجودی کیف پول:</span>
                <span style={{ color: 'var(--teal-glow)', fontWeight: 700 }}>
                  {walletBalance.toLocaleString('fa-IR')} تومان
                </span>
                <Link to="/dashboard/wallet" style={{ color: 'var(--teal-glow)', fontSize: 13 }}>
                  شارژ کیف پول ←
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="home-updates" aria-label="اطلاعیه و فروشگاه">
        <div className="container">
          <div className="home-updates-layout">
            <article className="caravan-notice">
                <h2>اطلاعیه مهم کاروانیان</h2>
                <p>جلسه توجیهی کاروانیان برگزار می‌شود. حضور در جلسه الزامی بوده و عدم حضور به منزله انصراف تلقی می‌گردد.</p>
              <Link to="/news" className="home-action-button">مشاهده جزئیات جلسه <span aria-hidden="true">←</span></Link>
            </article>

            <article className="community-shop">
                <h2>فروشگاه صنایع‌دستی هیئت</h2>
                <p>محصولات منتخب صنایع‌دستی با طرح‌های مذهبی؛ درآمد آن صرف تأمین هزینه زائرین کم‌بضاعت کاروان می‌شود.</p>
              <Link to="/shop" className="home-action-button">مشاهده محصولات <span aria-hidden="true">←</span></Link>
            </article>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery">
        <div className="container">
          <div className="gallery-heading-row">
            <div className="section-head">
              <h2 className="section-title">لحظه‌های ماندگار مسیر</h2>
              <p className="section-desc">نگاهی به فضای معنوی کاروان‌های پیش‌رو و همراهی خادمین هیئت.</p>
            </div>
            <Link to="/gallery" className="gallery-view-all">
              <span>مشاهده همه تصاویر</span>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
            </Link>
          </div>

          <div className="gallery-tabs fade-in">
            {GALLERY_TABS.map(tab => (
              <button aria-pressed={galleryFilter === tab.key}
                key={tab.key}
                className={`gallery-tab${galleryFilter === tab.key ? ' active' : ''}`}
                onClick={() => setGalleryFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {filteredGallery.map(item => (
              <button type="button" key={item.id} onClick={() => setSelectedPhoto(item)} className={`gallery-item${item.featured ? ' gallery-poster' : ''}`}>
                <img src={item.image} alt={item.title} loading="lazy" draggable={false} />
                <span className="gallery-caption">{item.title}</span>
              </button>
            ))}
          </div>
          {filteredGallery.length === 0 && <p className="gallery-empty" role="status">تصویری در این دسته وجود ندارد. برای دیدن تصاویر دیگر، دسته «همه» را انتخاب کنید.</p>}
          <div className="gallery-mobile-action">
            <Link to="/gallery" className="gallery-view-all">
              <span>مشاهده همه تصاویر</span>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
            </Link>
          </div>

        </div>
      </section>

      {selectedPhoto && (
        <Dialog label={selectedPhoto.title} className="home-lightbox" onClose={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto.image} alt={selectedPhoto.title} draggable={false} />
          <p>{selectedPhoto.title}</p>
          <button type="button" className="btn btn-ghost" onClick={() => setSelectedPhoto(null)}>بستن</button>
        </Dialog>
      )}

      {/* News */}
      <section id="news">
        <div className="container">
          <div className="section-head fade-in">
            <h2 className="section-title">تازه‌های هیئت</h2>
            <p className="section-desc">آخرین اخبار، اطلاعیه‌ها و رویدادهای هیئت دانشجویی انصار القائم.</p>
          </div>

          <div className="news-grid">
            {displayNews.map(item => (
              <article
                key={item.id}
                className="news-card fade-in"
              >
                <Link to={item.link || `/news/${item.id}`} className="news-img" aria-label={item.title}>
                  <span className="news-date">
                    {item.date || (item.published_at && new Date(item.published_at).toLocaleDateString('fa-IR')) || ''}
                  </span>
                  <img
                    src={item.image || galleryPoster}
                    alt={item.title}
                    loading="lazy"
                    draggable={false}
                  />
                </Link>
                <div className="news-body">
                  <span className="news-cat">{item.category || 'اخبار'}</span>
                  <h3 className="news-title"><Link to={item.link || `/news/${item.id}`}>{item.title}</Link></h3>
                  <p className="news-excerpt">{item.excerpt || item.content?.substring(0, 150)}</p>
                  <Link to={item.link || `/news/${item.id}`} className="news-link">
                    مشاهده جزئیات ←
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/news" className="btn btn-ghost">مشاهده همه اخبار ←</Link>
          </div>
        </div>
      </section>

      {/* Donate */}
      <section id="donate">
        <div className="container">
          <div
            className="donate-card scale-in"
            ref={donateRef}
            onMouseMove={canHover ? handleTilt : undefined}
            onMouseLeave={canHover ? resetTilt : undefined}
          >
            <div className="donate-icon">♡</div>
            <h3>قلک اربعین</h3>
            <p>
              می‌توانید هر روز مبلغی را به کیف پول خود اضافه کنید.
              هنگام ثبت‌نام سفر، می‌توانید در بخش سفرهای من، مبلغ دلخواه را از کیف پول برای پرداخت هزینه سفر انتخاب کنید.
            </p>

            {activeContribution && (
              <div className="progress-wrap">
                <div className="progress-info">
                  <span className="label">محقق‌شده: {activeContribution.progress_percent}٪</span>
                  <span className="value">هدف: {activeContribution.total_amount?.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: donateVisible ? `${activeContribution.progress_percent || 0}%` : '0%' }}
                  />
                </div>
              </div>
            )}

            <div className="donate-stats">
              {[
                { title: 'کیف پول', sub: 'شارژ مستقیم' },
                { title: 'همپای قافله', sub: 'کمک به زائرین' },
                { title: 'مشارکت مالی', sub: 'پروژه‌های هیئت' },
              ].map((s, i) => (
                <div key={i} className="donate-stat">
                  <strong>{s.title}</strong>
                  <span>{s.sub}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 26, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard/wallet" className="btn btn-gold">شارژ کیف پول</Link>
              <Link to="/dashboard" className="btn btn-ghost">پنل کاربری و پیگیری مشارکت</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-section" aria-label="سخن امام حسین علیه السلام">
        <figure className="container remembrance-quote">
          <svg className="quote-mark" aria-hidden="true" width="42" height="34" viewBox="0 0 42 34" fill="currentColor"><path d="M0 20C0 9 5 3 16 0v6C9 9 7 12 7 17h10v17H0V20Zm25 0C25 9 30 3 41 0v6c-7 3-9 6-9 11h10v17H25V20Z" /></svg>
          <blockquote className="quote-text" lang="ar">
            فَإِنّي لا أرَى المَوتَ إلّا سَعادَةً، وَ لَا الحَياةَ مَعَ الظّالِمينَ إلّا بَرَماً
          </blockquote>
          <figcaption className="quote-author">امام حسین علیه السلام</figcaption>
        </figure>
      </section>

      {/* Panel CTA */}
      <section id="panel">
        <div className="container">
          <div className="panel-cta scale-in" onMouseMove={canHover ? handleTilt : undefined} onMouseLeave={canHover ? resetTilt : undefined}>
            <h3>پنل کاربری زائرین</h3>
            <p>مشاهده وضعیت ثبت‌نام، کارت زائر، کیف پول، تیکتینگ و گالری شخصی سفرهایتان.</p>
            <div className="panel-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-gold">ورود به پنل</Link>
                  <Link to="/dashboard/trips/register" className="btn btn-ghost">ثبت‌نام کاروان</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-gold">ورود / ثبت‌نام</Link>
                  <Link to="/register" className="btn btn-ghost">ایجاد حساب جدید</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
