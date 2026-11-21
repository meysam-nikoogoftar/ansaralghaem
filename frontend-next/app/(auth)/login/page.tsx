import type { Metadata } from 'next'
import AuthCard from '@/components/auth/auth-card'
import LoginForm from '@/components/auth/login-form'
import { safeReturnTo } from '@/lib/navigation'
import { pageMetadata } from '@/lib/seo'
import { getServerUser } from '@/lib/server/session'
import { redirect } from 'next/navigation'
export const metadata: Metadata = {
  ...pageMetadata('ورود به حساب', '/login', 'ورود به حساب کاربری هیئت انصار القائم (عج)'),
  robots: { index: false, follow: false },
}
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>
}) {
  const returnTo = safeReturnTo((await searchParams).returnTo)
  if (await getServerUser().catch(() => null)) redirect(returnTo)
  return (
    <AuthCard title="ورود به پنل زائرین">
      <LoginForm returnTo={returnTo} />
    </AuthCard>
  )
}
