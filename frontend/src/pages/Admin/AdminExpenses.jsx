import { useEffect, useState } from 'react'
import api from '../../services/api'

const emptyForm = { title: '', amount: '', category: '', description: '', date: '' }

function AdminExpenses() {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchExpenses = () => {
    setIsLoading(true)
    api.get('/financial/admin/expenses/')
      .then(res => setExpenses(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchExpenses() }, [])

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
      category: item.category || '',
      description: item.description || '',
      date: item.date || '',
    })
    setIsFormOpen(true)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    try {
      const payload = { ...formData, amount: Number(formData.amount) || 0 }
      if (editingId) {
        const res = await api.put(`/financial/admin/expenses/${editingId}/`, payload)
        setExpenses(expenses.map(x => x.id === editingId ? res.data : x))
        setMessage('هزینه ویرایش شد')
      } else {
        const res = await api.post('/financial/admin/expenses/', payload)
        setExpenses([res.data, ...expenses])
        setMessage('هزینه ثبت شد')
      }
      setIsFormOpen(false)
    } catch {
      setMessage('خطا در ذخیره — اگه اسم فیلدها با مدل واقعی فرق داره بهم بگو تا اصلاح کنم')
    }
    setIsSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('این ریزهزینه حذف بشه؟')) return
    try {
      await api.delete(`/financial/admin/expenses/${id}/`)
      setExpenses(expenses.filter(x => x.id !== id))
    } catch {
      alert('خطا در حذف')
    }
  }

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  return (
    <div className="aex-page">
      <div className="aex-head">
        <h1>ریزهزینه‌ها</h1>
        <button onClick={openCreateForm} className="aex-new-btn">+ ثبت هزینه جدید</button>
      </div>

      <div className="aex-total-card">
        <p>مجموع هزینه‌های ثبت‌شده</p>
        <strong>{total.toLocaleString('fa-IR')} تومان</strong>
      </div>

      {message && <div className="aex-message">{message}</div>}

      {isFormOpen && (
        <div className="aex-card">
          <h2>{editingId ? 'ویرایش هزینه' : 'ثبت هزینه جدید'}</h2>
          <form onSubmit={handleSubmit} className="aex-form">
            <div className="aex-grid">
              <div className="aex-field">
                <label>عنوان</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="aex-input" required />
              </div>
              <div className="aex-field">
                <label>مبلغ (تومان)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="aex-input" required />
              </div>
              <div className="aex-field">
                <label>دسته‌بندی</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="مثلاً: اسکان، حمل‌ونقل، تغذیه" className="aex-input" />
              </div>
              <div className="aex-field">
                <label>تاریخ</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="aex-input" />
              </div>
              <div className="aex-field aex-span-2">
                <label>توضیحات</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="aex-input" />
              </div>
            </div>
            <div className="aex-form-actions">
              <button type="submit" disabled={isSaving} className="aex-submit-btn">
                {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="aex-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="aex-loading">در حال بارگذاری...</div>
      ) : expenses.length === 0 ? (
        <div className="aex-empty">هزینه‌ای ثبت نشده است</div>
      ) : (
        <div className="aex-table-wrap">
          <table className="aex-table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>دسته‌بندی</th>
                <th>مبلغ</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.category || '—'}</td>
                  <td className="aex-amount">{Number(item.amount).toLocaleString('fa-IR')} ت</td>
                  <td>{item.date || '—'}</td>
                  <td>
                    <div className="aex-row-actions">
                      <button onClick={() => openEditForm(item)} className="aex-edit-btn">ویرایش</button>
                      <button onClick={() => handleDelete(item.id)} className="aex-delete-btn">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .aex-page { display: flex; flex-direction: column; gap: 18px; }
        .aex-head { display: flex; align-items: center; justify-content: space-between; }
        .aex-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 21px; }
        .aex-new-btn {
          padding: 9px 18px; border-radius: 999px; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
        }

        .aex-total-card {
          background: linear-gradient(135deg, var(--teal), var(--teal-light));
          border-radius: var(--radius-lg); padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .aex-total-card p { color: rgba(255,255,255,0.85); font-size: 13px; }
        .aex-total-card strong { color: #fff; font-size: 20px; font-family: var(--font-display); }

        .aex-message {
          padding: 11px 14px; border-radius: var(--radius-sm);
          background: rgba(31,163,130,0.12); border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow); font-size: 13px;
        }

        .aex-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; }
        .aex-card h2 { font-family: var(--font-display); color: var(--gold-light); font-size: 15px; margin-bottom: 16px; }
        .aex-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .aex-span-2 { grid-column: span 2; }
        .aex-field label { display: block; color: var(--ink-dim); font-size: 12.5px; margin-bottom: 6px; }
        .aex-input {
          width: 100%; padding: 10px 13px;
          background: rgba(10,21,18,0.6); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body);
          font-size: 13px; outline: none;
        }
        .aex-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.1); }

        .aex-form-actions { display: flex; gap: 10px; margin-top: 16px; }
        .aex-submit-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
        }
        .aex-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .aex-cancel-btn {
          padding: 10px 22px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }

        .aex-loading, .aex-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .aex-table-wrap { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow-x: auto; }
        .aex-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .aex-table th {
          text-align: right; padding: 12px 16px; color: var(--ink-faint);
          font-size: 11.5px; border-bottom: 1px solid var(--line); white-space: nowrap;
        }
        .aex-table td { padding: 12px 16px; color: var(--ink); border-bottom: 1px solid var(--line); white-space: nowrap; }
        .aex-table tr:last-child td { border-bottom: none; }
        .aex-amount { color: #ff9aa8; font-weight: 600; }
        .aex-row-actions { display: flex; gap: 8px; }
        .aex-edit-btn, .aex-delete-btn { font-size: 11.5px; padding: 6px 13px; border-radius: 999px; cursor: pointer; border: 1px solid; }
        .aex-edit-btn { color: var(--gold-light); border-color: rgba(216,181,104,0.4); background: transparent; }
        .aex-delete-btn { color: #ff9aa8; border-color: rgba(255,107,125,0.4); background: transparent; }
      `}</style>
    </div>
  )
}

export default AdminExpenses