import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Announcement from '../components/Announcement'
import useAuthStore from '../store/authStore'

// Particles data
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 15,
  size: 1 + Math.random() * 3,
}))

function MainLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  // Cursor
  const cursorDotRef = useRef(null)
  const cursorRingRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const ringRef = useRef({ x: 0, y: 0 })

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState(0)

  // Bottom nav active
  const [activeNav, setActiveNav] = useState('home')

  // Custom cursor
  useEffect(() => {
    if (window.innerWidth <= 900) return
    const dot = cursorDotRef.current
    const ring = cursorRingRef.current
    if (!dot || !ring) return

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
    }
    document.addEventListener('mousemove', onMove)

    let animId
    const animateRing = () => {
      ringRef.current.x += (mouseRef.current.x - ringRef.current.x) * 0.35
      ringRef.current.y += (mouseRef.current.y - ringRef.current.y) * 0.35
      ring.style.left = ringRef.current.x + 'px'
      ring.style.top = ringRef.current.y + 'px'
      animId = requestAnimationFrame(animateRing)
    }
    animateRing()

    const addHover = () => {
      document.querySelectorAll('a, button, .gallery-item, .promo-card, .news-card, .stat-card, .feature, .count-box, .detail-item, .gallery-tab').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'))
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'))
      })
    }
    addHover()

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
    }
  }, [location.pathname])

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const progress = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100
      setScrollProgress(isNaN(progress) ? 0 : progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })

    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
        observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [location.pathname])

  // Ripple effect
  useEffect(() => {
    const handleClick = (e) => {
      const btn = e.target.closest('.btn')
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      const size = Math.max(rect.width, rect.height)
      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px'
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px'
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Bottom nav active state
  useEffect(() => {
    const path = location.pathname
    if (path === '/') setActiveNav('home')
    else if (path.includes('dashboard')) setActiveNav('panel')
    else if (path.includes('news')) setActiveNav('news')
    else if (path.includes('gallery')) setActiveNav('gallery')
    else if (path.includes('shop')) setActiveNav('shop')
    else setActiveNav('home')
  }, [location.pathname])

  const bottomNavItems = [
    {
      key: 'home', label: 'خانه', to: '/',
      icon: <><path d="M3 12l9-9 9 9" /><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" /></>
    },
    {
      key: 'news', label: 'اخبار', to: '/news',
      icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></>
    },
    {
      key: 'gallery', label: 'گالری', to: '/gallery',
      icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>
    },
    {
      key: 'shop', label: 'فروشگاه', to: '/shop',
      icon: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></>
    },
    {
      key: 'panel', label: 'پنل', to: isAuthenticated ? '/dashboard' : '/login',
      icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>
    },
  ]

  return (
    <div dir="rtl">
      {/* Custom Cursor */}
      <div className="cursor-dot" ref={cursorDotRef} />
      <div className="cursor-ring" ref={cursorRingRef} />

      {/* Scroll Progress */}
      <div className="scroll-progress">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Particles */}
      <div className="particles">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Announcement */}
      <Announcement />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {bottomNavItems.map(item => (
            <Link
              key={item.key}
              to={item.to}
              className={`bottom-nav-item${activeNav === item.key ? ' active' : ''}`}
            >
              <svg viewBox="0 0 24 24">{item.icon}</svg>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default MainLayout