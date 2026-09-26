import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo.png'
import CustomCursor from '../components/CustomCursor'
import ThemeToggle from '../components/ThemeToggle'

const menuItems = [
  { path: '/admin', label: 'داشبورد', icon: 'grid' },
  { path: '/admin/users', label: 'کاربران', icon: 'users' },
  { path: '/admin/trips', label: 'سفرها', icon: 'plane' },
  { path: '/admin/registrations', label: 'ثبت‌نام‌ها', icon: 'clipboard' },
  { path: '/admin/expenses', label: 'ریزهزینه‌ها', icon: 'wallet' },
  { path: '/admin/contributions', label: 'مشارکت مالی', icon: 'heart' },
  { path: '/admin/refunds', label: 'عودت وجه', icon: 'refresh' },
  // بخش‌های بعدی (محصولات، محتوا) در فازهای بعد اضافه می‌شوند
]

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
  plane: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />,
  clipboard: <><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-4" /><path d="M9 12l2 2 4-4" /></>,
  wallet: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />,
  refresh: <><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>,
}

function SvgIcon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isSuperAdmin = user?.user_type === 'superadmin'

  return (
    <div dir="rtl" className="adm-shell">
      <CustomCursor />

      {/* Top bar */}
      <header className="adm-topbar">
        <div className="adm-topbar-right">
          <button className="adm-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="adm-title">پنل مدیریت</span>
        </div>

        <div className="adm-topbar-left">
          <ThemeToggle />
          <span className={`adm-role-badge${isSuperAdmin ? ' super' : ''}`}>
            {isSuperAdmin ? 'سوپرادمین' : 'ادمین'}
          </span>
          <div className="adm-user-chip">
            <div className="adm-avatar">
              {user?.profile_image ? <img src={user.profile_image} alt="" /> : (user?.first_name?.[0] || '؟')}
            </div>
            <div>
              <p>{user?.first_name} {user?.last_name}</p>
              <span>{user?.mobile}</span>
            </div>
          </div>
          <Link to="/" className="adm-site-link" title="بازگشت به سایت">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" /></svg>
          </Link>
          <button onClick={handleLogout} className="adm-logout-btn">خروج</button>
        </div>
      </header>

      <div className="adm-body">
        <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="adm-brand">
            <img src={logo} alt="logo" />
            <span>هیئت انصار القائم</span>
          </div>
          <nav>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`adm-nav-item${isActive ? ' active' : ''}`}
                >
                  <SvgIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="adm-sidebar-note">
            بخش‌های کاربران، ثبت‌نام‌ها، محصولات و محتوا در مراحل بعد اضافه می‌شوند.
          </div>
        </aside>

        <main className="adm-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .adm-shell { min-height: 100vh; background: var(--bg-deep); color: var(--ink); }

        .adm-topbar {
          position: sticky; top: 0; z-index: 50;
          height: 60px;
          background: var(--surface-2);
          border-bottom: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 22px;
        }
        .adm-topbar-right, .adm-topbar-left { display: flex; align-items: center; gap: 14px; }
        .adm-title { font-family: var(--font-display); color: var(--teal-glow); font-size: 16px; }
        .adm-sidebar-toggle {
          display: none;
          background: none; border: 1px solid var(--line); border-radius: 8px;
          color: var(--ink-dim); padding: 6px 8px; cursor: pointer;
        }

        .adm-role-badge {
          font-size: 11px; padding: 4px 12px; border-radius: 999px;
          background: rgba(216,181,104,0.12); color: var(--gold-light);
          border: 1px solid rgba(216,181,104,0.3);
        }
        .adm-role-badge.super {
          background: rgba(122,35,48,0.2); color: #ff9aa8;
          border-color: rgba(122,35,48,0.4);
        }

        .adm-user-chip { display: flex; align-items: center; gap: 8px; }
        .adm-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--teal); color: var(--gold-light);
          display: grid; place-items: center; font-size: 12px; font-weight: 700;
          overflow: hidden;
        }
        .adm-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .adm-user-chip p { font-size: 12.5px; color: var(--ink); line-height: 1.3; }
        .adm-user-chip span { font-size: 10.5px; color: var(--ink-faint); }

        .adm-site-link {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--line);
          display: grid; place-items: center;
          color: var(--ink-dim);
        }
        .adm-site-link:hover { color: var(--teal-glow); border-color: var(--teal-glow); }

        .adm-logout-btn {
          background: none; border: 1px solid var(--line); border-radius: 8px;
          color: var(--ink-dim); padding: 7px 14px; font-size: 12.5px;
          font-family: var(--font-body); cursor: pointer;
        }
        .adm-logout-btn:hover { border-color: rgba(255,107,125,0.5); color: #ff9aa8; }

        .adm-body { display: flex; min-height: calc(100vh - 60px); }

        .adm-sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--surface-2);
          border-left: 1px solid var(--line);
          padding: 18px 14px;
          display: flex; flex-direction: column;
        }
        .adm-brand {
          display: flex; align-items: center; gap: 10px;
          padding-bottom: 16px; margin-bottom: 14px;
          border-bottom: 1px solid var(--line);
        }
        .adm-brand img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--gold); }
        .adm-brand span { color: var(--gold-light); font-size: 12px; font-family: var(--font-display); }

        .adm-sidebar nav { display: flex; flex-direction: column; gap: 4px; }
        .adm-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          color: var(--ink); font-size: 13px; font-weight: 500;
          text-decoration: none;
          transition: all .2s ease;
        }
        .adm-nav-item:hover { background: var(--surface); color: var(--teal-glow); }
        .adm-nav-item.active {
          background: rgba(15,111,92,0.12); color: var(--teal-glow); font-weight: 700;
          border: 1px solid rgba(15,111,92,0.28);
        }

        .adm-sidebar-note {
          margin-top: auto;
          padding: 12px;
          font-size: 11px;
          color: var(--ink-faint);
          line-height: 1.8;
          border-top: 1px solid var(--line);
          padding-top: 14px;
        }

        .adm-main { flex: 1; min-width: 0; padding: 26px 28px; background: var(--bg); }

        @media (max-width: 900px) {
          .adm-sidebar-toggle { display: block; }
          .adm-sidebar {
            position: fixed; top: 60px; right: 0; bottom: 0; z-index: 45;
            transform: translateX(100%);
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-user-chip p, .adm-user-chip span { display: none; }
          .adm-main { padding: 18px 16px; }
        }
      `}</style>
    </div>
  )
}

export default AdminLayout