import { useEffect, useState } from 'react'
import api from '../../services/api'

const refundStatusMeta = {
  pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید و واریز شد', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminRefunds() {
  const [refunds, setRefunds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [amountOverride, setAmountOverride] = useState({})

  const fetchRefunds = () => {
    setIsLoading(true)
    api.get('/trips/admin/refunds/')
      .then(res => setRefunds(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchRefunds() }, [])

  const handleApprove = async (r) => {
    setBusyId(r.id)
    try {
      const payload = { action: 'approve' }
      if (amountOverride[r.id]) payload.amount = Number(amountOverride[r.id])
      const res = await api.post(`/trips/admin/refunds/${r.id}/action/`, payload)
      setRefunds(refunds.map(x => x.id === r.id ? res.data : x))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در تایید عودت وجه')
    }
    setBusyId(null)
  }

  const handleReject = async (r) => {
    if (!window.confirm('این درخواست عودت وجه رد بشه؟')) return
    setBusyId(r.id)
    try {
      const res = await api.post(`/trips/admin/refunds/${r.id}/action/`, { action: 'reject' })
      setRefunds(refunds.map(x => x.id === r.id ? res.data : x))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در رد درخواست')
    }
    setBusyId(null)
  }

  const pendingCount = refunds.filter(r => r.refund_status === 'pending').length

  return (
    <div className="arf-page">
      <div className="arf-head">
        <h1>عودت وجه کیف پول</h1>
        {pendingCount > 0 && <span className="arf-pending-badge">{pendingCount} درخواست در انتظار</span>}
      </div>
      <p className="arf-desc">این لیست، انصراف‌های ثبت‌شده در «سفرهای من» است که منتظر تایید و واریز به کیف‌پول کاربر هستند.</p>

      {isLoading ? (
        <div className="arf-loading">در حال بارگذاری...</div>
      ) : refunds.length === 0 ? (
        <div className="arf-empty">درخواست عودت وجهی وجود ندارد</div>
      ) : (
        <div className="arf-list">
          {refunds.map(r => (
            <div key={r.id} className="arf-card">
              <div className="arf-card-top">
                <div>
                  <h3>{r.user_name}</h3>
                  <p>{r.trip_detail?.title} · کد پیگیری: <span className="arf-mono">{r.tracking_code}</span></p>
                </div>
                <span
                  className="arf-badge"
                  style={{
                    color: refundStatusMeta[r.refund_status]?.color,
                    borderColor: refundStatusMeta[r.refund_status]?.color,
                    background: refundStatusMeta[r.refund_status]?.bg,
                  }}
                >
                  {refundStatusMeta[r.refund_status]?.label || r.refund_status}
                </span>
              </div>

              <div className="arf-meta">
                <span>مبلغ پرداخت‌شده: <strong>{((r.paid_from_wallet || 0) + (r.paid_directly || 0)).toLocaleString('fa-IR')} ت</strong></span>
                 {r.requested_refund_amount > 0 && (
                <span>مبلغ درخواستی کاربر: <strong style={{ color: 'var(--teal-glow)' }}>{r.requested_refund_amount.toLocaleString('fa-IR')} ت</strong></span>
                )}
                <span>مبلغ عودت پیش‌فرض سفر: <strong>{Number(r.trip_detail?.refund_amount || 0).toLocaleString('fa-IR')} ت</strong></span>
              </div>

              {r.refund_status === 'pending' && (
                <div className="arf-actions">
                  <input
                    type="number"
                    placeholder="مبلغ دلخواه (اختیاری)"
                    className="arf-amount-input"
                    value={amountOverride[r.id] || ''}
                    onChange={(e) => setAmountOverride({ ...amountOverride, [r.id]: e.target.value })}
                  />
                  <button onClick={() => handleApprove(r)} disabled={busyId === r.id} className="arf-approve-btn">
                    {busyId === r.id ? '...' : 'تایید و واریز به کیف‌پول'}
                  </button>
                  <button onClick={() => handleReject(r)} disabled={busyId === r.id} className="arf-reject-btn">
                    رد درخواست
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .arf-page { display: flex; flex-direction: column; gap: 8px; }
        .arf-head { display: flex; align-items: center; gap: 12px; }
        .arf-head h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }
        .arf-pending-badge {
          font-size: 11.5px; padding: 4px 12px; border-radius: 999px;
          background: var(--status-warn-bg); color: var(--status-warn); border: 1px solid var(--status-warn);
        }
        .arf-desc { color: var(--ink-faint); font-size: 12.5px; margin-bottom: 10px; }

        .arf-loading, .arf-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .arf-list { display: flex; flex-direction: column; gap: 14px; }
        .arf-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 18px 20px; }
        .arf-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .arf-card-top h3 { color: var(--ink); font-size: 14.5px; font-weight: 700; }
        .arf-card-top p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .arf-mono { font-family: monospace; }
        .arf-badge { font-size: 11.5px; padding: 4px 12px; border-radius: 999px; border: 1px solid; white-space: nowrap; flex-shrink: 0; }

        .arf-meta {
          display: flex; flex-wrap: wrap; gap: 16px; color: var(--ink-dim); font-size: 12px;
          padding: 10px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 12px;
        }
        .arf-meta strong { color: var(--ink); }

        .arf-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .arf-amount-input {
          padding: 8px 12px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 12.5px; outline: none; width: 160px;
        }
        .arf-amount-input:focus { border-color: var(--teal-glow); }
        .arf-approve-btn, .arf-reject-btn { font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer; border: 1px solid; }
        .arf-approve-btn { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .arf-approve-btn:hover { background: rgba(75,214,172,0.22); }
        .arf-reject-btn { background: transparent; color: var(--status-danger); border-color: var(--status-danger); }
        .arf-reject-btn:hover { background: rgba(122,35,48,0.12); }
        .arf-approve-btn:disabled, .arf-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

export default AdminRefunds