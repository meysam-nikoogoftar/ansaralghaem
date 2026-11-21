export function LoadFeedback({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="request-feedback" role={message ? 'alert' : 'status'}>
      {message || 'در حال بارگذاری…'}
      {onRetry && <button onClick={onRetry}>تلاش مجدد</button>}
    </div>
  )
}
