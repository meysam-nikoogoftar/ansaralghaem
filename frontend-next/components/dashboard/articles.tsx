'use client'
import '@/styles/dashboard/articles-page.css'
import { dashboardRequest } from '@/lib/dashboard/browser'
import { FormValidation, FormControl } from './forms'
import { useLoadFeedback, LoadFeedback } from './load-feedback'
import { fieldErrors } from '@/lib/api/errors'
import { discardResponse } from '@/lib/dashboard/browser'
import { listResponse, ownArticle } from '@/lib/dashboard/detail-contracts'
import type { FieldErrors } from '@/types'
import type { OwnArticle } from '@/lib/dashboard/detail-contracts'
import type { FormEvent } from 'react'
async function request<T>(path: string, decode: (value: unknown) => T, body?: unknown) {
  return { data: await dashboardRequest(path, decode, body) }
}
import { useEffect, useState, useRef } from 'react'

function MyArticles({ initialItems }: { initialItems: OwnArticle[] | null }) {
  const mutationPending = useRef(false)
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback(initialItems !== null)

  const [articles, setArticles] = useState<OwnArticle[]>(initialItems ?? [])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'article',
    aparat_link: '',
  })

  useEffect(() => {
    if (initialItems !== null) return
    observeLoad(
      () =>
        request('/content/articles/my/', listResponse(ownArticle).parse)
          .then((res) => setArticles(res.data))
          .catch((error) => {
            throw error
          }),
      "'/content/articles/my/'",
    )
  }, [initialItems, observeLoad])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setValidationErrors({})

    e.preventDefault()
    if (mutationPending.current) return
    mutationPending.current = true
    setIsLoading(true)
    try {
      await request('/content/articles/create/', discardResponse, formData)
      setIsCreating(false)
      setFormData({ title: '', content: '', category: 'article', aparat_link: '' })
      const res = await request('/content/articles/my/', listResponse(ownArticle).parse)
      setArticles(res.data)
    } catch (error) {
      const errors = fieldErrors(error)
      setValidationErrors(
        Object.keys(errors).length
          ? errors
          : { content: 'ثبت دلنوشته انجام نشد. دوباره تلاش کنید.' },
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

  const categoryOptions = [
    { value: 'article', label: 'دلنوشته' },
    { value: 'memory', label: 'خاطره' },
    { value: 'munajat', label: 'مناجات' },
    { value: 'madahi', label: 'کلیپ مداحی' },
    { value: 'mouludi', label: 'کلیپ مولودی' },
  ]

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="ma-page">
            <div className="ma-head">
              <h1>دلنوشته‌های من</h1>
              <button onClick={() => setIsCreating(true)} className="ma-new-btn">
                دلنوشته جدید
              </button>
            </div>

            {isCreating && (
              <div className="ma-card">
                <h2>ثبت دلنوشته جدید</h2>
                <form onSubmit={handleSubmit} className="ma-form">
                  <div className="ma-field">
                    <FormControl
                      as="input"
                      label={<>عنوان</>}
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="ma-input"
                      required
                    />
                  </div>
                  <div className="ma-field">
                    <FormControl
                      as="select"
                      label={<>دسته‌بندی</>}
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="ma-input"
                    >
                      {categoryOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </FormControl>
                  </div>
                  <div className="ma-field">
                    <FormControl
                      as="textarea"
                      label={<>متن</>}
                      name="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="ma-input"
                      required
                    />
                  </div>
                  <div className="ma-field">
                    <FormControl
                      as="input"
                      label={<>لینک آپارات (اختیاری)</>}
                      name="aparat_link"
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
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="ma-cancel-btn"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            )}

            {articles.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 && articles.length === 0 ? null : articles.length ===
              0 ? (
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
                        background: statusConfig[article.status]?.bg,
                      }}
                    >
                      {statusConfig[article.status]?.label}
                    </span>
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

export default MyArticles
