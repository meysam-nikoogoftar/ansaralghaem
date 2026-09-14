import { useEffect, useState } from 'react'
import api from '../../services/api'

const emptyForm = { title: '', description: '', total_amount: '', is_active: true, is_public: true }

function AdminContributions() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchItems = () => {
    setIsLoading(true)
    api.get('/financial/admin/contributions/')
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchItems() }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const openEditForm = (item) => {
    setEditingId(item.id)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      total_amount: item.total_amount || '',
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
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    try {
      const payload = { ...formData, total_amount: Number(formData.total_amount) || 0 }
      if (editingId) {
        const res = await api.put(`/financial/admin/contributions/${editingId}/`, payload)
        setItems(items.map(x => x.id === editingId ? res.data : x))
        setMessage('کمپین ویرایش شد')
      } else {
        const res = await api.post('/financial/admin/contributions/', payload)
        setItems([res.data, ...items])
        setMessage('کمپین جدید ایجاد شد')
      }
      setIsFormOpen(false)
    } catch {
      setMessage('خطا در ذخیره — اگه اسم فیلدها با مدل واقعی فرق داره بهم بگو')
    }
    setIsSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این کمپین حذف بشه؟')) return
    try {
      await api.delete(`/financial/admin/contributions/${id}/`)
      setItems(items.filter(x => x.id !== id))
    } catch {
      alert('خطا در حذف')
    }
  }

  const handleToggle = async (item, field) => {
    try {
      const res = await api.patch(`/financial/admin/contributions/${item.id}/`, { [field]: !item[field] })
      setItems(items.map(x => x.id === item.id ? res.data : x))
    } catch {
      alert('خطا در تغییر وضعیت')
    }
  }

  return (
    <div className="acn-page">
      <div className="acn-head">
        <h1>مشارکت‌های مالی</h1>
        <button onClick={openCreateForm} className="acn-new-btn">+ کمپین جدید</button>
      </div>

      {message && <div className="acn-message">{message}</div>}

      {isFormOpen && (
        <div className="acn-card">
          <h2>{editingId ? 'ویرایش کمپین' : 'ایجاد کمپین جدید'}</h2>
          <form onSubmit={handleSubmit} className="acn-form">
            <div className="acn-field">
              <label>عنوان کمپین</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="acn-input" required />
            </div>
            <div className="acn-field">
              <label>توضیحات</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="acn-input" />
            </div>
            <div className="acn-field">
              <label>مبلغ هدف (تومان)</label>
              <input type="number" name="total_amount" value={formData.total_amount} onChange={handleChange} className="acn-input" required />
            </div>
            <div className="acn-checks">
              <label className="acn-checkbox-label">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                <span>فعال</span>
              </label>
              <label className="acn-checkbox-label">
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
                <span>نمایش در صفحه اصلی</span>
              </label>
            </div>
            <div className="acn-form-actions">
              <button type="submit" disabled={isSaving} className="acn-submit-btn">
                {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="acn-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="acn-loading">در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="acn-empty">کمپینی ثبت نشده است</div>
      ) : (
        <div className="acn-list">
          {items.map(item => {
            const raised = item.current_amount ?? item.raised_amount ?? 0
            const percent = item.progress_percent ?? (item.total_amount ? Math.min(100, Math.round((raised / item.total_amount) * 100)) : 0)
            return (
              <div key={item.id} className="acn-item-card">
                <div className="acn-item-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description?.substring(0, 100)}</p>
                  </div>
                  <div className="acn-item-actions">
                    <button onClick={() => openEditForm(item)} className="acn-edit-btn">ویرایش</button>
                    <button onClick={() => handleDelete(item.id)} className="acn-delete-btn">حذف</button>
                  </div>
                </div>
                <div className="acn-progress-wrap">
                  <div className="acn-progress-info">
                    <span>{percent}٪ محقق‌شده</span>
                    <span>هدف: {Number(item.total_amount).toLocaleString('fa-IR')} ت</span>
                  </div>
                  <div className="acn-progress-track">
                    <div className="acn-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                <div className="acn-toggles">
                  <button onClick={() => handleToggle(item, 'is_active')} className={`acn-toggle-pill${item.is_active ? ' on' : ''}`}>
                    {item.is_active ? '● فعال' : '○ غیرفعال'}
                  </button>
                  <button onClick={() => handleToggle(item, 'is_public')} className={`acn-toggle-pill${item.is_public ? ' on' : ''}`}>
                    {item.is_public ? '● نمایش عمومی' : '○ مخفی'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .acn-page { display: flex; flex-direction: column; gap: 18px; }
        .acn-head { display: flex; align-items: center; justify-content: space-between; }
        .acn-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 21px; }
        .acn-new-btn {
          padding: 9px 18px; border-radius: 999px; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
        }

        .acn-message {
          padding: 11px 14px; border-radius: var(--radius-sm);
          background: rgba(31,163,130,0.12); border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow); font-size: 13px;
        }

        .acn-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; max-width: 560px; }
        .acn-card h2 { font-family: var(--font-display); color: var(--gold-light); font-size: 15px; margin-bottom: 16px; }
        .acn-form { display: flex; flex-direction: column; gap: 14px; }
        .acn-field label { display: block; color: var(--ink-dim); font-size: 12.5px; margin-bottom: 6px; }
        .acn-input {
          width: 100%; padding: 10px 13px;
          background: rgba(10,21,18,0.6); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body);
          font-size: 13px; outline: none;
        }
        .acn-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.1); }
        .acn-checks { display: flex; gap: 18px; }
        .acn-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .acn-checkbox-label input { width: 16px; height: 16px; accent-color: var(--gold); }
        .acn-checkbox-label span { color: var(--ink-dim); font-size: 13px; }

        .acn-form-actions { display: flex; gap: 10px; }
        .acn-submit-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
        }
        .acn-cancel-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }

        .acn-loading, .acn-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .acn-list { display: flex; flex-direction: column; gap: 14px; }
        .acn-item-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 18px 20px; }
        .acn-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .acn-item-top h3 { color: var(--ink); font-size: 14.5px; font-weight: 700; }
        .acn-item-top p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .acn-item-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .acn-edit-btn, .acn-delete-btn { font-size: 11.5px; padding: 6px 13px; border-radius: 999px; cursor: pointer; border: 1px solid; }
        .acn-edit-btn { color: var(--gold-light); border-color: rgba(216,181,104,0.4); background: transparent; }
        .acn-delete-btn { color: #ff9aa8; border-color: rgba(255,107,125,0.4); background: transparent; }

        .acn-progress-wrap { margin-bottom: 14px; }
        .acn-progress-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-dim); margin-bottom: 6px; }
        .acn-progress-track { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .acn-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light)); transition: width .5s ease; }

        .acn-toggles { display: flex; gap: 8px; }
        .acn-toggle-pill { font-size: 11.5px; padding: 5px 12px; border-radius: 999px; cursor: pointer; border: 1px solid var(--line); background: transparent; color: var(--ink-faint); }
        .acn-toggle-pill.on { color: var(--teal-glow); border-color: rgba(75,214,172,0.4); background: rgba(75,214,172,0.1); }
      `}</style>
    </div>
  )
}

export default AdminContributions