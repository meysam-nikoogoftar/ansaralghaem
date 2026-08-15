import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get(`/content/news/${id}/`)
      .then(res => setNews(res.data))
      .catch(() => navigate('/news'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">در حال بارگذاری...</div>
    </div>
  )

  if (!news) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <button
        onClick={() => navigate('/news')}
        className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
      >
        ← برگشت به اخبار
      </button>

      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-4">{news.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-4 border-b">
        <span>
          {new Date(news.published_at || news.created_at).toLocaleDateString('fa-IR')}
        </span>
        <span>👁 {news.views_count} بازدید</span>
      </div>

      <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
        {news.content}
      </div>
    </div>
  )
}

export default NewsDetail