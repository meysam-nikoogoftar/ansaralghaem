'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { errorMessage, fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '@/lib/admin/api'

const refundStatusMeta = {
  pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید و واریز شد', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminRefunds() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [refunds, setRefunds] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const pendingAction = useRef(false)
  const [busyId, setBusyId] = useState(null)
  const [amountOverride, setAmountOverride] = useState({})

  const fetchRefunds = useCallback(() => {
    observeLoad(() => api.get('/trips/admin/refunds/').then(setRefunds), "'/trips/admin/refunds/'")
  }, [observeLoad])

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  const handleAction = async (refund, action) => {
    if (pendingAction.current || refund.refund_status !== 'pending') return
    if (action === 'reject' && !window.confirm('این درخواست عودت وجه رد بشه؟')) return
    pendingAction.current = true
    setBusyId(refund.id)
    setValidationErrors({})
    try {
      const amount = amountOverride[refund.id]
      const payload = action === 'approve' && amount ? { action, amount } : { action }
      const updated = await api.post(`/trips/admin/refunds/${refund.id}/action/`, payload)
      setRefunds((current) => current.map((item) => (item.id === refund.id ? updated : item)))
    } catch (error) {
      setValidationErrors(fieldErrors(error))
      alert(errorMessage(error, 'ثبت نتیجهٔ عودت وجه انجام نشد.'))
    } finally {
      pendingAction.current = false
      setBusyId(null)
    }
  }

  const pendingCount = refunds.filter((r) => r.refund_status === 'pending').length

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="arf-page">
            <div className="arf-head">
              <h1>عودت وجه کیف پول</h1>
              {pendingCount > 0 && (
                <span className="arf-pending-badge">{pendingCount} درخواست در انتظار</span>
              )}
            </div>
            <p className="arf-desc">
              این لیست، انصراف‌های ثبت‌شده در «سفرهای من» است که منتظر تایید و واریز به کیف‌پول
              کاربر هستند.
            </p>

            {isLoading ? (
              <div className="arf-loading">در حال بارگذاری...</div>
            ) : refunds.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && refunds.length === 0 ? null : refunds.length ===
              0 ? (
              <div className="arf-empty">درخواست عودت وجهی وجود ندارد</div>
            ) : (
              <div className="arf-list">
                {refunds.map((r) => (
                  <div key={r.id} className="arf-card">
                    <div className="arf-card-top">
                      <div>
                        <h3>{r.user_name}</h3>
                        <p>
                          {r.trip_detail?.title} · کد پیگیری:{' '}
                          <span className="arf-mono">{r.tracking_code}</span>
                        </p>
                      </div>
                      <span
                        className="arf-badge"
                        style={{
                          color: refundStatusMeta[r.refund_status]?.color,
                          borderColor: refundStatusMeta[r.refund_status]?.color,
                          background: refundStatusMeta[r.refund_status]?.bg,
                        }}
                      >
                        {refundStatusMeta[r.refund_status]?.label || r.refund_status}
                      </span>
                    </div>

                    <div className="arf-meta">
                      <span>
                        مبلغ پرداخت‌شده:{' '}
                        <strong>
                          {(
                            Number(r.paid_from_wallet || 0) + Number(r.paid_directly || 0)
                          ).toLocaleString('fa-IR')}{' '}
                          ت
                        </strong>
                      </span>
                      {r.requested_refund_amount > 0 && (
                        <span>
                          مبلغ درخواستی کاربر:{' '}
                          <strong style={{ color: 'var(--teal-glow)' }}>
                            {r.requested_refund_amount.toLocaleString('fa-IR')} ت
                          </strong>
                        </span>
                      )}
                      <span>
                        مبلغ عودت پیش‌فرض سفر:{' '}
                        <strong>
                          {Number(r.trip_detail?.refund_amount || 0).toLocaleString('fa-IR')} ت
                        </strong>
                      </span>
                    </div>

                    {r.refund_status === 'pending' && (
                      <div className="arf-actions">
                        <FormControl
                          as="input"
                          hiddenLabel
                          label="مبلغ دلخواه (اختیاری)"
                          type="number"
                          name="amount"
                          min={0}
                          step={1}
                          placeholder="مبلغ دلخواه (اختیاری)"
                          className="arf-amount-input"
                          value={amountOverride[r.id] || ''}
                          onChange={(e) =>
                            setAmountOverride({ ...amountOverride, [r.id]: e.target.value })
                          }
                        />
                        <button
                          onClick={() => handleAction(r, 'approve')}
                          disabled={busyId !== null}
                          className="arf-approve-btn"
                        >
                          {busyId === r.id ? '...' : 'تایید و واریز به کیف‌پول'}
                        </button>
                        <button
                          onClick={() => handleAction(r, 'reject')}
                          disabled={busyId !== null}
                          className="arf-reject-btn"
                        >
                          رد درخواست
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminRefunds
