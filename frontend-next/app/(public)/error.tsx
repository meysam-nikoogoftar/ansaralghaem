'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const retry = () =>
    startTransition(() => {
      router.refresh()
      reset()
    })
  return (
    <section className="page-status" role="alert">
      <h1>دریافت اطلاعات انجام نشد</h1>
      <p>ارتباط با سرویس موقتاً برقرار نیست. دوباره تلاش کنید.</p>
      <button className="btn" onClick={retry} disabled={pending}>
        تلاش مجدد
      </button>
    </section>
  )
}
