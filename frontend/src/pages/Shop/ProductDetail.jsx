import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/shop/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/shop'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!address || !postalCode) {
      alert('لطفاً آدرس و کد پستی را وارد کنید')
      return
    }
    setIsOrdering(true)
    try {
      await api.post('/shop/orders/create/', {
        product: id,
        quantity,
        address,
        postal_code: postalCode
      })
      setMessage('سفارش با موفقیت ثبت شد')
    } catch (err) {
      setMessage(err.response?.data?.error || 'خطا در ثبت سفارش')
    }
    setIsOrdering(false)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">در حال بارگذاری...</div>
    </div>
  )

  if (!product) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      <button
        onClick={() => navigate('/shop')}
        className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
      >
        ← برگشت به فروشگاه
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* تصویر محصول */}
          <div className="h-80 bg-gray-100">
            {product.main_image ? (
              <img
                src={product.main_image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🛍️</span>
              </div>
            )}
          </div>

          {/* اطلاعات محصول */}
          <div className="p-8">
            <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
            <p className="text-xs text-gray-400 mb-4">کد محصول: {product.code}</p>

            {product.discounted_price ? (
              <div className="mb-4">
                <p className="text-gray-400 line-through text-sm">
                  {product.price?.toLocaleString()} تومان
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {product.discounted_price?.toLocaleString()} تومان
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-green-700 mb-4">
                {product.price?.toLocaleString()} تومان
              </p>
            )}

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            <span className={`text-sm px-3 py-1 rounded-full mb-6 inline-block ${
              product.stock > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {product.stock > 0 ? `موجود (${product.stock} عدد)` : 'ناموجود'}
            </span>

            {product.stock > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">تعداد:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آدرس تحویل</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">کد پستی</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
                    {message}
                  </div>
                )}

                <button
                  onClick={handleOrder}
                  disabled={isOrdering}
                  className="w-full bg-green-800 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isOrdering ? 'در حال ثبت...' : 'ثبت سفارش'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail