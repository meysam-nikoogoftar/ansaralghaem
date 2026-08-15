import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function Shop() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/shop/categories/')
      .then(res => setCategories(res.data))
      .catch(() => {})

    fetchProducts()
  }, [])

  const fetchProducts = (categoryId = '') => {
    setIsLoading(true)
    const url = categoryId ? `/shop/products/?category=${categoryId}` : '/shop/products/'
    api.get(url)
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    fetchProducts(categoryId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">فروشگاه</h1>

      {/* دسته‌بندی‌ها */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === ''
              ? 'bg-green-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          همه
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === cat.id
                ? 'bg-green-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">محصولی یافت نشد</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/shop/${product.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {product.main_image ? (
                <img
                  src={product.main_image}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🛍️</span>
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-gray-800 mb-2">{product.title}</h2>
                <p className="text-xs text-gray-500 mb-3">{product.category_name}</p>
                <div className="flex items-center justify-between">
                  {product.discounted_price ? (
                    <div>
                      <p className="text-gray-400 line-through text-xs">
                        {product.price?.toLocaleString()}
                      </p>
                      <p className="text-green-700 font-bold">
                        {product.discounted_price?.toLocaleString()} تومان
                      </p>
                    </div>
                  ) : (
                    <p className="text-green-700 font-bold">
                      {product.price?.toLocaleString()} تومان
                    </p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? 'موجود' : 'ناموجود'}
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

export default Shop