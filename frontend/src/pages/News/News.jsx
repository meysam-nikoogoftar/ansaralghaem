import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function News() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/content/news/')
      .then(res => setNews(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">در حال بارگذاری...</div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">اخبار و اطلاعیه‌ها</h1>

      {news.length === 0 ? (
        <div className="text-center py-16 text-gray-500">خبری وجود ندارد</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-3">
                  {item.content?.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    {new Date(item.published_at || item.created_at).toLocaleDateString('fa-IR')}
                  </span>
                  <span className="text-xs text-gray-400">
                    👁 {item.views_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default News