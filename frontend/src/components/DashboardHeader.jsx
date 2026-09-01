import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo.png'

function DashboardHeader() {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-[#1B6B6A] fixed top-0 left-0 right-0 z-50 h-16" dir="rtl">
      <div className="flex items-center justify-between h-full px-6">

        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A84C]"
          />
          <span className="text-white font-bold hidden md:block">
            هیئت انصار القائم (عج)
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.first_name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#C9A84C]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.first_name?.[0]}
                </span>
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-white text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-white/60 text-xs">{user?.mobile}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <span>خروج</span>
            <span>🚪</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader