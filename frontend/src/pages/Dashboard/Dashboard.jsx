import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

const icons = {
  plane: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />,
  wallet: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" /></>,
  check: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  ticket: <><path d="M2 9a3 3 0 010-6h20a3 3 0 010 6" /><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6" /><path d="M2 9h20v6H2z" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
  user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
}

function Icon({ name }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

function Dashboard() {
  const { user } = useAuthStore()
  const [wallet, setWallet] = useState(null)
  const [trips, setTrips] = useState([])

  useEffect(() => {
    api.get('/financial/wallet/')
      .then(res => setWallet(res.data))
      .catch(() => {})

    api.get('/trips/my-registrations/')
      .then(res => setTrips(res.data))
      .catch(() => {})
  }, [])

  const stats = [
    { label: 'تعداد سفرها', value: trips.length, icon: 'plane' },
    { label: 'موجودی کیف پول', value: wallet ? `${wallet.balance.toLocaleString('fa-IR')} تومان` : '---', icon: 'wallet' },
    { label: 'سفرهای تایید شده', value: trips.filter(t => t.status === 'approved').length, icon: 'check' },
    { label: 'در انتظار بررسی', value: trips.filter(t => t.status === 'pending').length, icon: 'clock' },
  ]

  const quickLinks = [
    { to: '/dashboard/trips/register', label: 'ثبت‌نام سفر جدید', icon: 'edit' },
    { to: '/dashboard/wallet', label: 'شارژ کیف پول', icon: 'wallet' },
    { to: '/dashboard/tickets', label: 'ثبت تیکت', icon: 'ticket' },
    { to: '/dashboard/articles', label: 'ثبت دلنوشته', icon: 'book' },
  ]

  const statusConfig = {
    approved: { label: 'تایید شده', color: '#4bd6ac' },
    pending: { label: 'در انتظار', color: '#d8b568' },
    rejected: { label: 'رد شده', color: '#ff6b7d' },
    cancelled: { label: 'انصراف داده', color: '#af9f88' },
    attended: { label: 'شرکت کرد', color: '#4bd6ac' },
    absent: { label: 'شرکت نکرد', color: '#ff6b7d' },
  }

  return (
    <div className="db-page">

      {/* خوش‌آمدگویی */}
      <div className="db-welcome">
        <div className="db-welcome-avatar">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" />
          ) : (
            <Icon name="user" />
          )}
        </div>
        <div>
          <h1>خوش آمدید، {user?.first_name} {user?.last_name}</h1>
          <p>{user?.mobile}</p>
        </div>
      </div>

      {/* آمار */}
      <div className="db-stats">
        {stats.map((stat, i) => (
          <div key={i} className="db-stat-card">
            <div className="db-stat-icon"><Icon name={stat.icon} /></div>
            <div className="db-stat-value">{stat.value}</div>
            <div className="db-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* دسترسی سریع */}
      <div className="db-section">
        <h2>دسترسی سریع</h2>
        <div className="db-quicklinks">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.to} className="db-quicklink">
              <div className="db-quicklink-icon"><Icon name={link.icon} /></div>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* آخرین سفرها */}
      {trips.length > 0 && (
        <div className="db-section">
          <div className="db-section-head">
            <h2>آخرین سفرها</h2>
            <Link to="/dashboard/trips">مشاهده همه ←</Link>
          </div>
          <div className="db-trip-list">
            {trips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="db-trip-row">
                <div>
                  <h3>{trip.trip_detail?.title}</h3>
                  <p>کد پیگیری: {trip.tracking_code}</p>
                </div>
                <span
                  className="db-badge"
                  style={{
                    color: statusConfig[trip.status]?.color,
                    borderColor: statusConfig[trip.status]?.color,
                    background: `${statusConfig[trip.status]?.color}1a`,
                  }}
                >
                  {statusConfig[trip.status]?.label || trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .db-page { display: flex; flex-direction: column; gap: 28px; }

        .db-welcome {
          display: flex; align-items: center; gap: 18px;
          background: linear-gradient(135deg, var(--teal), var(--teal-light));
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          border: 1px solid var(--line);
          box-shadow: 0 20px 40px -20px rgba(15,111,92,0.5);
        }
        .db-welcome-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 2px solid var(--gold);
          display: grid; place-items: center;
          color: var(--gold-light);
          overflow: hidden; flex-shrink: 0;
        }
        .db-welcome-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .db-welcome h1 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 19px;
        }
        .db-welcome p { color: rgba(238,230,214,0.75); font-size: 13px; margin-top: 4px; }

        .db-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .db-stat-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 18px;
          transition: all .3s ease;
        }
        .db-stat-card:hover { border-color: var(--gold); transform: translateY(-3px); }
        .db-stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(216,181,104,0.1);
          color: var(--gold);
          display: grid; place-items: center;
          margin-bottom: 10px;
        }
        .db-stat-value { color: var(--ink); font-size: 18px; font-weight: 700; }
        .db-stat-label { color: var(--ink-dim); font-size: 12px; margin-top: 4px; }

        .db-section h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 17px;
          margin-bottom: 16px;
        }
        .db-section-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .db-section-head h2 { margin-bottom: 0; }
        .db-section-head a { color: var(--gold); font-size: 13px; }
        .db-section-head a:hover { color: var(--gold-light); }

        .db-quicklinks {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .db-quicklink {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 18px;
          text-align: center;
          transition: all .3s ease;
        }
        .db-quicklink:hover {
          border-color: var(--gold);
          background: rgba(216,181,104,0.06);
          transform: translateY(-3px);
        }
        .db-quicklink-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, var(--teal), var(--teal-light));
          color: var(--gold-light);
          display: grid; place-items: center;
          margin: 0 auto 10px;
        }
        .db-quicklink span { color: var(--ink-dim); font-size: 13px; font-weight: 500; }

        .db-trip-list { display: flex; flex-direction: column; gap: 12px; }
        .db-trip-row {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 16px 18px;
        }
        .db-trip-row h3 { color: var(--ink); font-size: 14px; font-weight: 600; }
        .db-trip-row p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .db-badge {
          font-size: 12px; padding: 5px 12px; border-radius: 999px;
          border: 1px solid; white-space: nowrap;
        }

        @media (max-width: 900px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); }
          .db-quicklinks { grid-template-columns: repeat(2, 1fr); }
          .db-welcome { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

export default Dashboard