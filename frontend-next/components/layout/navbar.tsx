'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import AppLink from '@/components/navigation/app-link'
import ThemeToggle from '@/components/theme/theme-toggle'
import { useSession } from '@/components/auth/session-provider'
import { Icon } from './icon'
import AccountMenu from './account-menu'

const items = [
  { href: '/', label: 'صفحه اصلی' },
  { href: '/news', label: 'اخبار' },
  { href: '/articles', label: 'دلنوشته‌ها' },
  { href: '/gallery', label: 'گالری' },
  { href: '/shop', label: 'فروشگاه' },
  { href: '/track', label: 'پیگیری ثبت‌نام' },
]
export default function Navbar() {
  const pathname = usePathname()
  const { status, logout } = useSession()
  const [menu, setMenu] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menu) return
    panel.current?.querySelector('a')?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [menu])
  const links = items.map((item) => (
    <AppLink
      key={item.href}
      href={item.href}
      aria-current={pathname === item.href ? 'page' : undefined}
      className={pathname === item.href ? 'active' : undefined}
      onClick={() => setMenu(false)}
    >
      {item.label}
    </AppLink>
  ))
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button
          ref={trigger}
          className="mobile-menu-btn"
          aria-label={menu ? 'بستن منو' : 'باز کردن منو'}
          aria-expanded={menu}
          aria-controls="public-mobile-menu"
          onClick={() => setMenu(!menu)}
        >
          <Icon name={menu ? 'close' : 'menu'} />
        </button>
        <AppLink href="/" className="brand">
          <div className="brand-logo">
            <Image src="/brand-logo.png" width={56} height={56} alt="هیئت انصار القائم" />
          </div>
          <div className="brand-text">
            <strong className="brand-title">هیئت انصار القائم (عج)</strong>
            <span>هیئت دانشجویی</span>
          </div>
        </AppLink>
        <nav className="nav-links" aria-label="صفحات سایت">
          {links}
        </nav>
        <div className="header-theme-mobile">
          <ThemeToggle />
        </div>
        <div className="nav-cta">
          <ThemeToggle />
          {status === 'authenticated' ? (
            <AccountMenu />
          ) : status === 'checking' ? (
            <span className="field-hint" role="status">
              بررسی ورود…
            </span>
          ) : (
            <AppLink href="/login" className="header-auth-button">
              <Icon name="user" />
              <span>ورود / ثبت‌نام</span>
            </AppLink>
          )}
        </div>
      </div>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={`public-menu-backdrop${menu ? ' is-open' : ''}`}
        onClick={() => setMenu(false)}
      />
      <div
        ref={panel}
        id="public-mobile-menu"
        className={`public-mobile-menu${menu ? ' is-open' : ''}`}
        inert={!menu}
        aria-hidden={!menu}
      >
        {links}
        <div className="mobile-menu-auth">
          {status === 'authenticated' ? (
            <button className="mobile-menu-logout" onClick={logout}>
              خروج از حساب
            </button>
            ) : status !== 'checking' ? (
            <>
              <AppLink href="/login" className="mobile-auth-login">
                ورود
              </AppLink>
              <AppLink href="/register" className="mobile-auth-register">
                ثبت‌نام
              </AppLink>
            </>
          ) : (
            <span role="status">بررسی ورود…</span>
          )}
        </div>
      </div>
    </header>
  )
}
