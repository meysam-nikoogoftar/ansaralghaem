'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '@/lib/admin/api'

const emptyForm = { title: '', amount: '', trip: '', description: '', expense_date: '' }

function AdminExpenses() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [trips, setTrips] = useState([])
  const [expenses, setExpenses] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const saving = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchExpenses = useCallback(() => {
    observeLoad(
      () => api.get('/financial/admin/expenses/').then(setExpenses),
      "'/financial/admin/expenses/'",
    )
  }, [observeLoad])

  useEffect(() => {
    fetchExpenses()
    observeLoad(() => api.get('/trips/admin/trip-options/').then(setTrips), 'expense-trips')
  }, [fetchExpenses, observeLoad])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title || '',
      amount: item.amount || '',
      trip: String(item.trip),
      description: item.description || '',
      expense_date: item.expense_date || '',
    })
    setIsFormOpen(true)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    setValidationErrors({})

    e.preventDefault()
    if (saving.current) return
    saving.current = true
    setIsSaving(true)
    setMessage('')
    try {
      const payload = { ...formData, trip: Number(formData.trip) }
      if (editingId) {
        const res = await api.put(`/financial/admin/expenses/${editingId}/`, payload)
        setExpenses((current) => current.map((x) => (x.id === editingId ? res : x)))
        setMessage('هزینه ویرایش شد')
      } else {
        const res = await api.post('/financial/admin/expenses/', payload)
        setExpenses((current) => [res, ...current])
        setMessage('هزینه ثبت شد')
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
    if (!window.confirm('این ریزهزینه حذف بشه؟')) return
    try {
      await api.delete(`/financial/admin/expenses/${id}/`)
      setExpenses((current) => current.filter((x) => x.id !== id))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در حذف')
    }
  }

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="aex-page">
            <div className="aex-head">
              <h1>ریزهزینه‌ها</h1>
              <button onClick={openCreateForm} className="aex-new-btn">
                + ثبت هزینه جدید
              </button>
            </div>

            <div className="aex-total-card">
              <p>مجموع هزینه‌های ثبت‌شده</p>
              <strong>
                {isLoading || loadState.errors.length ? '—' : total.toLocaleString('fa-IR')} تومان
              </strong>
            </div>

            {message && (
              <div role="status" aria-live="polite" aria-atomic="true" className="aex-message">
                {message}
              </div>
            )}

            {isFormOpen && (
              <div className="aex-card">
                <h2>{editingId ? 'ویرایش هزینه' : 'ثبت هزینه جدید'}</h2>
                <form onSubmit={handleSubmit} className="aex-form">
                  <div className="aex-grid">
                    <div className="aex-field">
                      <FormControl
                        as="input"
                        label={<>عنوان</>}
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="aex-input"
                        required
                      />
                    </div>
                    <div className="aex-field">
                      <FormControl
                        as="input"
                        label={<>مبلغ (تومان)</>}
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="aex-input"
                        required
                      />
                    </div>
                    <div className="aex-field">
                      <FormControl
                        as="select"
                        label="سفر"
                        name="trip"
                        value={formData.trip}
                        onChange={handleChange}
                        className="aex-input"
                        required
                      >
                        <option value="">انتخاب سفر</option>
                        {trips.map((trip) => (
                          <option key={trip.id} value={trip.id}>
                            {trip.title}
                          </option>
                        ))}
                      </FormControl>
                    </div>
                    <div className="aex-field">
                      <FormControl
                        as="input"
                        label={<>تاریخ</>}
                        type="date"
                        name="expense_date"
                        value={formData.expense_date}
                        onChange={handleChange}
                        className="aex-input"
                        required
                      />
                    </div>
                    <div className="aex-field aex-span-2">
                      <FormControl
                        as="textarea"
                        label={<>توضیحات</>}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="aex-input"
                      />
                    </div>
                  </div>
                  <div className="aex-form-actions">
                    <button type="submit" disabled={isSaving} className="aex-submit-btn">
                      {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="aex-cancel-btn"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading ? (
              <div className="aex-loading">در حال بارگذاری...</div>
            ) : expenses.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && expenses.length === 0 ? null : expenses.length ===
              0 ? (
              <div className="aex-empty">هزینه‌ای ثبت نشده است</div>
            ) : (
              <div className="aex-table-wrap">
                <table className="aex-table">
                  <thead>
                    <tr>
                      <th>عنوان</th>
                      <th>سفر</th>
                      <th>مبلغ</th>
                      <th>تاریخ</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>
                          {item.trip_title ||
                            trips.find((trip) => trip.id === item.trip)?.title ||
                            '—'}
                        </td>
                        <td className="aex-amount">
                          {Number(item.amount).toLocaleString('fa-IR')} ت
                        </td>
                        <td>{item.expense_date || '—'}</td>
                        <td>
                          <div className="aex-row-actions">
                            <button onClick={() => openEditForm(item)} className="aex-edit-btn">
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="aex-delete-btn"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminExpenses
