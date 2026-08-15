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
    pending: { label: 'در انتظار بررسی', color: 'bg-amber-100 text-amber-700' },
    approved: { label: 'تایید شده', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'انصراف داده', color: 'bg-gray-100 text-gray-700' },
    attended: { label: 'شرکت کرد', color: 'bg-blue-100 text-blue-700' },
    absent: { label: 'شرکت نکرد', color: 'bg-red-100 text-red-700' },
  }

  const paymentConfig = {
    unpaid: { label: 'پرداخت نشده', color: 'text-red-600' },
    partial: { label: 'نیمه‌کامل', color: 'text-amber-600' },
    paid: { label: 'پرداخت کامل', color: 'text-green-600' },
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

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">در حال بارگذاری...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">سفرهای من</h1>
        <Link
          to="/dashboard/trips/register"
          className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          ثبت‌نام سفر جدید
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">✈️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">هنوز سفری ثبت نکرده‌اید</h3>
          <p className="text-gray-500 text-sm mb-6">برای شرکت در سفرهای هیئت ثبت‌نام کنید</p>
          <Link
            to="/dashboard/trips/register"
            className="bg-green-800 text-white px-6 py-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            ثبت‌نام در سفر
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {trip.trip_detail?.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    کد پیگیری: <span className="font-mono font-medium">{trip.tracking_code}</span>
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[trip.status]?.color}`}>
                  {statusConfig[trip.status]?.label}
                </span>
              </div>

              {/* اطلاعات مالی */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">هزینه کل</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {trip.total_cost?.toLocaleString()} تومان
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">پرداخت شده</p>
                  <p className="font-bold text-green-700 text-sm">
                    {(trip.paid_from_wallet + trip.paid_directly)?.toLocaleString()} تومان
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">باقیمانده</p>
                  <p className="font-bold text-red-600 text-sm">
                    {trip.remaining_amount?.toLocaleString()} تومان
                  </p>
                </div>
              </div>

              {/* وضعیت پرداخت */}
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${paymentConfig[trip.payment_status]?.color}`}>
                  وضعیت پرداخت: {paymentConfig[trip.payment_status]?.label}
                </p>
                {trip.status === 'approved' && trip.payment_status !== 'paid' && (
                  <Link
                    to={`/dashboard/wallet`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                  >
                    پرداخت از کیف پول
                  </Link>
                )}
                {trip.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(trip.id)}
                    className="text-red-600 border border-red-300 px-4 py-2 rounded-lg text-xs hover:bg-red-50 transition-colors"
                  >
                    انصراف
                  </button>
                )}
              </div>

              {/* همسفران */}
              {trip.companions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">همسفران:</p>
                  <div className="flex gap-2 flex-wrap">
                    {trip.companions.map((c) => (
                      <span key={c.id} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                        {c.companion_detail?.first_name} {c.companion_detail?.last_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTrips