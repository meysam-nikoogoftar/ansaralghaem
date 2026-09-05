import { useState } from 'react'
import api from '../../services/api'

function TrackRegistration() {
  const [trackingCode, setTrackingCode] = useState('')
  const [nationalCode, setNationalCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setIsLoading(true)
    try {
      const res = await api.get(`/trips/track/?tracking_code=${trackingCode}&national_code=${nationalCode}`)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'ثبت‌نامی یافت نشد')
    }
    setIsLoading(false)
  }

  const statusConfig = {
    pending: { label: 'در انتظار بررسی', color: '#d8b568' },
    approved: { label: 'تایید شده', color: '#4bd6ac' },
    rejected: { label: 'رد شده', color: '#ff6b7d' },
    cancelled: { label: 'انصراف داده', color: '#af9f88' },
    attended: { label: 'شرکت کرد', color: '#7fb7ff' },
    absent: { label: 'شرکت نکرد', color: '#ff6b7d' },
  }

  return (
    <div className="tg-page" dir="rtl">
      <div className="tg-container">
        <div className="tg-head">
          <div className="section-kicker">✦ پیگیری ✦</div>
          <h1 className="section-title">پیگیری ثبت‌نام</h1>
        </div>

        <div className="tg-card">
          <form onSubmit={handleSubmit} className="tg-form">
            <div className="tg-field">
              <label>کد پیگیری</label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="کد پیگیری ثبت‌نام"
                className="tg-input"
                required
              />
            </div>
            <div className="tg-field">
              <label>کد ملی</label>
              <input
                type="text"
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value)}
                placeholder="کد ملی"
                className="tg-input"
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="tg-submit">
              {isLoading ? 'در حال جستجو...' : 'پیگیری'}
            </button>
          </form>

          {error && <div className="tg-error">{error}</div>}

          {result && (
            <div className="tg-result">
              <h2>نتیجه پیگیری</h2>
              <div className="tg-result-rows">
                <div className="tg-result-row">
                  <span>نام:</span>
                  <strong>{result.user_name}</strong>
                </div>
                <div className="tg-result-row">
                  <span>سفر:</span>
                  <strong>{result.trip_detail?.title}</strong>
                </div>
                <div className="tg-result-row">
                  <span>کد پیگیری:</span>
                  <strong className="tg-mono">{result.tracking_code}</strong>
                </div>
                <div className="tg-result-row">
                  <span>وضعیت:</span>
                  <strong style={{ color: statusConfig[result.status]?.color }}>
                    {statusConfig[result.status]?.label}
                  </strong>
                </div>
                <div className="tg-result-row">
                  <span>وضعیت پرداخت:</span>
                  <strong>
                    {result.payment_status === 'paid' ? 'کامل' :
                     result.payment_status === 'partial' ? 'نیمه‌کامل' : 'پرداخت نشده'}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tg-page { padding: 56px 0 80px; }
        .tg-container { max-width: 560px; margin: 0 auto; padding: 0 24px; }
        .tg-head { text-align: center; margin-bottom: 32px; }
        .tg-head .section-title { margin-top: 4px; }

        .tg-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 28px;
        }

        .tg-form { display: flex; flex-direction: column; gap: 16px; }
        .tg-field label { display: block; color: var(--ink-dim); font-size: 13px; margin-bottom: 6px; }
        .tg-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          outline: none;
        }
        .tg-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }

        .tg-submit {
          width: 100%;
          padding: 13px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 14px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 20px -6px rgba(216,181,104,0.45);
          transition: transform .25s ease;
        }
        .tg-submit:hover:not(:disabled) { transform: translateY(-2px); }
        .tg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .tg-error {
          margin-top: 20px;
          padding: 14px;
          border-radius: var(--radius-sm);
          background: rgba(122,35,48,0.2);
          border: 1px solid rgba(122,35,48,0.4);
          color: #ff9aa8;
          font-size: 13px;
        }

        .tg-result {
          margin-top: 24px;
          padding: 20px;
          border-radius: var(--radius-md);
          background: rgba(31,163,130,0.08);
          border: 1px solid rgba(31,163,130,0.25);
        }
        .tg-result h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 16px;
          margin-bottom: 14px;
        }
        .tg-result-rows { display: flex; flex-direction: column; gap: 10px; }
        .tg-result-row { display: flex; justify-content: space-between; }
        .tg-result-row span { color: var(--ink-faint); font-size: 13px; }
        .tg-result-row strong { color: var(--ink); font-size: 13px; }
        .tg-mono { font-family: monospace; }
      `}</style>
    </div>
  )
}

export default TrackRegistration