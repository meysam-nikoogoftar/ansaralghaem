'use client'
import { usePathname } from 'next/navigation'
import AppLink from '@/components/navigation/app-link'
import { useSession } from '@/components/auth/session-provider'
import { Icon, type IconName } from './icon'
export default function BottomNav() {
  const path = usePathname()
  const { status } = useSession()
  const items: { key: IconName; label: string; href: string }[] = [
    { key: 'home', label: 'خانه', href: '/' },
    { key: 'news', label: 'اخبار', href: '/news' },
    { key: 'gallery', label: 'گالری', href: '/gallery' },
    { key: 'shop', label: 'فروشگاه', href: '/shop' },
    { key: 'user', label: 'پنل', href: status === 'authenticated' ? '/dashboard' : '/login' },
  ]
  return (
    <nav className="bottom-nav" aria-label="دسترسی سریع">
      <div className="bottom-nav-inner">
        {items.map((item) => (
          <AppLink
            key={item.key}
            href={item.href}
            className={`bottom-nav-item${path === item.href ? ' active' : ''}`}
            aria-current={path === item.href ? 'page' : undefined}
          >
            <Icon name={item.key} />
            <span>{item.label}</span>
          </AppLink>
        ))}
      </div>
    </nav>
  )
}
