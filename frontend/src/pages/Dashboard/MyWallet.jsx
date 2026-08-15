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
    charge: 'text-green-600',
    withdraw: 'text-red-600',
    trip_payment: 'text-blue-600',
    refund: 'text-amber-600',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">کیف پول</h1>

      {/* موجودی */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl p-6 text-white">
        <p className="text-green-100 text-sm mb-2">موجودی فعلی</p>
        <h2 className="text-3xl font-bold">
          {wallet ? wallet.balance.toLocaleString() : '---'} تومان
        </h2>
      </div>

      {/* شارژ کیف پول */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">شارژ کیف پول</h2>
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
            {message}
          </div>
        )}
        <form onSubmit={handleCharge} className="flex gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مبلغ (تومان)"
            min="1000"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'در حال پرداخت...' : 'پرداخت آنلاین'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">حداقل مبلغ شارژ: ۱,۰۰۰ تومان</p>
      </div>

      {/* تاریخچه تراکنش‌ها */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">تاریخچه تراکنش‌ها</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">تراکنشی وجود ندارد</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{typeLabel[t.transaction_type]}</p>
                  <p className="text-xs text-gray-500">{t.description}</p>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${typeColor[t.transaction_type]}`}>
                    {t.amount.toLocaleString()} تومان
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyWallet