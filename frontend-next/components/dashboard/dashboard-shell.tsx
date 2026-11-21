'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import AccountMenu from '@/components/layout/account-menu'
import { Icon } from '@/components/layout/icon'
import AppLink from '@/components/navigation/app-link'
import ThemeToggle from '@/components/theme/theme-toggle'
import DashboardMobileMenu from './dashboard-mobile-menu'

const links = [
  ['/dashboard', 'داشبورد', 'home'],
  ['/dashboard/profile', 'پروفایل من', 'user'],
  ['/dashboard/trips', 'سفرهای من', 'plane'],
  ['/dashboard/trips/register', 'ثبت‌نام سفر', 'edit'],
  ['/dashboard/wallet', 'کیف پول', 'wallet'],
  ['/dashboard/orders', 'سفارش‌های من', 'shop'],
  ['/dashboard/financial-report', 'گزارش مالی', 'report'],
  ['/dashboard/tickets', 'تیکت‌ها', 'ticket'],
  ['/dashboard/gallery', 'گالری من', 'gallery'],
  ['/dashboard/articles', 'دلنوشته‌های من', 'book'],
] as const

function DashboardNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="dashboard-navigation" aria-label="بخش‌های حساب کاربری">
      {links.map(([href, label, icon]) => (
        <AppLink
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          onClick={onNavigate}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </AppLink>
      ))}
    </nav>
  )
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="member-dashboard">
      <a className="skip-link" href="#main-content">
        رفتن به محتوا
      </a>
      <header className="dashboard-header">
        <AppLink href="/" className="dashboard-brand" aria-label="صفحهٔ اصلی هیئت انصار القائم">
          <Image src="/brand-logo.png" width={38} height={38} alt="" />
          <span>هیئت انصار القائم (عج)</span>
        </AppLink>
        <div className="dashboard-header-actions">
          <ThemeToggle />
          <AccountMenu />
          <DashboardMobileMenu title="منوی داشبورد">
            {(close) => <DashboardNavigation pathname={pathname} onNavigate={close} />}
          </DashboardMobileMenu>
        </div>
      </header>
      <div className="dashboard-workspace">
        <aside className="dashboard-sidebar">
          <DashboardNavigation pathname={pathname} />
          <figure className="dashboard-sidebar-quote">
            <blockquote lang="ar">فَإِنِّي لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ</blockquote>
            <figcaption>امام حسین (ع)</figcaption>
          </figure>
        </aside>
        <main id="main-content" className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}
