'use client'
export default function AuthFeedback({
  checking,
  sessionError,
  onRetry,
}: {
  checking: boolean
  sessionError: boolean
  onRetry: () => Promise<void>
}) {
  return (
    <div className="auth-feedback">
      {checking && (
        <p className="field-hint" role="status">
          در حال بررسی ورود…
        </p>
      )}
      {sessionError && (
        <div className="auth-message" role="status">
          بررسی نشست قبلی انجام نشد.{' '}
          <button type="button" onClick={() => void onRetry()}>
            تلاش مجدد
          </button>
        </div>
      )}
      <noscript>
        <p className="auth-message">برای ورود و ثبت‌نام، JavaScript مرورگر را فعال کنید.</p>
      </noscript>
    </div>
  )
}
