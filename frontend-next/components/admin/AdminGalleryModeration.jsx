'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { errorMessage, fieldErrors } from '@/lib/api/errors'
import Dialog from '@/components/ui/dialog'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { useEffect, useState } from 'react'
import api from '@/lib/admin/api'
import { safeMediaPath } from '@/lib/urls'

const statusMeta = {
  pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminGalleryModeration() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [images, setImages] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  function fetchImages() {
    const params = new URLSearchParams()
    if (statusFilter) params.append('status', statusFilter)
    observeLoad(
      () => api.get(`/content/admin/gallery/?${params.toString()}`).then(setImages),
      '`/content/admin/gallery/?${params.toString()}`',
    )
  }

  useEffect(() => {
    fetchImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleAction = async (id, action) => {
    setValidationErrors({})

    setBusyId(id)
    try {
      const res = await api.post(`/content/admin/gallery/${id}/action/`, { action })
      setImages(images.map((img) => (img.id === id ? res : img)))
      if (lightbox?.id === id) setLightbox(res)
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      alert(errorMessage(err, 'خطا در ثبت عملیات'))
    }
    setBusyId(null)
  }

  const pendingCount = images.filter((img) => img.status === 'pending').length

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="agm-page">
            <div className="agm-head">
              <h1>تایید تصاویر گالری</h1>
              {pendingCount > 0 && (
                <span className="agm-pending-badge">{pendingCount} در انتظار بررسی</span>
              )}
            </div>

            <div className="agm-status-tabs">
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
                  className={`agm-status-tab${statusFilter === t.key ? ' active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="agm-loading">در حال بارگذاری...</div>
            ) : images.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && images.length === 0 ? null : images.length === 0 ? (
              <div className="agm-empty">تصویری یافت نشد</div>
            ) : (
              <div className="agm-grid">
                {images.map((img) => (
                  <div key={img.id} className="agm-card">
                    <button
                      type="button"
                      className="agm-thumb-wrap"
                      onClick={() => setLightbox(img)}
                    >
                      <img src={safeMediaPath(img.image) ?? undefined} alt={img.title} />
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
                    </button>

                    <div className="agm-card-body">
                      <p className="agm-uploader">{img.uploader_name}</p>
                      {img.title && <p className="agm-title">{img.title}</p>}
                      {img.category && <p className="agm-category">دسته: {img.category}</p>}
                      <p className="agm-date">
                        {new Date(img.created_at).toLocaleDateString('fa-IR')}
                      </p>

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
              <Dialog
                label="نمایش تصویر"
                className="agm-lightbox"
                onClose={() => setLightbox(null)}
              >
                <div className="agm-lightbox-content" onClick={(e) => e.stopPropagation()}>
                  <img src={safeMediaPath(lightbox.image) ?? undefined} alt={lightbox.title} />
                  <div className="agm-lightbox-info">
                    <div>
                      {lightbox.title && <p className="agm-lightbox-title">{lightbox.title}</p>}
                      <p className="agm-lightbox-uploader">
                        {lightbox.uploader_name} ·{' '}
                        {new Date(lightbox.created_at).toLocaleDateString('fa-IR')}
                      </p>
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
                      <button
                        onClick={() => handleAction(lightbox.id, 'approve')}
                        disabled={busyId === lightbox.id}
                        className="agm-approve-btn"
                      >
                        {busyId === lightbox.id ? '...' : 'تایید'}
                      </button>
                      <button
                        onClick={() => handleAction(lightbox.id, 'reject')}
                        disabled={busyId === lightbox.id}
                        className="agm-reject-btn"
                      >
                        رد
                      </button>
                    </div>
                  )}
                  <button onClick={() => setLightbox(null)} className="agm-lightbox-close">
                    بستن
                  </button>
                </div>
              </Dialog>
            )}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminGalleryModeration
