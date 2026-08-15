import { useEffect, useState } from 'react'
import api from '../../services/api'

function Gallery() {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/content/gallery/')
      .then(res => setImages(res.data))
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">گالری تصاویر</h1>

      {images.length === 0 ? (
        <div className="text-center py-16 text-gray-500">تصویری وجود ندارد</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelected(img)}
              className="cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={img.image}
                alt={img.title}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.image}
              alt={selected.title}
              className="w-full rounded-2xl"
            />
            {selected.title && (
              <p className="text-white text-center mt-4 font-medium">{selected.title}</p>
            )}
            <p className="text-gray-400 text-center text-sm mt-1">{selected.uploader_name}</p>
            <button
              onClick={() => setSelected(null)}
              className="block mx-auto mt-4 text-white border border-white px-6 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery