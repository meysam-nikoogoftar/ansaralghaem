import { useEffect, useState } from 'react'
import api from '../../services/api'

function MyWallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [])

  const fetchWallet = () => {
    api.get('/financial/wallet/')
      .then(res => setWallet(res.data))
      .catch(() => {})
  }

  const fetchTransactions = () => {
    api.get('/financial/wallet/transactions/')
      .then(res => setTransactions(res.data))
      .catch(() => {})
  }

  const handleCharge = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await api.post('/financial/wallet/charge/', { amount: parseInt(amount) })
      setMessage(res.data.message)
      setAmount('')
      fetchWallet()
      fetchTransactions()
    } catch (err) {
      setMessage(err.response?.data?.error || 'خطا در شارژ کیف پول')
    }
    setIsLoading(false)
  }

  const typeLabel = {
    charge: 'شارژ',
    withdraw: 'برداشت',
    trip_payment: 'پرداخت سفر',
    refund: 'عودت وجه',
  }

  const typeColor = {
    charge: '#4bd6ac',
    withdraw: '#ff6b7d',
    trip_payment: '#7fb7ff',
    refund: '#d8b568',
  }

  return (
    <div className="wl-page">
      <h1 className="wl-heading">کیف پول</h1>

      {/* موجودی */}
      <div className="wl-balance-card">
        <p>موجودی فعلی</p>
        <h2>{wallet ? wallet.balance.toLocaleString('fa-IR') : '---'} تومان</h2>
      </div>

      {/* شارژ کیف پول */}
      <div className="wl-card">
        <h2>شارژ کیف پول</h2>
        {message && (
          <div className={`wl-message ${message.includes('موفقیت') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleCharge} className="wl-charge-form">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مبلغ (تومان)"
            min="1000"
            className="wl-input"
            required
          />
          <button type="submit" disabled={isLoading} className="wl-charge-btn">
            {isLoading ? 'در حال پرداخت...' : 'پرداخت آنلاین'}
          </button>
        </form>
        <p className="wl-hint">حداقل مبلغ شارژ: ۱,۰۰۰ تومان</p>
      </div>

      {/* تاریخچه تراکنش‌ها */}
      <div className="wl-card">
        <h2>تاریخچه تراکنش‌ها</h2>
        {transactions.length === 0 ? (
          <p className="wl-empty">تراکنشی وجود ندارد</p>
        ) : (
          <div className="wl-tx-list">
            {transactions.map((t) => (
              <div key={t.id} className="wl-tx-row">
                <div>
                  <p className="wl-tx-type">{typeLabel[t.transaction_type]}</p>
                  <p className="wl-tx-desc">{t.description}</p>
                </div>
                <div className="wl-tx-right">
                  <p className="wl-tx-amount" style={{ color: typeColor[t.transaction_type] }}>
                    {t.amount.toLocaleString('fa-IR')} تومان
                  </p>
                  <p className="wl-tx-date">{new Date(t.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .wl-page { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }
        .wl-heading { font-family: var(--font-display); color: var(--gold-light); font-size: 22px; }

        .wl-balance-card {
          background: linear-gradient(135deg, var(--teal), var(--teal-light));
          border-radius: var(--radius-lg);
          padding: 26px 28px;
          border: 1px solid var(--line);
          box-shadow: 0 20px 40px -20px rgba(15,111,92,0.5);
        }
        .wl-balance-card p { color: rgba(238,230,214,0.8); font-size: 13px; margin-bottom: 8px; }
        .wl-balance-card h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 30px;
        }

        .wl-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
        }
        .wl-card h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 15px;
          margin-bottom: 14px;
        }

        .wl-message {
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 14px;
        }
        .wl-message.success {
          background: rgba(31,163,130,0.15);
          border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow);
        }
        .wl-message.error {
          background: rgba(122,35,48,0.2);
          border: 1px solid rgba(122,35,48,0.4);
          color: #ff9aa8;
        }

        .wl-charge-form { display: flex; gap: 10px; }
        .wl-input {
          flex: 1;
          padding: 12px 16px;
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-size: 13px;
          outline: none;
        }
        .wl-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }
        .wl-charge-btn {
          padding: 0 22px;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          font-size: 13px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          white-space: nowrap;
        }
        .wl-charge-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .wl-hint { color: var(--ink-faint); font-size: 11px; margin-top: 8px; }

        .wl-empty { color: var(--ink-dim); font-size: 13px; text-align: center; padding: 24px 0; }

        .wl-tx-list { display: flex; flex-direction: column; }
        .wl-tx-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
        }
        .wl-tx-row:last-child { border-bottom: none; }
        .wl-tx-type { color: var(--ink); font-size: 13px; font-weight: 600; }
        .wl-tx-desc { color: var(--ink-faint); font-size: 11px; margin-top: 3px; }
        .wl-tx-right { text-align: left; }
        .wl-tx-amount { font-size: 13px; font-weight: 700; }
        .wl-tx-date { color: var(--ink-faint); font-size: 11px; margin-top: 3px; }

        @media (max-width: 480px) {
          .wl-charge-form { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}

export default MyWallet