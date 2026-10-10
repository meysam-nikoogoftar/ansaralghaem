import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const categoryOptions = [
  { value: '', label: 'همه' },
  { value: 'article', label: 'دلنوشته' },
  { value: 'memory', label: 'خاطره' },
  { value: 'munajat', label: 'مناجات' },
  { value: 'madahi', label: 'کلیپ مداحی' },
  { value: 'mouludi', label: 'کلیپ مولودی' },
]

const categoryLabel = Object.fromEntries(categoryOptions.map(c => [c.value, c.label]))

function Articles() {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    setIsLoading(true)
    const url = category ? `/content/articles/?category=${category}` : '/content/articles/'
    api.get(url)
      .then(res => setArticles(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [category])

  return (
    <div className="pa-page" dir="rtl">
      <div className="container">
        <div className="pa-head">
          <div className="section-kicker">✦ دلنوشته‌ها ✦</div>
          <h1 className="section-title">دلنوشته‌ها و خاطرات</h1>
          <p className="section-desc">دلنوشته، خاطره، مناجات و کلیپ‌های مداحی و مولودی ارسالی زائرین و اعضای هیئت</p>
        </div>

        <div className="pa-tabs">
          {categoryOptions.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`pa-tab${category === c.value ? ' active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="pa-loading">در حال بارگذاری...</div>
        ) : articles.length === 0 ? (
          <div className="pa-empty">دلنوشته‌ای یافت نشد</div>
        ) : (
          <div className="pa-grid">
            {articles.map(article => (
              <Link key={article.id} to={`/articles/${article.id}`} className="pa-card">
                {article.main_image ? (
                  <img src={article.main_image} alt={article.title} loading="lazy" />
                ) : (
                  <div className="pa-card-placeholder">📖</div>
                )}
                <div className="pa-card-body">
                  <span className="pa-cat">{categoryLabel[article.category] || article.category}</span>
                  <h2>{article.title}</h2>
                  <p>{article.content?.substring(0, 110)}...</p>
                  <div className="pa-card-meta">
                    <span>{article.author_name}</span>
                    <span>👁 {article.views_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pa-loading { min-height: 50vh; display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
        .pa-page { padding: 56px 0 80px; }
        .pa-head { text-align: center; margin-bottom: 32px; }
        .pa-head .section-title { margin-top: 4px; }

        .pa-tabs { display: flex; justify-content: center; gap: 8px; margin-bottom: 36px; flex-wrap: wrap; }
        .pa-tab {
          padding: 9px 18px; border-radius: 999px; background: transparent;
          border: 1px solid var(--line); color: var(--ink-dim); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .3s ease; font-family: var(--font-body);
        }
        .pa-tab:hover { color: var(--teal-glow); border-color: var(--teal-glow); }
        .pa-tab.active { color: #eefaf5; border-color: transparent; background: linear-gradient(135deg, var(--teal-light), var(--teal)); }

        .pa-empty { text-align: center; padding: 60px 0; color: var(--ink-dim); font-size: 14px; }

        .pa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .pa-card {
          background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md);
          overflow: hidden; display: flex; flex-direction: column;
          transition: all .35s cubic-bezier(.2,.7,.3,1);
        }
        .pa-card:hover { transform: translateY(-8px); border-color: var(--teal-glow); box-shadow: 0 25px 45px -20px rgba(15,111,92,0.3); }
        .pa-card img { width: 100%; height: 170px; object-fit: cover; transition: transform .6s ease; }
        .pa-card:hover img { transform: scale(1.08); }
        .pa-card-placeholder { width: 100%; height: 170px; display: grid; place-items: center; font-size: 36px; background: var(--panel-inset-bg); }
        .pa-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
        .pa-cat { color: var(--teal-glow); font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-bottom: 6px; }
        .pa-card-body h2 { font-family: var(--font-display); color: var(--teal-glow); font-size: 16px; line-height: 1.6; margin-bottom: 8px; }
        .pa-card-body p { color: var(--ink-dim); font-size: 13px; line-height: 1.8; flex: 1; }
        .pa-card-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line);
          color: var(--ink-faint); font-size: 11px;
        }
      `}</style>
    </div>
  )
}

export default Articles