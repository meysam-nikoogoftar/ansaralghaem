import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard/orders': 'سفارش‌های من',
  '/': 'صفحه اصلی', '/login': 'ورود', '/register': 'ثبت‌نام', '/news': 'اخبار', '/articles': 'دلنوشته‌ها', '/gallery': 'گالری', '/shop': 'فروشگاه', '/track': 'پیگیری ثبت‌نام',
  '/dashboard': 'پنل کاربری', '/dashboard/profile': 'پروفایل من', '/dashboard/trips': 'سفرهای من', '/dashboard/trips/register': 'ثبت‌نام سفر', '/dashboard/wallet': 'کیف پول', '/dashboard/tickets': 'تیکت‌ها', '/dashboard/gallery': 'گالری من', '/dashboard/articles': 'دلنوشته‌های من', '/dashboard/financial-report': 'گزارش مالی من',
  '/admin': 'داشبورد مدیریت', '/admin/users': 'مدیریت کاربران', '/admin/trips': 'مدیریت سفرها', '/admin/registrations': 'ثبت‌نام‌ها', '/admin/articles': 'مدیریت دلنوشته‌ها', '/admin/gallery': 'مدیریت گالری', '/admin/news': 'مدیریت اخبار', '/admin/expenses': 'ریزهزینه‌ها', '/admin/contributions': 'مشارکت‌های مالی', '/admin/refunds': 'عودت وجه',
}

export default function RouteTitle() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const title = titles[pathname] || (/^\/news\//.test(pathname) ? 'جزئیات خبر' : /^\/articles\//.test(pathname) ? 'دلنوشته' : /^\/shop\//.test(pathname) ? 'جزئیات محصول' : /^\/admin\/users\//.test(pathname) ? 'جزئیات کاربر' : 'صفحه پیدا نشد')
    document.title = `${title} | هیئت انصار القائم (عج)`
  }, [pathname])
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, behavior: 'instant' }); return }
    let id
    try { id = decodeURIComponent(hash.slice(1)) } catch { return }
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  return null
}
