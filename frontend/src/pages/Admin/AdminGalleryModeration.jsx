import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusMeta = {
  pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminGalleryModeration() {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const fetchImages = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.append('status', statusFilter)
    api.get(`/content/admin/gallery/?${params.toString()}`)
      .then(res => setImages(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleAction = async (id, action) => {
    setBusyId(id)
    try {
      const res = await api.post(`/content/admin/gallery/${id}/action/`, { action })
      setImages(images.map(img => img.id === id ? res.data : img))
      if (lightbox?.id === id) setLightbox(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت عملیات')
    }
    setBusyId(null)
  }

  const pendingCount = images.filter(img => img.status === 'pending').length

  return (
    <div className="agm-page">
      <div className="agm-head">
        <h1>تایید تصاویر گالری</h1>
        {pendingCount > 0 && <span className="agm-pending-badge">{pendingCount} در انتظار بررسی</span>}
      </div>

      <div className="agm-status-tabs">
        {[
          { key: '', label: 'همه' },
          { key: 'pending', label: 'در انتظار بررسی' },
          { key: 'approved', label: 'تایید شده' },
          { key: 'rejected', label: 'رد شده' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`agm-status-tab${statusFilter === t.key ? ' active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="agm-loading">در حال بارگذاری...</div>
      ) : images.length === 0 ? (
        <div className="agm-empty">تصویری یافت نشد</div>
      ) : (
        <div className="agm-grid">
          {images.map(img => (
            <div key={img.id} className="agm-card">
              <div className="agm-thumb-wrap" onClick={() => setLightbox(img)}>
                <img src={img.image} alt={img.title} />
                <span
                  className="agm-badge"
                  style={{
                    color: statusMeta[img.status]?.color,
                    borderColor: statusMeta[img.status]?.color,
                    background: statusMeta[img.status]?.bg,
                  }}
                >
                  {statusMeta[img.status]?.label}
                </span>
              </div>

              <div className="agm-card-body">
                <p className="agm-uploader">{img.uploader_name}</p>
                {img.title && <p className="agm-title">{img.title}</p>}
                {img.category && <p className="agm-category">دسته: {img.category}</p>}
                <p className="agm-date">{new Date(img.created_at).toLocaleDateString('fa-IR')}</p>

                {img.status === 'pending' && (
                  <div className="agm-actions">
                    <button
                      onClick={() => handleAction(img.id, 'approve')}
                      disabled={busyId === img.id}
                      className="agm-approve-btn"
                    >
                      {busyId === img.id ? '...' : 'تایید'}
                    </button>
                    <button
                      onClick={() => handleAction(img.id, 'reject')}
                      disabled={busyId === img.id}
                      className="agm-reject-btn"
                    >
                      رد
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="agm-lightbox" onClick={() => setLightbox(null)}>
          <div className="agm-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.title} />
            <div className="agm-lightbox-info">
              <div>
                {lightbox.title && <p className="agm-lightbox-title">{lightbox.title}</p>}
                <p className="agm-lightbox-uploader">{lightbox.uploader_name} · {new Date(lightbox.created_at).toLocaleDateString('fa-IR')}</p>
              </div>
              <span
                className="agm-badge"
                style={{
                  color: statusMeta[lightbox.status]?.color,
                  borderColor: statusMeta[lightbox.status]?.color,
                  background: statusMeta[lightbox.status]?.bg,
                }}
              >
                {statusMeta[lightbox.status]?.label}
              </span>
            </div>
            {lightbox.status === 'pending' && (
              <div className="agm-lightbox-actions">
                <button onClick={() => handleAction(lightbox.id, 'approve')} disabled={busyId === lightbox.id} className="agm-approve-btn">
                  {busyId === lightbox.id ? '...' : 'تایید'}
                </button>
                <button onClick={() => handleAction(lightbox.id, 'reject')} disabled={busyId === lightbox.id} className="agm-reject-btn">
                  رد
                </button>
              </div>
            )}
            <button onClick={() => setLightbox(null)} className="agm-lightbox-close">بستن</button>
          </div>
        </div>
      )}

      <style>{`
        .agm-page { display: flex; flex-direction: column; gap: 18px; }
        .agm-head { display: flex; align-items: center; gap: 12px; }
        .agm-head h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }
        .agm-pending-badge {
          font-size: 11.5px; padding: 4px 12px; border-radius: 999px;
          background: var(--status-warn-bg); color: var(--status-warn); border: 1px solid var(--status-warn);
        }

        .agm-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .agm-status-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
        }
        .agm-status-tab:hover { color: var(--teal-glow); border-color: var(--teal-glow); }
        .agm-status-tab.active { background: rgba(15,111,92,0.12); color: var(--teal-glow); border-color: var(--teal-glow); }

        .agm-loading, .agm-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .agm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
        .agm-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; transition: all .3s ease; }
        .agm-card:hover { border-color: var(--teal-glow); }

        .agm-thumb-wrap { position: relative; cursor: pointer; }
        .agm-thumb-wrap img { width: 100%; height: 220px; object-fit: cover; display: block; }
        .agm-badge {
          position: absolute; top: 8px; left: 8px;
          font-size: 10.5px; padding: 3px 10px; border-radius: 999px; border: 1px solid; backdrop-filter: blur(6px);
        }

        .agm-card-body { padding: 12px; }
        .agm-uploader { color: var(--ink); font-size: 12.5px; font-weight: 600; }
        .agm-title { color: var(--ink-dim); font-size: 12px; margin-top: 2px; }
        .agm-category { color: var(--ink-faint); font-size: 11px; margin-top: 4px; }
        .agm-date { color: var(--ink-faint); font-size: 10.5px; margin-top: 4px; }

        .agm-actions { display: flex; gap: 8px; margin-top: 10px; }
        .agm-approve-btn, .agm-reject-btn {
          flex: 1; font-size: 11.5px; padding: 7px 10px; border-radius: 999px; cursor: pointer; border: 1px solid;
        }
        .agm-approve-btn { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .agm-approve-btn:hover { background: rgba(75,214,172,0.22); }
        .agm-reject-btn { background: transparent; color: var(--status-danger); border-color: var(--status-danger); }
        .agm-reject-btn:hover { background: rgba(122,35,48,0.12); }
        .agm-approve-btn:disabled, .agm-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .agm-lightbox {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(6,13,11,0.9); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .agm-lightbox-content { max-width: 820px; width: 100%; text-align: center; }
        .agm-lightbox-content img { width: 100%; max-height: 80vh; object-fit: contain; border-radius: var(--radius-lg); border: 1px solid var(--line); }
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-top: 16px; text-align: right;
        }
        .agm-lightbox-title { color: var(--ink); font-size: 14px; font-weight: 600; }
        .agm-lightbox-uploader { color: var(--ink-faint); font-size: 11.5px; margin-top: 4px; }
        .agm-lightbox-actions { display: flex; gap: 10px; margin-top: 16px; }
        .agm-lightbox-close {
          margin: 14px auto 0; display: block; padding: 9px 22px; border-radius: 999px;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }
        .agm-lightbox-close:hover { border-color: var(--teal-glow); color: var(--teal-glow); }
      `}</style>
    </div>
  )
}

export default AdminGalleryModeration