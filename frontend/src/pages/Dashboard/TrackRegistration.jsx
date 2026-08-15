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
    pending: { label: 'در انتظار بررسی', color: 'text-amber-600' },
    approved: { label: 'تایید شده', color: 'text-green-600' },
    rejected: { label: 'رد شده', color: 'text-red-600' },
    cancelled: { label: 'انصراف داده', color: 'text-gray-600' },
    attended: { label: 'شرکت کرد', color: 'text-blue-600' },
    absent: { label: 'شرکت نکرد', color: 'text-red-600' },
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">پیگیری ثبت‌نام</h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">کد پیگیری</label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="کد پیگیری ثبت‌نام"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی</label>
            <input
              type="text"
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              placeholder="کد ملی"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-800 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'در حال جستجو...' : 'پیگیری'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-4">نتیجه پیگیری</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">نام:</span>
                <span className="font-medium text-gray-800">{result.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">سفر:</span>
                <span className="font-medium text-gray-800">{result.trip_detail?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">کد پیگیری:</span>
                <span className="font-mono font-medium text-gray-800">{result.tracking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">وضعیت:</span>
                <span className={`font-bold ${statusConfig[result.status]?.color}`}>
                  {statusConfig[result.status]?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">وضعیت پرداخت:</span>
                <span className="font-medium text-gray-800">
                  {result.payment_status === 'paid' ? 'کامل' :
                   result.payment_status === 'partial' ? 'نیمه‌کامل' : 'پرداخت نشده'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackRegistration