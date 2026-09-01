import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

const toFa = (n) => String(n).padStart(2, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1400&q=80',
    title: 'هفتمین کاروان پیاده‌روی اربعین حسینی',
    summary: 'از تهران تا کربلای معلی؛ همراه کاروان دانشجویی انصار القائم در مسیر عشق.',
    badge: 'ثبت‌نام آغاز شد · ظرفیت محدود',
    btnLabel: 'ثبت‌نام کاروان',
    link: '/dashboard/trips/register',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1400&q=80',
    title: 'سهمی در کوچ عاشقان داشته باش',
    summary: 'با مشارکت در قلک اربعین، هزینه سفر زائرین کم‌بضاعت را تأمین کن.',
    badge: 'پویش مردمی · مغناطیس حسینی',
    btnLabel: 'مشارکت در قلک',
    link: '/dashboard/wallet',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1400&q=80',
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
  { id: 1, image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80', title: 'شب‌های مسیر نجف - کربلا', category: 'night', featured: true },
  { id: 2, image: 'https://images.unsplash.com/photo-1564769625905520329-2e29472b1f24?w=800&q=80', title: 'گنبد و بارگاه', category: 'dome' },
  { id: 3, image: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80', title: 'خادمین کاروان', category: 'servants' },
  { id: 4, image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80', title: 'موکب اربعین', category: 'mokeb' },
  { id: 5, image: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80', title: 'مسیر پیاده‌روی', category: 'path' },
  { id: 6, image: 'https://images.unsplash.com/photo-1564769625905520329-2e29472b1f24?w=800&q=80', title: 'همراهان قدیمی', category: 'dome' },
  { id: 7, image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80', title: 'شب‌های حسینی', category: 'night' },
  { id: 8, image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80', title: 'حرم حضرت حسین', category: 'dome' },
]

const STATIC_NEWS = [
  {
    id: 1,
    title: 'آغاز ثبت‌نام هفتمین دوره کاروان پیاده اربعین انصار القائم',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    excerpt: 'ثبت‌نام کاروان با اولویت دانشجویان و اساتید از امروز آغاز شد. ظرفیت محدود است.',
    date: '۱۴۰۵/۰۲/۱۲',
    category: 'ثبت‌نام کاروان',
    link: '/news',
  },
  {
    id: 2,
    title: 'جلسه توجیهی کاروانیان، ۲۹ تیرماه برگزار می‌شود',
    image: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80',
    excerpt: 'حضور در جلسه توجیهی الزامی بوده و عدم حضور به منزله انصراف تلقی می‌گردد.',
    date: '۱۴۰۵/۰۱/۲۸',
    category: 'اطلاعیه',
    link: '/news',
  },
  {
    id: 3,
    title: 'شروع پویش مغناطیس حسینی در آستانه اربعین',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80',
    excerpt: 'پویشی مردمی برای جذب کمک‌های خیرین جهت پوشش هزینه زائرین کم‌بضاعت.',
    date: '۱۴۰۴/۱۲/۰۵',
    category: 'پویش مردمی',
    link: '/news',
  },
]

function Home() {
  const { isAuthenticated } = useAuthStore()

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
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % displaySliders.length)
    }, 6000)
  }, [displaySliders.length])

  useEffect(() => {
    startSlider()
    return () => clearInterval(slideIntervalRef.current)
  }, [startSlider])

  const changeSlide = (dir) => {
    setCurrentSlide(prev => (prev + dir + displaySliders.length) % displaySliders.length)
    startSlider()
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
  }, [statsVisible])

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
      <section className="hero-slider">
        <div className="slides">
          {displaySliders.map((slide, i) => (
            <div key={slide.id} className={`slide${i === currentSlide ? ' active' : ''}`}>
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
                  <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-ghost">
                    {isAuthenticated ? 'پنل کاربری' : 'آشنایی با هیئت'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="slider-arrow prev" onClick={() => changeSlide(-1)}>‹</button>
        <button className="slider-arrow next" onClick={() => changeSlide(1)}>›</button>

        <div className="slider-dots">
          {displaySliders.map((_, i) => (
            <div
              key={i}
              className={`dot${i === currentSlide ? ' active' : ''}`}
              onClick={() => { setCurrentSlide(i); startSlider() }}
            />
          ))}
        </div>
      </section>

      {/* About + Stats */}
      <section id="about">
        <div className="container">
          <div className="section-head fade-in">
            <div className="section-kicker">✦ درباره هیئت ✦</div>
            <h2 className="section-title">خادمانی کوچک، برای آقایی بزرگ</h2>
            <p className="section-desc">هیئت دانشجویی انصار القائم (عج) از سال ۱۳۹۷ با جمعی از دانشجویان دلباخته اباعبدالله‌الحسین (ع) شکل گرفت.</p>
          </div>

          <div className="about-grid">
            <div className="fade-in-left">
              <div className="about-text">
                <p>با یک هدف ساده: هموار کردن مسیر عاشقان برای رسیدن به کربلا و همراهی صمیمانه با زائرین، از لحظه ثبت‌نام تا بازگشت.</p>
                <p>هر سال، کاروان پیاده‌روی اربعین هیئت با اولویت دانشجویان و اساتید دانشگاه‌های تهران برگزار می‌شود.</p>
              </div>
              <div className="about-features">
                {[
                  { icon: '✦', title: 'خادمی داوطلبانه', desc: 'مدیریت هیئت به‌صورت کاملاً دانشجویی و جهادی است.' },
                  { icon: '✦', title: 'اولویت با دانشجویان', desc: 'ثبت‌نام با دانشجویان و اساتید فارغ‌التحصیل تا سه سال اخیر.' },
                  { icon: '✦', title: 'همراهی تا انتها', desc: 'از تهران تا کربلا و اسلامشهر تا مرز، همراه کاروانیم.' },
                ].map((f, i) => (
                  <div key={i} className="feature fade-in">
                    <div className="feature-icon">{f.icon}</div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-visual fade-in-right">
              <img src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80" alt="هیئت انصار القائم" />
              <div className="about-badge">
                <strong>+۷ سال</strong>
                <span>خدمت به زائرین حسینی</span>
              </div>
            </div>
          </div>

          <div className="stats-section fade-in" ref={statsRef}>
            <div className="stats">
              {[
                { icon: '✦', num: statsNums.trips, label: 'دوره کاروان اربعین', suffix: '' },
                { icon: '♡', num: statsNums.pilgrims, label: 'زائر اعزام‌شده', suffix: '+' },
                { icon: '✧', num: statsNums.year, label: 'سال تأسیس هیئت', suffix: '' },
                { icon: '❖', num: statsNums.percent, label: 'دانشجویی و مردمی', suffix: '٪' },
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

      {/* Countdown */}
      <section className="countdown-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-head fade-in">
            <div className="section-kicker">⏱ شمارش معکوس</div>
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
            <div className="section-kicker">کاروان پیاده‌روی اربعین ✦</div>
            <h2 className="section-title">{activeTrip ? activeTrip.title : 'کاروان اربعین هیئت'}</h2>
            <p className="section-desc">ثبت‌نام کاروان انصار القائم برای پیاده‌روی اربعین حسینی آغاز شده است.</p>
          </div>

          <div className="caravan-card fade-in" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
            <div className="caravan-head">
              <div>
                <span className="caravan-tag">ظرفیت محدود</span>
                <div className="caravan-route">تهران – کربلای معلی – تهران</div>
              </div>
              <Link to="/dashboard/trips/register" className="btn btn-gold">
                مشاهده شرایط و ثبت‌نام
              </Link>
            </div>

            <p style={{ color: 'var(--ink-dim)', lineHeight: 2, maxWidth: 800, position: 'relative', zIndex: 2 }}>
              {activeTrip?.conditions?.substring(0, 250) || 'کاروان با نظارت مستقیم خادمین هیئت، از تهران به سمت مرز و کربلا حرکت کرده و پس از پیاده‌روی اربعین، از مسیر زمینی بازمی‌گردد. اولویت ثبت‌نام با دانشجویان و همسر دانشجو خواهد بود.'}
            </p>

            <div className="caravan-details">
              {[
                { label: 'تاریخ حرکت از تهران', value: activeTrip?.start_date || '—' },
                { label: 'تاریخ بازگشت', value: activeTrip?.end_date || '—' },
                { label: 'هزینه سفر', value: activeTrip?.cost ? `${activeTrip.cost.toLocaleString('fa-IR')} ت` : '—' },
                { label: 'مسیر رفت و برگشت', value: 'اتوبوس VIP' },
              ].map((d, i) => (
                <div key={i} className="detail-item">
                  <div className="label">{d.label}</div>
                  <div className="value">{d.value}</div>
                </div>
              ))}
            </div>

            {isAuthenticated && walletBalance !== null && (
              <div style={{
                marginTop: 16, padding: '12px 18px', borderRadius: 12,
                background: 'rgba(216,181,104,0.08)', border: '1px solid var(--line)',
                display: 'inline-flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2,
              }}>
                <span style={{ color: 'var(--ink-dim)', fontSize: 13 }}>موجودی کیف پول:</span>
                <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>
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
      <section style={{ padding: '30px 0' }}>
        <div className="container">
          <div className="promo-grid">
            <Link to="/news" className="promo-card gold-theme fade-in-left">
              <div>
                <div className="promo-icon">✦</div>
                <h3>اطلاعیه مهم کاروانیان</h3>
                <p>جلسه توجیهی کاروانیان برگزار می‌شود. حضور در جلسه الزامی بوده و عدم حضور به منزله انصراف تلقی می‌گردد.</p>
              </div>
              <span className="promo-link">مشاهده جزئیات جلسه ←</span>
            </Link>

            <Link to="/shop" className="promo-card teal-theme fade-in-right">
              <div>
                <div className="promo-icon">♡</div>
                <h3>فروشگاه صنایع‌دستی هیئت</h3>
                <p>محصولات منتخب صنایع‌دستی با طرح‌های مذهبی؛ درآمد آن صرف تأمین هزینه زائرین کم‌بضاعت کاروان می‌شود.</p>
              </div>
              <span className="promo-link">مشاهده محصولات ←</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery">
        <div className="container">
          <div className="section-head fade-in">
            <div className="section-kicker">گالری تصاویر ✦</div>
            <h2 className="section-title">لحظه‌های ماندگار مسیر</h2>
            <p className="section-desc">نگاهی به فضای معنوی کاروان‌های پیش‌رو و همراهی خادمین هیئت.</p>
          </div>

          <div className="gallery-tabs fade-in">
            {GALLERY_TABS.map(tab => (
              <button
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
              <div key={item.id} className={`gallery-item scale-in${item.featured ? ' featured' : ''}`}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="gallery-caption">{item.title}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/gallery" className="btn btn-ghost">مشاهده همه تصاویر ←</Link>
          </div>
        </div>
      </section>

      {/* News */}
      <section id="news">
        <div className="container">
          <div className="section-head fade-in">
            <div className="section-kicker">✦ اخبار و اطلاعیه‌ها ✦</div>
            <h2 className="section-title">تازه‌های هیئت</h2>
            <p className="section-desc">آخرین اخبار، اطلاعیه‌ها و رویدادهای هیئت دانشجویی انصار القائم.</p>
          </div>

          <div className="news-grid">
            {displayNews.map(item => (
              <article
                key={item.id}
                className="news-card fade-in"
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                <div className="news-img">
                  <span className="news-date">
                    {item.date || (item.published_at && new Date(item.published_at).toLocaleDateString('fa-IR')) || ''}
                  </span>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80'}
                    alt={item.title}
                    loading="lazy"
                  />
                </div>
                <div className="news-body">
                  <span className="news-cat">{item.category || 'اخبار'}</span>
                  <h3 className="news-title">{item.title}</h3>
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
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <div className="donate-icon">♡</div>
            <h3>قلک اربعین</h3>
            <p>
              می‌توانید هر روز مبلغی را به کیف پول خود اضافه کنید.
              هنگام ثبت‌نام سفر، موجودی کیف پول به‌صورت خودکار از هزینه سفر کسر می‌شود.
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
              <Link to="/dashboard" className="btn btn-ghost">همپای قافله</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-section">
        <div className="container fade-in">
          <div style={{ fontFamily: 'Aref Ruqaa, serif', fontSize: 80, color: 'var(--gold)', lineHeight: 0.5, opacity: 0.2, textAlign: 'center', marginBottom: 20 }}>
            "
          </div>
          <p className="quote-text">
            فَإِنّي لا أرَى المَوتَ إلّا سَعادَةً، وَ لَا الحَياةَ مَعَ الظّالِمينَ إلّا بَرَماً
          </p>
          <div className="quote-author">امام حسین علیه السلام</div>
        </div>
      </section>

      {/* Panel CTA */}
      <section id="panel">
        <div className="container">
          <div className="panel-cta scale-in" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
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