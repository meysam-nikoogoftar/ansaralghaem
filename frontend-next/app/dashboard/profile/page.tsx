import ProfileForm from '@/components/dashboard/profile'
import { profile } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'ویرایش پروفایل' }

export default async function ProfilePage() {
  await requireServerUser('/dashboard/profile')
  const user = await privateRequest('/accounts/profile/', profile.parse).catch(() => null)
  return user ? (
    <ProfileForm initialUser={user} />
  ) : (
    <p role="status">
      دریافت پروفایل انجام نشد. <a href="/dashboard/profile">تلاش مجدد</a>
    </p>
  )
}
