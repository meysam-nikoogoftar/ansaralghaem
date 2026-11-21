'use client'
import { dashboardRequest } from '@/lib/dashboard/browser'
import { FormValidation, ErrorSummary, FormControl } from './forms'
import { useLoadFeedback, LoadFeedback } from './load-feedback'
import { ApiError, fieldErrors } from '@/lib/api/errors'
import { dashboardError, discardResponse } from '@/lib/dashboard/browser'
import { listResponse, availableTrip, companion } from '@/lib/dashboard/detail-contracts'
import { useRouter } from 'next/navigation'
import { safeMediaPath } from '@/lib/urls'
import type { FieldErrors } from '@/types'
import type { AvailableTrip, Companion } from '@/lib/dashboard/detail-contracts'
async function request<T>(path: string, decode: (value: unknown) => T, body?: unknown) {
  return { data: await dashboardRequest(path, decode, body) }
}
import { useEffect, useState, useRef } from 'react'
import '@/styles/dashboard/registration-support.css'

function TripRegister({ initialItems }: { initialItems: AvailableTrip[] | null }) {
  const mutationPending = useRef(false)
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback(initialItems !== null)

  const [trips, setTrips] = useState<AvailableTrip[]>(
    initialItems?.filter((trip) => trip.registration_open) ?? [],
  )
  const [selectedTrip, setSelectedTrip] = useState<AvailableTrip | null>(null)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [searchCode, setSearchCode] = useState('')
  const [searchResult, setSearchResult] = useState<Companion | null>(null)
  const [searchError, setSearchError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()
  const firstAvailable = trips.find((trip) => trip.remaining_capacity !== 0)?.id

  useEffect(() => {
    if (initialItems !== null) return
    observeLoad(
      () =>
        request('/trips/?registration_open=true', listResponse(availableTrip).parse)
          .then((res) => setTrips(res.data.filter((t) => t.registration_open)))
          .catch((error) => {
            throw error
          }),
      "'/trips/?registration_open=true'",
    )
  }, [initialItems, observeLoad])

  const searchCompanion = async () => {
    if (isSearching) return
    setSearchError('')
    setSearchResult(null)
    if (!/^\d{10}$/.test(searchCode)) {
      setSearchError('کد ملی همسفر را با ۱۰ رقم وارد کنید.')
      return
    }
    setIsSearching(true)
    try {
      const res = await request(
        `/accounts/search-user/?national_code=${searchCode}`,
        companion.parse,
      )
      if (companions.find((c) => c.id === res.data.id)) {
        setSearchError('این کاربر قبلاً اضافه شده')
        return
      }
      setSearchResult(res.data)
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setSearchError(dashboardError(err, 'کاربر یافت نشد'))
    } finally {
      setIsSearching(false)
    }
  }

  const addCompanion = () => {
    if (searchResult) {
      setCompanions([...companions, searchResult])
      setSearchResult(null)
      setSearchCode('')
    }
  }

  const removeCompanion = (id: number) => {
    setCompanions(companions.filter((c) => c.id !== id))
  }

  const handleSubmit = async () => {
    if (isLoading) return
    setValidationErrors({})
    setSubmitError('')

    if (!selectedTrip) {
      setSubmitError('لطفاً یک سفر انتخاب کنید')
      return
    }
    if (!agreed) {
      setSubmitError('برای ثبت‌نام، شرایط سفر را بخوانید و بپذیرید.')
      return
    }
    if (mutationPending.current) return
    mutationPending.current = true
    setIsLoading(true)
    try {
      await request('/trips/register/', discardResponse, {
        trip: selectedTrip.id,
        companion_national_codes: companions.map((c) => c.national_code),
      })
      router.push('/dashboard/trips')
    } catch (err) {
      setValidationErrors(fieldErrors(err))
      if (
        err instanceof ApiError &&
        err.status === 409 &&
        err.data &&
        typeof err.data === 'object' &&
        'code' in err.data &&
        err.data.code === 'trip_full'
      ) {
        setTrips((current) =>
          current.map((trip) =>
            trip.id === selectedTrip.id ? { ...trip, remaining_capacity: 0 } : trip,
          ),
        )
        setSelectedTrip(null)
        setAgreed(false)
      }
      setSubmitError(dashboardError(err, 'ثبت‌نام انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید.'))
    }
    mutationPending.current = false
    setIsLoading(false)
  }

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="tr-page">
            <header className="service-page-heading">
              <h1 className="tr-heading">ثبت‌نام سفر</h1>
              <p>سفر را انتخاب کنید، شرایط را بخوانید و در صورت نیاز همسفر اضافه کنید.</p>
            </header>

            {/* انتخاب سفر */}
            <div className="tr-card">
              <h2>انتخاب سفر</h2>
              {trips.length === 0 && (!loadState.started || loadState.pending > 0) ? (
                <p className="field-hint" role="status">
                  در حال دریافت اطلاعات…
                </p>
              ) : loadState.errors.length > 0 && trips.length === 0 ? null : trips.length === 0 ? (
                <p className="tr-empty-text">در حال حاضر سفری برای ثبت‌نام وجود ندارد</p>
              ) : (
                <div
                  className="tr-trip-options"
                  role="radiogroup"
                  aria-label="انتخاب سفر"
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key))
                      return
                    event.preventDefault()
                    const controls = [
                      ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                        '[role="radio"]:not(:disabled)',
                      ),
                    ]
                    if (controls.length === 0) return
                    const index = controls.findIndex(
                      (control) => control === document.activeElement,
                    )
                    const delta = ['ArrowLeft', 'ArrowDown'].includes(event.key) ? 1 : -1
                    const next = controls[(index + delta + controls.length) % controls.length]
                    next?.focus()
                    next?.click()
                  }}
                >
                  {trips.map((trip) => (
                    <button
                      type="button"
                      role="radio"
                      tabIndex={
                        selectedTrip?.id === trip.id ||
                        (!selectedTrip && firstAvailable === trip.id)
                          ? 0
                          : -1
                      }
                      aria-checked={selectedTrip?.id === trip.id}
                      disabled={trip.remaining_capacity === 0}
                      key={trip.id}
                      onClick={() => {
                        if (selectedTrip?.id !== trip.id) setAgreed(false)
                        setSubmitError('')
                        setSelectedTrip(trip)
                      }}
                      className={`tr-trip-option${selectedTrip?.id === trip.id ? ' selected' : ''}`}
                    >
                      <div>
                        <h3>{trip.title}</h3>
                        <p>
                          {new Date(trip.start_date).toLocaleDateString('fa-IR')} تا{' '}
                          {new Date(trip.end_date).toLocaleDateString('fa-IR')}
                        </p>
                        {trip.remaining_capacity != null && (
                          <p>
                            {trip.remaining_capacity === 0
                              ? 'ظرفیت تکمیل شده'
                              : `${trip.remaining_capacity.toLocaleString('fa-IR')} جای خالی`}
                          </p>
                        )}
                      </div>
                      <strong>{trip.cost?.toLocaleString('fa-IR')} تومان</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* شرایط سفر */}
            {selectedTrip && (
              <div className="tr-card">
                <h2>شرایط سفر</h2>
                <div
                  className="tr-conditions"
                  tabIndex={0}
                  role="region"
                  aria-label="متن شرایط سفر"
                >
                  {selectedTrip.conditions || 'شرایطی تعریف نشده'}
                </div>
                <label className="tr-agree">
                  <FormControl
                    as="input"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked)
                      setSubmitError('')
                    }}
                  />
                  <span>شرایط فوق را خوانده و قبول دارم</span>
                </label>
              </div>
            )}

            {/* همسفران */}
            <div className="tr-card">
              <h2>همسفران (اختیاری)</h2>
              <p className="service-description" id="companion-hint">
                اگر تنها سفر می‌کنید، این بخش را خالی بگذارید. همسفر باید در سایت حساب کاربری داشته
                باشد.
              </p>
              <form
                className="tr-search-row"
                onSubmit={(event) => {
                  event.preventDefault()
                  searchCompanion()
                }}
              >
                <div className="tr-search-field">
                  <FormControl
                    as="input"
                    label="کد ملی همسفر"
                    name="searchCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    dir="ltr"
                    aria-describedby="companion-hint"
                    disabled={isSearching}
                    value={searchCode}
                    onChange={(e) => {
                      setSearchCode(
                        e.target.value
                          .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
                          .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))),
                      )
                      setSearchResult(null)
                      setSearchError('')
                    }}
                    placeholder="کد ملی همسفر"
                    className="tr-input"
                  />
                </div>
                <button type="submit" disabled={isSearching} className="tr-search-btn">
                  {isSearching ? 'در حال جستجو…' : 'جستجوی همسفر'}
                </button>
              </form>

              {searchError && (
                <p role="status" aria-live="polite" aria-atomic="true" className="tr-search-error">
                  {searchError}
                </p>
              )}

              {searchResult && (
                <div className="tr-search-result">
                  <div className="tr-search-result-info">
                    {searchResult.profile_image ? (
                      <img src={safeMediaPath(searchResult.profile_image) ?? undefined} alt="" />
                    ) : (
                      <div className="tr-avatar-fallback">{searchResult.first_name?.[0]}</div>
                    )}
                    <div>
                      <p>
                        {searchResult.first_name} {searchResult.last_name}
                      </p>
                      <span>کد ملی: {searchResult.national_code}</span>
                    </div>
                  </div>
                  <button onClick={addCompanion} className="tr-add-btn">
                    اضافه کردن
                  </button>
                </div>
              )}

              {companions.length > 0 && (
                <div className="tr-companion-list">
                  {companions.map((c) => (
                    <div key={c.id} className="tr-companion-row">
                      <p>
                        {c.first_name} {c.last_name}
                      </p>
                      <button onClick={() => removeCompanion(c.id)}>حذف</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* دکمه ثبت‌نام */}
            <div className="tr-review">
              <div>
                <h2>خلاصه ثبت‌نام</h2>
                <p>{selectedTrip?.title || 'هنوز سفری انتخاب نکرده‌اید'}</p>
                <span>
                  {companions.length
                    ? `شما و ${companions.length.toLocaleString('fa-IR')} همسفر`
                    : 'بدون همسفر'}
                </span>
                {selectedTrip && (
                  <p>
                    هزینه اعلام‌شده سفر:{' '}
                    <strong>{Number(selectedTrip.cost).toLocaleString('fa-IR')} تومان</strong>
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedTrip || !agreed}
                className="tr-submit"
              >
                {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام در سفر'}
              </button>
              {!agreed && selectedTrip && (
                <p className="service-description">برای فعال‌شدن ثبت‌نام، شرایط سفر را بپذیرید.</p>
              )}
              {submitError && (
                <p className="service-error" role="alert">
                  {submitError}
                </p>
              )}
              <ErrorSummary errors={validationErrors} />
            </div>
          </div>
        }
      </>
    </FormValidation>
  )
}

export default TripRegister
