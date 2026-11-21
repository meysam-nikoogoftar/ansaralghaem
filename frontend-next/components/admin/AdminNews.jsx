'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '@/lib/admin/api'
import { safeMediaPath } from '@/lib/urls'

const emptyForm = { title: '', content: '', is_published: false }

function AdminNews() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [newsList, setNewsList] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [selectedFile, setSelectedFile] = useState(null)
  const saving = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchNews = useCallback(() => {
    observeLoad(() => api.get('/content/admin/news/').then(setNewsList), "'/content/admin/news/'")
  }, [observeLoad])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setSelectedFile(null)
    setIsFormOpen(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title || '',
      content: item.content || '',
      is_published: item.is_published || false,
    })
    setSelectedFile(null)
    setIsFormOpen(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const buildFormData = () => {
    const data = new FormData()
    data.append('title', formData.title)
    data.append('content', formData.content)
    data.append('is_published', formData.is_published)
    if (selectedFile) data.append('image', selectedFile)
    return data
  }

  const handleSubmit = async (e) => {
    setValidationErrors({})

    e.preventDefault()
    if (saving.current) return
    saving.current = true
    setIsSaving(true)
    setMessage('')
    try {
      const data = buildFormData()
      if (editingId) {
        const res = await api.put(`/content/admin/news/${editingId}/`, data)
        setNewsList((current) => current.map((n) => (n.id === editingId ? res : n)))
        setMessage('خبر ویرایش شد')
      } else {
        const res = await api.post('/content/admin/news/', data)
        setNewsList((current) => [res, ...current])
        setMessage('خبر جدید ثبت شد')
      }
      setIsFormOpen(false)
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      setMessage('خطا در ذخیره خبر')
    } finally {
      saving.current = false
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این خبر حذف بشه؟')) return
    try {
      await api.delete(`/content/admin/news/${id}/`)
      setNewsList((current) => current.filter((n) => n.id !== id))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در حذف خبر')
    }
  }

  const handleTogglePublish = async (item) => {
    setValidationErrors({})

    try {
      const res = await api.patch(`/content/admin/news/${item.id}/`, {
        is_published: !item.is_published,
      })
      setNewsList((current) => current.map((n) => (n.id === item.id ? res : n)))
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در تغییر وضعیت انتشار')
    }
  }

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="anw-page">
            <div className="anw-head">
              <h1>مدیریت اخبار</h1>
              <button onClick={openCreateForm} className="anw-new-btn">
                + خبر جدید
              </button>
            </div>

            {message && (
              <div role="status" aria-live="polite" aria-atomic="true" className="anw-message">
                {message}
              </div>
            )}

            {isFormOpen && (
              <div className="anw-card">
                <h2>{editingId ? 'ویرایش خبر' : 'ثبت خبر جدید'}</h2>
                <form onSubmit={handleSubmit} className="anw-form">
                  <div className="anw-field">
                    <FormControl
                      as="input"
                      label={<>عنوان خبر</>}
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="anw-input"
                      required
                    />
                  </div>
                  <div className="anw-field">
                    <FormControl
                      as="input"
                      label={<>تصویر {editingId && '(خالی بذار اگه نمی‌خوای عوض بشه)'}</>}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="anw-file-input"
                    />
                  </div>
                  <div className="anw-field">
                    <FormControl
                      as="textarea"
                      label={<>متن کامل خبر</>}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={6}
                      className="anw-input"
                      required
                    />
                  </div>
                  <label className="anw-checkbox-label">
                    <FormControl
                      as="input"
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleChange}
                    />
                    <span>منتشر شود (روی سایت نمایش داده شود)</span>
                  </label>
                  <div className="anw-form-actions">
                    <button type="submit" disabled={isSaving} className="anw-submit-btn">
                      {isSaving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت خبر'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="anw-cancel-btn"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading ? (
              <div className="anw-loading">در حال بارگذاری...</div>
            ) : newsList.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && newsList.length === 0 ? null : newsList.length ===
              0 ? (
              <div className="anw-empty">خبری ثبت نشده است</div>
            ) : (
              <div className="anw-list">
                {newsList.map((item) => (
                  <div key={item.id} className="anw-row">
                    {item.image ? (
                      <img
                        src={safeMediaPath(item.image) ?? undefined}
                        alt={item.title}
                        className="anw-thumb"
                      />
                    ) : (
                      <div className="anw-thumb anw-thumb-placeholder">📰</div>
                    )}
                    <div className="anw-row-info">
                      <h3>{item.title}</h3>
                      <p>
                        {new Date(item.created_at).toLocaleDateString('fa-IR')} · 👁{' '}
                        {item.views_count} بازدید
                      </p>
                    </div>
                    <div className="anw-row-actions">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`anw-toggle-pill${item.is_published ? ' on' : ''}`}
                      >
                        {item.is_published ? '● منتشر شده' : '○ پیش‌نویس'}
                      </button>
                      <button onClick={() => openEditForm(item)} className="anw-edit-btn">
                        ویرایش
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="anw-delete-btn">
                        حذف
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

export default AdminNews
