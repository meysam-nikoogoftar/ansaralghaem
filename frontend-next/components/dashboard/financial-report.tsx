import '@/styles/dashboard/financial-report.css'
import type { FinancialReport } from '@/lib/dashboard/detail-contracts'
const typeLabel: Record<string, string> = {
  charge: 'شارژ کیف پول',
  withdraw: 'برداشت',
  trip_payment: 'پرداخت سفر',
  refund: 'عودت وجه',
}
const typeColor: Record<string, string> = {
  charge: 'var(--status-ok)',
  withdraw: 'var(--status-danger)',
  trip_payment: 'var(--status-info)',
  refund: 'var(--status-warn)',
}
const statusLabel: Record<string, string> = {
  success: 'موفق',
  failed: 'ناموفق',
  pending: 'در انتظار',
}
const statusColor: Record<string, string> = {
  success: 'var(--status-ok)',
  failed: 'var(--status-danger)',
  pending: 'var(--status-warn)',
}

function FinancialReportView({ data }: { data: FinancialReport }) {
  const { summary, wallet_transactions, direct_payments, contribution_payments } = data

  const cards = [
    { label: 'موجودی فعلی کیف پول', value: summary.wallet_balance, color: 'var(--teal-glow)' },
    { label: 'مجموع شارژ کیف پول', value: summary.total_charged, color: 'var(--status-ok)' },
    {
      label: 'مجموع پرداخت از کیف پول',
      value: summary.total_wallet_spent,
      color: 'var(--status-info)',
    },
    { label: 'مجموع پرداخت مستقیم', value: summary.total_direct_paid, color: 'var(--status-info)' },
    { label: 'مجموع عودت وجه', value: summary.total_refunded, color: 'var(--gold-light)' },
    { label: 'مجموع مشارکت مالی', value: summary.total_contributed, color: 'var(--gold-light)' },
  ]
  const paymentGroups = [
    {
      label: 'پرداخت سفر از کیف پول',
      value: Number(summary.total_wallet_spent || 0),
      color: 'var(--teal-glow)',
    },
    {
      label: 'پرداخت مستقیم سفر',
      value: Number(summary.total_direct_paid || 0),
      color: 'var(--status-info)',
    },
    {
      label: 'مشارکت مالی',
      value: Number(summary.total_contributed || 0),
      color: 'var(--gold-light)',
    },
  ]
  const largestPayment = Math.max(1, ...paymentGroups.map((group) => group.value))

  return (
    <div className="fr-wrap">
      <div className="fr-cards">
        {cards.map((c, i) => (
          <div key={i} className={`fr-card${i === 0 ? ' fr-balance' : ''}`}>
            {i === 0 && (
              <svg
                className="fr-wallet-symbol"
                aria-hidden="true"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14V8H6a2 2 0 0 1 0-4" />
                <path d="M20 12h-5v5h5" />
              </svg>
            )}
            <p>{c.label}</p>
            <strong style={{ color: c.color }}>
              {Number(c.value || 0).toLocaleString('fa-IR')} تومان
            </strong>
            {i === 0 && <span className="fr-balance-caption">مانده اعتبار در کیف پول شما</span>}
          </div>
        ))}
      </div>

      <div className="fr-comparison">
        <div className="fr-comparison-intro">
          <h2>پرداخت‌ها در یک نگاه</h2>
          <p>مقایسه مبالغ ثبت‌شده در هر مسیر پرداخت.</p>
          <span>طول نوارها نسبت به بزرگ‌ترین مبلغ است.</span>
        </div>
        <div className="fr-bars">
          {paymentGroups.map((group) => (
            <div className="fr-bar-item" key={group.label}>
              <div>
                <span>{group.label}</span>
                <strong>{group.value.toLocaleString('fa-IR')} تومان</strong>
              </div>
              <div className="fr-bar-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(0, (group.value / largestPayment) * 100)}%`,
                    background: group.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fr-section">
        <h2>
          تراکنش‌های کیف پول{' '}
          <span>{wallet_transactions.length.toLocaleString('fa-IR')} تراکنش</span>
        </h2>
        {wallet_transactions.length === 0 ? (
          <p className="fr-empty">تراکنشی ثبت نشده</p>
        ) : (
          <div className="fr-list">
            {wallet_transactions.map((t) => (
              <div key={t.id} className="fr-row">
                <div>
                  <p className="fr-row-title">
                    {typeLabel[t.transaction_type] || t.transaction_type}
                  </p>
                  {t.description && <p className="fr-row-desc">{t.description}</p>}
                </div>
                <div className="fr-row-left">
                  <strong style={{ color: typeColor[t.transaction_type] }}>
                    {Number(t.amount).toLocaleString('fa-IR')} تومان
                  </strong>
                  <span className="fr-status" style={{ color: statusColor[t.status] }}>
                    {statusLabel[t.status] || t.status}
                  </span>
                  <span className="fr-date">
                    {new Date(t.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fr-section">
        <h2>پرداخت‌های مستقیم سفر</h2>
        {direct_payments.length === 0 ? (
          <p className="fr-empty">پرداخت مستقیمی ثبت نشده</p>
        ) : (
          <div className="fr-list">
            {direct_payments.map((p) => (
              <div key={p.id} className="fr-row">
                <p className="fr-row-title">{p.trip_title}</p>
                <div className="fr-row-left">
                  <strong style={{ color: 'var(--status-info)' }}>
                    {Number(p.amount).toLocaleString('fa-IR')} تومان
                  </strong>
                  <span className="fr-date">
                    {new Date(p.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fr-section">
        <h2>مشارکت‌های مالی</h2>
        {contribution_payments.length === 0 ? (
          <p className="fr-empty">مشارکتی ثبت نشده</p>
        ) : (
          <div className="fr-list">
            {contribution_payments.map((p) => (
              <div key={p.id} className="fr-row">
                <p className="fr-row-title">{p.contribution_title}</p>
                <div className="fr-row-left">
                  <strong style={{ color: 'var(--gold-light)' }}>
                    {Number(p.amount).toLocaleString('fa-IR')} تومان
                  </strong>
                  <span className="fr-date">
                    {new Date(p.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FinancialReportView
