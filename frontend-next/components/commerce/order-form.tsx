'use client'
import { useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { useSession } from '@/components/auth/session-provider'
import { browserRequest } from '@/lib/api/browser'
import { loginHref } from '@/lib/navigation'
import type { Product } from '@/lib/commerce-contracts'
export default function OrderForm({ product }: { product: Product }) {
  const { status } = useSession()
  const lock = useRef(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [complete, setComplete] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current || complete) return
    const data = new FormData(event.currentTarget)
    lock.current = true
    setPending(true)
    setMessage('')
    try {
      const receipt = await browserRequest(
        '/shop/orders/create/',
        z.object({ order_number: z.string() }).parse,
        {
          method: 'POST',
          authenticated: true,
          body: {
            product: product.id,
            quantity: Number(data.get('quantity')),
            address: data.get('address'),
            postal_code: data.get('postal_code'),
          },
        },
      )
      setComplete(true)
      setMessage(`سفارش با موفقیت ثبت شد: ${receipt.order_number}`)
    } catch {
      setMessage(
        'ثبت سفارش انجام نشد. موجودی و اطلاعات را بررسی کنید؛ در صورت قطع ارتباط، ابتدا سفارش‌های من را بررسی کنید.',
      )
    } finally {
      lock.current = false
      setPending(false)
    }
  }
  if (status !== 'authenticated')
    return <a href={loginHref(`/shop/${product.id}`)}>برای خرید وارد حساب شوید</a>
  return (
    <form onSubmit={submit} className="pd-order-form">
      <label className="pd-field">
        تعداد
        <input
          className="pd-input"
          name="quantity"
          type="number"
          min={1}
          max={product.stock}
          defaultValue={1}
          required
        />
      </label>
      <label className="pd-field">
        آدرس تحویل
        <textarea className="pd-input" name="address" autoComplete="street-address" maxLength={2000} required />
      </label>
      <label className="pd-field">
        کد پستی
        <input
          className="pd-input"
          name="postal_code"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
          autoComplete="postal-code"
          required
        />
      </label>
      <button className="pd-submit" disabled={pending || complete}>
        {pending ? 'در حال ثبت…' : 'ثبت سفارش'}
      </button>
      <p role="status">{message}</p>
      <a href="/dashboard/orders">سفارش‌های من</a>
    </form>
  )
}

