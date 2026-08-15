import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'

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

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  return (
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
      </Routes>
    </BrowserRouter>
  )
}

export default App