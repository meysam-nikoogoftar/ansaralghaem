import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import { subscribeSessionChange } from '../../shared/session-client'
import RouteTitle from './components/RouteTitle'
import NotFound from './pages/NotFound'
import MigrationBoundary, { MigrationRedirect } from './components/MigrationBoundary'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

// Pages
import News from './pages/News/News'
import NewsDetail from './pages/News/NewsDetail'
import Articles from './pages/Content/Articles'
import ArticleDetail from './pages/Content/ArticleDetail'
import Gallery from './pages/Gallery/Gallery'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminUserDetail from './pages/Admin/AdminUserDetail'
import AdminTrips from './pages/Admin/AdminTrips'
import AdminRegistrations from './pages/Admin/AdminRegistrations'
import AdminArticles from './pages/Admin/AdminArticles'
import AdminGalleryModeration from './pages/Admin/AdminGalleryModeration'
import AdminNews from './pages/Admin/AdminNews'
import AdminExpenses from './pages/Admin/AdminExpenses'
import AdminContributions from './pages/Admin/AdminContributions'
import AdminRefunds from './pages/Admin/AdminRefunds'

// Protected Route (کاربر عادی لاگین‌کرده)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ returnTo: location.pathname + location.search + location.hash }} replace />
  return children
}

// Protected Route (فقط ادمین یا سوپرادمین)
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ returnTo: location.pathname + location.search + location.hash }} replace />
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
  const authError = useAuthStore((s) => s.authError)
  const initAuth = useAuthStore((s) => s.initAuth)
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
  if (authError) {
    return <div role="alert" className="request-feedback">بررسی ورود موقتاً در دسترس نیست.<button type="button" onClick={initAuth}>تلاش مجدد</button></div>
  }
  return children
}

function App() {
  const { initAuth } = useAuthStore()
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initAuth()
    initTheme()
    return subscribeSessionChange(initAuth)
  }, [initAuth, initTheme])

  return (
      <BrowserRouter>
        <MigrationBoundary />
        <RouteTitle />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<MigrationRedirect />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:id" element={<ArticleDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="shop" element={<MigrationRedirect />} />
            <Route path="shop/:id" element={<MigrationRedirect />} />
            <Route path="track" element={<MigrationRedirect />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<MigrationRedirect />} />
          <Route path="/register" element={<MigrationRedirect />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <AuthGate><ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute></AuthGate>
          }>
            <Route index element={<MigrationRedirect />} />
            <Route path="profile" element={<MigrationRedirect />} />
            <Route path="trips" element={<MigrationRedirect />} />
            <Route path="trips/register" element={<MigrationRedirect />} />
            <Route path="wallet" element={<MigrationRedirect />} />
            <Route path="orders" element={<MigrationRedirect />} />
            <Route path="tickets" element={<MigrationRedirect />} />
            <Route path="gallery" element={<MigrationRedirect />} />
            <Route path="articles" element={<MigrationRedirect />} />
            <Route path="financial-report" element={<MigrationRedirect />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AuthGate><ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute></AuthGate>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="gallery" element={<AdminGalleryModeration />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="contributions" element={<AdminContributions />} />
            <Route path="refunds" element={<AdminRefunds />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
