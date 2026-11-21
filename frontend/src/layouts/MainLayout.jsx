import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Announcement from '../components/Announcement'
import useAuthStore from '../store/authStore'

function MainLayout() {
  useEffect(() => {
    const elements = [...document.querySelectorAll('.navbar, .public-shell')]
    const measure = () => document.documentElement.style.setProperty('--public-header-height', `${[...document.querySelectorAll('.navbar, .an-bar')].reduce((sum, element) => sum + element.getBoundingClientRect().height, 0)}px`)
    const observer = new ResizeObserver(measure)
    elements.forEach(element => observer.observe(element))
    measure()
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--public-header-height') }
  }, [])
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState(0)

  // Bottom nav active
  const activeNav = location.pathname === '/' ? 'home' : location.pathname.startsWith('/dashboard') ? 'panel' : ['news', 'gallery', 'shop'].find(key => location.pathname.startsWith('/' + key)) || ''

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
    <div className="public-shell" dir="rtl">
      {/* Scroll Progress */}
      <div className="scroll-progress">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
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
              aria-current={activeNav === item.key ? 'location' : undefined}
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
