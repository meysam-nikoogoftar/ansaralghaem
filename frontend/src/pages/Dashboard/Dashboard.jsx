import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

function Dashboard() {
  const { user } = useAuthStore()
  const [wallet, setWallet] = useState(null)
  const [trips, setTrips] = useState([])

  useEffect(() => {
    api.get('/financial/wallet/')
      .then(res => setWallet(res.data))
      .catch(() => {})

    api.get('/trips/my-registrations/')
      .then(res => setTrips(res.data))
      .catch(() => {})
  }, [])

  const stats = [
    { label: 'تعداد سفرها', value: trips.length, icon: '✈️', color: 'bg-blue-50 text-blue-700' },
    { label: 'موجودی کیف پول', value: wallet ? `${wallet.balance.toLocaleString()} تومان` : '---', icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'سفرهای تایید شده', value: trips.filter(t => t.status === 'approved').length, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'در انتظار بررسی', value: trips.filter(t => t.status === 'pending').length, icon: '⏳', color: 'bg-amber-50 text-amber-700' },
  ]

  const quickLinks = [
    { to: '/dashboard/trips/register', label: 'ثبت‌نام سفر جدید', icon: '📝', color: 'bg-green-800' },
    { to: '/dashboard/wallet', label: 'شارژ کیف پول', icon: '💳', color: 'bg-blue-700' },
    { to: '/dashboard/tickets', label: 'ثبت تیکت', icon: '🎫', color: 'bg-purple-700' },
    { to: '/dashboard/articles', label: 'ثبت دلنوشته', icon: '📖', color: 'bg-amber-700' },
  ]

  return (
    <div className="space-y-6">

      {/* خوش‌آمدگویی */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              👤
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">
              خوش آمدید، {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-green-100 text-sm mt-1">{user?.mobile}</p>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-4`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-sm opacity-75">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* دسترسی سریع */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className={`${link.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}
            >
              <div className="text-2xl mb-2">{link.icon}</div>
              <div className="text-sm font-medium">{link.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* آخرین سفرها */}
      {trips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">آخرین سفرها</h2>
            <Link to="/dashboard/trips" className="text-green-800 text-sm hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-3">
            {trips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-medium text-gray-800">{trip.trip_detail?.title}</h3>
                  <p className="text-sm text-gray-500">کد پیگیری: {trip.tracking_code}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  trip.status === 'approved' ? 'bg-green-100 text-green-700' :
                  trip.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  trip.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {trip.status === 'approved' ? 'تایید شده' :
                   trip.status === 'pending' ? 'در انتظار' :
                   trip.status === 'rejected' ? 'رد شده' :
                   trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard