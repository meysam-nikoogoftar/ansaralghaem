import type { Metadata } from 'next'
import AuthCard from '@/components/auth/auth-card'
import RegisterForm from '@/components/auth/register-form'
import { safeReturnTo } from '@/lib/navigation'
import { pageMetadata } from '@/lib/seo'
import { getServerUser } from '@/lib/server/session'
import { redirect } from 'next/navigation'
export const metadata: Metadata = {
  ...pageMetadata('ثبت‌نام', '/register', 'ایجاد حساب کاربری زائرین هیئت انصار القائم (عج)'),
  robots: { index: false, follow: false },
}
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>
}) {
  const returnTo = safeReturnTo((await searchParams).returnTo)
  if (await getServerUser().catch(() => null)) redirect(returnTo)
  return (
    <AuthCard title="ایجاد حساب کاربری زائرین" register>
      <RegisterForm returnTo={returnTo} />
    </AuthCard>
  )
}
