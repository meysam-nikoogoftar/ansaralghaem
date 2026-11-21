'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useCallback, useEffect, useRef, useState } from 'react'
import JalaliDatePicker from '@/components/ui/jalali-date-picker'
import api from '@/lib/admin/api'
import { formatDate } from '@/lib/urls'

const emptyForm = {
  title: '',
  trip_type: 'arbaeen',
  audience: 'public',
  start_date: '',
  end_date: '',
  cost: '',
  capacity: '',
  refund_amount: '',
  refund_description: '',
  conditions: '',
  is_active: true,
  registration_open: false,
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
  const saving = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchTrips = useCallback(() => {
    observeLoad(() => api.get('/trips/admin/trips/').then(setTrips), "'/trips/admin/trips/'")
  }, [observeLoad])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const openEditForm = (trip) => {
    setEditingId(trip.id)
    setFormData({
      title: trip.title,
      trip_type: trip.trip_type,
      audience: trip.audience,
      start_date: trip.start_date,
      end_date: trip.end_date,
      cost: trip.cost,
      capacity: trip.capacity ?? '',
      refund_amount: trip.refund_amount,
      refund_description: trip.refund_description || '',
      conditions: trip.conditions || '',
      is_active: trip.is_active,
      registration_open: trip.registration_open,
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
    if (saving.current) return
    saving.current = true
    setIsSaving(true)
    setMessage('')
    try {
      const payload = {
        ...formData,
        cost: Number(formData.cost) || 0,
        capacity: formData.capacity === '' ? null : Number(formData.capacity),
        refund_amount: Number(formData.refund_amount) || 0,
      }
      if (editingId) {
        const res = await api.put(`/trips/admin/trips/${editingId}/`, payload)
        setTrips((current) => current.map((t) => (t.id === editingId ? res : t)))
        setMessage('سفر با موفقیت ویرایش شد')
      } else {
        const res = await api.post('/trips/admin/trips/', payload)
        setTrips((current) => [res, ...current])
        setMessage('سفر جدید با موفقیت ایجاد شد')
      }
      setIsFormOpen(false)
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setMessage('خطا در ذخیره سفر — لطفاً فیلدها را بررسی کنید')
    } finally {
      saving.current = false
      setIsSaving(false)
    }
  }

  const handleToggle = async (trip, field) => {
    setValidationErrors({})

    try {
      const res = await api.patch(`/trips/admin/trips/${trip.id}/`, { [field]: !trip[field] })
      setTrips((current) => current.map((t) => (t.id === trip.id ? res : t)))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در تغییر وضعیت')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این سفر و همه‌ی ثبت‌نام‌های مرتبط با آن حذف می‌شود. ادامه می‌دهید؟'))
      return
    try {
      await api.delete(`/trips/admin/trips/${id}/`)
      setTrips((current) => current.filter((t) => t.id !== id))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در حذف سفر')
    }
  }

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="atp-page">
            <div className="atp-head">
              <h1>مدیریت سفرها</h1>
              <button onClick={openCreateForm} className="atp-new-btn">
                + سفر جدید
              </button>
            </div>

            {message && (
              <div role="status" aria-live="polite" aria-atomic="true" className="atp-message">
                {message}
              </div>
            )}

            {isFormOpen && (
              <div className="atp-card">
                <h2>{editingId ? 'ویرایش سفر' : 'ایجاد سفر جدید'}</h2>
                <form onSubmit={handleSubmit} className="atp-form">
                  <div className="atp-grid">
                    <div className="atp-field">
                      <FormControl
                        as="input"
                        label={<>عنوان سفر</>}
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="atp-input"
                        required
                      />
                    </div>
                    <div className="atp-field">
                      <FormControl
                        as="select"
                        label={<>نوع سفر</>}
                        name="trip_type"
                        value={formData.trip_type}
                        onChange={handleChange}
                        className="atp-input"
                      >
                        {tripTypeOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </FormControl>
                    </div>
                    <div className="atp-field">
                      <FormControl
                        as="select"
                        label={<>مخصوص</>}
                        name="audience"
                        value={formData.audience}
                        onChange={handleChange}
                        className="atp-input"
                      >
                        {audienceOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </FormControl>
                    </div>
                    <div className="atp-field">
                      <label htmlFor="trip-start_date">از تاریخ</label>
                      <JalaliDatePicker
                        id="trip-start_date"
                        value={formData.start_date}
                        onChange={(iso) => setFormData({ ...formData, start_date: iso })}
                      />
                    </div>
                    <div className="atp-field">
                      <label htmlFor="trip-end_date">تا تاریخ</label>
                      <JalaliDatePicker
                        id="trip-end_date"
                        value={formData.end_date}
                        onChange={(iso) => setFormData({ ...formData, end_date: iso })}
                      />
                    </div>
                    <div className="atp-field">
                      <FormControl
                        as="input"
                        label={<>هزینه ثبت‌نام (تومان)</>}
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="atp-input"
                        required
                      />
                    </div>
                    <div className="atp-field">
                      <FormControl
                        label="ظرفیت ثبت‌نام"
                        type="number"
                        name="capacity"
                        min={1}
                        step={1}
                        value={formData.capacity}
                        onChange={handleChange}
                        className="atp-input"
                        aria-describedby="trip-capacity-help"
                      />
                      <small id="trip-capacity-help">خالی یعنی بدون محدودیت</small>
                    </div>
                    <div className="atp-field">
                      <FormControl
                        as="input"
                        label={<>مبلغ عودت وجه</>}
                        type="number"
                        name="refund_amount"
                        value={formData.refund_amount}
                        onChange={handleChange}
                        className="atp-input"
                      />
                    </div>
                    <div className="atp-field atp-span-2">
                      <FormControl
                        as="input"
                        label={<>توضیحات عودت وجه</>}
                        type="text"
                        name="refund_description"
                        value={formData.refund_description}
                        onChange={handleChange}
                        className="atp-input"
                      />
                    </div>
                    <div className="atp-field atp-span-2">
                      <FormControl
                        as="textarea"
                        label={<>شرایط سفر</>}
                        name="conditions"
                        value={formData.conditions}
                        onChange={handleChange}
                        rows={4}
                        className="atp-input"
                      />
                    </div>
                    <div className="atp-field">
                      <label className="atp-checkbox-label">
                        <FormControl
                          as="input"
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                        />
                        <span>سفر فعال (روی سایت نمایش داده شود)</span>
                      </label>
                    </div>
                    <div className="atp-field">
                      <label className="atp-checkbox-label">
                        <FormControl
                          as="input"
                          type="checkbox"
                          name="registration_open"
                          checked={formData.registration_open}
                          onChange={handleChange}
                        />
                        <span>ثبت‌نام باز است</span>
                      </label>
                    </div>
                  </div>
                  <div className="atp-form-actions">
                    <button type="submit" disabled={isSaving} className="atp-submit-btn">
                      {isSaving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ایجاد سفر'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="atp-cancel-btn"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading ? (
              <div className="atp-loading">در حال بارگذاری...</div>
            ) : trips.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && trips.length === 0 ? null : trips.length === 0 ? (
              <div className="atp-empty">سفری ثبت نشده است</div>
            ) : (
              <div className="atp-list">
                {trips.map((trip) => (
                  <div key={trip.id} className="atp-trip-card">
                    <div className="atp-trip-top">
                      <div>
                        <h3>{trip.title}</h3>
                        <p>
                          {formatDate(trip.start_date)} تا {formatDate(trip.end_date)} ·{' '}
                          {trip.cost?.toLocaleString('fa-IR')} تومان
                        </p>
                        <p>
                          {trip.capacity == null
                            ? 'ظرفیت بدون محدودیت'
                            : `${(trip.remaining_capacity ?? trip.capacity).toLocaleString('fa-IR')} جای خالی از ${trip.capacity.toLocaleString('fa-IR')} ثبت‌نام`}
                        </p>
                      </div>
                      <div className="atp-trip-actions">
                        <button onClick={() => openEditForm(trip)} className="atp-edit-btn">
                          ویرایش
                        </button>
                        <button onClick={() => handleDelete(trip.id)} className="atp-delete-btn">
                          حذف
                        </button>
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
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminTrips
