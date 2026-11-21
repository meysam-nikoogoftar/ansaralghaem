'use client'
import { useEffect, useState, useRef, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from '@/components/navigation/app-link'
import HomeGallery from './home-gallery'
import HeroSlider from './hero-slider'
import ShrineAnimation from './shrine-animation'
import useMediaQuery from '@/hooks/use-media-query'
import { useSession } from '@/components/auth/session-provider'
import { browserRequest } from '@/lib/api/browser'
import { z } from 'zod'
import type { HomeData } from '@/types/home'
import Countdown from './countdown'
import { DEFAULT_SLIDES, STATIC_NEWS } from './home-content'
const galleryPoster = '/home/gallery-1-poster.jpg'
export default function Home({ data }: { data: HomeData }) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const canHover = useMediaQuery('(min-width: 901px) and (hover: hover) and (pointer: fine)')

  const { sliders, news, contributions, trips, gallery } = data
  const [walletBalance, setWalletBalance] = useState<number | null>(null)


  // Stats
  const statsRef = useRef<HTMLDivElement>(null)
  const statsVisible = useRef(false)
  const [statsNums, setStatsNums] = useState({ trips: 0, pilgrims: 0, year: 0, percent: 0 })

  // Donate progress
  const [donateVisible, setDonateVisible] = useState(false)
  const donateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setWalletBalance(null)
    if (!isAuthenticated) return
    const controller = new AbortController()
    void browserRequest('/financial/wallet/', z.object({ balance: z.number() }).parse, {
      authenticated: true,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setWalletBalance(result.balance)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [isAuthenticated])

  const displaySliders = sliders.length > 0 ? sliders : DEFAULT_SLIDES
  const activeTrip = trips.find((t) => t.registration_open) || trips[0]
  const activeContribution = contributions[0]

  const displayNews = news.length > 0 ? news : STATIC_NEWS

  // Stats counter
  useEffect(() => {
    if (!statsRef.current) return
    if (reducedMotion) return
    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !statsVisible.current) {
          statsVisible.current = true
          const duration = 2000
          const start = performance.now()
          const targets = { trips: 7, pilgrims: 2000, year: 1397, percent: 100 }
          const animate = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const e = 1 - Math.pow(1 - p, 3)
            setStatsNums({
              trips: Math.floor(targets.trips * e),
              pilgrims: Math.floor(targets.pilgrims * e),
              year: Math.floor(targets.year * e),
              percent: Math.floor(targets.percent * e),
            })
            if (p < 1) frame = requestAnimationFrame(animate)
          }
          frame = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(statsRef.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  // Donate progress
  useEffect(() => {
    if (!donateRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setDonateVisible(true)
      },
      { threshold: 0.3 },
    )
    observer.observe(donateRef.current)
    return () => observer.disconnect()
  }, [])

  // 3D Tilt
  const handleTilt = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    card.style.transform = `perspective(1000px) rotateX(${((y - cy) / cy) * -4}deg) rotateY(${((x - cx) / cx) * 4}deg) translateY(-6px)`
  }

  const resetTilt = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = ''
  }

  return (
    <>
      <h1 className="sr-only">هیئت دانشجویی انصار القائم (عج)</h1>
      <HeroSlider slides={displaySliders} authenticated={isAuthenticated} />

      {/* About + Stats */}
      <section id="about">
        <svg
          className="hero-wave-glow"
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="home-wave-soft-light" x="-20%" y="-100%" width="140%" height="400%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <clipPath id="home-wave-lower-side">
              <path d="M0 66C150 6 270 6 440 48C560 78 640 108 720 108C800 108 880 78 1000 48C1170 6 1290 6 1440 66V240H0Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#home-wave-lower-side)">
            <path
              d="M0 66C150 6 270 6 440 48C560 78 640 108 720 108C800 108 880 78 1000 48C1170 6 1290 6 1440 66"
              fill="none"
              stroke="#26a77d"
              strokeWidth="32"
              opacity=".38"
              filter="url(#home-wave-soft-light)"
            />
          </g>
        </svg>
        <div className="container">
          <div className="section-head fade-in">
            <h2 className="section-title">خادمانی کوچک، برای آقایی بزرگ</h2>
            <p className="section-desc">
              هیئت دانشجویی انصار القائم (عج) از سال ۱۳۹۷ با جمعی از دانشجویان دلباخته
              اباعبدالله‌الحسین (ع) شکل گرفت.
            </p>
          </div>

          <div className="about-grid">
            <div className="fade-in-left">
              <div className="about-text">
                <p>
                  با یک هدف ساده: هموار کردن مسیر عاشقان برای رسیدن به کربلا و همراهی صمیمانه با
                  زائرین، از لحظه ثبت‌نام تا بازگشت.
                </p>
                <p>
                  هر سال، کاروان پیاده‌روی اربعین هیئت با اولویت دانشجویان و اساتید دانشگاه‌های
                  تهران برگزار می‌شود.
                </p>
              </div>
              <dl className="community-principles">
                {[
                  {
                    title: 'خادمی داوطلبانه',
                    desc: 'مدیریت هیئت به‌صورت کاملاً دانشجویی و جهادی است.',
                  },
                  {
                    title: 'اولویت با دانشجویان',
                    desc: 'ثبت‌نام با دانشجویان و اساتید فارغ‌التحصیل تا سه سال اخیر.',
                  },
                  {
                    title: 'همراهی تا انتها',
                    desc: 'از تهران تا کربلا و اسلامشهر تا مرز، همراه کاروانیم.',
                  },
                ].map((f) => (
                  <div key={f.title}>
                    <dt>{f.title}</dt>
                    <dd>{f.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="about-visual fade-in-right">
              <Image
                src="/home/about-book.jpg"
                alt="هیئت انصار القائم"
                width={640}
                height={480}
                sizes="(max-width:700px) 100vw, 50vw"
              />
              <div className="about-badge">
                <strong>+۷ سال</strong>
                <span>خدمت به زائرین حسینی</span>
              </div>
            </div>
          </div>

          <div className="stats-section fade-in" ref={statsRef}>
            <div className="stats">
              {[
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <>
                        <rect x="4" y="3" width="16" height="15" rx="3" />
                        <path d="M4 11h16M8 18v3m8-3v3M8 7h8M8 15h.01M16 15h.01" />
                      </>
                    </svg>
                  ),
                  num: reducedMotion ? 7 : statsNums.trips,
                  label: 'دوره کاروان اربعین',
                  suffix: '',
                },
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <>
                        <circle cx="9" cy="7" r="3" />
                        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3" />
                      </>
                    </svg>
                  ),
                  num: reducedMotion ? 2000 : statsNums.pilgrims,
                  label: 'زائر اعزام‌شده',
                  suffix: '+',
                },
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <>
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18m-13 5 3 3 5-5" />
                      </>
                    </svg>
                  ),
                  num: reducedMotion ? 1397 : statsNums.year,
                  label: 'سال تأسیس هیئت',
                  suffix: '',
                },
                {
                  icon: (
                    <svg
                      aria-hidden="true"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <>
                        <path d="m2 10 4-4 4 1 4-1 8 5-5 8-5 2-8-7M8 7l4 4 3-3M7 15l4 4M10 12l5 5" />
                      </>
                    </svg>
                  ),
                  num: reducedMotion ? 100 : statsNums.percent,
                  label: 'دانشجویی و مردمی',
                  suffix: '٪',
                },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-num">
                    {s.suffix === '+' ? s.suffix : ''}
                    {s.num.toLocaleString('fa-IR')}
                    {s.suffix === '٪' ? s.suffix : ''}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ShrineAnimation />

      <Countdown />

      {/* Caravan / Trip */}
      <section id="caravan">
        <div className="container">
          <div className="section-head fade-in">
            <h2 className="section-title">
              {activeTrip ? activeTrip.title : 'کاروان اربعین هیئت'}
            </h2>
            <p className="section-desc">
              ثبت‌نام کاروان انصار القائم برای پیاده‌روی اربعین حسینی آغاز شده است.
            </p>
          </div>

          <div className="trip-overview">
            <div className="trip-overview-head">
              <div>
                <span className="trip-capacity">ظرفیت محدود</span>
                <p className="trip-route">تهران – کربلای معلی – تهران</p>
              </div>
              <Link href="/dashboard/trips/register" className="btn btn-gold">
                مشاهده شرایط و ثبت‌نام
              </Link>
            </div>

            <p className="trip-summary">
              {activeTrip?.conditions?.substring(0, 250) ||
                'کاروان با نظارت مستقیم خادمین هیئت، از تهران به سمت مرز و کربلا حرکت کرده و پس از پیاده‌روی اربعین، از مسیر زمینی بازمی‌گردد. اولویت ثبت‌نام با دانشجویان و همسر دانشجو خواهد بود.'}
            </p>

            <dl className="trip-facts">
              {[
                { label: 'تاریخ حرکت از تهران', value: activeTrip?.start_date || '—' },
                { label: 'تاریخ بازگشت', value: activeTrip?.end_date || '—' },
                {
                  label: 'هزینه سفر',
                  value: activeTrip?.cost ? `${activeTrip.cost.toLocaleString('fa-IR')} ت` : '—',
                },
                { label: 'مسیر رفت و برگشت', value: 'اتوبوس VIP' },
              ].map((d) => (
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
                <Link href="/dashboard/wallet" style={{ color: 'var(--teal-glow)', fontSize: 13 }}>
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
              <p>
                جلسه توجیهی کاروانیان برگزار می‌شود. حضور در جلسه الزامی بوده و عدم حضور به منزله
                انصراف تلقی می‌گردد.
              </p>
              <Link href="/news" className="home-action-button">
                مشاهده جزئیات جلسه <span aria-hidden="true">←</span>
              </Link>
            </article>

            <article className="community-shop">
              <h2>فروشگاه صنایع‌دستی هیئت</h2>
              <p>
                محصولات منتخب صنایع‌دستی با طرح‌های مذهبی؛ درآمد آن صرف تأمین هزینه زائرین کم‌بضاعت
                کاروان می‌شود.
              </p>
              <Link href="/shop" className="home-action-button">
                مشاهده محصولات <span aria-hidden="true">←</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <HomeGallery photos={gallery} />

      {/* News */}
      <section id="news">
        <div className="container">
          <div className="section-head fade-in">
            <h2 className="section-title">تازه‌های هیئت</h2>
            <p className="section-desc">
              آخرین اخبار، اطلاعیه‌ها و رویدادهای هیئت دانشجویی انصار القائم.
            </p>
          </div>

          <div className="news-grid">
            {displayNews.map((item) => (
              <article key={item.id} className="news-card fade-in">
                <Link
                  href={item.link || `/news/${item.id}`}
                  className="news-img"
                    aria-labelledby={`home-news-title-${item.id} home-news-date-${item.id}`}
                >
                    <span className="news-date" id={`home-news-date-${item.id}`}>
                    {item.date ||
                      (item.published_at &&
                        new Date(item.published_at).toLocaleDateString('fa-IR')) ||
                      ''}
                  </span>
                  <Image
                    width={600}
                    height={400}
                    sizes="(max-width:700px) 100vw, 33vw"
                    src={item.image || galleryPoster}
                    alt={item.title}
                    loading="lazy"
                    draggable={false}
                  />
                </Link>
                <div className="news-body">
                  <span className="news-cat">{item.category || 'اخبار'}</span>
                  <h3 className="news-title" id={`home-news-title-${item.id}`}>
                    <Link href={item.link || `/news/${item.id}`}>{item.title}</Link>
                  </h3>
                  <p className="news-excerpt">{item.excerpt || item.content?.substring(0, 150)}</p>
                  <Link href={item.link || `/news/${item.id}`} className="news-link">
                    مشاهده جزئیات ←
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link href="/news" className="btn btn-ghost">
              مشاهده همه اخبار ←
            </Link>
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
              می‌توانید هر روز مبلغی را به کیف پول خود اضافه کنید. هنگام ثبت‌نام سفر، می‌توانید در
              بخش سفرهای من، مبلغ دلخواه را از کیف پول برای پرداخت هزینه سفر انتخاب کنید.
            </p>

            {activeContribution && (
              <div className="progress-wrap">
                <div className="progress-info">
                  <span className="label">محقق‌شده: {activeContribution.progress_percent}٪</span>
                  <span className="value">
                    هدف: {activeContribution.total_amount?.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: donateVisible ? `${activeContribution.progress_percent || 0}%` : '0%',
                    }}
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

            <div
              style={{
                marginTop: 26,
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link href="/dashboard/wallet" className="btn btn-gold">
                شارژ کیف پول
              </Link>
              <Link href="/dashboard" className="btn btn-ghost">
                پنل کاربری و پیگیری مشارکت
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-section" aria-label="سخن امام حسین علیه السلام">
        <figure className="container remembrance-quote">
          <svg
            className="quote-mark"
            aria-hidden="true"
            width="42"
            height="34"
            viewBox="0 0 42 34"
            fill="currentColor"
          >
            <path d="M0 20C0 9 5 3 16 0v6C9 9 7 12 7 17h10v17H0V20Zm25 0C25 9 30 3 41 0v6c-7 3-9 6-9 11h10v17H25V20Z" />
          </svg>
          <blockquote className="quote-text" lang="ar">
            فَإِنّي لا أرَى المَوتَ إلّا سَعادَةً، وَ لَا الحَياةَ مَعَ الظّالِمينَ إلّا بَرَماً
          </blockquote>
          <figcaption className="quote-author">امام حسین علیه السلام</figcaption>
        </figure>
      </section>

      {/* Panel CTA */}
      <section id="panel">
        <div className="container">
          <div
            className="panel-cta scale-in"
            onMouseMove={canHover ? handleTilt : undefined}
            onMouseLeave={canHover ? resetTilt : undefined}
          >
            <h3>پنل کاربری زائرین</h3>
            <p>مشاهده وضعیت ثبت‌نام، کارت زائر، کیف پول، تیکتینگ و گالری شخصی سفرهایتان.</p>
            <div className="panel-actions">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="btn btn-gold">
                    ورود به پنل
                  </Link>
                  <Link href="/dashboard/trips/register" className="btn btn-ghost">
                    ثبت‌نام کاروان
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-gold">
                    ورود / ثبت‌نام
                  </Link>
                  <Link href="/register" className="btn btn-ghost">
                    ایجاد حساب جدید
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
