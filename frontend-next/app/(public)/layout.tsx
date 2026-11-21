import type { ReactNode } from 'react'
import { connection } from 'next/server'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import BottomNav from '@/components/layout/bottom-nav'
import AnnouncementBar from '@/components/layout/announcement-bar'
import { getAnnouncements } from '@/lib/api/public'
import '@/styles/news.css'
import '@/styles/news-detail.css'
import '@/styles/articles.css'
import '@/styles/article-detail.css'
import '@/styles/gallery.css'
import '@/styles/commerce.css'

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Runtime SSR keeps CI builds independent of a running Django/database.
  // Explicitly cached public fetches still retain their revalidation policy.
  await connection()
  const announcements = await getAnnouncements()
  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">
        رفتن به محتوا
      </a>
      <AnnouncementBar announcements={announcements} />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  )
}
