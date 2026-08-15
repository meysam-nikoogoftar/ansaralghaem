import { Link, useLocation } from 'react-router-dom'

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
    <aside className="fixed right-0 top-16 h-full w-64 bg-white shadow-lg" dir="rtl">
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
                      ? 'bg-green-800 text-white'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default DashboardSidebar