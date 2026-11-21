'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '@/lib/admin/api'

const emptyForm = {
  title: '',
  total_amount: '',
  share_count: '',
  share_amount: '',
  start_date: '',
  end_date: '',
  is_active: true,
  is_public: true,
}

function AdminContributions() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [items, setItems] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const saving = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchItems = useCallback(() => {
    observeLoad(
      () => api.get('/financial/admin/contributions/').then(setItems),
      "'/financial/admin/contributions/'",
    )
  }, [observeLoad])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title || '',
      total_amount: item.total_amount || '',
      share_count: item.share_count ?? '',
      share_amount: item.share_amount ?? '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      is_active: item.is_active ?? true,
      is_public: item.is_public ?? true,
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
      const payload = { ...formData, share_count: Number(formData.share_count) }
      if (editingId) {
        const res = await api.put(`/financial/admin/contributions/${editingId}/`, payload)
        setItems((current) => current.map((x) => (x.id === editingId ? res : x)))
        setMessage('کمپین ویرایش شد')
      } else {
        const res = await api.post('/financial/admin/contributions/', payload)
        setItems((current) => [res, ...current])
        setMessage('کمپین جدید ایجاد شد')
      }
      setIsFormOpen(false)
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      setMessage('ذخیره انجام نشد. اطلاعات فرم را بررسی و دوباره تلاش کنید.')
    } finally {
      saving.current = false
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این کمپین حذف بشه؟')) return
    try {
      await api.delete(`/financial/admin/contributions/${id}/`)
      setItems((current) => current.filter((x) => x.id !== id))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در حذف')
    }
  }

  const handleToggle = async (item, field) => {
    setValidationErrors({})

    try {
      const res = await api.patch(`/financial/admin/contributions/${item.id}/`, {
        [field]: !item[field],
      })
      setItems((current) => current.map((x) => (x.id === item.id ? res : x)))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در تغییر وضعیت')
    }
  }

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="acn-page">
            <div className="acn-head">
              <h1>مشارکت‌های مالی</h1>
              <button onClick={openCreateForm} className="acn-new-btn">
                + کمپین جدید
              </button>
            </div>

            {message && (
              <div role="status" aria-live="polite" aria-atomic="true" className="acn-message">
                {message}
              </div>
            )}

            {isFormOpen && (
              <div className="acn-card">
                <h2>{editingId ? 'ویرایش کمپین' : 'ایجاد کمپین جدید'}</h2>
                <form onSubmit={handleSubmit} className="acn-form">
                  <div className="acn-field">
                    <FormControl
                      as="input"
                      label={<>عنوان کمپین</>}
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="acn-input"
                      required
                    />
                  </div>
                  <div className="acn-field">
                    <FormControl
                      as="input"
                      label={<>مبلغ هدف (تومان)</>}
                      type="number"
                      name="total_amount"
                      value={formData.total_amount}
                      onChange={handleChange}
                      className="acn-input"
                      required
                    />
                  </div>
                  <div className="acn-field">
                    <FormControl
                      label="تعداد سهم"
                      name="share_count"
                      type="number"
                      min="1"
                      required
                      value={formData.share_count}
                      onChange={handleChange}
                      className="acn-input"
                    />
                  </div>
                  <div className="acn-field">
                    <FormControl
                      label="مبلغ هر سهم (تومان)"
                      name="share_amount"
                      type="number"
                      min="1"
                      required
                      value={formData.share_amount}
                      onChange={handleChange}
                      className="acn-input"
                    />
                  </div>
                  <div className="acn-field">
                    <FormControl
                      label="تاریخ شروع"
                      name="start_date"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                      className="acn-input"
                    />
                  </div>
                  <div className="acn-field">
                    <FormControl
                      label="تاریخ پایان"
                      name="end_date"
                      type="date"
                      min={formData.start_date || undefined}
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      className="acn-input"
                    />
                  </div>
                  <div className="acn-checks">
                    <label className="acn-checkbox-label">
                      <FormControl
                        as="input"
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <span>فعال</span>
                    </label>
                    <label className="acn-checkbox-label">
                      <FormControl
                        as="input"
                        type="checkbox"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleChange}
                      />
                      <span>نمایش در صفحه اصلی</span>
                    </label>
                  </div>
                  <div className="acn-form-actions">
                    <button type="submit" disabled={isSaving} className="acn-submit-btn">
                      {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="acn-cancel-btn"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading ? (
              <div className="acn-loading">در حال بارگذاری...</div>
            ) : items.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && items.length === 0 ? null : items.length === 0 ? (
              <div className="acn-empty">کمپینی ثبت نشده است</div>
            ) : (
              <div className="acn-list">
                {items.map((item) => {
                  const raised =
                    item.collected_amount ?? item.current_amount ?? item.raised_amount ?? 0
                  const progressKnown =
                    item.progress_percent != null ||
                    item.collected_amount != null ||
                    item.current_amount != null ||
                    item.raised_amount != null
                  const percent =
                    item.progress_percent ??
                    (item.total_amount
                      ? Math.min(100, Math.round((raised / item.total_amount) * 100))
                      : 0)
                  return (
                    <div key={item.id} className="acn-item-card">
                      <div className="acn-item-top">
                        <div>
                          <h3>{item.title}</h3>
                        </div>
                        <div className="acn-item-actions">
                          <button onClick={() => openEditForm(item)} className="acn-edit-btn">
                            ویرایش
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="acn-delete-btn">
                            حذف
                          </button>
                        </div>
                      </div>
                      <div className="acn-progress-wrap">
                        <div className="acn-progress-info">
                          <span>
                            {progressKnown
                              ? `${percent}٪ محقق‌شده`
                              : 'اطلاعات پیشرفت هنوز دریافت نشده است'}
                          </span>
                          <span>هدف: {Number(item.total_amount).toLocaleString('fa-IR')} ت</span>
                        </div>
                        <div className="acn-progress-track">
                          <div className="acn-progress-fill" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      <div className="acn-toggles">
                        <button
                          onClick={() => handleToggle(item, 'is_active')}
                          className={`acn-toggle-pill${item.is_active ? ' on' : ''}`}
                        >
                          {item.is_active ? '● فعال' : '○ غیرفعال'}
                        </button>
                        <button
                          onClick={() => handleToggle(item, 'is_public')}
                          className={`acn-toggle-pill${item.is_public ? ' on' : ''}`}
                        >
                          {item.is_public ? '● نمایش عمومی' : '○ مخفی'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminContributions
