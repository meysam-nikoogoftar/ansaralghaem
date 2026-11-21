import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AdminShell from '@/components/admin/admin-shell'
import { requireServerUser } from '@/lib/server/session'
import '@/styles/dashboard.css'
import '@/styles/admin.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'پنل مدیریت',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireServerUser('/admin', true)
  return <AdminShell>{children}</AdminShell>
}
