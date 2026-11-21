import Image from 'next/image'
import type { ReactNode } from 'react'
import AppLink from '@/components/navigation/app-link'

export default function AuthCard({
  title,
  register = false,
  children,
}: {
  title: string
  register?: boolean
  children: ReactNode
}) {
  return (
    <main className={`auth-page${register ? ' auth-register' : ''}`}>
      <div className="auth-card">
        <AppLink href="/" className="auth-brand">
          <div className="auth-logo">
            <Image
              src="/brand-logo.png"
              width={72}
              height={72}
              sizes={register ? '48px' : '72px'}
              alt="هیئت انصار القائم"
              preload
            />
          </div>
          <h1>هیئت انصار القائم (عج)</h1>
          <span>{title}</span>
        </AppLink>
        {children}
        <div className="auth-quote" lang="ar">
          فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ
        </div>
      </div>
    </main>
  )
}
