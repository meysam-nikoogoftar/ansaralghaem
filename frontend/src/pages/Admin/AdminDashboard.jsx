import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusMeta = {
  '': { label: 'بدون وضعیت', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  pending: { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  cancelled: { label: 'انصراف داده', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  attended: { label: 'شرکت کرد', color: 'var(--status-info)', bg: 'var(--status-info-bg)' },
  absent: { label: 'شرکت نکرد', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/accounts/admin/dashboard-stats/')
      .then(res => setStats(res.data))
      .catch(() => setError('خطا در دریافت آمار (دسترسی ادمین لازم است)'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="adb-loading">در حال بارگذاری آمار...</div>
  if (error) return <div className="adb-error">{error}</div>
  if (!stats) return null

  const cards = [
    { label: 'کاربران عادی', value: stats.total_users, color: 'var(--teal-glow)' },
    { label: 'ادمین‌ها', value: stats.total_admins, color: 'var(--teal-light)' },
    { label: 'سفرهای فعال', value: stats.total_trips, color: '#7fb7ff' },
    { label: 'موجودی کل کیف‌پول‌ها', value: `${stats.total_wallet_balance.toLocaleString('fa-IR')} ت`, color: 'var(--gold-light)' },
    { label: 'تیکت در انتظار', value: stats.pending_tickets, color: '#ff9aa8' },
    { label: 'گالری در انتظار', value: stats.pending_gallery, color: '#ff9aa8' },
    { label: 'دلنوشته در انتظار', value: stats.pending_articles, color: '#ff9aa8' },
  ]

  const maxStatusCount = Math.max(1, ...Object.values(stats.registrations_by_status))

  return (
    <div className="adb-page">
      <h1 className="adb-heading">داشبورد مدیریت</h1>

      <div className="adb-cards">
        {cards.map((c, i) => (
          <div key={i} className="adb-card">
            <p className="adb-card-label">{c.label}</p>
            <strong className="adb-card-value" style={{ color: c.color }}>{c.value}</strong>
          </div>
        ))}
      </div>

      <div className="adb-grid">
        <div className="adb-panel">
          <h2>وضعیت ثبت‌نام‌ها</h2>
          <div className="adb-bars">
            {Object.entries(stats.registrations_by_status).map(([key, count]) => (
              <div key={key} className="adb-bar-row">
                <span className="adb-bar-label" style={{ color: statusMeta[key]?.color }}>
                  {statusMeta[key]?.label || key}
                </span>
                <div className="adb-bar-track">
                  <div
                    className="adb-bar-fill"
                    style={{
                      width: `${(count / maxStatusCount) * 100}%`,
                      background: statusMeta[key]?.color,
                    }}
                  />
                </div>
                <span className="adb-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="adb-panel">
          <h2>آخرین ثبت‌نام‌ها</h2>
          {stats.recent_registrations.length === 0 ? (
            <p className="adb-empty">ثبت‌نامی وجود ندارد</p>
          ) : (
            <div className="adb-table">
              <div className="adb-table-head">
                <span>کاربر</span>
                <span>سفر</span>
                <span>وضعیت</span>
              </div>
              {stats.recent_registrations.map((r) => (
                <div key={r.id} className="adb-table-row">
                  <span>{r.user_name}</span>
                  <span>{r.trip_detail?.title}</span>
                  <span
                    className="adb-status-pill"
                    style={{
                      color: statusMeta[r.status]?.color,
                      borderColor: statusMeta[r.status]?.color,
                      background: statusMeta[r.status]?.bg,
                    }}
                  >
                    {statusMeta[r.status]?.label || r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .adb-loading, .adb-error {
          min-height: 40vh; display: flex; align-items: center; justify-content: center;
          color: var(--ink-dim); font-size: 14px;
        }
        .adb-error { color: #ff9aa8; }

        .adb-page { display: flex; flex-direction: column; gap: 22px; }
        .adb-heading { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }

        .adb-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 14px;
        }
        .adb-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 16px;
        }
        .adb-card-label { color: var(--ink-faint); font-size: 11.5px; margin-bottom: 8px; }
        .adb-card-value { font-size: 19px; font-weight: 700; }

        .adb-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 18px;
        }
        .adb-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
        }
        .adb-panel h2 {
          font-family: var(--font-display);
          color: var(--teal-glow);
          font-size: 15px;
          margin-bottom: 16px;
        }

        .adb-bars { display: flex; flex-direction: column; gap: 12px; }
        .adb-bar-row { display: grid; grid-template-columns: 90px 1fr 26px; align-items: center; gap: 10px; }
        .adb-bar-label { font-size: 12px; }
        .adb-bar-track { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .adb-bar-fill { height: 100%; border-radius: 999px; transition: width .5s ease; }
        .adb-bar-count { font-size: 12px; color: var(--ink-dim); text-align: left; }

        .adb-empty { color: var(--ink-dim); font-size: 13px; text-align: center; padding: 20px 0; }

        .adb-table { display: flex; flex-direction: column; }
        .adb-table-head, .adb-table-row {
          display: grid; grid-template-columns: 1fr 1fr 100px;
          gap: 8px; align-items: center;
          padding: 9px 0;
        }
        .adb-table-head {
          color: var(--ink-faint); font-size: 11px;
          border-bottom: 1px solid var(--line);
          padding-bottom: 10px;
        }
        .adb-table-row {
          border-bottom: 1px solid var(--line);
          color: var(--ink); font-size: 12.5px;
        }
        .adb-table-row:last-child { border-bottom: none; }
        .adb-status-pill {
          font-size: 10.5px; padding: 3px 9px; border-radius: 999px;
          border: 1px solid; justify-self: start; white-space: nowrap;
        }

        @media (max-width: 900px) {
          .adb-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard