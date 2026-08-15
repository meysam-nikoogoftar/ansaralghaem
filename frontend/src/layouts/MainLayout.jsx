import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Announcement from '../components/Announcement'

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Announcement />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout