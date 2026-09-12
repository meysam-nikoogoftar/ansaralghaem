import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

// Pages
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Dashboard/Profile'
import MyTrips from './pages/Dashboard/MyTrips'
import MyWallet from './pages/Dashboard/MyWallet'
import MyTickets from './pages/Dashboard/MyTickets'
import MyGallery from './pages/Dashboard/MyGallery'
import MyArticles from './pages/Dashboard/MyArticles'
import News from './pages/News/News'
import NewsDetail from './pages/News/NewsDetail'
import Gallery from './pages/Gallery/Gallery'
import Shop from './pages/Shop/Shop'
import ProductDetail from './pages/Shop/ProductDetail'
import TripRegister from './pages/Dashboard/TripRegister'
import TrackRegistration from './pages/Dashboard/TrackRegistration'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminTrips from './pages/Admin/AdminTrips'
import AdminRegistrations from './pages/Admin/AdminRegistrations'

// Protected Route (کاربر عادی لاگین‌کرده)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Protected Route (فقط ادمین یا سوپرادمین)
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!['admin', 'superadmin'].includes(user?.user_type)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// وقتی صفحه رفرش می‌شود یا مستقیم یک آدرس تایپ می‌شود، تا وقتی مشخص نشده
// کاربر لاگین هست یا نه (و چه نقشی دارد)، مسیرهای محافظت‌شده رندر نمی‌شوند؛
// این از ریدایرکت زودهنگام و اشتباه (قبل از لود شدن اطلاعات کاربر) جلوگیری می‌کند.
function AuthGate({ children }) {
  const authChecked = useAuthStore((s) => s.authChecked)
  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--ink-dim)', fontSize: 14,
      }}>
        در حال بارگذاری...
      </div>
    )
  }
  return children
}

function App() {
  const { initAuth } = useAuthStore()
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initAuth()
    initTheme()
  }, [])

  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/:id" element={<ProductDetail />} />
            <Route path="track" element={<TrackRegistration />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="trips" element={<MyTrips />} />
            <Route path="trips/register" element={<TripRegister />} />
            <Route path="wallet" element={<MyWallet />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="gallery" element={<MyGallery />} />
            <Route path="articles" element={<MyArticles />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="registrations" element={<AdminRegistrations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGate>
  )
}

export default App