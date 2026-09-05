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

  if (isLoading) return <div className="nw-loading">در حال بارگذاری...</div>

  return (
    <div className="nw-page" dir="rtl">
      <div className="container">
        <div className="nw-head">
          <div className="section-kicker">✦ اخبار و اطلاعیه‌ها ✦</div>
          <h1 className="section-title">اخبار و اطلاعیه‌ها</h1>
        </div>

        {news.length === 0 ? (
          <div className="nw-empty">خبری وجود ندارد</div>
        ) : (
          <div className="nw-grid">
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.id}`} className="nw-card">
                {item.image && <img src={item.image} alt={item.title} loading="lazy" />}
                <div className="nw-card-body">
                  <h2>{item.title}</h2>
                  <p>{item.content?.substring(0, 130)}...</p>
                  <div className="nw-card-meta">
                    <span>{new Date(item.published_at || item.created_at).toLocaleDateString('fa-IR')}</span>
                    <span>👁 {item.views_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .nw-loading {
          min-height: 50vh;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-dim);
        }
        .nw-page { padding: 56px 0 80px; }
        .nw-head { text-align: center; margin-bottom: 40px; }
        .nw-head .section-title { margin-top: 4px; }

        .nw-empty {
          text-align: center; padding: 60px 0;
          color: var(--ink-dim); font-size: 14px;
        }

        .nw-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .nw-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: all .35s cubic-bezier(.2,.7,.3,1);
        }
        .nw-card:hover {
          transform: translateY(-8px);
          border-color: var(--gold);
          box-shadow: 0 25px 45px -20px rgba(216,181,104,0.3);
        }
        .nw-card img {
          width: 100%; height: 170px; object-fit: cover;
          transition: transform .6s ease;
        }
        .nw-card:hover img { transform: scale(1.08); }
        .nw-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
        .nw-card-body h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .nw-card-body p {
          color: var(--ink-dim); font-size: 13px; line-height: 1.8; flex: 1;
        }
        .nw-card-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 14px; padding-top: 12px;
          border-top: 1px solid var(--line);
          color: var(--ink-faint); font-size: 11px;
        }
      `}</style>
    </div>
  )
}

export default News