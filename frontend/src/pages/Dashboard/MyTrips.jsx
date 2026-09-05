import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function MyTrips() {
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/trips/my-registrations/')
      .then(res => setTrips(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const statusConfig = {
    pending: { label: 'در انتظار بررسی', color: '#d8b568' },
    approved: { label: 'تایید شده', color: '#4bd6ac' },
    rejected: { label: 'رد شده', color: '#ff6b7d' },
    cancelled: { label: 'انصراف داده', color: '#af9f88' },
    attended: { label: 'شرکت کرد', color: '#7fb7ff' },
    absent: { label: 'شرکت نکرد', color: '#ff6b7d' },
  }

  const paymentConfig = {
    unpaid: { label: 'پرداخت نشده', color: '#ff6b7d' },
    partial: { label: 'نیمه‌کامل', color: '#d8b568' },
    paid: { label: 'پرداخت کامل', color: '#4bd6ac' },
  }

  const handleCancel = async (id) => {
    if (!window.confirm('آیا از انصراف خود مطمئن هستید؟')) return
    try {
      await api.post(`/trips/registration/${id}/cancel/`)
      setTrips(trips.map(t => t.id === id ? { ...t, status: 'cancelled' } : t))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در انصراف')
    }
  }

  if (isLoading) return <div className="mt-loading">در حال بارگذاری...</div>

  return (
    <div className="mt-page">
      <div className="mt-head">
        <h1>سفرهای من</h1>
        <Link to="/dashboard/trips/register" className="mt-new-btn">ثبت‌نام سفر جدید</Link>
      </div>

      {trips.length === 0 ? (
        <div className="mt-empty">
          <div className="mt-empty-icon">✈️</div>
          <h3>هنوز سفری ثبت نکرده‌اید</h3>
          <p>برای شرکت در سفرهای هیئت ثبت‌نام کنید</p>
          <Link to="/dashboard/trips/register" className="mt-new-btn">ثبت‌نام در سفر</Link>
        </div>
      ) : (
        <div className="mt-list">
          {trips.map((trip) => (
            <div key={trip.id} className="mt-card">
              <div className="mt-card-head">
                <div>
                  <h3>{trip.trip_detail?.title}</h3>
                  <p>کد پیگیری: <span className="mt-mono">{trip.tracking_code}</span></p>
                </div>
                <span
                  className="mt-badge"
                  style={{
                    color: statusConfig[trip.status]?.color,
                    borderColor: statusConfig[trip.status]?.color,
                    background: `${statusConfig[trip.status]?.color}1a`,
                  }}
                >
                  {statusConfig[trip.status]?.label}
                </span>
              </div>

              <div className="mt-financials">
                <div>
                  <p>هزینه کل</p>
                  <strong>{trip.total_cost?.toLocaleString('fa-IR')} تومان</strong>
                </div>
                <div>
                  <p>پرداخت شده</p>
                  <strong className="mt-paid">{(trip.paid_from_wallet + trip.paid_directly)?.toLocaleString('fa-IR')} تومان</strong>
                </div>
                <div>
                  <p>باقیمانده</p>
                  <strong className="mt-remaining">{trip.remaining_amount?.toLocaleString('fa-IR')} تومان</strong>
                </div>
              </div>

              <div className="mt-row-actions">
                <p style={{ color: paymentConfig[trip.payment_status]?.color }}>
                  وضعیت پرداخت: {paymentConfig[trip.payment_status]?.label}
                </p>
                {trip.status === 'approved' && trip.payment_status !== 'paid' && (
                  <Link to="/dashboard/wallet" className="mt-action-btn primary">پرداخت از کیف پول</Link>
                )}
                {trip.status === 'pending' && (
                  <button onClick={() => handleCancel(trip.id)} className="mt-action-btn danger">انصراف</button>
                )}
              </div>

              {trip.companions?.length > 0 && (
                <div className="mt-companions">
                  <p>همسفران:</p>
                  <div className="mt-companion-chips">
                    {trip.companions.map((c) => (
                      <span key={c.id}>{c.companion_detail?.first_name} {c.companion_detail?.last_name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .mt-loading { text-align: center; padding: 60px 0; color: var(--ink-dim); }

        .mt-page { display: flex; flex-direction: column; gap: 22px; }
        .mt-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .mt-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 22px; }

        .mt-new-btn {
          display: inline-flex; align-items: center;
          padding: 10px 20px;
          border-radius: 999px;
          font-size: 13px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 18px -6px rgba(216,181,104,0.45);
          transition: transform .25s ease;
        }
        .mt-new-btn:hover { transform: translateY(-2px); }

        .mt-empty {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 48px 24px;
          text-align: center;
        }
        .mt-empty-icon { font-size: 40px; margin-bottom: 14px; }
        .mt-empty h3 { color: var(--ink); font-size: 16px; margin-bottom: 8px; }
        .mt-empty p { color: var(--ink-dim); font-size: 13px; margin-bottom: 20px; }

        .mt-list { display: flex; flex-direction: column; gap: 16px; }
        .mt-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
        }
        .mt-card-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 16px; gap: 12px;
        }
        .mt-card-head h3 { color: var(--ink); font-size: 15px; font-weight: 700; }
        .mt-card-head p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .mt-mono { font-family: monospace; color: var(--ink-dim); }

        .mt-badge {
          font-size: 12px; padding: 5px 12px; border-radius: 999px;
          border: 1px solid; white-space: nowrap; flex-shrink: 0;
        }

        .mt-financials {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: rgba(10,21,18,0.5);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-bottom: 16px;
          text-align: center;
        }
        .mt-financials p { color: var(--ink-faint); font-size: 11px; margin-bottom: 4px; }
        .mt-financials strong { color: var(--ink); font-size: 13px; }
        .mt-paid { color: var(--teal-glow) !important; }
        .mt-remaining { color: #ff9aa8 !important; }

        .mt-row-actions {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
        }
        .mt-row-actions p { font-size: 13px; font-weight: 500; }
        .mt-action-btn {
          font-size: 12px; padding: 8px 16px; border-radius: 999px;
          border: 1px solid; cursor: pointer;
          font-family: var(--font-body);
        }
        .mt-action-btn.primary { color: #1a1206; background: var(--gold); border-color: var(--gold); }
        .mt-action-btn.danger { color: #ff9aa8; background: transparent; border-color: rgba(255,107,125,0.4); }
        .mt-action-btn.danger:hover { background: rgba(122,35,48,0.15); }

        .mt-companions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); }
        .mt-companions p { color: var(--ink-faint); font-size: 12px; margin-bottom: 8px; }
        .mt-companion-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .mt-companion-chips span {
          background: rgba(216,181,104,0.1);
          color: var(--gold-light);
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 999px;
        }

        @media (max-width: 600px) {
          .mt-financials { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
    </div>
  )
}

export default MyTrips