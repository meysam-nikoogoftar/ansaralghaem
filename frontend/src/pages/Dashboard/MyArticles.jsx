import { useEffect, useState } from 'react'
import api from '../../services/api'

function MyArticles() {
  const [articles, setArticles] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'article', aparat_link: ''
  })

  useEffect(() => {
    api.get('/content/articles/my/')
      .then(res => setArticles(res.data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/content/articles/create/', formData)
      setIsCreating(false)
      setFormData({ title: '', content: '', category: 'article', aparat_link: '' })
      const res = await api.get('/content/articles/my/')
      setArticles(res.data)
    } catch {
      alert('خطا در ثبت دلنوشته')
    }
    setIsLoading(false)
  }

  const statusConfig = {
    pending: { label: 'در انتظار بررسی', color: 'bg-amber-100 text-amber-700' },
    approved: { label: 'تایید شده', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700' },
  }

  const categoryOptions = [
    { value: 'article', label: 'دلنوشته' },
    { value: 'memory', label: 'خاطره' },
    { value: 'munajat', label: 'مناجات' },
    { value: 'madahi', label: 'کلیپ مداحی' },
    { value: 'mouludi', label: 'کلیپ مولودی' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">دلنوشته‌های من</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          دلنوشته جدید
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">ثبت دلنوشته جدید</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categoryOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">متن</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لینک آپارات (اختیاری)</label>
              <input
                type="text"
                value={formData.aparat_link}
                onChange={(e) => setFormData({ ...formData, aparat_link: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-800 text-white px-6 py-3 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'در حال ثبت...' : 'ثبت دلنوشته'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm hover:bg-gray-50"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-lg font-medium text-gray-700">دلنوشته‌ای وجود ندارد</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{article.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {article.content.substring(0, 100)}...
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[article.status]?.color}`}>
                  {statusConfig[article.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyArticles