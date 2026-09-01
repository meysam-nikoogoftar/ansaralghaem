import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo.png'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { path: '/', label: 'صفحه اصلی' },
    { path: '/news', label: 'اخبار' },
    { path: '/gallery', label: 'گالری' },
    { path: '/shop', label: 'فروشگاه' },
    { path: '/track', label: 'پیگیری ثبت‌نام' },
  ]

  return (
    <header className="navbar" style={{ boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none' }}>
      <div className="nav-inner">

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
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="nav-cta">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-gold btn-sm">
                {user?.first_name ? `پنل ${user.first_name}` : 'پنل کاربری'}
              </Link>
              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
                style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--ink-dim)' }}
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">ورود</Link>
              <Link to="/register" className="btn btn-gold btn-sm">ثبت‌نام</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none', border: '1px solid var(--line)',
            color: 'var(--ink-dim)', borderRadius: 10,
            padding: '8px 10px',
          }}
          aria-label="منو"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10,21,18,0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--line)',
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px', borderRadius: 12,
                color: location.pathname === item.path ? 'var(--gold-light)' : 'var(--ink-dim)',
                background: location.pathname === item.path ? 'rgba(216,181,104,0.08)' : 'transparent',
                fontWeight: 500, fontSize: 15,
              }}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-gold btn-sm" onClick={() => setMenuOpen(false)}>پنل کاربری</Link>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="btn btn-ghost btn-sm">خروج</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>ورود</Link>
                <Link to="/register" className="btn btn-gold btn-sm" onClick={() => setMenuOpen(false)}>ثبت‌نام</Link>
              </>
            )}
          </div>
        </div>
      )}

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