import { useEffect, useState } from 'react'
import api from '../../services/api'

function MyGallery() {
  const [images, setImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: '' })
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    api.get('/content/gallery/my/')
      .then(res => setImages(res.data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('لطفاً یک تصویر انتخاب کنید')
      return
    }
    setIsLoading(true)
    try {
      const data = new FormData()
      data.append('image', selectedFile)
      data.append('title', formData.title)
      data.append('category', formData.category)
      await api.post('/content/gallery/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setIsUploading(false)
      setFormData({ title: '', category: '' })
      setSelectedFile(null)
      const res = await api.get('/content/gallery/my/')
      setImages(res.data)
    } catch {
      alert('خطا در آپلود تصویر')
    }
    setIsLoading(false)
  }

  const statusConfig = {
    pending: { label: 'در انتظار بررسی', color: '#d8b568' },
    approved: { label: 'تایید شده', color: '#4bd6ac' },
    rejected: { label: 'رد شده', color: '#ff6b7d' },
  }

  return (
    <div className="mg-page">
      <div className="mg-head">
        <h1>گالری من</h1>
        <button onClick={() => setIsUploading(true)} className="mg-new-btn">آپلود تصویر</button>
      </div>

      {isUploading && (
        <div className="mg-card">
          <h2>آپلود تصویر جدید</h2>
          <form onSubmit={handleSubmit} className="mg-form">
            <div className="mg-field">
              <label>تصویر</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mg-file-input"
                required
              />
            </div>
            <div className="mg-field">
              <label>عنوان (اختیاری)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mg-input"
              />
            </div>
            <div className="mg-field">
              <label>دسته‌بندی</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="مثلاً: اربعین ۱۴۰۴"
                className="mg-input"
              />
            </div>
            <div className="mg-form-actions">
              <button type="submit" disabled={isLoading} className="mg-submit-btn">
                {isLoading ? 'در حال آپلود...' : 'آپلود'}
              </button>
              <button type="button" onClick={() => setIsUploading(false)} className="mg-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {images.length === 0 ? (
        <div className="mg-empty">
          <div className="mg-empty-icon">🖼️</div>
          <h3>تصویری آپلود نشده</h3>
        </div>
      ) : (
        <div className="mg-grid">
          {images.map((img) => (
            <div key={img.id} className="mg-item">
              <img src={img.image} alt={img.title} />
              <div className="mg-item-body">
                {img.title && <p>{img.title}</p>}
                <span
                  className="mg-badge"
                  style={{
                    color: statusConfig[img.status]?.color,
                    borderColor: statusConfig[img.status]?.color,
                    background: `${statusConfig[img.status]?.color}1a`,
                  }}
                >
                  {statusConfig[img.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .mg-page { display: flex; flex-direction: column; gap: 20px; }
        .mg-head { display: flex; align-items: center; justify-content: space-between; }
        .mg-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 22px; }

        .mg-new-btn {
          padding: 10px 20px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-size: 13px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 18px -6px rgba(216,181,104,0.45);
        }

        .mg-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
          max-width: 520px;
        }
        .mg-card h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 15px;
          margin-bottom: 14px;
        }

        .mg-form { display: flex; flex-direction: column; gap: 14px; }
        .mg-field label { display: block; color: var(--ink-dim); font-size: 13px; margin-bottom: 6px; }
        .mg-input, .mg-file-input {
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
        .mg-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }
        .mg-file-input::file-selector-button {
          background: var(--teal);
          color: var(--gold-light);
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          margin-left: 10px;
          cursor: pointer;
          font-family: var(--font-body);
        }

        .mg-form-actions { display: flex; gap: 10px; }
        .mg-submit-btn {
          padding: 11px 22px;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          font-size: 13px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
        }
        .mg-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .mg-cancel-btn {
          padding: 11px 22px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink-dim);
          font-size: 13px;
          cursor: pointer;
        }
        .mg-cancel-btn:hover { border-color: var(--gold); color: var(--gold-light); }

        .mg-empty {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 48px 24px;
          text-align: center;
        }
        .mg-empty-icon { font-size: 40px; margin-bottom: 14px; }
        .mg-empty h3 { color: var(--ink); font-size: 16px; }

        .mg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .mg-item {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all .3s ease;
        }
        .mg-item:hover { border-color: var(--gold); transform: translateY(-3px); }
        .mg-item img { width: 100%; height: 150px; object-fit: cover; display: block; }
        .mg-item-body { padding: 12px; }
        .mg-item-body p { color: var(--ink); font-size: 13px; font-weight: 500; margin-bottom: 8px; }
        .mg-badge {
          font-size: 11px; padding: 4px 10px; border-radius: 999px;
          border: 1px solid; display: inline-block;
        }
      `}</style>
    </div>
  )
}

export default MyGallery