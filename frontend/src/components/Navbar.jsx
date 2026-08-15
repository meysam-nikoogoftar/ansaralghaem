import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../store/authStore'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">هیئت</span>
            </div>
            <span className="text-green-800 font-bold text-lg hidden md:block">
              هیئت انصار القائم (عج)
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-800 transition-colors">
              صفحه اصلی
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-green-800 transition-colors">
              اخبار
            </Link>
            <Link to="/gallery" className="text-gray-700 hover:text-green-800 transition-colors">
              گالری
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-green-800 transition-colors">
              فروشگاه
            </Link>
            <Link to="/track" className="text-gray-700 hover:text-green-800 transition-colors">
              پیگیری ثبت‌نام
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  پنل کاربری
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-green-800 border border-green-800 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t flex flex-col gap-3">
            <Link to="/" className="text-gray-700 hover:text-green-800">صفحه اصلی</Link>
            <Link to="/news" className="text-gray-700 hover:text-green-800">اخبار</Link>
            <Link to="/gallery" className="text-gray-700 hover:text-green-800">گالری</Link>
            <Link to="/shop" className="text-gray-700 hover:text-green-800">فروشگاه</Link>
            <Link to="/track" className="text-gray-700 hover:text-green-800">پیگیری ثبت‌نام</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar