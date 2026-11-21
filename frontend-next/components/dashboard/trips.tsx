'use client'
import { dashboardRequest } from '@/lib/dashboard/browser'
import { FormValidation, FormControl } from './forms'
import { useLoadFeedback, LoadFeedback } from './load-feedback'
import { fieldErrors } from '@/lib/api/errors'
import { dashboardError, discardResponse } from '@/lib/dashboard/browser'
import { listResponse, registration, walletPayment } from '@/lib/dashboard/detail-contracts'
import { dashboardWalletSchema } from '@/lib/dashboard/contracts'
import { useRouter } from 'next/navigation'
import { TripTimeline } from './trip-timeline'
import type { FieldErrors } from '@/types'
import type { Registration } from '@/lib/dashboard/detail-contracts'
import type { DashboardWallet } from '@/lib/dashboard/contracts'
import Link from '@/components/navigation/app-link'
import Dialog from '@/components/ui/dialog'
async function request<T>(path: string, decode: (value: unknown) => T, body?: unknown) {
  return { data: await dashboardRequest(path, decode, body) }
}
import { useCallback, useEffect, useState, useRef } from 'react'
import '@/styles/dashboard/travel-finance.css'

function RefundRequestBox({ trip, onDone }: { trip: Registration; onDone: () => void }) {
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({})

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [fullAmount, setFullAmount] = useState(false)
  const mutationPending = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const totalPaid = Number(trip.paid_from_wallet || 0) + Number(trip.paid_directly || 0)

  const handleFullToggle = () => {
    const next = !fullAmount
    setFullAmount(next)
    setAmount(next ? String(totalPaid) : '')
  }

  const handleSubmit = async () => {
    setValidationErrors({})

    if (mutationPending.current) return
    setMessage('')
    const value = Number(amount)
    if (!Number.isSafeInteger(value) || value <= 0 || value > totalPaid) {
      setMessage('مبلغ نامعتبر است')
      return
    }
    mutationPending.current = true
    setIsSubmitting(true)
    try {
      await request(`/trips/registration/${trip.id}/request-refund/`, discardResponse, {
        amount: value,
      })
      onDone()
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setMessage(dashboardError(err, 'خطا در ثبت درخواست'))
    }
    mutationPending.current = false
    setIsSubmitting(false)
  }

  if (!open) {
    return (
      <FormValidation errors={validationErrors}>
        <button
          onClick={() => setOpen(true)}
          className="mt-action-btn outline"
          style={{ marginTop: 14 }}
        >
          درخواست عودت وجه
        </button>
      </FormValidation>
    )
  }

  return (
    <FormValidation errors={validationErrors}>
      <div className="mt-refund-box">
        <p>
          مبلغ پرداخت‌شده: <strong>{totalPaid.toLocaleString('fa-IR')} تومان</strong>
        </p>
        <label className="mt-refund-checkbox">
          <FormControl
            as="input"
            type="checkbox"
            checked={fullAmount}
            onChange={handleFullToggle}
          />
          <span>کل مبلغ پرداخت‌شده</span>
        </label>
        <FormControl
          as="input"
          hiddenLabel
          label="مبلغ درخواستی برای عودت"
          name="amount"
          type="number"
          min="1"
          max={totalPaid}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setFullAmount(false)
          }}
          readOnly={fullAmount}
          placeholder="مبلغ درخواستی برای عودت"
          className="mt-pay-input"
        />
        <div className="mt-pay-btns">
          <button onClick={handleSubmit} disabled={isSubmitting} className="mt-action-btn primary">
            {isSubmitting ? '...' : 'ثبت درخواست عودت وجه'}
          </button>
          <button onClick={() => setOpen(false)} className="mt-action-btn outline">
            انصراف
          </button>
        </div>
        {message && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-pay-feedback error"
          >
            <span>{message}</span>
          </div>
        )}
      </div>
    </FormValidation>
  )
}

function CancelBox({ trip, onDone }: { trip: Registration; onDone: () => void }) {
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({})

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [fullAmount, setFullAmount] = useState(false)
  const mutationPending = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const totalPaid = Number(trip.paid_from_wallet || 0) + Number(trip.paid_directly || 0)

  const handleFullToggle = () => {
    const next = !fullAmount
    setFullAmount(next)
    setAmount(next ? String(totalPaid) : '')
  }

  const handleConfirm = async () => {
    setValidationErrors({})

    if (mutationPending.current) return
    setMessage('')
    let payload = {}
    if (totalPaid > 0) {
      const value = Number(amount)
      if (!Number.isSafeInteger(value) || value <= 0 || value > totalPaid) {
        setMessage('مبلغ نامعتبر است')
        return
      }
      payload = { amount: value }
    }
    mutationPending.current = true
    setIsSubmitting(true)
    try {
      await request(`/trips/registration/${trip.id}/cancel/`, discardResponse, payload)
      onDone()
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setMessage(dashboardError(err, 'خطا در انصراف'))
    }
    mutationPending.current = false
    setIsSubmitting(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-action-btn danger">
        انصراف از سفر
      </button>
      {open && (
        <Dialog
          className="mt-cancel-overlay"
          label="تأیید انصراف از سفر"
          onClose={() => {
            if (!isSubmitting) setOpen(false)
          }}
        >
          <FormValidation errors={validationErrors}>
            <div className="mt-refund-box">
              <h2>از انصراف سفر مطمئن هستید؟</h2>
              <p>{trip.trip_detail?.title}</p>
              <p>
                با تأیید، درخواست انصراف این ثبت‌نام ارسال می‌شود. اگر قصد ادامه سفر را دارید،
                «ادامه سفر» را انتخاب کنید.
              </p>
              {totalPaid > 0 && (
                <>
                  <p>
                    مبلغ پرداخت‌شده: <strong>{totalPaid.toLocaleString('fa-IR')} تومان</strong>
                  </p>
                  <label className="mt-refund-checkbox">
                    <FormControl
                      as="input"
                      type="checkbox"
                      checked={fullAmount}
                      onChange={handleFullToggle}
                    />
                    <span>کل مبلغ پرداخت‌شده</span>
                  </label>
                  <FormControl
                    as="input"
                    hiddenLabel
                    label="مبلغ درخواستی برای عودت وجه"
                    name="amount"
                    type="number"
                    min="1"
                    max={totalPaid}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setFullAmount(false)
                    }}
                    readOnly={fullAmount}
                    placeholder="مبلغ درخواستی برای عودت وجه"
                    className="mt-pay-input"
                  />
                </>
              )}
              <div className="mt-pay-btns">
                <button
                  disabled={isSubmitting}
                  onClick={() => setOpen(false)}
                  className="mt-action-btn outline"
                >
                  ادامه سفر
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="mt-action-btn danger"
                >
                  {isSubmitting ? '...' : 'تایید انصراف'}
                </button>
              </div>
              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="mt-pay-feedback error"
                >
                  <span>{message}</span>
                </div>
              )}
            </div>
          </FormValidation>
        </Dialog>
      )}
    </>
  )
}

function MyTrips({
  initialItems,
  initialWallet = null,
}: {
  initialItems: Registration[] | null
  initialWallet?: DashboardWallet | null
}) {
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback(initialItems !== null)

  const router = useRouter()
  const [trips, setTrips] = useState<Registration[]>(initialItems ?? [])
  const [isLoading, setIsLoading] = useState(initialItems === null)
  const [wallet, setWallet] = useState<DashboardWallet | null>(initialWallet)
  const [payAmounts, setPayAmounts] = useState<Record<number, string>>({})
  const paymentPending = useRef(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [payFeedback, setPayFeedback] = useState<
    Record<number, { type: string; text: string } | null>
  >({})
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!/^#registration-\d+$/.test(window.location.hash) || !trips.length) return
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(window.location.hash.slice(1))
      target?.scrollIntoView({ block: 'start', behavior: 'instant' })
      target?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [trips])

  const fetchTrips = useCallback(() => {
    observeLoad(
      () =>
        request('/trips/my-registrations/', listResponse(registration).parse)
          .then((res) => setTrips(res.data))
          .catch((error) => {
            throw error
          })
          .finally(() => setIsLoading(false)),
      "'/trips/my-registrations/'",
    )
  }, [observeLoad])

  useEffect(() => {
    if (initialItems === null) fetchTrips()
    if (initialWallet === null)
      observeLoad(
        () =>
          request('/financial/wallet/', dashboardWalletSchema.parse)
            .then((res) => setWallet(res.data))
            .catch((error) => {
              throw error
            }),
        "'/financial/wallet/'",
      )
  }, [fetchTrips, initialItems, initialWallet, observeLoad])

  const statusConfig: Record<string, { label: string; color: string; bg?: string }> = {
    '': { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
    pending: { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
    approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
    rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
    cancelled: {
      label: 'انصراف داده',
      color: 'var(--status-neutral)',
      bg: 'var(--status-neutral-bg)',
    },
    attended: { label: 'شرکت کرد', color: 'var(--status-info)', bg: 'var(--status-info-bg)' },
    absent: { label: 'شرکت نکرد', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  }

  const paymentConfig: Record<string, { label: string; color: string; bg?: string }> = {
    unpaid: { label: 'پرداخت نشده', color: 'var(--status-danger)' },
    partial: { label: 'نیمه‌کامل', color: 'var(--status-warn)' },
    paid: { label: 'پرداخت کامل', color: 'var(--status-ok)' },
  }

  const setFeedback = (tripId: number, data: { type: string; text: string } | null) => {
    setPayFeedback((f) => ({ ...f, [tripId]: data }))
  }

  const handlePayWallet = async (trip: Registration) => {
    if (paymentPending.current) return
    setValidationErrors({})

    const amount = Number(payAmounts[trip.id] ?? trip.remaining_amount)
    setFeedback(trip.id, null)

    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > Number(trip.remaining_amount)) {
      setFeedback(trip.id, { type: 'error', text: 'مبلغ نامعتبر است' })
      return
    }
    if (wallet && amount > wallet.balance) {
      setFeedback(trip.id, { type: 'low-balance', text: 'موجودی کیف پول کافی نیست' })
      return
    }

    paymentPending.current = true
    setBusyId(trip.id)
    try {
      const res = await request('/financial/wallet/pay/', walletPayment.parse, {
        registration_id: trip.id,
        expected_remaining: trip.remaining_amount,
        amount,
      })
      setFeedback(trip.id, { type: 'success', text: 'پرداخت با موفقیت از کیف پول انجام شد' })
      setWallet((w) => (w ? { ...w, balance: res.data.wallet_balance } : w))
      setPayAmounts({ ...payAmounts, [trip.id]: '' })
      fetchTrips()
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setFeedback(trip.id, { type: 'error', text: dashboardError(err, 'خطا در پرداخت') })
    }
    paymentPending.current = false
    setBusyId(null)
  }

  const handlePayDirect = async (trip: Registration) => {
    if (paymentPending.current) return
    setValidationErrors({})

    const amount = Number(payAmounts[trip.id] ?? trip.remaining_amount)
    setFeedback(trip.id, null)

    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > Number(trip.remaining_amount)) {
      setFeedback(trip.id, { type: 'error', text: 'مبلغ نامعتبر است' })
      return
    }

    paymentPending.current = true
    setBusyId(trip.id)
    try {
      await request(`/trips/registration/${trip.id}/pay-direct/`, discardResponse, { amount })
      setFeedback(trip.id, { type: 'success', text: 'پرداخت مستقیم با موفقیت ثبت شد' })
      setPayAmounts({ ...payAmounts, [trip.id]: '' })
      fetchTrips()
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setFeedback(trip.id, { type: 'error', text: dashboardError(err, 'خطا در پرداخت مستقیم') })
    }
    paymentPending.current = false
    setBusyId(null)
  }

  if (isLoading)
    return (
      <FormValidation errors={validationErrors}>
        <>
          <LoadFeedback state={loadState} onRetry={retryLoad} />
          {<div className="mt-loading">در حال بارگذاری...</div>}
        </>
      </FormValidation>
    )

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="mt-page">
            <div className="mt-head">
              <div>
                <h1>سفرهای من</h1>
                <p className="mt-description">
                  ثبت‌نام‌ها، وضعیت پرداخت و همسفران خود را مدیریت کنید.
                </p>
              </div>
              <Link href="/dashboard/trips/register" className="mt-new-btn">
                ثبت‌نام سفر جدید
              </Link>
            </div>

            {wallet && (
              <div className="mt-wallet-strip">
                <span>موجودی کیف پول:</span>
                <strong>{wallet.balance.toLocaleString('fa-IR')} تومان</strong>
                <Link href="/dashboard/wallet">شارژ کیف پول ←</Link>
              </div>
            )}
            <div className="mt-filters" role="group" aria-label="فیلتر سفرها">
              {[
                ['all', 'همه سفرها'],
                ['active', 'ثبت‌نام‌های جاری'],
                ['past', 'سایر ثبت‌نام‌ها'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value ?? 'all')}
                >
                  {label}
                </button>
              ))}
            </div>

            {trips.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && trips.length === 0 ? null : trips.length === 0 ? (
              <div className="mt-empty">
                <h3>هنوز سفری ثبت نکرده‌اید</h3>
                <p>برای شرکت در سفرهای هیئت ثبت‌نام کنید</p>
                <Link href="/dashboard/trips/register" className="mt-new-btn">
                  ثبت‌نام در سفر
                </Link>
              </div>
            ) : (
              <div className="mt-list">
                {trips
                  .filter(
                    (trip) =>
                      filter === 'all' ||
                      (filter === 'active'
                        ? ['', 'pending', 'approved'].includes(trip.status)
                        : !['', 'pending', 'approved'].includes(trip.status)),
                  )
                  .map((trip) => {
                    const feedback = payFeedback[trip.id]
                    return (
                      <div
                        key={trip.id}
                        id={`registration-${trip.id}`}
                        tabIndex={-1}
                        className="mt-card"
                        style={{ scrollMarginTop: 150 }}
                      >
                        <div className="mt-card-head">
                          <div className="mt-travel-title">
                            <span className="mt-travel-icon" aria-hidden="true">
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="4" y="3" width="16" height="15" rx="3" />
                                <path d="M4 11h16M8 18v3m8-3v3M8 7h8M8 15h.01M16 15h.01" />
                              </svg>
                            </span>
                            <div>
                              <h2>{trip.trip_detail?.title}</h2>
                              {trip.trip_detail?.start_date && (
                                <p className="mt-dates">
                                  {new Date(trip.trip_detail.start_date).toLocaleDateString(
                                    'fa-IR',
                                  )}
                                  {trip.trip_detail.end_date && (
                                    <>
                                      {' '}
                                      تا{' '}
                                      {new Date(trip.trip_detail.end_date).toLocaleDateString(
                                        'fa-IR',
                                      )}
                                    </>
                                  )}
                                </p>
                              )}
                              <p>
                                کد پیگیری: <span className="mt-mono">{trip.tracking_code}</span>
                              </p>
                            </div>
                          </div>
                          <span
                            className="mt-badge"
                            style={{
                              color: statusConfig[trip.status]?.color,
                              borderColor: statusConfig[trip.status]?.color,
                              background: statusConfig[trip.status]?.bg,
                            }}
                          >
                            {statusConfig[trip.status]?.label}
                          </span>
                        </div>

                        {trip.trip_detail?.start_date && (
                          <div className="mt-itinerary">
                            <div>
                              <span>آغاز سفر</span>
                              <strong>
                                {new Date(trip.trip_detail.start_date).toLocaleDateString('fa-IR', {
                                  day: 'numeric',
                                  month: 'long',
                                })}
                              </strong>
                              <small>
                                {new Date(trip.trip_detail.start_date).toLocaleDateString('fa-IR', {
                                  year: 'numeric',
                                })}
                              </small>
                            </div>
                            <TripTimeline
                              start={trip.trip_detail.start_date}
                              end={trip.trip_detail.end_date}
                            />
                            <div>
                              <span>پایان سفر</span>
                              <strong>
                                {trip.trip_detail.end_date
                                  ? new Date(trip.trip_detail.end_date).toLocaleDateString(
                                      'fa-IR',
                                      { day: 'numeric', month: 'long' },
                                    )
                                  : 'اعلام نشده'}
                              </strong>
                              <small>
                                {trip.trip_detail.end_date
                                  ? new Date(trip.trip_detail.end_date).toLocaleDateString(
                                      'fa-IR',
                                      { year: 'numeric' },
                                    )
                                  : ''}
                              </small>
                            </div>
                          </div>
                        )}

                        <div className="mt-financials">
                          <div>
                            <p>هزینه کل</p>
                            <strong>{trip.total_cost?.toLocaleString('fa-IR')} تومان</strong>
                          </div>
                          <div>
                            <p>پرداخت شده</p>
                            <strong className="mt-paid">
                              {(
                                Number(trip.paid_from_wallet || 0) + Number(trip.paid_directly || 0)
                              )?.toLocaleString('fa-IR')}{' '}
                              تومان
                            </strong>
                          </div>
                          <div>
                            <p>باقیمانده</p>
                            <strong className="mt-remaining">
                              {trip.remaining_amount?.toLocaleString('fa-IR')} تومان
                            </strong>
                          </div>
                        </div>

                        {Number(trip.total_cost) > 0 && (
                          <div className="mt-payment-progress">
                            <div>
                              <span>تکمیل پرداخت</span>
                              <strong>
                                {Math.min(
                                  100,
                                  Math.round(
                                    ((Number(trip.paid_from_wallet || 0) +
                                      Number(trip.paid_directly || 0)) /
                                      Number(trip.total_cost)) *
                                      100,
                                  ),
                                ).toLocaleString('fa-IR')}
                                ٪
                              </strong>
                            </div>
                            <progress
                              max={Number(trip.total_cost)}
                              value={Math.min(
                                Number(trip.total_cost),
                                Number(trip.paid_from_wallet || 0) +
                                  Number(trip.paid_directly || 0),
                              )}
                              aria-label="میزان تکمیل پرداخت سفر"
                            />
                          </div>
                        )}

                        <div className="mt-row-actions">
                          <p style={{ color: paymentConfig[trip.payment_status]?.color }}>
                            وضعیت پرداخت: {paymentConfig[trip.payment_status]?.label}
                          </p>
                          {(trip.status === 'pending' || trip.status === '') && (
                            <CancelBox trip={trip} onDone={fetchTrips} />
                          )}
                        </div>

                        {['', 'pending'].includes(trip.status) && trip.remaining_amount > 0 && (
                          <div className="mt-pay-box">
                            <h3>پرداخت هزینه سفر</h3>
                            <FormControl
                              as="input"
                              label="مبلغ پرداخت (تومان)"
                              name="amount"
                              inputMode="numeric"
                              step="1"
                              type="number"
                              min="1"
                              max={trip.remaining_amount}
                              placeholder={`حداکثر ${trip.remaining_amount.toLocaleString('fa-IR')} تومان`}
                              value={payAmounts[trip.id] ?? trip.remaining_amount}
                              onChange={(e) =>
                                setPayAmounts({ ...payAmounts, [trip.id]: e.target.value })
                              }
                              className="mt-pay-input"
                            />
                            <p className="mt-description">
                              حداکثر {Number(trip.remaining_amount).toLocaleString('fa-IR')} تومان؛
                              مبلغ موردنظر را وارد و روش پرداخت را انتخاب کنید.
                            </p>
                            <div className="mt-pay-btns">
                              <button
                                onClick={() => handlePayWallet(trip)}
                                disabled={busyId !== null}
                                className="mt-action-btn primary"
                              >
                                {busyId === trip.id ? '...' : 'پرداخت از کیف پول'}
                              </button>
                              <button
                                onClick={() => handlePayDirect(trip)}
                                disabled={busyId !== null}
                                className="mt-action-btn outline"
                              >
                                {busyId === trip.id ? '...' : 'پرداخت مستقیم (آنلاین)'}
                              </button>
                            </div>

                            {feedback && (
                              <div
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                className={`mt-pay-feedback ${feedback.type}`}
                              >
                                <span>{feedback.text}</span>
                                {feedback.type === 'low-balance' && (
                                  <button
                                    onClick={() => router.push('/dashboard/wallet')}
                                    className="mt-charge-link"
                                  >
                                    شارژ کیف پول
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {feedback &&
                          !(['', 'pending'].includes(trip.status) && trip.remaining_amount > 0) && (
                            <p className={`mt-pay-feedback ${feedback.type}`} role="status">
                              {feedback.text}
                            </p>
                          )}
                        {trip.status === 'rejected' &&
                          Number(trip.paid_from_wallet || 0) + Number(trip.paid_directly || 0) >
                            0 &&
                          !trip.refund_requested && (
                            <RefundRequestBox trip={trip} onDone={fetchTrips} />
                          )}

                        {trip.refund_requested && (
                          <div className="mt-refund-status">
                            وضعیت درخواست عودت وجه:{' '}
                            <strong
                              style={{
                                color:
                                  trip.refund_status === 'approved'
                                    ? 'var(--status-ok)'
                                    : trip.refund_status === 'rejected'
                                      ? 'var(--status-danger)'
                                      : 'var(--status-warn)',
                              }}
                            >
                              {trip.refund_status === 'approved'
                                ? 'تایید و واریز شد'
                                : trip.refund_status === 'rejected'
                                  ? 'رد شد'
                                  : 'در انتظار بررسی'}
                            </strong>
                          </div>
                        )}

                        {trip.companions?.length > 0 && (
                          <div className="mt-companions">
                            <p>همسفران:</p>
                            <div className="mt-companion-chips">
                              {trip.companions.map((c) => (
                                <span key={c.id}>
                                  {c.companion_detail?.first_name} {c.companion_detail?.last_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
            {trips.length > 0 &&
              !trips.some(
                (trip) =>
                  filter === 'all' ||
                  (filter === 'active'
                    ? ['', 'pending', 'approved'].includes(trip.status)
                    : !['', 'pending', 'approved'].includes(trip.status)),
              ) && (
                <p className="mt-empty" role="status">
                  ثبت‌نامی در این دسته وجود ندارد.
                </p>
              )}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default MyTrips
