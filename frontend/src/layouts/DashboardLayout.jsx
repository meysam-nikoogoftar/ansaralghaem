import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardHeader from '../components/DashboardHeader'

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 mr-64 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout