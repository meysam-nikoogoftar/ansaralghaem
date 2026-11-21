'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { errorMessage, fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { useEffect, useState } from 'react'
import api from '@/lib/admin/api'
import { safeAparatLink, safeMediaPath } from '@/lib/urls'

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
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [articles, setArticles] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  function fetchArticles() {
    const params = new URLSearchParams()
    if (statusFilter) params.append('status', statusFilter)
    observeLoad(
      () => api.get(`/content/admin/articles/?${params.toString()}`).then(setArticles),
      '`/content/admin/articles/?${params.toString()}`',
    )
  }

  useEffect(() => {
    fetchArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleAction = async (id, action) => {
    setValidationErrors({})

    setBusyId(id)
    try {
      const res = await api.post(`/content/admin/articles/${id}/action/`, { action })
      setArticles(articles.map((a) => (a.id === id ? res : a)))
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      alert(errorMessage(err, 'خطا در ثبت عملیات'))
    }
    setBusyId(null)
  }

  const pendingCount = articles.filter((a) => a.status === 'pending').length

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="aar-page">
            <div className="aar-head">
              <h1>تایید دلنوشته‌ها</h1>
              {pendingCount > 0 && (
                <span className="aar-pending-badge">{pendingCount} در انتظار بررسی</span>
              )}
            </div>

            <div className="aar-status-tabs">
              {[
                { key: '', label: 'همه' },
                { key: 'pending', label: 'در انتظار بررسی' },
                { key: 'approved', label: 'تایید شده' },
                { key: 'rejected', label: 'رد شده' },
              ].map((t) => (
                <button
                  aria-pressed={statusFilter === t.key}
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
            ) : articles.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && articles.length === 0 ? null : articles.length ===
              0 ? (
              <div className="aar-empty">دلنوشته‌ای یافت نشد</div>
            ) : (
              <div className="aar-list">
                {articles.map((article) => {
                  const isExpanded = expandedId === article.id
                  return (
                    <div key={article.id} className="aar-card">
                      <div className="aar-card-top">
                        {article.main_image ? (
                          <img
                            src={safeMediaPath(article.main_image) ?? undefined}
                            alt={article.title}
                            className="aar-thumb"
                          />
                        ) : (
                          <div className="aar-thumb aar-thumb-placeholder">📖</div>
                        )}

                        <div className="aar-card-info">
                          <div className="aar-card-info-head">
                            <div>
                              <h3>{article.title}</h3>
                              <p>
                                {article.author_name} ·{' '}
                                {categoryLabel[article.category] || article.category} ·{' '}
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

                          <p id={`article-preview-${article.id}`} className="aar-preview">
                            {isExpanded
                              ? article.content
                              : `${article.content?.substring(0, 180)}${article.content?.length > 180 ? '...' : ''}`}
                          </p>
                          {article.content?.length > 180 && (
                            <button
                              aria-expanded={isExpanded}
                              aria-controls={`article-preview-${article.id}`}
                              onClick={() => setExpandedId(isExpanded ? null : article.id)}
                              className="aar-toggle-btn"
                            >
                              {isExpanded ? 'کمتر نشان بده' : 'ادامه متن'}
                            </button>
                          )}

                          {safeAparatLink(article.aparat_link) && (
                            <a
                              href={safeAparatLink(article.aparat_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="aar-aparat-link"
                            >
                              🎬 مشاهده لینک آپارات
                            </a>
                          )}

                          {(article.extra_image1 ||
                            article.extra_image2 ||
                            article.extra_image3) && (
                            <div className="aar-extra-images">
                              {[article.extra_image1, article.extra_image2, article.extra_image3]
                                .filter(Boolean)
                                .map((img, i) => (
                                  <img key={i} src={safeMediaPath(img) ?? undefined} alt="" />
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
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminArticles
