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
    <div className="sp-page" dir="rtl">
      <div className="container">
        <div className="sp-head">
          <div className="section-kicker">✦ فروشگاه صنایع‌دستی ✦</div>
          <h1 className="section-title">فروشگاه</h1>
        </div>

        <div className="sp-categories">
          <button
            onClick={() => handleCategoryChange('')}
            className={`sp-cat-btn${selectedCategory === '' ? ' active' : ''}`}
          >
            همه
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`sp-cat-btn${selectedCategory === cat.id ? ' active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="sp-loading">در حال بارگذاری...</div>
        ) : products.length === 0 ? (
          <div className="sp-empty">محصولی یافت نشد</div>
        ) : (
          <div className="sp-grid">
            {products.map((product) => (
              <Link key={product.id} to={`/shop/${product.id}`} className="sp-card">
                {product.main_image ? (
                  <img src={product.main_image} alt={product.title} />
                ) : (
                  <div className="sp-card-placeholder">🛍️</div>
                )}
                <div className="sp-card-body">
                  <h2>{product.title}</h2>
                  <p>{product.category_name}</p>
                  <div className="sp-card-footer">
                    {product.discounted_price ? (
                      <div>
                        <p className="sp-price-old">{product.price?.toLocaleString('fa-IR')}</p>
                        <p className="sp-price">{product.discounted_price?.toLocaleString('fa-IR')} تومان</p>
                      </div>
                    ) : (
                      <p className="sp-price">{product.price?.toLocaleString('fa-IR')} تومان</p>
                    )}
                    <span className={`sp-stock${product.stock > 0 ? ' in' : ' out'}`}>
                      {product.stock > 0 ? 'موجود' : 'ناموجود'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .sp-page { padding: 56px 0 80px; }
        .sp-head { text-align: center; margin-bottom: 32px; }
        .sp-head .section-title { margin-top: 4px; }

        .sp-categories {
          display: flex; gap: 8px; flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 36px;
        }
        .sp-cat-btn {
          padding: 9px 18px; border-radius: 999px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink-dim);
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all .3s ease;
          font-family: var(--font-body);
        }
        .sp-cat-btn:hover { color: var(--gold-light); border-color: var(--gold); }
        .sp-cat-btn.active {
          color: #1a1206; border-color: transparent;
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
        }

        .sp-loading, .sp-empty {
          text-align: center; padding: 60px 0;
          color: var(--ink-dim); font-size: 14px;
        }

        .sp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 20px;
        }
        .sp-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all .35s cubic-bezier(.2,.7,.3,1);
        }
        .sp-card:hover {
          transform: translateY(-8px);
          border-color: var(--gold);
          box-shadow: 0 25px 45px -20px rgba(216,181,104,0.3);
        }
        .sp-card img { width: 100%; height: 190px; object-fit: cover; }
        .sp-card-placeholder {
          width: 100%; height: 190px;
          display: grid; place-items: center;
          background: rgba(10,21,18,0.5);
          font-size: 40px;
        }
        .sp-card-body { padding: 16px; }
        .sp-card-body h2 { color: var(--ink); font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .sp-card-body p { color: var(--ink-faint); font-size: 11px; margin-bottom: 12px; }
        .sp-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .sp-price { color: var(--gold-light); font-weight: 700; font-size: 14px; }
        .sp-price-old { color: var(--ink-faint); font-size: 11px; text-decoration: line-through; }
        .sp-stock {
          font-size: 11px; padding: 4px 10px; border-radius: 999px;
        }
        .sp-stock.in { background: rgba(75,214,172,0.12); color: var(--teal-glow); }
        .sp-stock.out { background: rgba(255,107,125,0.12); color: #ff9aa8; }
      `}</style>
    </div>
  )
}

export default Shop