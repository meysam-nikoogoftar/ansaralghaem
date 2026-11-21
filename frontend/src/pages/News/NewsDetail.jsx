import usePageTitle from '../../hooks/usePageTitle'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function NewsDetail() {
  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)
  usePageTitle(news?.title)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    observeLoad(() => api.get(`/content/news/${id}/`)
      .then(res => setNews(res.data))
      .catch(error => { throw error })
      .finally(() => setIsLoading(false)), "`/content/news/${id}/`")
  }, [id, observeLoad])

  if (isLoading) return <><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="nd-loading">در حال بارگذاری...</div>}</>

  if (!news) return <><LoadFeedback state={loadState} onRetry={retryLoad} />{null}</>

  return (
    <><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="nd-page" dir="rtl">
      <div className="nd-container">
        <button onClick={() => navigate('/news')} className="nd-back">← برگشت به اخبار</button>

        {news.image && <img src={news.image} alt={news.title} className="nd-image" />}

        <h1 className="nd-title">{news.title}</h1>

        <div className="nd-meta">
          <span>{new Date(news.published_at || news.created_at).toLocaleDateString('fa-IR')}</span>
          <span>👁 {news.views_count} بازدید</span>
        </div>

        <div className="nd-content">{news.content}</div>
      </div>

      <style>{`
        .nd-loading {
          min-height: 50vh;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-dim);
        }
        .nd-page { padding: 48px 0 80px; }
        .nd-container { max-width: 760px; margin: 0 auto; padding: 0 24px; }

        .nd-back {
          background: none; border: none; cursor: pointer;
          color: var(--ink-dim); font-size: 13px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px;
        }
        .nd-back:hover { color: var(--teal-glow); }

        .nd-image {
          width: 100%; height: 320px; object-fit: cover;
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          margin-bottom: 24px;
        }

        .nd-title {
          font-family: var(--font-display);
          color: var(--teal-glow);
          font-size: 26px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .nd-meta {
          display: flex; align-items: center; gap: 18px;
          color: var(--ink-faint); font-size: 12px;
          padding-bottom: 20px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--line);
        }

        .nd-content {
          color: var(--ink-dim);
          font-size: 15px;
          line-height: 2.1;
          white-space: pre-wrap;
        }
      `}</style>
    </div>}</>
  )
}

export default NewsDetail