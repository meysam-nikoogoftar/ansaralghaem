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

  if (isLoading) return <div className="pd-loading">در حال بارگذاری...</div>

  if (!product) return null

  return (
    <div className="pd-page" dir="rtl">
      <div className="pd-container">
        <button onClick={() => navigate('/shop')} className="pd-back">← برگشت به فروشگاه</button>

        <div className="pd-card">
          <div className="pd-grid">
            <div className="pd-image">
              {product.main_image ? (
                <img src={product.main_image} alt={product.title} />
              ) : (
                <div className="pd-image-placeholder">🛍️</div>
              )}
            </div>

            <div className="pd-info">
              <p className="pd-category">{product.category_name}</p>
              <h1>{product.title}</h1>
              <p className="pd-code">کد محصول: {product.code}</p>

              {product.discounted_price ? (
                <div className="pd-price-block">
                  <p className="pd-price-old">{product.price?.toLocaleString('fa-IR')} تومان</p>
                  <p className="pd-price">{product.discounted_price?.toLocaleString('fa-IR')} تومان</p>
                </div>
              ) : (
                <p className="pd-price pd-price-solo">{product.price?.toLocaleString('fa-IR')} تومان</p>
              )}

              <p className="pd-desc">{product.description}</p>

              <span className={`pd-stock${product.stock > 0 ? ' in' : ' out'}`}>
                {product.stock > 0 ? `موجود (${product.stock} عدد)` : 'ناموجود'}
              </span>

              {product.stock > 0 && (
                <div className="pd-order-form">
                  <div className="pd-qty-row">
                    <label>تعداد:</label>
                    <div className="pd-qty-control">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                    </div>
                  </div>

                  <div className="pd-field">
                    <label>آدرس تحویل</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="pd-input" />
                  </div>

                  <div className="pd-field">
                    <label>کد پستی</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="pd-input" />
                  </div>

                  {message && (
                    <div className={`pd-message ${message.includes('موفقیت') ? 'success' : 'error'}`}>
                      {message}
                    </div>
                  )}

                  <button onClick={handleOrder} disabled={isOrdering} className="pd-submit">
                    {isOrdering ? 'در حال ثبت...' : 'ثبت سفارش'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pd-loading {
          min-height: 50vh;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-dim);
        }
        .pd-page { padding: 48px 0 80px; }
        .pd-container { max-width: 920px; margin: 0 auto; padding: 0 24px; }

        .pd-back {
          background: none; border: none; cursor: pointer;
          color: var(--ink-dim); font-size: 13px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px;
        }
        .pd-back:hover { color: var(--gold-light); }

        .pd-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .pd-image { background: rgba(10,21,18,0.5); min-height: 320px; }
        .pd-image img { width: 100%; height: 100%; object-fit: cover; }
        .pd-image-placeholder {
          width: 100%; height: 100%;
          display: grid; place-items: center;
          font-size: 60px;
        }

        .pd-info { padding: 32px; }
        .pd-category { color: var(--ink-faint); font-size: 12px; margin-bottom: 6px; }
        .pd-info h1 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 22px;
          margin-bottom: 6px;
        }
        .pd-code { color: var(--ink-faint); font-size: 11px; margin-bottom: 16px; }

        .pd-price-block { margin-bottom: 16px; }
        .pd-price-old { color: var(--ink-faint); font-size: 12px; text-decoration: line-through; }
        .pd-price { color: var(--teal-glow); font-weight: 700; font-size: 20px; }
        .pd-price-solo { margin-bottom: 16px; }

        .pd-desc { color: var(--ink-dim); font-size: 13px; line-height: 1.9; margin-bottom: 20px; }

        .pd-stock {
          display: inline-block;
          font-size: 12px; padding: 6px 14px; border-radius: 999px;
          margin-bottom: 20px;
        }
        .pd-stock.in { background: rgba(75,214,172,0.12); color: var(--teal-glow); }
        .pd-stock.out { background: rgba(255,107,125,0.12); color: #ff9aa8; }

        .pd-order-form { display: flex; flex-direction: column; gap: 14px; }
        .pd-qty-row { display: flex; align-items: center; gap: 14px; }
        .pd-qty-row label { color: var(--ink-dim); font-size: 13px; }
        .pd-qty-control { display: flex; align-items: center; gap: 10px; }
        .pd-qty-control button {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink-dim);
          cursor: pointer;
        }
        .pd-qty-control button:hover { border-color: var(--gold); color: var(--gold-light); }
        .pd-qty-control span { color: var(--ink); font-weight: 600; width: 20px; text-align: center; }

        .pd-field label { display: block; color: var(--ink-dim); font-size: 13px; margin-bottom: 6px; }
        .pd-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          outline: none;
        }
        .pd-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }

        .pd-message {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }
        .pd-message.success {
          background: rgba(31,163,130,0.15);
          border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow);
        }
        .pd-message.error {
          background: rgba(122,35,48,0.2);
          border: 1px solid rgba(122,35,48,0.4);
          color: #ff9aa8;
        }

        .pd-submit {
          width: 100%;
          padding: 14px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 15px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 20px -6px rgba(216,181,104,0.45);
          transition: transform .25s ease;
        }
        .pd-submit:hover:not(:disabled) { transform: translateY(-2px); }
        .pd-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 700px) {
          .pd-grid { grid-template-columns: 1fr; }
          .pd-image { min-height: 240px; }
        }
      `}</style>
    </div>
  )
}

export default ProductDetail