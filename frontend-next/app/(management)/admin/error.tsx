'use client'

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="request-feedback" role="alert">
      این بخش موقتاً در دسترس نیست.
      <button type="button" onClick={reset}>
        تلاش مجدد
      </button>
    </div>
  )
}
