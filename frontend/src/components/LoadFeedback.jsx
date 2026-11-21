export default function LoadFeedback({ state, onRetry }) {
  if (state.errors.length) return <div className="request-feedback" role="alert">
    <span>{state.errors.includes(403) ? 'دسترسی به این اطلاعات برای حساب شما مجاز نیست.' : state.errors.includes(404) ? 'اطلاعات درخواستی پیدا نشد.' : 'دریافت بخشی از اطلاعات انجام نشد. اطلاعات قبلی حفظ شده است.'}</span>
    <button type="button" onClick={onRetry} disabled={state.pending > 0}>تلاش مجدد</button>
  </div>
  return <span className="sr-only" role="status" data-loading={state.pending > 0 || !state.started}>{state.pending > 0 ? 'در حال دریافت اطلاعات…' : state.started ? 'اطلاعات به‌روزرسانی شد.' : ''}</span>
}
