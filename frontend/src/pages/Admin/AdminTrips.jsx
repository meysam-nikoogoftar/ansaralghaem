import FormValidation from '../../components/FormValidation'
import { fieldErrors } from '../../utils/validation'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import FormControl from '../../components/FormControl'
import { useCallback, useEffect, useState } from 'react'
import JalaliDatePicker from '../../components/JalaliDatePicker'
import api from '../../services/api'

const emptyForm = {
  title: '', trip_type: 'arbaeen', audience: 'public',
  start_date: '', end_date: '', cost: '', refund_amount: '',
  refund_description: '', conditions: '', is_active: true, registration_open: false,
}

const tripTypeOptions = [
  { value: 'arbaeen', label: 'اربعین' },
  { value: 'fatemiyeh', label: 'فاطمیه' },
  { value: 'mashhad', label: 'مشهد' },
  { value: 'qom', label: 'قم' },
  { value: 'other', label: 'سایر' },
]

const audienceOptions = [
  { value: 'public', label: 'عمومی' },
  { value: 'khadamin', label: 'خادمین' },
  { value: 'students', label: 'دانشجویان' },
  { value: 'other', label: 'سایر' },
]

function AdminTrips() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [trips, setTrips] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')



  const fetchTrips = useCallback(() => {
    observeLoad(() => api.get('/trips/admin/trips/')
      .then(res => setTrips(res.data))
      .catch(error => { throw error })
      , "'/trips/admin/trips/'")
  }, [observeLoad])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const openEditForm = (trip) => {
    setEditingId(trip.id)
    setFormData({
      title: trip.title, trip_type: trip.trip_type, audience: trip.audience,
      start_date: trip.start_date, end_date: trip.end_date, cost: trip.cost,
      refund_amount: trip.refund_amount, refund_description: trip.refund_description || '',
      conditions: trip.conditions || '', is_active: trip.is_active, registration_open: trip.registration_open,
    })
    setIsFormOpen(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    setValidationErrors({})

    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    try {
      const payload = { ...formData, cost: Number(formData.cost) || 0, refund_amount: Number(formData.refund_amount) || 0 }
      if (editingId) {
        const res = await api.put(`/trips/admin/trips/${editingId}/`, payload)
        setTrips(trips.map(t => t.id === editingId ? res.data : t))
        setMessage('سفر با موفقیت ویرایش شد')
      } else {
        const res = await api.post('/trips/admin/trips/', payload)
        setTrips([res.data, ...trips])
        setMessage('سفر جدید با موفقیت ایجاد شد')
      }
      setIsFormOpen(false)
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setMessage('خطا در ذخیره سفر — لطفاً فیلدها را بررسی کنید')
    }
    setIsSaving(false)
  }

  const handleToggle = async (trip, field) => {
    setValidationErrors({})

    try {
      const res = await api.patch(`/trips/admin/trips/${trip.id}/`, { [field]: !trip[field] })
      setTrips(trips.map(t => t.id === trip.id ? res.data : t))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در تغییر وضعیت')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این سفر و همه‌ی ثبت‌نام‌های مرتبط با آن حذف می‌شود. ادامه می‌دهید؟')) return
    try {
      await api.delete(`/trips/admin/trips/${id}/`)
      setTrips(trips.filter(t => t.id !== id))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در حذف سفر')
    }
  }

  return (
    <FormValidation errors={validationErrors}><><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="atp-page">
      <div className="atp-head">
        <h1>مدیریت سفرها</h1>
        <button onClick={openCreateForm} className="atp-new-btn">+ سفر جدید</button>
      </div>

      {message && <div role="status" aria-live="polite" aria-atomic="true" className="atp-message">{message}</div>}

      {isFormOpen && (
        <div className="atp-card">
          <h2>{editingId ? 'ویرایش سفر' : 'ایجاد سفر جدید'}</h2>
          <form onSubmit={handleSubmit} className="atp-form">
            <div className="atp-grid">
              <div className="atp-field">

                <FormControl as="input" label={<>عنوان سفر</>} type="text" name="title" value={formData.title} onChange={handleChange} className="atp-input" required />
              </div>
              <div className="atp-field">

                <FormControl as="select" label={<>نوع سفر</>} name="trip_type" value={formData.trip_type} onChange={handleChange} className="atp-input">
                  {tripTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </FormControl>
              </div>
              <div className="atp-field">

                <FormControl as="select" label={<>مخصوص</>} name="audience" value={formData.audience} onChange={handleChange} className="atp-input">
                  {audienceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </FormControl>
              </div>
              <div className="atp-field">
                <label htmlFor="trip-start_date">از تاریخ</label>
                <JalaliDatePicker id="trip-start_date" value={formData.start_date} onChange={(iso) => setFormData({ ...formData, start_date: iso })} />
              </div>
              <div className="atp-field">
                <label htmlFor="trip-end_date">تا تاریخ</label>
                <JalaliDatePicker id="trip-end_date" value={formData.end_date} onChange={(iso) => setFormData({ ...formData, end_date: iso })} />
              </div>
              <div className="atp-field">

                <FormControl as="input" label={<>هزینه ثبت‌نام (تومان)</>} type="number" name="cost" value={formData.cost} onChange={handleChange} className="atp-input" required />
              </div>
              <div className="atp-field">

                <FormControl as="input" label={<>مبلغ عودت وجه</>} type="number" name="refund_amount" value={formData.refund_amount} onChange={handleChange} className="atp-input" />
              </div>
              <div className="atp-field atp-span-2">

                <FormControl as="input" label={<>توضیحات عودت وجه</>} type="text" name="refund_description" value={formData.refund_description} onChange={handleChange} className="atp-input" />
              </div>
              <div className="atp-field atp-span-2">

                <FormControl as="textarea" label={<>شرایط سفر</>} name="conditions" value={formData.conditions} onChange={handleChange} rows={4} className="atp-input" />
              </div>
              <div className="atp-field">
                <label className="atp-checkbox-label">
                  <FormControl as="input" type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                  <span>سفر فعال (روی سایت نمایش داده شود)</span>
                </label>
              </div>
              <div className="atp-field">
                <label className="atp-checkbox-label">
                  <FormControl as="input" type="checkbox" name="registration_open" checked={formData.registration_open} onChange={handleChange} />
                  <span>ثبت‌نام باز است</span>
                </label>
              </div>
            </div>
            <div className="atp-form-actions">
              <button type="submit" disabled={isSaving} className="atp-submit-btn">
                {isSaving ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ایجاد سفر')}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="atp-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="atp-loading">در حال بارگذاری...</div>
      ) : (trips.length === 0 && (!loadState.started || loadState.pending > 0)) ? (<p className="field-hint" role="status">در حال دریافت اطلاعات…</p>) : (loadState.errors.length > 0 && trips.length === 0) ? null : trips.length === 0 ? (
        <div className="atp-empty">سفری ثبت نشده است</div>
      ) : (
        <div className="atp-list">
          {trips.map(trip => (
            <div key={trip.id} className="atp-trip-card">
              <div className="atp-trip-top">
                <div>
                  <h3>{trip.title}</h3>
                  <p>{trip.start_date} تا {trip.end_date} · {trip.cost?.toLocaleString('fa-IR')} تومان</p>
                </div>
                <div className="atp-trip-actions">
                  <button onClick={() => openEditForm(trip)} className="atp-edit-btn">ویرایش</button>
                  <button onClick={() => handleDelete(trip.id)} className="atp-delete-btn">حذف</button>
                </div>
              </div>
              <div className="atp-toggles">
                <button
                  onClick={() => handleToggle(trip, 'is_active')}
                  className={`atp-toggle-pill${trip.is_active ? ' on' : ''}`}
                >
                  {trip.is_active ? '● فعال' : '○ غیرفعال'}
                </button>
                <button
                  onClick={() => handleToggle(trip, 'registration_open')}
                  className={`atp-toggle-pill${trip.registration_open ? ' on' : ''}`}
                >
                  {trip.registration_open ? '● ثبت‌نام باز' : '○ ثبت‌نام بسته'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .atp-page { display: flex; flex-direction: column; gap: 18px; }
        .atp-head { display: flex; align-items: center; justify-content: space-between; }
        .atp-head h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }
        .atp-new-btn {
          padding: 9px 18px; border-radius: 999px; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
        }

        .atp-message {
          padding: 11px 14px; border-radius: var(--radius-sm);
          background: rgba(31,163,130,0.12); border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow); font-size: 13px;
        }

        .atp-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; }
        .atp-card h2 { font-family: var(--font-display); color: var(--teal-glow); font-size: 15px; margin-bottom: 16px; }

        .atp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .atp-span-2 { grid-column: span 2; }
        .atp-field label { display: block; color: var(--ink-dim); font-size: 12.5px; margin-bottom: 6px; }
        .atp-input {
          width: 100%; padding: 10px 13px;
          background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body);
          font-size: 13px; outline: none;
        }
        .atp-input:focus { border-color: var(--teal-glow); box-shadow: 0 0 0 3px rgba(15,111,92,0.12); }
        select.atp-input option { background: var(--surface-2); color: var(--ink); }

        .atp-checkbox-label { display: flex; align-items: center; gap: 9px; cursor: pointer; margin-top: 6px; }
        .atp-checkbox-label input { width: 16px; height: 16px; accent-color: var(--teal-glow); }
        .atp-checkbox-label span { color: var(--ink-dim); font-size: 12.5px; }

        .atp-form-actions { display: flex; gap: 10px; margin-top: 16px; }
        .atp-submit-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
        }
        .atp-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .atp-cancel-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }
        .atp-cancel-btn:hover { border-color: var(--teal-glow); color: var(--teal-glow); }

        .atp-loading, .atp-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .atp-list { display: flex; flex-direction: column; gap: 12px; }
        .atp-trip-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 18px; }
        .atp-trip-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .atp-trip-top h3 { color: var(--ink); font-size: 14px; font-weight: 700; }
        .atp-trip-top p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .atp-trip-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .atp-edit-btn, .atp-delete-btn {
          font-size: 11.5px; padding: 6px 13px; border-radius: 999px; cursor: pointer; border: 1px solid;
        }
        .atp-edit-btn { color: var(--teal-glow); border-color: rgba(15,111,92,0.4); background: transparent; }
        .atp-edit-btn:hover { background: rgba(15,111,92,0.1); }
        .atp-delete-btn { color: var(--status-danger); border-color: rgba(255,107,125,0.4); background: transparent; }
        .atp-delete-btn:hover { background: rgba(122,35,48,0.12); }

        .atp-toggles { display: flex; gap: 8px; }
        .atp-toggle-pill {
          font-size: 11.5px; padding: 5px 12px; border-radius: 999px; cursor: pointer;
          border: 1px solid var(--line); background: transparent; color: var(--ink-faint);
        }
        .atp-toggle-pill.on { color: var(--status-ok); border-color: var(--status-ok); background: var(--status-ok-bg); }
      `}</style>
    </div>}</></FormValidation>
  )
}

export default AdminTrips