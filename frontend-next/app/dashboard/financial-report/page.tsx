import FinancialReport from '@/components/dashboard/financial-report'
import { financialReport } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'گزارش مالی' }

function validDate(value: unknown) {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value))
    ? value
    : ''
}

export default async function FinancialReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  await requireServerUser('/dashboard/financial-report')
  const [data, params] = await Promise.all([
    privateRequest('/financial/report/', financialReport.parse).catch(() => null),
    searchParams,
  ])
  const from = validDate(params.from)
  const to = validDate(params.to)
  const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' })
  const inRange = ({ created_at }: { created_at: string }) => {
    if (!from && !to) return true
    const timestamp = Date.parse(created_at)
    if (!Number.isFinite(timestamp)) return false
    const date = dateFormat.format(timestamp)
    return (!from || date >= from) && (!to || date <= to)
  }
  return (
    <section className="db-page">
      <h1 className="section-title">گزارش مالی</h1>
      {!data ? (
        <p role="status">
          دریافت گزارش انجام نشد. <a href="/dashboard/financial-report">تلاش مجدد</a>
        </p>
      ) : (
        <>
          <form
            action="/dashboard/financial-report"
            className="request-feedback"
            aria-label="فیلتر تراکنش‌ها"
          >
            <label>
              از تاریخ <input name="from" type="date" defaultValue={from} />
            </label>
            <label>
              تا تاریخ <input name="to" type="date" defaultValue={to} />
            </label>
            <button type="submit">اعمال فیلتر</button>
            {(from || to) && <a href="/dashboard/financial-report">پاک کردن فیلتر</a>}
            <p>فیلتر تاریخ فقط روی فهرست تراکنش‌ها اعمال می‌شود.</p>
          </form>
          <FinancialReport
            data={{
              ...data,
              wallet_transactions: data.wallet_transactions.filter(inRange),
              direct_payments: data.direct_payments.filter(inRange),
              contribution_payments: data.contribution_payments.filter(inRange),
            }}
          />
        </>
      )}
    </section>
  )
}
