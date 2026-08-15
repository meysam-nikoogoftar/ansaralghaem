import { useEffect, useState } from 'react'
import api from '../../services/api'

function MyGallery() {
  const [images, setImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: '' })
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    api.get('/content/gallery/my/')
      .then(res => setImages(res.data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('لطفاً یک تصویر انتخاب کنید')
      return
    }
    setIsLoading(true)
    try {
      const data = new FormData()
      data.append('image', selectedFile)
      data.append('title', formData.title)
      data.append('category', formData.category)
      await api.post('/content/gallery/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setIsUploading(false)
      setFormData({ title: '', category: '' })
      setSelectedFile(null)
      const res = await api.get('/content/gallery/my/')
      setImages(res.data)
    } catch {
      alert('خطا در آپلود تصویر')
    }
    setIsLoading(false)
  }

  const statusConfig = {
    pending: { label: 'در انتظار بررسی', color: 'bg-amber-100 text-amber-700' },
    approved: { label: 'تایید شده', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">گالری من</h1>
        <button
          onClick={() => setIsUploading(true)}
          className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          آپلود تصویر
        </button>
      </div>

      {isUploading && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">آپلود تصویر جدید</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تصویر</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان (اختیاری)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="مثلاً: اربعین ۱۴۰۴"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-800 text-white px-6 py-3 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'در حال آپلود...' : 'آپلود'}
              </button>
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm hover:bg-gray-50"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {images.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-700">تصویری آپلود نشده</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img
                src={img.image}
                alt={img.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                {img.title && (
                  <p className="text-sm font-medium text-gray-800 mb-1">{img.title}</p>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[img.status]?.color}`}>
                  {statusConfig[img.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyGallery