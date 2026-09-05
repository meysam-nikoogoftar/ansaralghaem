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

  if (isLoading) return <div className="gl-loading">در حال بارگذاری...</div>

  return (
    <div className="gl-page" dir="rtl">
      <div className="container">
        <div className="gl-head">
          <div className="section-kicker">✦ گالری تصاویر ✦</div>
          <h1 className="section-title">گالری تصاویر</h1>
        </div>

        {images.length === 0 ? (
          <div className="gl-empty">تصویری وجود ندارد</div>
        ) : (
          <div className="gl-grid">
            {images.map((img) => (
              <div key={img.id} onClick={() => setSelected(img)} className="gl-item">
                <img src={img.image} alt={img.title} loading="lazy" />
                <div className="gl-item-overlay">
                  <span>{img.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="gl-lightbox" onClick={() => setSelected(null)}>
          <div className="gl-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selected.image} alt={selected.title} />
            {selected.title && <p className="gl-lightbox-title">{selected.title}</p>}
            <p className="gl-lightbox-uploader">{selected.uploader_name}</p>
            <button onClick={() => setSelected(null)} className="gl-lightbox-close">بستن</button>
          </div>
        </div>
      )}

      <style>{`
        .gl-loading {
          min-height: 50vh;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-dim);
        }
        .gl-page { padding: 56px 0 80px; }
        .gl-head { text-align: center; margin-bottom: 40px; }
        .gl-head .section-title { margin-top: 4px; }

        .gl-empty { text-align: center; padding: 60px 0; color: var(--ink-dim); font-size: 14px; }

        .gl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .gl-item {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid var(--line);
          cursor: pointer;
          transition: all .4s ease;
        }
        .gl-item:hover { transform: translateY(-6px); border-color: var(--gold); box-shadow: 0 20px 40px -15px rgba(216,181,104,0.3); }
        .gl-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; }
        .gl-item:hover img { transform: scale(1.1); }
        .gl-item-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 45%, rgba(6,13,11,0.9));
          display: flex; align-items: flex-end; padding: 12px;
          opacity: 0; transition: opacity .3s ease;
        }
        .gl-item:hover .gl-item-overlay { opacity: 1; }
        .gl-item-overlay span { color: var(--gold-light); font-size: 13px; font-weight: 600; }

        .gl-lightbox {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(6,13,11,0.9);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .gl-lightbox-content { max-width: 720px; width: 100%; text-align: center; }
        .gl-lightbox-content img {
          width: 100%; border-radius: var(--radius-lg);
          border: 1px solid var(--line);
        }
        .gl-lightbox-title { color: var(--gold-light); margin-top: 16px; font-weight: 600; }
        .gl-lightbox-uploader { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .gl-lightbox-close {
          margin: 18px auto 0; display: block;
          padding: 10px 24px;
          border-radius: 999px;
          border: 1px solid var(--gold);
          background: transparent;
          color: var(--gold-light);
          font-size: 13px;
          cursor: pointer;
          transition: all .25s ease;
        }
        .gl-lightbox-close:hover { background: rgba(216,181,104,0.1); }
      `}</style>
    </div>
  )
}

export default Gallery