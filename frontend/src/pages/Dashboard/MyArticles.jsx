import { useEffect, useState } from 'react'
import api from '../../services/api'

function MyArticles() {
  const [articles, setArticles] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'article', aparat_link: ''
  })

  useEffect(() => {
    api.get('/content/articles/my/')
      .then(res => setArticles(res.data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/content/articles/create/', formData)
      setIsCreating(false)
      setFormData({ title: '', content: '', category: 'article', aparat_link: '' })
      const res = await api.get('/content/articles/my/')
      setArticles(res.data)
    } catch {
      alert('خطا در ثبت دلنوشته')
    }
    setIsLoading(false)
  }

  const statusConfig = {
    pending: { label: 'در انتظار بررسی', color: '#d8b568' },
    approved: { label: 'تایید شده', color: '#4bd6ac' },
    rejected: { label: 'رد شده', color: '#ff6b7d' },
  }

  const categoryOptions = [
    { value: 'article', label: 'دلنوشته' },
    { value: 'memory', label: 'خاطره' },
    { value: 'munajat', label: 'مناجات' },
    { value: 'madahi', label: 'کلیپ مداحی' },
    { value: 'mouludi', label: 'کلیپ مولودی' },
  ]

  return (
    <div className="ma-page">
      <div className="ma-head">
        <h1>دلنوشته‌های من</h1>
        <button onClick={() => setIsCreating(true)} className="ma-new-btn">دلنوشته جدید</button>
      </div>

      {isCreating && (
        <div className="ma-card">
          <h2>ثبت دلنوشته جدید</h2>
          <form onSubmit={handleSubmit} className="ma-form">
            <div className="ma-field">
              <label>عنوان</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="ma-input"
                required
              />
            </div>
            <div className="ma-field">
              <label>دسته‌بندی</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="ma-input"
              >
                {categoryOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="ma-field">
              <label>متن</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="ma-input"
                required
              />
            </div>
            <div className="ma-field">
              <label>لینک آپارات (اختیاری)</label>
              <input
                type="text"
                value={formData.aparat_link}
                onChange={(e) => setFormData({ ...formData, aparat_link: e.target.value })}
                className="ma-input"
              />
            </div>
            <div className="ma-form-actions">
              <button type="submit" disabled={isLoading} className="ma-submit-btn">
                {isLoading ? 'در حال ثبت...' : 'ثبت دلنوشته'}
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="ma-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="ma-empty">
          <div className="ma-empty-icon">📖</div>
          <h3>دلنوشته‌ای وجود ندارد</h3>
        </div>
      ) : (
        <div className="ma-list">
          {articles.map((article) => (
            <div key={article.id} className="ma-row">
              <div>
                <h3>{article.title}</h3>
                <p>{article.content.substring(0, 100)}...</p>
              </div>
              <span
                className="ma-badge"
                style={{
                  color: statusConfig[article.status]?.color,
                  borderColor: statusConfig[article.status]?.color,
                  background: `${statusConfig[article.status]?.color}1a`,
                }}
              >
                {statusConfig[article.status]?.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ma-page { display: flex; flex-direction: column; gap: 20px; }
        .ma-head { display: flex; align-items: center; justify-content: space-between; }
        .ma-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 22px; }

        .ma-new-btn {
          padding: 10px 20px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-size: 13px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 18px -6px rgba(216,181,104,0.45);
        }

        .ma-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
          max-width: 620px;
        }
        .ma-card h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 15px;
          margin-bottom: 14px;
        }

        .ma-form { display: flex; flex-direction: column; gap: 14px; }
        .ma-field label { display: block; color: var(--ink-dim); font-size: 13px; margin-bottom: 6px; }
        .ma-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          outline: none;
        }
        .ma-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }
        select.ma-input option { background: var(--surface-2); color: var(--ink); }

        .ma-form-actions { display: flex; gap: 10px; }
        .ma-submit-btn {
          padding: 11px 22px;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          font-size: 13px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
        }
        .ma-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ma-cancel-btn {
          padding: 11px 22px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink-dim);
          font-size: 13px;
          cursor: pointer;
        }
        .ma-cancel-btn:hover { border-color: var(--gold); color: var(--gold-light); }

        .ma-empty {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 48px 24px;
          text-align: center;
        }
        .ma-empty-icon { font-size: 40px; margin-bottom: 14px; }
        .ma-empty h3 { color: var(--ink); font-size: 16px; }

        .ma-list { display: flex; flex-direction: column; gap: 14px; }
        .ma-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 16px 18px;
        }
        .ma-row h3 { color: var(--ink); font-size: 14px; font-weight: 700; }
        .ma-row p { color: var(--ink-faint); font-size: 12px; margin-top: 6px; line-height: 1.7; }
        .ma-badge {
          font-size: 12px; padding: 5px 12px; border-radius: 999px;
          border: 1px solid; white-space: nowrap; flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

export default MyArticles