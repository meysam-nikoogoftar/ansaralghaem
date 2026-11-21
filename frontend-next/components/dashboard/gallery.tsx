'use client'
import '@/styles/dashboard/gallery-page.css'
import { dashboardRequest } from '@/lib/dashboard/browser'
import { FormValidation, FormControl } from './forms'
import { useLoadFeedback, LoadFeedback } from './load-feedback'
import { fieldErrors } from '@/lib/api/errors'
import { discardResponse } from '@/lib/dashboard/browser'
import { listResponse, ownPhoto } from '@/lib/dashboard/detail-contracts'
import { safeMediaPath } from '@/lib/urls'
import type { FieldErrors } from '@/types'
import type { OwnPhoto } from '@/lib/dashboard/detail-contracts'
import type { FormEvent } from 'react'
async function request<T>(path: string, decode: (value: unknown) => T, body?: unknown) {
  return { data: await dashboardRequest(path, decode, body) }
}
import { useEffect, useState, useRef } from 'react'

function MyGallery({ initialItems }: { initialItems: OwnPhoto[] | null }) {
  const mutationPending = useRef(false)
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback(initialItems !== null)

  const [images, setImages] = useState<OwnPhoto[]>(initialItems ?? [])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (initialItems !== null) return
    observeLoad(
      () =>
        request('/content/gallery/my/', listResponse(ownPhoto).parse)
          .then((res) => setImages(res.data))
          .catch((error) => {
            throw error
          }),
      "'/content/gallery/my/'",
    )
  }, [initialItems, observeLoad])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setValidationErrors({})

    e.preventDefault()
    if (!selectedFile) {
      setValidationErrors({ image: 'لطفاً یک تصویر انتخاب کنید.' })
      return
    }
    if (mutationPending.current) return
    mutationPending.current = true
    setIsLoading(true)
    try {
      const data = new FormData()
      data.append('image', selectedFile)
      data.append('title', formData.title)
      data.append('category', formData.category)
      await request('/content/gallery/create/', discardResponse, data)
      setIsUploading(false)
      setFormData({ title: '', category: '' })
      setSelectedFile(null)
      const res = await request('/content/gallery/my/', listResponse(ownPhoto).parse)
      setImages(res.data)
    } catch (error) {
      const errors = fieldErrors(error)
      setValidationErrors(
        Object.keys(errors).length ? errors : { image: 'آپلود تصویر انجام نشد. دوباره تلاش کنید.' },
      )
    }
    mutationPending.current = false
    setIsLoading(false)
  }

  const statusConfig: Record<string, { label: string; color: string; bg?: string }> = {
    pending: { label: 'در انتظار بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
    approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
    rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  }

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="mg-page">
            <div className="mg-head">
              <h1>گالری من</h1>
              <button onClick={() => setIsUploading(true)} className="mg-new-btn">
                آپلود تصویر
              </button>
            </div>

            {isUploading && (
              <div className="mg-card">
                <h2>آپلود تصویر جدید</h2>
                <form onSubmit={handleSubmit} className="mg-form">
                  <div className="mg-field">
                    <FormControl
                      as="input"
                      label={<>تصویر</>}
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                      className="mg-file-input"
                      required
                    />
                  </div>
                  <div className="mg-field">
                    <FormControl
                      as="input"
                      label={<>عنوان (اختیاری)</>}
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mg-input"
                    />
                  </div>
                  <div className="mg-field">
                    <FormControl
                      as="input"
                      label={<>دسته‌بندی</>}
                      name="category"
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
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="mg-cancel-btn"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}

            {images.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && images.length === 0 ? null : images.length === 0 ? (
              <div className="mg-empty">
                <div className="mg-empty-icon">🖼️</div>
                <h3>تصویری آپلود نشده</h3>
              </div>
            ) : (
              <div className="mg-grid">
                {images.map((img) => (
                  <div key={img.id} className="mg-item">
                    <img src={safeMediaPath(img.image) ?? undefined} alt={img.title} />
                    <div className="mg-item-body">
                      {img.title && <p>{img.title}</p>}
                      <span
                        className="mg-badge"
                        style={{
                          color: statusConfig[img.status]?.color,
                          borderColor: statusConfig[img.status]?.color,
                          background: statusConfig[img.status]?.bg,
                        }}
                      >
                        {statusConfig[img.status]?.label}
                      </span>
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

export default MyGallery
