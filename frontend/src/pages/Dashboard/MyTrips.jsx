import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function RefundRequestBox({ trip, onDone }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [fullAmount, setFullAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const totalPaid = trip.paid_from_wallet + trip.paid_directly

  const handleFullToggle = () => {
    const next = !fullAmount
    setFullAmount(next)
    setAmount(next ? String(totalPaid) : '')
  }

  const handleSubmit = async () => {
    setMessage('')
    const value = Number(amount)
    if (!value || value <= 0 || value > totalPaid) {
      setMessage('مبلغ نامعتبر است')
      return
    }
    setIsSubmitting(true)
    try {
      await api.post(`/trips/registration/${trip.id}/request-refund/`, { amount: value })
      onDone()
    } catch (err) {
      setMessage(err.response?.data?.error || 'خطا در ثبت درخواست')
    }
    setIsSubmitting(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-action-btn outline" style={{ marginTop: 14 }}>
        درخواست عودت وجه
      </button>
    )
  }

  return (
    <div className="mt-refund-box">
      <p>مبلغ پرداخت‌شده: <strong>{totalPaid.toLocaleString('fa-IR')} تومان</strong></p>
      <label className="mt-refund-checkbox">
        <input type="checkbox" checked={fullAmount} onChange={handleFullToggle} />
        <span>کل مبلغ پرداخت‌شده</span>
      </label>
      <input
        type="number"
        min="1"
        max={totalPaid}
        value={amount}
        onChange={(e) => { setAmount(e.target.value); setFullAmount(false) }}
        readOnly={fullAmount}
        placeholder="مبلغ درخواستی برای عودت"
        className="mt-pay-input"
      />
      <div className="mt-pay-btns">
        <button onClick={handleSubmit} disabled={isSubmitting} className="mt-action-btn primary">
          {isSubmitting ? '...' : 'ثبت درخواست عودت وجه'}
        </button>
        <button onClick={() => setOpen(false)} className="mt-action-btn outline">انصراف</button>
      </div>
      {message && <div className="mt-pay-feedback error"><span>{message}</span></div>}
    </div>
  )
}

function CancelBox({ trip, onDone }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [fullAmount, setFullAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const totalPaid = trip.paid_from_wallet + trip.paid_directly

  const handleFullToggle = () => {
    const next = !fullAmount
    setFullAmount(next)
    setAmount(next ? String(totalPaid) : '')
  }

  const handleConfirm = async () => {
    setMessage('')
    let payload = {}
    if (totalPaid > 0) {
      const value = Number(amount)
      if (!value || value <= 0 || value > totalPaid) {
        setMessage('مبلغ نامعتبر است')
        return
      }
      payload = { amount: value }
    }
    setIsSubmitting(true)
    try {
      await api.post(`/trips/registration/${trip.id}/cancel/`, payload)
      onDone()
    } catch (err) {
      setMessage(err.response?.data?.error || 'خطا در انصراف')
    }
    setIsSubmitting(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-action-btn danger">انصراف</button>
    )
  }

  return (
    <div className="mt-refund-box">
      <p>آیا از انصراف این ثبت‌نام مطمئن هستید؟</p>
      {totalPaid > 0 && (
        <>
          <p>مبلغ پرداخت‌شده: <strong>{totalPaid.toLocaleString('fa-IR')} تومان</strong></p>
          <label className="mt-refund-checkbox">
            <input type="checkbox" checked={fullAmount} onChange={handleFullToggle} />
            <span>کل مبلغ پرداخت‌شده</span>
          </label>
          <input
            type="number"
            min="1"
            max={totalPaid}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setFullAmount(false) }}
            readOnly={fullAmount}
            placeholder="مبلغ درخواستی برای عودت وجه"
            className="mt-pay-input"
          />
        </>
      )}
      <div className="mt-pay-btns">
        <button onClick={handleConfirm} disabled={isSubmitting} className="mt-action-btn danger">
          {isSubmitting ? '...' : 'تایید انصراف'}
        </button>
        <button onClick={() => setOpen(false)} className="mt-action-btn outline">بی‌خیال</button>
      </div>
      {message && <div className="mt-pay-feedback error"><span>{message}</span></div>}
    </div>
  )
}

function MyTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [wallet, setWallet] = useState(null)
  const [payAmounts, setPayAmounts] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [payFeedback, setPayFeedback] = useState({})

  useEffect(() => {
    fetchTrips()
    api.get('/financial/wallet/').then(res => setWallet(res.data)).catch(() => {})
  }, [])

  const fetchTrips = () => {
    api.get('/trips/my-registrations/')
      .then(res => setTrips(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  const statusConfig = {
    '': { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
    pending: { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
    approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
    rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
    cancelled: { label: 'انصراف داده', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
    attended: { label: 'شرکت کرد', color: 'var(--status-info)', bg: 'var(--status-info-bg)' },
    absent: { label: 'شرکت نکرد', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  }

  const paymentConfig = {
    unpaid: { label: 'پرداخت نشده', color: 'var(--status-danger)' },
    partial: { label: 'نیمه‌کامل', color: 'var(--status-warn)' },
    paid: { label: 'پرداخت کامل', color: 'var(--status-ok)' },
  }

  const setFeedback = (tripId, data) => {
    setPayFeedback(f => ({ ...f, [tripId]: data }))
  }

  const handlePayWallet = async (trip) => {
    const amount = Number(payAmounts[trip.id] ?? trip.remaining_amount)
    setFeedback(trip.id, null)

    if (!amount || amount <= 0) {
      setFeedback(trip.id, { type: 'error', text: 'مبلغ نامعتبر است' })
      return
    }
    if (wallet && amount > wallet.balance) {
      setFeedback(trip.id, { type: 'low-balance', text: 'موجودی کیف پول کافی نیست' })
      return
    }

    setBusyId(trip.id)
    try {
      const res = await api.post('/financial/wallet/pay/', {
        registration_id: trip.id,
        amount,
      })
      setFeedback(trip.id, { type: 'success', text: 'پرداخت با موفقیت از کیف پول انجام شد' })
      setWallet(w => w ? { ...w, balance: res.data.wallet_balance } : w)
      setPayAmounts({ ...payAmounts, [trip.id]: '' })
      fetchTrips()
    } catch (err) {
      setFeedback(trip.id, { type: 'error', text: err.response?.data?.error || 'خطا در پرداخت' })
    }
    setBusyId(null)
  }

  const handlePayDirect = async (trip) => {
    const amount = Number(payAmounts[trip.id] ?? trip.remaining_amount)
    setFeedback(trip.id, null)

    if (!amount || amount <= 0) {
      setFeedback(trip.id, { type: 'error', text: 'مبلغ نامعتبر است' })
      return
    }

    setBusyId(trip.id)
    try {
      await api.post(`/trips/registration/${trip.id}/pay-direct/`, { amount })
      setFeedback(trip.id, { type: 'success', text: 'پرداخت مستقیم با موفقیت ثبت شد' })
      setPayAmounts({ ...payAmounts, [trip.id]: '' })
      fetchTrips()
    } catch (err) {
      setFeedback(trip.id, { type: 'error', text: err.response?.data?.error || 'خطا در پرداخت مستقیم' })
    }
    setBusyId(null)
  }

  if (isLoading) return <div className="mt-loading">در حال بارگذاری...</div>

  return (
    <div className="mt-page">
      <div className="mt-head">
        <h1>سفرهای من</h1>
        <Link to="/dashboard/trips/register" className="mt-new-btn">ثبت‌نام سفر جدید</Link>
      </div>

      {wallet && (
        <div className="mt-wallet-strip">
          <span>موجودی کیف پول:</span>
          <strong>{wallet.balance.toLocaleString('fa-IR')} تومان</strong>
          <Link to="/dashboard/wallet">شارژ کیف پول ←</Link>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="mt-empty">
          <div className="mt-empty-icon">✈️</div>
          <h3>هنوز سفری ثبت نکرده‌اید</h3>
          <p>برای شرکت در سفرهای هیئت ثبت‌نام کنید</p>
          <Link to="/dashboard/trips/register" className="mt-new-btn">ثبت‌نام در سفر</Link>
        </div>
      ) : (
        <div className="mt-list">
          {trips.map((trip) => {
            const feedback = payFeedback[trip.id]
            return (
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
                      background: statusConfig[trip.status]?.bg,
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
                  {(trip.status === 'pending' || trip.status === '') && (
                    <CancelBox trip={trip} onDone={fetchTrips} />
                  )}
                </div>

                {['', 'pending'].includes(trip.status) && trip.remaining_amount > 0 && (
                  <div className="mt-pay-box">
                    <input
                      type="number"
                      min="1"
                      max={trip.remaining_amount}
                      placeholder={`حداکثر ${trip.remaining_amount.toLocaleString('fa-IR')} تومان`}
                      value={payAmounts[trip.id] ?? ''}
                      onChange={(e) => setPayAmounts({ ...payAmounts, [trip.id]: e.target.value })}
                      className="mt-pay-input"
                    />
                    <div className="mt-pay-btns">
                      <button
                        onClick={() => handlePayWallet(trip)}
                        disabled={busyId === trip.id}
                        className="mt-action-btn primary"
                      >
                        {busyId === trip.id ? '...' : 'پرداخت از کیف پول'}
                      </button>
                      <button
                        onClick={() => handlePayDirect(trip)}
                        disabled={busyId === trip.id}
                        className="mt-action-btn outline"
                      >
                        {busyId === trip.id ? '...' : 'پرداخت مستقیم (آنلاین)'}
                      </button>
                    </div>

                    {feedback && (
                      <div className={`mt-pay-feedback ${feedback.type}`}>
                        <span>{feedback.text}</span>
                        {feedback.type === 'low-balance' && (
                          <button onClick={() => navigate('/dashboard/wallet')} className="mt-charge-link">
                            شارژ کیف پول
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {trip.status === 'rejected' && (trip.paid_from_wallet + trip.paid_directly) > 0 && !trip.refund_requested && (
                  <RefundRequestBox trip={trip} onDone={fetchTrips} />
                )}

                {trip.refund_requested && (
                  <div className="mt-refund-status">
                    وضعیت درخواست عودت وجه:{' '}
                    <strong style={{
                      color: trip.refund_status === 'approved' ? 'var(--status-ok)'
                        : trip.refund_status === 'rejected' ? 'var(--status-danger)'
                        : 'var(--status-warn)'
                    }}>
                      {trip.refund_status === 'approved' ? 'تایید و واریز شد'
                        : trip.refund_status === 'rejected' ? 'رد شد'
                        : 'در انتظار بررسی'}
                    </strong>
                  </div>
                )}

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
            )
          })}
        </div>
      )}

      <style>{`
        .mt-loading { text-align: center; padding: 60px 0; color: var(--ink-dim); }

        .mt-page { display: flex; flex-direction: column; gap: 22px; }
        .mt-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .mt-head h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 22px; }

        .mt-new-btn {
          display: inline-flex; align-items: center;
          padding: 10px 20px; border-radius: 999px;
          font-size: 13px; font-weight: 700; color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
          box-shadow: 0 6px 18px -6px rgba(15,111,92,0.45);
          transition: transform .25s ease;
        }
        .mt-new-btn:hover { transform: translateY(-2px); }

        .mt-wallet-strip {
          display: flex; align-items: center; gap: 10px;
          background: var(--panel-inset-bg); border: 1px solid var(--line);
          border-radius: var(--radius-md); padding: 12px 18px; font-size: 13px;
        }
        .mt-wallet-strip span { color: var(--ink-dim); }
        .mt-wallet-strip strong { color: var(--teal-glow); }
        .mt-wallet-strip a { margin-right: auto; color: var(--teal-glow); font-size: 12.5px; }
        .mt-wallet-strip a:hover { color: var(--teal-light); }

        .mt-empty {
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: 48px 24px; text-align: center;
        }
        .mt-empty-icon { font-size: 40px; margin-bottom: 14px; }
        .mt-empty h3 { color: var(--ink); font-size: 16px; margin-bottom: 8px; }
        .mt-empty p { color: var(--ink-dim); font-size: 13px; margin-bottom: 20px; }

        .mt-list { display: flex; flex-direction: column; gap: 16px; }
        .mt-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; }
        .mt-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
        .mt-card-head h3 { color: var(--ink); font-size: 15px; font-weight: 700; }
        .mt-card-head p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .mt-mono { font-family: monospace; color: var(--ink-dim); }

        .mt-badge { font-size: 12px; padding: 5px 12px; border-radius: 999px; border: 1px solid; white-space: nowrap; flex-shrink: 0; }

        .mt-financials {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          background: var(--panel-inset-bg); border: 1px solid var(--line);
          border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px; text-align: center;
        }
        .mt-financials p { color: var(--ink-faint); font-size: 11px; margin-bottom: 4px; }
        .mt-financials strong { color: var(--ink); font-size: 13px; }
        .mt-paid { color: var(--teal-glow) !important; }
        .mt-remaining { color: #ff9aa8 !important; }

        .mt-row-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .mt-row-actions p { font-size: 13px; font-weight: 500; }
        .mt-action-btn {
          font-size: 12px; padding: 8px 16px; border-radius: 999px;
          border: 1px solid; cursor: pointer; font-family: var(--font-body); white-space: nowrap;
        }
        .mt-action-btn.primary { color: #eefaf5; background: var(--teal); border-color: var(--teal); }
        .mt-action-btn.primary:hover:not(:disabled) { background: var(--teal-light); }
        .mt-action-btn.outline { color: var(--teal-glow); background: transparent; border-color: rgba(15,111,92,0.4); }
        .mt-action-btn.outline:hover:not(:disabled) { background: rgba(15,111,92,0.1); }
        .mt-action-btn.danger { color: #ff9aa8; background: transparent; border-color: rgba(255,107,125,0.4); }
        .mt-action-btn.danger:hover { background: rgba(122,35,48,0.15); }
        .mt-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .mt-pay-box { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--line); }
        .mt-pay-input {
          padding: 9px 12px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 12.5px; outline: none;
        }
        .mt-pay-input:focus { border-color: var(--teal-glow); }
        .mt-pay-btns { display: flex; gap: 10px; flex-wrap: wrap; }

        .mt-pay-feedback { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 12.5px; padding: 8px 12px; border-radius: var(--radius-sm); }
        .mt-pay-feedback.error, .mt-pay-feedback.low-balance { color: #ff9aa8; background: rgba(122,35,48,0.12); border: 1px solid rgba(255,107,125,0.3); }
        .mt-pay-feedback.success { color: var(--status-ok); background: var(--status-ok-bg); border: 1px solid var(--status-ok); }
        .mt-charge-link { border: none; background: var(--teal); color: #eefaf5; padding: 5px 14px; border-radius: 999px; font-size: 11.5px; cursor: pointer; }
        .mt-charge-link:hover { background: var(--teal-light); }

        .mt-refund-box {
          display: flex; flex-direction: column; gap: 10px;
          margin-top: 14px; padding: 14px; background: var(--panel-inset-bg);
          border: 1px dashed var(--line); border-radius: var(--radius-md);
        }
        .mt-refund-box p { font-size: 13px; color: var(--ink-dim); }
        .mt-refund-box p strong { color: var(--ink); }
        .mt-refund-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px; color: var(--ink-dim); }
        .mt-refund-checkbox input { width: 15px; height: 15px; accent-color: var(--teal-glow); }
        .mt-refund-status { margin-top: 12px; font-size: 13px; color: var(--ink-dim); }

        .mt-companions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); }
        .mt-companions p { color: var(--ink-faint); font-size: 12px; margin-bottom: 8px; }
        .mt-companion-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .mt-companion-chips span { background: rgba(216,181,104,0.1); color: var(--gold-light); font-size: 12px; padding: 5px 12px; border-radius: 999px; }

        @media (max-width: 600px) {
          .mt-financials { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
    </div>
  )
}

export default MyTrips