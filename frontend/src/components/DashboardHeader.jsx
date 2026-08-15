import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function DashboardHeader() {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16" dir="rtl">
      <div className="flex items-center justify-between h-full px-6">
        <Link to="/" className="text-green-800 font-bold text-lg">
          هیئت انصار القائم (عج)
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.first_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
                <span className="text-white text-xs">
                  {user?.first_name?.[0]}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-700">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader