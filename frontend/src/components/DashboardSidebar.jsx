import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const menuItems = [
  { path: '/dashboard', label: 'داشبورد', icon: '🏠' },
  { path: '/dashboard/profile', label: 'پروفایل من', icon: '👤' },
  { path: '/dashboard/trips', label: 'سفرهای من', icon: '✈️' },
  { path: '/dashboard/trips/register', label: 'ثبت‌نام سفر', icon: '📝' },
  { path: '/dashboard/wallet', label: 'کیف پول', icon: '💰' },
  { path: '/dashboard/tickets', label: 'تیکت‌ها', icon: '🎫' },
  { path: '/dashboard/gallery', label: 'گالری من', icon: '🖼️' },
  { path: '/dashboard/articles', label: 'دلنوشته‌های من', icon: '📖' },
]

function DashboardSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed right-0 top-16 h-full w-64 bg-white shadow-lg border-l border-gray-100" dir="rtl">

      {/* Logo در sidebar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-[#1B6B6A]">
        <img
          src={logo}
          alt="logo"
          className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A84C]"
        />
        <div>
          <p className="text-white text-xs font-bold">هیئت انصار القائم</p>
          <p className="text-[#C9A84C] text-xs">(عج)</p>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-[#1B6B6A] text-white'
                      : 'text-gray-700 hover:bg-[#1B6B6A]/10 hover:text-[#1B6B6A]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* بخش پایین sidebar */}
      <div className="absolute bottom-20 right-0 left-0 p-4">
        <div className="bg-[#1B6B6A]/10 rounded-xl p-4 text-center">
          <p className="text-xs text-[#1B6B6A] italic leading-relaxed">
            «فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ»
          </p>
          <p className="text-xs text-gray-400 mt-1">امام حسین (ع)</p>
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar