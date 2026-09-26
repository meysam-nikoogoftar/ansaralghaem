import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusMeta = {
  pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  cancelled: { label: 'انصراف داده', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  attended: { label: 'شرکت کرد', color: 'var(--status-info)', bg: 'var(--status-info-bg)' },
  absent: { label: 'شرکت نکرد', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

const paymentMeta = {
  unpaid: { label: 'پرداخت نشده', color: 'var(--status-danger)' },
  partial: { label: 'نیمه‌کامل', color: 'var(--status-warn)' },
  paid: { label: 'کامل', color: 'var(--status-ok)' },
}

function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchRegistrations = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (statusFilter) params.append('status', statusFilter)
    api.get(`/trips/admin/registrations/?${params.toString()}`)
      .then(res => setRegistrations(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchRegistrations()
  }

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, { action: 'approve' })
      setRegistrations(registrations.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در تایید ثبت‌نام')
    }
    setBusyId(null)
  }

  const openReject = (id) => {
    setRejectingId(id)
    setRejectReason('')
  }

  const submitReject = async (id) => {
    setBusyId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, {
        action: 'reject',
        rejection_reason: rejectReason,
      })
      setRegistrations(registrations.map(r => r.id === id ? res.data : r))
      setRejectingId(null)
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در رد ثبت‌نام')
    }
    setBusyId(null)
  }

  return (
    <div className="art-page">
      <h1 className="art-heading">مدیریت ثبت‌نام‌ها</h1>

      <div className="art-toolbar">
        <form onSubmit={handleSearchSubmit} className="art-search-form">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام، موبایل یا کد پیگیری..."
            className="art-search-input"
          />
          <button type="submit" className="art-search-btn">جستجو</button>
        </form>

        <div className="art-status-tabs">
          {[
            { key: '', label: 'همه' },
            { key: 'pending', label: 'در انتظار' },
            { key: 'approved', label: 'تایید شده' },
            { key: 'rejected', label: 'رد شده' },
            { key: 'cancelled', label: 'انصراف' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`art-status-tab${statusFilter === t.key ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="art-loading">در حال بارگذاری...</div>
      ) : registrations.length === 0 ? (
        <div className="art-empty">ثبت‌نامی یافت نشد</div>
      ) : (
        <div className="art-list">
          {registrations.map(r => (
            <div key={r.id} className="art-card">
              <div className="art-card-top">
                <div>
                  <h3>{r.user_name}</h3>
                  <p>{r.trip_detail?.title} · کد پیگیری: <span className="art-mono">{r.tracking_code}</span></p>
                </div>
                <span
                  className="art-badge"
                  style={{ color: statusMeta[r.status]?.color, borderColor: statusMeta[r.status]?.color, background: statusMeta[r.status]?.bg }}
                >
                  {statusMeta[r.status]?.label || r.status}
                </span>
              </div>

              <div className="art-card-meta">
                <span>هزینه کل: <strong>{r.total_cost?.toLocaleString('fa-IR')} ت</strong></span>
                <span>باقیمانده: <strong>{r.remaining_amount?.toLocaleString('fa-IR')} ت</strong></span>
                <span style={{ color: paymentMeta[r.payment_status]?.color }}>
                  پرداخت: {paymentMeta[r.payment_status]?.label}
                </span>
                <span>تاریخ: {new Date(r.registered_at).toLocaleDateString('fa-IR')}</span>
              </div>

              {r.status === 'pending' && (
                <div className="art-actions">
                  <button onClick={() => handleApprove(r.id)} disabled={busyId === r.id} className="art-approve-btn">
                    {busyId === r.id ? '...' : 'تایید ثبت‌نام'}
                  </button>
                  <button onClick={() => openReject(r.id)} disabled={busyId === r.id} className="art-reject-btn">
                    رد کردن
                  </button>
                </div>
              )}

              {rejectingId === r.id && (
                <div className="art-reject-box">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="دلیل رد ثبت‌نام (اختیاری)..."
                    rows={2}
                    className="art-reject-input"
                  />
                  <div className="art-reject-actions">
                    <button onClick={() => submitReject(r.id)} disabled={busyId === r.id} className="art-reject-confirm">
                      {busyId === r.id ? '...' : 'تایید رد ثبت‌نام'}
                    </button>
                    <button onClick={() => setRejectingId(null)} className="art-reject-cancel">انصراف</button>
                  </div>
                </div>
              )}

              {r.status === 'rejected' && r.rejection_reason && (
                <p className="art-rejection-note">دلیل رد: {r.rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .art-page { display: flex; flex-direction: column; gap: 18px; }
        .art-heading { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }

        .art-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .art-search-form { display: flex; gap: 8px; flex: 1; min-width: 240px; max-width: 380px; }
        .art-search-input {
          flex: 1; padding: 9px 14px; background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 13px; outline: none;
        }
        .art-search-input:focus { border-color: var(--teal-glow); }
        .art-search-btn {
          padding: 0 16px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }
        .art-search-btn:hover { border-color: var(--teal-glow); color: var(--teal-glow); }

        .art-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .art-status-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
        }
        .art-status-tab:hover { color: var(--teal-glow); border-color: var(--teal-glow); }
        .art-status-tab.active { background: rgba(15,111,92,0.12); color: var(--teal-glow); border-color: var(--teal-glow); }

        .art-loading, .art-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .art-list { display: flex; flex-direction: column; gap: 14px; }
        .art-card {
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: 18px 20px;
        }
        .art-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .art-card-top h3 { color: var(--ink); font-size: 14.5px; font-weight: 700; }
        .art-card-top p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .art-mono { font-family: monospace; }
        .art-badge { font-size: 11.5px; padding: 4px 12px; border-radius: 999px; border: 1px solid; white-space: nowrap; flex-shrink: 0; }

        .art-card-meta {
          display: flex; flex-wrap: wrap; gap: 16px;
          color: var(--ink-dim); font-size: 12px;
          padding: 10px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
          margin-bottom: 12px;
        }
        .art-card-meta strong { color: var(--ink); }

        .art-actions { display: flex; gap: 10px; }
        .art-approve-btn, .art-reject-btn {
          font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer; border: 1px solid;
        }
        .art-approve-btn { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .art-approve-btn:hover { background: rgba(75,214,172,0.22); }
        .art-reject-btn { background: transparent; color: var(--status-danger); border-color: var(--status-danger); }
        .art-reject-btn:hover { background: rgba(122,35,48,0.12); }
        .art-approve-btn:disabled, .art-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .art-reject-box { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--line); }
        .art-reject-input {
          width: 100%; padding: 9px 12px; background: var(--input-bg);
          border: 1px solid var(--line); border-radius: var(--radius-sm);
          color: var(--ink); font-family: var(--font-body); font-size: 12.5px; outline: none; resize: vertical;
        }
        .art-reject-input:focus { border-color: var(--teal-glow); }
        .art-reject-actions { display: flex; gap: 8px; margin-top: 8px; }
        .art-reject-confirm {
          font-size: 12px; padding: 7px 16px; border-radius: 999px; cursor: pointer;
          background: rgba(122,35,48,0.25); color: var(--status-danger); border: 1px solid rgba(122,35,48,0.5);
        }
        .art-reject-cancel {
          font-size: 12px; padding: 7px 16px; border-radius: 999px; cursor: pointer;
          background: transparent; color: var(--ink-dim); border: 1px solid var(--line);
        }

        .art-rejection-note { margin-top: 10px; color: var(--status-danger); font-size: 12px; }
      `}</style>
    </div>
  )
}

export default AdminRegistrations