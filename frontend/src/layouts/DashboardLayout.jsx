import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo.png'

const menuItems = [
  { path: '/dashboard', label: 'داشبورد', icon: 'home' },
  { path: '/dashboard/profile', label: 'پروفایل من', icon: 'user' },
  { path: '/dashboard/trips', label: 'سفرهای من', icon: 'plane' },
  { path: '/dashboard/trips/register', label: 'ثبت‌نام سفر', icon: 'edit' },
  { path: '/dashboard/wallet', label: 'کیف پول', icon: 'wallet' },
  { path: '/dashboard/tickets', label: 'تیکت‌ها', icon: 'ticket' },
  { path: '/dashboard/gallery', label: 'گالری من', icon: 'image' },
  { path: '/dashboard/articles', label: 'دلنوشته‌های من', icon: 'book' },
]

const icons = {
  home: <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />,
  user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  plane: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />,
  edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  wallet: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" /></>,
  ticket: <><path d="M2 9a3 3 0 010-6h20a3 3 0 010 6" /><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6" /><path d="M2 9h20v6H2z" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
}

function SvgIcon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>

      {/* Top Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,21,18,0.9)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="logo" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
          <span style={{ fontFamily: 'Aref Ruqaa, serif', color: 'var(--gold-light)', fontSize: 16 }}>
            هیئت انصار القائم (عج)
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--line)',
          }}>
            {user?.profile_image ? (
              <img src={user.profile_image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                display: 'grid', placeItems: 'center',
                color: 'var(--gold-light)', fontWeight: 700, fontSize: 14,
              }}>
                {user?.first_name?.[0] || '؟'}
              </div>
            )}
            <div>
              <p style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{user?.mobile}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: '1px solid var(--line)',
              color: 'var(--ink-dim)', borderRadius: 10,
              padding: '8px 14px', fontSize: 13, fontFamily: 'var(--font-body)',
            }}
          >
            خروج
          </button>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none', background: 'none',
              border: '1px solid var(--line)', color: 'var(--ink-dim)',
              borderRadius: 10, padding: '8px 10px',
            }}
            className="sidebar-toggle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          width: 240, flexShrink: 0,
          background: 'var(--bg-deep)',
          borderLeft: '1px solid var(--line)',
          padding: '20px 12px',
          position: 'sticky', top: 62,
          height: 'calc(100vh - 62px)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
          className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 12,
                    color: isActive ? 'var(--gold-light)' : 'var(--ink-dim)',
                    background: isActive ? 'rgba(216,181,104,0.1)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(216,181,104,0.2)' : 'transparent'}`,
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.25s ease',
                    textDecoration: 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--ink)'
                      e.currentTarget.style.background = 'var(--surface)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--ink-dim)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ color: isActive ? 'var(--gold)' : 'var(--ink-faint)', flexShrink: 0 }}>
                    <SvgIcon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span style={{
                      marginRight: 'auto', width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--gold)',
                      boxShadow: '0 0 8px rgba(216,181,104,0.8)',
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quote at bottom */}
          <div style={{
            marginTop: 20, padding: '14px 12px', borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--line)',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'Aref Ruqaa, serif',
              color: 'var(--gold-light)', fontSize: 13,
              lineHeight: 2, marginBottom: 6,
            }}>
              فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ
            </p>
            <p style={{ color: 'var(--ink-faint)', fontSize: 11 }}>امام حسین (ع)</p>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1, padding: '28px 32px',
          minWidth: 0,
          background: 'var(--bg)',
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .dashboard-sidebar { transition: transform 0.3s ease; }
        @media (max-width: 900px) {
          .dashboard-sidebar {
            position: fixed; top: 62px; right: 0;
            height: calc(100vh - 62px); z-index: 40;
            transform: translateX(100%);
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          }
          .dashboard-sidebar.open { transform: translateX(0); }
          .sidebar-toggle { display: block !important; }
          main { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  )
}

export default DashboardLayout