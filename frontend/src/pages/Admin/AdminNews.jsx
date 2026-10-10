import { useEffect, useState } from 'react'
import api from '../../services/api'

const emptyForm = { title: '', content: '', is_published: false }

function AdminNews() {
  const [newsList, setNewsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchNews = () => {
    setIsLoading(true)
    api.get('/content/admin/news/')
      .then(res => setNewsList(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchNews() }, [])

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
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    try {
      const data = buildFormData()
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (editingId) {
        const res = await api.put(`/content/admin/news/${editingId}/`, data, config)
        setNewsList(newsList.map(n => n.id === editingId ? res.data : n))
        setMessage('خبر ویرایش شد')
      } else {
        const res = await api.post('/content/admin/news/', data, config)
        setNewsList([res.data, ...newsList])
        setMessage('خبر جدید ثبت شد')
      }
      setIsFormOpen(false)
    } catch {
      setMessage('خطا در ذخیره خبر')
    }
    setIsSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این خبر حذف بشه؟')) return
    try {
      await api.delete(`/content/admin/news/${id}/`)
      setNewsList(newsList.filter(n => n.id !== id))
    } catch {
      alert('خطا در حذف خبر')
    }
  }

  const handleTogglePublish = async (item) => {
    try {
      const res = await api.patch(`/content/admin/news/${item.id}/`, { is_published: !item.is_published })
      setNewsList(newsList.map(n => n.id === item.id ? res.data : n))
    } catch {
      alert('خطا در تغییر وضعیت انتشار')
    }
  }

  return (
    <div className="anw-page">
      <div className="anw-head">
        <h1>مدیریت اخبار</h1>
        <button onClick={openCreateForm} className="anw-new-btn">+ خبر جدید</button>
      </div>

      {message && <div className="anw-message">{message}</div>}

      {isFormOpen && (
        <div className="anw-card">
          <h2>{editingId ? 'ویرایش خبر' : 'ثبت خبر جدید'}</h2>
          <form onSubmit={handleSubmit} className="anw-form">
            <div className="anw-field">
              <label>عنوان خبر</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="anw-input" required />
            </div>
            <div className="anw-field">
              <label>تصویر {editingId && '(خالی بذار اگه نمی‌خوای عوض بشه)'}</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="anw-file-input" />
            </div>
            <div className="anw-field">
              <label>متن کامل خبر</label>
              <textarea name="content" value={formData.content} onChange={handleChange} rows={6} className="anw-input" required />
            </div>
            <label className="anw-checkbox-label">
              <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} />
              <span>منتشر شود (روی سایت نمایش داده شود)</span>
            </label>
            <div className="anw-form-actions">
              <button type="submit" disabled={isSaving} className="anw-submit-btn">
                {isSaving ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ثبت خبر')}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="anw-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="anw-loading">در حال بارگذاری...</div>
      ) : newsList.length === 0 ? (
        <div className="anw-empty">خبری ثبت نشده است</div>
      ) : (
        <div className="anw-list">
          {newsList.map(item => (
            <div key={item.id} className="anw-row">
              {item.image ? (
                <img src={item.image} alt={item.title} className="anw-thumb" />
              ) : (
                <div className="anw-thumb anw-thumb-placeholder">📰</div>
              )}
              <div className="anw-row-info">
                <h3>{item.title}</h3>
                <p>{new Date(item.created_at).toLocaleDateString('fa-IR')} · 👁 {item.views_count} بازدید</p>
              </div>
              <div className="anw-row-actions">
                <button onClick={() => handleTogglePublish(item)} className={`anw-toggle-pill${item.is_published ? ' on' : ''}`}>
                  {item.is_published ? '● منتشر شده' : '○ پیش‌نویس'}
                </button>
                <button onClick={() => openEditForm(item)} className="anw-edit-btn">ویرایش</button>
                <button onClick={() => handleDelete(item.id)} className="anw-delete-btn">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .anw-page { display: flex; flex-direction: column; gap: 18px; }
        .anw-head { display: flex; align-items: center; justify-content: space-between; }
        .anw-head h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }
        .anw-new-btn {
          padding: 9px 18px; border-radius: 999px; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
        }

        .anw-message {
          padding: 11px 14px; border-radius: var(--radius-sm);
          background: rgba(31,163,130,0.12); border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow); font-size: 13px;
        }

        .anw-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; max-width: 640px; }
        .anw-card h2 { font-family: var(--font-display); color: var(--teal-glow); font-size: 15px; margin-bottom: 16px; }
        .anw-form { display: flex; flex-direction: column; gap: 14px; }
        .anw-field label { display: block; color: var(--ink-dim); font-size: 12.5px; margin-bottom: 6px; }
        .anw-input, .anw-file-input {
          width: 100%; padding: 10px 13px;
          background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body);
          font-size: 13px; outline: none;
        }
        .anw-input:focus { border-color: var(--teal-glow); box-shadow: 0 0 0 3px rgba(15,111,92,0.12); }
        .anw-file-input::file-selector-button {
          background: var(--teal); color: #eefaf5; border: none; border-radius: 8px;
          padding: 6px 12px; margin-left: 10px; cursor: pointer; font-family: var(--font-body);
        }

        .anw-checkbox-label { display: flex; align-items: center; gap: 9px; cursor: pointer; }
        .anw-checkbox-label input { width: 16px; height: 16px; accent-color: var(--teal-glow); }
        .anw-checkbox-label span { color: var(--ink-dim); font-size: 13px; }

        .anw-form-actions { display: flex; gap: 10px; }
        .anw-submit-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
        }
        .anw-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .anw-cancel-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }

        .anw-loading, .anw-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .anw-list { display: flex; flex-direction: column; gap: 12px; }
        .anw-row {
          display: flex; align-items: center; gap: 14px;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-md); padding: 12px 16px;
        }
        .anw-thumb { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--line); }
        .anw-thumb-placeholder { display: grid; place-items: center; font-size: 22px; background: var(--panel-inset-bg); }

        .anw-row-info { flex: 1; min-width: 0; }
        .anw-row-info h3 { color: var(--ink); font-size: 14px; font-weight: 700; }
        .anw-row-info p { color: var(--ink-faint); font-size: 11.5px; margin-top: 4px; }

        .anw-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .anw-toggle-pill {
          font-size: 11px; padding: 5px 12px; border-radius: 999px; cursor: pointer;
          border: 1px solid var(--line); background: transparent; color: var(--ink-faint); white-space: nowrap;
        }
        .anw-toggle-pill.on { color: var(--status-ok); border-color: var(--status-ok); background: var(--status-ok-bg); }
        .anw-edit-btn, .anw-delete-btn { font-size: 11.5px; padding: 6px 13px; border-radius: 999px; cursor: pointer; border: 1px solid; white-space: nowrap; }
        .anw-edit-btn { color: var(--teal-glow); border-color: rgba(15,111,92,0.4); background: transparent; }
        .anw-delete-btn { color: #ff9aa8; border-color: rgba(255,107,125,0.4); background: transparent; }

        @media (max-width: 560px) {
          .anw-row { flex-wrap: wrap; }
          .anw-row-actions { width: 100%; justify-content: flex-start; }
        }
      `}</style>
    </div>
  )
}

export default AdminNews