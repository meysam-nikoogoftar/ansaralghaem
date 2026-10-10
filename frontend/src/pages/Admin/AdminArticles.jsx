import { useEffect, useState } from 'react'
import api from '../../services/api'

const statusMeta = {
  pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

const categoryLabel = {
  article: 'دلنوشته',
  memory: 'خاطره',
  munajat: 'مناجات',
  madahi: 'کلیپ مداحی',
  mouludi: 'کلیپ مولودی',
}

function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchArticles = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.append('status', statusFilter)
    api.get(`/content/admin/articles/?${params.toString()}`)
      .then(res => setArticles(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleAction = async (id, action) => {
    setBusyId(id)
    try {
      const res = await api.post(`/content/admin/articles/${id}/action/`, { action })
      setArticles(articles.map(a => a.id === id ? res.data : a))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت عملیات')
    }
    setBusyId(null)
  }

  const pendingCount = articles.filter(a => a.status === 'pending').length

  return (
    <div className="aar-page">
      <div className="aar-head">
        <h1>تایید دلنوشته‌ها</h1>
        {pendingCount > 0 && <span className="aar-pending-badge">{pendingCount} در انتظار بررسی</span>}
      </div>

      <div className="aar-status-tabs">
        {[
          { key: '', label: 'همه' },
          { key: 'pending', label: 'در انتظار بررسی' },
          { key: 'approved', label: 'تایید شده' },
          { key: 'rejected', label: 'رد شده' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`aar-status-tab${statusFilter === t.key ? ' active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="aar-loading">در حال بارگذاری...</div>
      ) : articles.length === 0 ? (
        <div className="aar-empty">دلنوشته‌ای یافت نشد</div>
      ) : (
        <div className="aar-list">
          {articles.map(article => {
            const isExpanded = expandedId === article.id
            return (
              <div key={article.id} className="aar-card">
                <div className="aar-card-top">
                  {article.main_image ? (
                    <img src={article.main_image} alt={article.title} className="aar-thumb" />
                  ) : (
                    <div className="aar-thumb aar-thumb-placeholder">📖</div>
                  )}

                  <div className="aar-card-info">
                    <div className="aar-card-info-head">
                      <div>
                        <h3>{article.title}</h3>
                        <p>
                          {article.author_name} · {categoryLabel[article.category] || article.category} ·{' '}
                          {new Date(article.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                      <span
                        className="aar-badge"
                        style={{
                          color: statusMeta[article.status]?.color,
                          borderColor: statusMeta[article.status]?.color,
                          background: statusMeta[article.status]?.bg,
                        }}
                      >
                        {statusMeta[article.status]?.label || article.status}
                      </span>
                    </div>

                    <p className="aar-preview">
                      {isExpanded ? article.content : `${article.content?.substring(0, 180)}${article.content?.length > 180 ? '...' : ''}`}
                    </p>
                    {article.content?.length > 180 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : article.id)} className="aar-toggle-btn">
                        {isExpanded ? 'کمتر نشان بده' : 'ادامه متن'}
                      </button>
                    )}

                    {article.aparat_link && (
                      <a href={article.aparat_link} target="_blank" rel="noreferrer" className="aar-aparat-link">
                        🎬 مشاهده لینک آپارات
                      </a>
                    )}

                    {(article.extra_image1 || article.extra_image2 || article.extra_image3) && (
                      <div className="aar-extra-images">
                        {[article.extra_image1, article.extra_image2, article.extra_image3]
                          .filter(Boolean)
                          .map((img, i) => (
                            <img key={i} src={img} alt="" />
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {article.status === 'pending' && (
                  <div className="aar-actions">
                    <button
                      onClick={() => handleAction(article.id, 'approve')}
                      disabled={busyId === article.id}
                      className="aar-approve-btn"
                    >
                      {busyId === article.id ? '...' : 'تایید'}
                    </button>
                    <button
                      onClick={() => handleAction(article.id, 'reject')}
                      disabled={busyId === article.id}
                      className="aar-reject-btn"
                    >
                      رد کردن
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .aar-page { display: flex; flex-direction: column; gap: 18px; }
        .aar-head { display: flex; align-items: center; gap: 12px; }
        .aar-head h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }
        .aar-pending-badge {
          font-size: 11.5px; padding: 4px 12px; border-radius: 999px;
          background: var(--status-warn-bg); color: var(--status-warn); border: 1px solid var(--status-warn);
        }

        .aar-status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .aar-status-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
        }
        .aar-status-tab:hover { color: var(--teal-glow); border-color: var(--teal-glow); }
        .aar-status-tab.active { background: rgba(15,111,92,0.12); color: var(--teal-glow); border-color: var(--teal-glow); }

        .aar-loading, .aar-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .aar-list { display: flex; flex-direction: column; gap: 14px; }
        .aar-card {
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: 18px 20px;
        }
        .aar-card-top { display: flex; gap: 16px; }
        .aar-thumb {
          width: 96px; height: 96px; border-radius: var(--radius-md);
          object-fit: cover; flex-shrink: 0; border: 1px solid var(--line);
        }
        .aar-thumb-placeholder {
          display: grid; place-items: center; font-size: 28px;
          background: var(--panel-inset-bg);
        }

        .aar-card-info { flex: 1; min-width: 0; }
        .aar-card-info-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .aar-card-info-head h3 { color: var(--ink); font-size: 14.5px; font-weight: 700; }
        .aar-card-info-head p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .aar-badge { font-size: 11.5px; padding: 4px 12px; border-radius: 999px; border: 1px solid; white-space: nowrap; flex-shrink: 0; }

        .aar-preview { color: var(--ink-dim); font-size: 13px; line-height: 1.9; white-space: pre-wrap; }
        .aar-toggle-btn {
          background: none; border: none; color: var(--teal-glow); font-size: 12px;
          cursor: pointer; margin-top: 6px; padding: 0;
        }
        .aar-toggle-btn:hover { color: var(--teal-light); }

        .aar-aparat-link {
          display: inline-block; margin-top: 10px; color: var(--teal-glow); font-size: 12.5px;
        }
        .aar-aparat-link:hover { color: var(--teal-light); }

        .aar-extra-images { display: flex; gap: 8px; margin-top: 10px; }
        .aar-extra-images img {
          width: 56px; height: 56px; border-radius: 10px; object-fit: cover; border: 1px solid var(--line);
        }

        .aar-actions { display: flex; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line); }
        .aar-approve-btn, .aar-reject-btn {
          font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer; border: 1px solid;
        }
        .aar-approve-btn { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .aar-approve-btn:hover { background: rgba(75,214,172,0.22); }
        .aar-reject-btn { background: transparent; color: var(--status-danger); border-color: var(--status-danger); }
        .aar-reject-btn:hover { background: rgba(122,35,48,0.12); }
        .aar-approve-btn:disabled, .aar-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 560px) {
          .aar-card-top { flex-direction: column; }
          .aar-thumb { width: 100%; height: 160px; }
        }
      `}</style>
    </div>
  )
}

export default AdminArticles