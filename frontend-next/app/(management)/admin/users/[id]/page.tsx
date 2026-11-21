import AdminUserDetail from '@/components/admin/AdminUserDetail'
import { notFound } from 'next/navigation'

export const metadata = { title: 'پرونده کاربر' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound()
  return <AdminUserDetail key={id} id={id} />
}
