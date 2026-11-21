import AppLink from '@/components/navigation/app-link'

export default function AdminNotFound() {
  return (
    <div className="request-feedback">
      صفحهٔ موردنظر پیدا نشد.
      <AppLink href="/admin">بازگشت به داشبورد مدیریت</AppLink>
    </div>
  )
}
