import FormValidation from '../../components/FormValidation'
import ErrorSummary from '../../components/ErrorSummary'
import { fieldErrors } from '../../utils/validation'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import FormControl from '../../components/FormControl'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './registration-support.css'

function TripRegister() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [companions, setCompanions] = useState([])
  const [searchCode, setSearchCode] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    observeLoad(() => api.get('/trips/?registration_open=true')
      .then(res => setTrips((Array.isArray(res.data) ? res.data : res.data.results || []).filter(t => t.registration_open)))
      .catch(error => { throw error }), "'/trips/?registration_open=true'")
  }, [observeLoad])

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
      const res = await api.get(`/accounts/search-user/?national_code=${searchCode}`)
      if (companions.find(c => c.id === res.data.id)) {
        setSearchError('این کاربر قبلاً اضافه شده')
        return
      }
      setSearchResult(res.data)
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setSearchError(err.response?.data?.error || 'کاربر یافت نشد')
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

  const removeCompanion = (id) => {
    setCompanions(companions.filter(c => c.id !== id))
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
    setIsLoading(true)
    try {
      await api.post('/trips/register/', {
        trip: selectedTrip.id,
        companion_national_codes: companions.map(c => c.national_code)
      })
      navigate('/dashboard/trips')
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setSubmitError(err.response?.data?.error || 'ثبت‌نام انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید.')
    }
    setIsLoading(false)
  }

  return (
    <FormValidation errors={validationErrors}><><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="tr-page">
      <header className="service-page-heading"><h1 className="tr-heading">ثبت‌نام سفر</h1><p>سفر را انتخاب کنید، شرایط را بخوانید و در صورت نیاز همسفر اضافه کنید.</p></header>

      {/* انتخاب سفر */}
      <div className="tr-card">
        <h2>انتخاب سفر</h2>
        {(trips.length === 0 && (!loadState.started || loadState.pending > 0)) ? (<p className="field-hint" role="status">در حال دریافت اطلاعات…</p>) : (loadState.errors.length > 0 && trips.length === 0) ? null : trips.length === 0 ? (
          <p className="tr-empty-text">در حال حاضر سفری برای ثبت‌نام وجود ندارد</p>
        ) : (
          <div className="tr-trip-options" role="radiogroup" aria-label="انتخاب سفر" onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) return
            event.preventDefault()
            const controls = [...event.currentTarget.querySelectorAll('[role="radio"]')]
            const index = controls.indexOf(document.activeElement)
            const delta = ['ArrowLeft', 'ArrowDown'].includes(event.key) ? 1 : -1
            const next = controls[(index + delta + controls.length) % controls.length]
            next?.focus(); next?.click()
          }}>
            {trips.map((trip) => (
              <button type="button" role="radio" tabIndex={selectedTrip?.id === trip.id || (!selectedTrip && trips[0]?.id === trip.id) ? 0 : -1} aria-checked={selectedTrip?.id === trip.id}
                key={trip.id}
                onClick={() => { if (selectedTrip?.id !== trip.id) setAgreed(false); setSubmitError(''); setSelectedTrip(trip) }}
                className={`tr-trip-option${selectedTrip?.id === trip.id ? ' selected' : ''}`}
              >
                <div>
                  <h3>{trip.title}</h3>
                  <p>{new Date(trip.start_date).toLocaleDateString('fa-IR')} تا {new Date(trip.end_date).toLocaleDateString('fa-IR')}</p>
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
          <div className="tr-conditions" tabIndex={0} role="region" aria-label="متن شرایط سفر">
            {selectedTrip.conditions || 'شرایطی تعریف نشده'}
          </div>
          <label className="tr-agree">
            <FormControl as="input" type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setSubmitError('') }} />
            <span>شرایط فوق را خوانده و قبول دارم</span>
          </label>
        </div>
      )}

      {/* همسفران */}
      <div className="tr-card">
        <h2>همسفران (اختیاری)</h2>
        <p className="service-description" id="companion-hint">اگر تنها سفر می‌کنید، این بخش را خالی بگذارید. همسفر باید در سایت حساب کاربری داشته باشد.</p>
        <form className="tr-search-row" onSubmit={event => { event.preventDefault(); searchCompanion() }}>
          <div className="tr-search-field"><FormControl as="input" label="کد ملی همسفر" name="searchCode"
            type="text"
            inputMode="numeric" maxLength={10} dir="ltr" aria-describedby="companion-hint" disabled={isSearching}
            value={searchCode}
            onChange={(e) => { setSearchCode(e.target.value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))); setSearchResult(null); setSearchError('') }}
            placeholder="کد ملی همسفر"
            className="tr-input"
          /></div>
          <button type="submit" disabled={isSearching} className="tr-search-btn">{isSearching ? 'در حال جستجو…' : 'جستجوی همسفر'}</button>
        </form>

        {searchError && <p role="status" aria-live="polite" aria-atomic="true" className="tr-search-error">{searchError}</p>}

        {searchResult && (
          <div className="tr-search-result">
            <div className="tr-search-result-info">
              {searchResult.profile_image ? (
                <img src={searchResult.profile_image} alt="" />
              ) : (
                <div className="tr-avatar-fallback">{searchResult.first_name?.[0]}</div>
              )}
              <div>
                <p>{searchResult.first_name} {searchResult.last_name}</p>
                <span>کد ملی: {searchResult.national_code}</span>
              </div>
            </div>
            <button onClick={addCompanion} className="tr-add-btn">اضافه کردن</button>
          </div>
        )}

        {companions.length > 0 && (
          <div className="tr-companion-list">
            {companions.map((c) => (
              <div key={c.id} className="tr-companion-row">
                <p>{c.first_name} {c.last_name}</p>
                <button onClick={() => removeCompanion(c.id)}>حذف</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* دکمه ثبت‌نام */}
      <div className="tr-review"><div><h2>خلاصه ثبت‌نام</h2><p>{selectedTrip?.title || 'هنوز سفری انتخاب نکرده‌اید'}</p><span>{companions.length ? `شما و ${companions.length.toLocaleString('fa-IR')} همسفر` : 'بدون همسفر'}</span>{selectedTrip && <p>هزینه اعلام‌شده سفر: <strong>{Number(selectedTrip.cost).toLocaleString('fa-IR')} تومان</strong></p>}</div>
      <button onClick={handleSubmit} disabled={isLoading || !selectedTrip || !agreed} className="tr-submit">
        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام در سفر'}
      </button>
      {!agreed && selectedTrip && <p className="service-description">برای فعال‌شدن ثبت‌نام، شرایط سفر را بپذیرید.</p>}
      {submitError && <p className="service-error" role="alert">{submitError}</p>}
      <ErrorSummary errors={validationErrors} />
      </div>


    </div>}</></FormValidation>
  )
}

export default TripRegister
