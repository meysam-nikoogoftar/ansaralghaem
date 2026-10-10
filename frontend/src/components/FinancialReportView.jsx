const typeLabel = { charge: 'شارژ کیف پول', withdraw: 'برداشت', trip_payment: 'پرداخت سفر', refund: 'عودت وجه' }
const typeColor = { charge: '#4bd6ac', withdraw: '#ff6b7d', trip_payment: '#7fb7ff', refund: '#d8b568' }
const statusLabel = { success: 'موفق', failed: 'ناموفق', pending: 'در انتظار' }
const statusColor = { success: 'var(--status-ok)', failed: 'var(--status-danger)', pending: 'var(--status-warn)' }

function FinancialReportView({ data, isLoading }) {
  if (isLoading) return <div className="fr-loading">در حال بارگذاری گزارش مالی...</div>
  if (!data) return null

  const { summary, wallet_transactions, direct_payments, contribution_payments } = data

  const cards = [
    { label: 'موجودی فعلی کیف پول', value: summary.wallet_balance, color: 'var(--teal-glow)' },
    { label: 'مجموع شارژ کیف پول', value: summary.total_charged, color: 'var(--status-ok)' },
    { label: 'مجموع پرداخت از کیف پول', value: summary.total_wallet_spent, color: 'var(--status-info)' },
    { label: 'مجموع پرداخت مستقیم', value: summary.total_direct_paid, color: 'var(--status-info)' },
    { label: 'مجموع عودت وجه', value: summary.total_refunded, color: 'var(--gold-light)' },
    { label: 'مجموع مشارکت مالی', value: summary.total_contributed, color: 'var(--gold-light)' },
  ]

  return (
    <div className="fr-wrap">
      <div className="fr-cards">
        {cards.map((c, i) => (
          <div key={i} className="fr-card">
            <p>{c.label}</p>
            <strong style={{ color: c.color }}>{c.value.toLocaleString('fa-IR')} تومان</strong>
          </div>
        ))}
      </div>

      <div className="fr-section">
        <h3>تراکنش‌های کیف پول</h3>
        {wallet_transactions.length === 0 ? (
          <p className="fr-empty">تراکنشی ثبت نشده</p>
        ) : (
          <div className="fr-list">
            {wallet_transactions.map(t => (
              <div key={t.id} className="fr-row">
                <div>
                  <p className="fr-row-title">{typeLabel[t.transaction_type] || t.transaction_type}</p>
                  {t.description && <p className="fr-row-desc">{t.description}</p>}
                </div>
                <div className="fr-row-left">
                  <strong style={{ color: typeColor[t.transaction_type] }}>{t.amount.toLocaleString('fa-IR')} ت</strong>
                  <span className="fr-status" style={{ color: statusColor[t.status] }}>{statusLabel[t.status] || t.status}</span>
                  <span className="fr-date">{new Date(t.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fr-section">
        <h3>پرداخت‌های مستقیم سفر</h3>
        {direct_payments.length === 0 ? (
          <p className="fr-empty">پرداخت مستقیمی ثبت نشده</p>
        ) : (
          <div className="fr-list">
            {direct_payments.map(p => (
              <div key={p.id} className="fr-row">
                <p className="fr-row-title">{p.trip_title}</p>
                <div className="fr-row-left">
                  <strong style={{ color: 'var(--status-info)' }}>{p.amount.toLocaleString('fa-IR')} ت</strong>
                  <span className="fr-date">{new Date(p.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fr-section">
        <h3>مشارکت‌های مالی</h3>
        {contribution_payments.length === 0 ? (
          <p className="fr-empty">مشارکتی ثبت نشده</p>
        ) : (
          <div className="fr-list">
            {contribution_payments.map(p => (
              <div key={p.id} className="fr-row">
                <p className="fr-row-title">{p.contribution_title}</p>
                <div className="fr-row-left">
                  <strong style={{ color: 'var(--gold-light)' }}>{p.amount.toLocaleString('fa-IR')} ت</strong>
                  <span className="fr-date">{new Date(p.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .fr-loading { text-align: center; padding: 40px 0; color: var(--ink-dim); font-size: 13px; }
        .fr-wrap { display: flex; flex-direction: column; gap: 22px; }

        .fr-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
        .fr-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px; }
        .fr-card p { color: var(--ink-faint); font-size: 11.5px; margin-bottom: 8px; }
        .fr-card strong { font-size: 16px; }

        .fr-section h3 { font-family: var(--font-display); color: var(--teal-glow); font-size: 15px; margin-bottom: 12px; }
        .fr-empty { color: var(--ink-faint); font-size: 12.5px; padding: 10px 0; }

        .fr-list { display: flex; flex-direction: column; gap: 8px; }
        .fr-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-sm); padding: 11px 15px;
        }
        .fr-row-title { color: var(--ink); font-size: 13px; font-weight: 600; }
        .fr-row-desc { color: var(--ink-faint); font-size: 11px; margin-top: 3px; }
        .fr-row-left { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
        .fr-status { font-size: 11px; }
        .fr-date { color: var(--ink-faint); font-size: 11px; }
      `}</style>
    </div>
  )
}

export default FinancialReportView