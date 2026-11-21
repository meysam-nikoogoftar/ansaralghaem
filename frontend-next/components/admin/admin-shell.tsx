'use client'

import { useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import DashboardMobileMenu from '@/components/dashboard/dashboard-mobile-menu'
import AccountMenu from '@/components/layout/account-menu'
import { Icon, type IconName } from '@/components/layout/icon'
import AppLink from '@/components/navigation/app-link'
import ThemeToggle from '@/components/theme/theme-toggle'
import { loginHref } from '@/lib/navigation'
import type { User } from '@/types'

type Permission = Extract<keyof User, `perm_${string}`>
type MenuItem = { href: string; label: string; icon: IconName; permission?: Permission }
const sections: MenuItem[] = [
  { href: '/admin', label: 'داشبورد', icon: 'grid' },
  { href: '/admin/users', label: 'کاربران', icon: 'user', permission: 'perm_users' },
  { href: '/admin/trips', label: 'سفرها', icon: 'plane', permission: 'perm_trips' },
  {
    href: '/admin/registrations',
    label: 'ثبت‌نام‌ها',
    icon: 'edit',
    permission: 'perm_registrations',
  },
  { href: '/admin/articles', label: 'دلنوشته‌ها', icon: 'book', permission: 'perm_content' },
  { href: '/admin/gallery', label: 'گالری', icon: 'gallery', permission: 'perm_content' },
  { href: '/admin/news', label: 'اخبار', icon: 'news', permission: 'perm_content' },
  { href: '/admin/expenses', label: 'ریزهزینه‌ها', icon: 'wallet', permission: 'perm_financial' },
  {
    href: '/admin/contributions',
    label: 'مشارکت مالی',
    icon: 'heart',
    permission: 'perm_financial',
  },
  { href: '/admin/refunds', label: 'عودت وجه', icon: 'refresh', permission: 'perm_financial' },
]

export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, status, retry } = useSession()
  const pathname = usePathname().replace(/\/$/, '')
  const isAdmin = user?.user_type === 'admin' || user?.user_type === 'superadmin'

  useEffect(() => {
    if (status === 'anonymous') {
      const { pathname, search, hash } = window.location
      window.location.replace(loginHref(pathname + search + hash))
    } else if (status === 'authenticated' && !isAdmin) {
      window.location.replace('/dashboard')
    }
  }, [isAdmin, status])

  if (status === 'error') {
    return (
      <div className="request-feedback" role="alert">
        بررسی ورود موقتاً در دسترس نیست.
        <button type="button" onClick={retry}>
          تلاش مجدد
        </button>
      </div>
    )
  }
  if (!isAdmin) return null

  const allowed = ({ permission }: MenuItem) =>
    !permission || user.user_type === 'superadmin' || user[permission] === true
  const current = sections.find(
    ({ href }) => pathname === href || (href !== '/admin' && pathname.startsWith(href + '/')),
  )
  const navigation = (onNavigate?: () => void) => (
    <nav className="dashboard-navigation" aria-label="بخش‌های مدیریت">
      {sections.filter(allowed).map((section) => (
        <AppLink
          key={section.href}
          href={section.href}
          aria-current={current === section ? 'page' : undefined}
          onClick={onNavigate}
        >
          <Icon name={section.icon} />
          <span>{section.label}</span>
        </AppLink>
      ))}
    </nav>
  )

  return (
    <div className="member-dashboard admin-dashboard">
      <a className="skip-link" href="#main-content">
        رفتن به محتوا
      </a>
      <header className="dashboard-header">
        <AppLink href="/" className="dashboard-brand" aria-label="بازگشت به سایت هیئت انصار القائم">
          <Image src="/brand-logo.png" width={38} height={38} alt="" />
          <span>پنل مدیریت</span>
        </AppLink>
        <div className="dashboard-header-actions">
          <ThemeToggle />
          <AccountMenu />
          <DashboardMobileMenu title="منوی مدیریت">{navigation}</DashboardMobileMenu>
        </div>
      </header>
      <div className="dashboard-workspace">
        <aside className="dashboard-sidebar">{navigation()}</aside>
        <main id="main-content" className="dashboard-main">
          {current && !allowed(current) ? (
            <p className="request-feedback" role="alert">
              دسترسی به این بخش برای حساب شما مجاز نیست.
            </p>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
