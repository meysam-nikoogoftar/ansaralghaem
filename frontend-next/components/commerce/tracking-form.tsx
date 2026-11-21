'use client'
import { useRef, useState, type FormEvent } from 'react'
import { browserRequest } from '@/lib/api/browser'
import { trackingSchema, type TrackingResult } from '@/lib/commerce-contracts'
const statuses: Record<string, string> = {
  approved: 'تأیید شده',
  pending: 'در دست بررسی',
  rejected: 'رد شده',
  cancelled: 'انصراف داده',
  attended: 'شرکت کرد',
  absent: 'شرکت نکرد',
}
export default function TrackingForm() {
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const lock = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    lock.current = true
    setPending(true)
    setResult(null)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      setResult(
        await browserRequest('/trips/track/', trackingSchema.parse, {
          method: 'POST',
          body: {
            tracking_code: String(data.get('tracking_code')).trim(),
            national_code: data.get('national_code'),
          },
        }),
      )
    } catch {
      setError('نتیجه‌ای دریافت نشد. اطلاعات را بررسی کنید و دوباره تلاش کنید.')
    } finally {
      lock.current = false
      setPending(false)
    }
  }
  return (
    <>
      <form onSubmit={submit} autoComplete="off" className="tg-form">
        <label>
          کد پیگیری
          <input className="tg-input" name="tracking_code" maxLength={30} required />
        </label>
        <label>
          کد ملی
          <input className="tg-input"
            name="national_code"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
        </label>
        <button className="tg-submit" disabled={pending}>
          {pending ? 'در حال جست‌وجو…' : 'پیگیری'}
        </button>
      </form>
      <p role="status">{error}</p>
      {result && (
        <section className="tg-result" aria-live="polite">
          <h2>نتیجه پیگیری</h2>
          <p>{result.user_name}</p>
          <p>{result.trip_detail.title}</p>
          <p>{result.tracking_code}</p>
          <p>{statuses[result.status] || 'بدون وضعیت'}</p>
          <p>
            {result.payment_status === 'paid'
              ? 'پرداخت کامل'
              : result.payment_status === 'partial'
                ? 'پرداخت نیمه‌کامل'
                : 'پرداخت نشده'}
          </p>
        </section>
      )}
    </>
  )
}

