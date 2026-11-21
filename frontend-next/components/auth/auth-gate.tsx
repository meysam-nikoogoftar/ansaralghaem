'use client'
import { useEffect, type ReactNode } from 'react'
import { useSession } from './session-provider'
import { requireLogin } from '@/lib/api/browser'

export function AuthGate({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, status, retry } = useSession()
  const allowed = !admin || user?.user_type === 'admin' || user?.user_type === 'superadmin'
  useEffect(() => {
    if (status === 'anonymous') requireLogin()
    if (status === 'authenticated' && !allowed) window.location.replace('/dashboard')
  }, [status, allowed])
  if (status === 'error')
    return (
      <div role="alert" className="request-feedback">
        بررسی ورود انجام نشد. <button onClick={() => void retry()}>تلاش مجدد</button>
      </div>
    )
  if (status !== 'authenticated' || !allowed) return <p role="status">در حال بررسی ورود…</p>
  return children
}
