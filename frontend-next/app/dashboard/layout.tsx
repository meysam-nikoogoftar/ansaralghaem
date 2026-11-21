import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import DashboardShell from '@/components/dashboard/dashboard-shell'
import { requireServerUser } from '@/lib/server/session'
import '@/styles/dashboard.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'حساب کاربری',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireServerUser('/dashboard')
  return <DashboardShell>{children}</DashboardShell>
}
