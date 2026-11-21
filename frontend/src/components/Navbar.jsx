import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo.png'
import ThemeToggle from './ThemeToggle'
import AccountMenu from './AccountMenu'
import useMediaQuery from '../hooks/useMediaQuery'

function Navbar() {
  const mobile = useMediaQuery('(max-width: 900px)')
  const { isAuthenticated, logout, authChecked, authError } = useAuthStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!menuOpen) return
    const frame = requestAnimationFrame(() => document.querySelector('#public-mobile-menu a')?.focus({ preventScroll: true }))
    const onKey = event => {
      if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.mobile-menu-btn')?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { path: '/', label: 'صفحه اصلی' },
    { path: '/news', label: 'اخبار' },
    { path: '/articles', label: 'دلنوشته‌ها' },
    { path: '/gallery', label: 'گالری' },
    { path: '/shop', label: 'فروشگاه' },
    { path: '/track', label: 'پیگیری ثبت‌نام' },
  ]

  return (
    <header className="navbar" style={{ boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none' }}>
      <div className="nav-inner">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
          }}
          aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'} aria-expanded={menuOpen} aria-controls="public-mobile-menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            }
          </svg>
        </button>

        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-logo">
            <img
              src={logo}
              alt="هیئت انصار القائم"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
          <div className="brand-text">
            <h1>هیئت انصار القائم (عج)</h1>
            <span>هیئت دانشجویی</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          {navItems.map(item => (
            <Link
              key={item.path}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-theme-mobile">{mobile && <ThemeToggle />}</div>

        {/* CTA */}
        <div className="nav-cta">
          {!mobile && <ThemeToggle />}
          {isAuthenticated ? (
            <AccountMenu />
          ) : (
            <Link to="/login" className="header-auth-button">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2H5Z" /></svg>
              <span>ورود / ثبت‌نام</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}

      </div>

      {/* Mobile Menu */}
      <button type="button" className={`public-menu-backdrop${menuOpen ? ' is-open' : ''}`} aria-label="بستن منو" tabIndex={-1} aria-hidden="true" onClick={() => setMenuOpen(false)} />
      <div id="public-mobile-menu" className={`public-mobile-menu${menuOpen ? ' is-open' : ''}`} inert={!menuOpen} aria-hidden={!menuOpen} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.mobile-menu-btn')?.focus() } }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px', borderRadius: 12,
                color: location.pathname === item.path ? 'var(--teal-glow)' : 'var(--ink-dim)',
                background: location.pathname === item.path ? 'rgba(216,181,104,0.08)' : 'transparent',
                fontWeight: 500, fontSize: 15,
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-menu-auth" aria-busy={!authChecked}>
            {!authChecked || authError ? null : isAuthenticated ? (
              <button type="button" onClick={logout} className="mobile-menu-logout">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                <span>خروج از حساب</span>
              </button>
            ) : (
              <>
                <Link to="/login" className="mobile-auth-login" onClick={() => setMenuOpen(false)}>ورود</Link>
                <Link to="/register" className="mobile-auth-register" onClick={() => setMenuOpen(false)}>ثبت‌نام</Link>
              </>
            )}
          </div>
        </div>

      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}

export default Navbar
