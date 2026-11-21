import FormValidation from '../../components/FormValidation'
import { fieldErrors } from '../../utils/validation'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import FormControl from '../../components/FormControl'
import { useCallback, useEffect, useState } from 'react'
import api from '../../services/api'
import './wallet.css'

function MyWallet() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const fetchWallet = useCallback(() => {
    observeLoad(() => api.get('/financial/wallet/')
      .then(res => setWallet(res.data))
      .catch(error => { throw error }), "'/financial/wallet/'")
  }, [observeLoad])

  const fetchTransactions = useCallback(() => {
    observeLoad(() => api.get('/financial/wallet/transactions/')
      .then(res => setTransactions(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(error => { throw error }), "'/financial/wallet/transactions/'")
  }, [observeLoad])

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [fetchTransactions, fetchWallet])





  const handleCharge = async (e) => {
    setValidationErrors({})

    e.preventDefault()
    if (isLoading) return
    const value = Number(amount)
    if (!Number.isSafeInteger(value) || value < 1000) {
      setValidationErrors({ amount: 'مبلغ باید عددی صحیح و حداقل ۱٬۰۰۰ تومان باشد.' })
      return
    }
    setMessage('')
    setIsLoading(true)
    try {
      const res = await api.post('/financial/wallet/charge/', { amount: value })
      setMessageType('success')
      setMessage(res.data.message || 'کیف پول با موفقیت شارژ شد')
      setWallet(current => ({ ...current, balance: res.data.balance ?? current?.balance }))
      setAmount('')
      fetchWallet()
      fetchTransactions()
    } catch (err) {
      setMessageType('error')
      setValidationErrors(fieldErrors(err))

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

  const statusLabels = { success: 'موفق', pending: 'در انتظار', failed: 'ناموفق' }
  const money = value => Number(value).toLocaleString('fa-IR')

  return (
    <FormValidation errors={validationErrors}>
      <div className="wl-page">
        <header className="wl-page-header">
          <h1 className="wl-heading">کیف پول</h1>
          <p>موجودی، افزایش اعتبار و همه تراکنش‌های شما در یک‌جا.</p>
        </header>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        <div className="wl-overview">
          <section className="wl-balance-card" aria-labelledby="wallet-balance-title">
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14V8H6a2 2 0 0 1 0-4"/><path d="M20 12h-5v5h5"/></svg>
            <h2 id="wallet-balance-title">موجودی کیف پول</h2>
            <p className="wl-balance-value">{wallet ? money(wallet.balance) : '—'} <span>تومان</span></p>
            <p className="wl-balance-note">برای مشاهده جزئیات پرداخت‌ها، تاریخچه تراکنش‌ها را بررسی کنید.</p>
          </section>
          <section className="wl-card wl-charge-card" aria-labelledby="wallet-charge-title">
            <h2 id="wallet-charge-title">افزایش اعتبار</h2>
            <form onSubmit={handleCharge} className="wl-charge-form" aria-busy={isLoading}>
              <div className="wl-amount-field">
                <FormControl as="input" label="مبلغ شارژ (تومان)" name="amount" type="number" inputMode="numeric"
                  value={amount} onChange={event => { setAmount(event.target.value); setValidationErrors({}); setMessage('') }}
                  placeholder="مثلاً ۱۰۰٬۰۰۰" min="1000" step="1" className="wl-input" required aria-describedby="wallet-amount-hint" disabled={isLoading} />
                <p id="wallet-amount-hint" className="wl-hint">حداقل مبلغ شارژ ۱٬۰۰۰ تومان است.</p>
              </div>
              <div className="wl-presets" role="group" aria-label="انتخاب مبلغ شارژ">
                {[50000, 100000, 200000].map(value => <button type="button" key={value} disabled={isLoading} aria-pressed={Number(amount) === value} onClick={() => { setAmount(String(value)); setValidationErrors({}); setMessage('') }}>{money(value)} <span>تومان</span></button>)}
              </div>
              <button type="submit" disabled={isLoading} className="wl-charge-btn">{isLoading ? 'در حال ثبت…' : 'افزایش اعتبار'}</button>
              {message && <div role={messageType === 'error' ? 'alert' : 'status'} className={`wl-message ${messageType}`}>{message}</div>}
            </form>
          </section>
        </div>
        <section className="wl-card wl-history" aria-labelledby="wallet-history-title">
          <div className="wl-section-heading"><h2 id="wallet-history-title">تاریخچه تراکنش‌ها</h2><span>مبالغ به تومان</span></div>
          {transactions.length === 0 && (!loadState.started || loadState.pending > 0) ? <p className="wl-empty" role="status">در حال دریافت تراکنش‌ها…</p> : loadState.errors.length > 0 && transactions.length === 0 ? null : transactions.length === 0 ? <div className="wl-empty"><strong>هنوز تراکنشی ثبت نشده</strong><p>پس از افزایش اعتبار یا پرداخت، جزئیات آن را اینجا می‌بینید.</p></div> :
            <ul className="wl-tx-list">{transactions.map(t => <li key={t.id} className="wl-tx-row">
              <div className="wl-tx-info"><p className="wl-tx-type">{typeLabel[t.transaction_type] || 'تراکنش'}</p>{t.description && <p className="wl-tx-desc">{t.description}</p>}<time className="wl-tx-date" dateTime={t.created_at}>{new Date(t.created_at).toLocaleDateString('fa-IR')}</time></div>
              <div className="wl-tx-right"><p className="wl-tx-amount">{money(t.amount)} <span>تومان</span></p><span className={`wl-tx-status ${['success', 'failed', 'pending'].includes(t.status) ? t.status : ''}`}>{statusLabels[t.status] || 'وضعیت نامشخص'}</span></div>
            </li>)}</ul>}
        </section>
      </div>
    </FormValidation>
  )
}

export default MyWallet
