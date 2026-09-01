import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const footerLinks = {
  quick: [
    { to: '/', label: 'صفحه اصلی' },
    { to: '/news', label: 'اخبار و اطلاعیه‌ها' },
    { to: '/gallery', label: 'گالری تصاویر' },
    { to: '/shop', label: 'فروشگاه' },
    { to: '/track', label: 'پیگیری ثبت‌نام' },
  ],
  panel: [
    { to: '/dashboard', label: 'پنل کاربری' },
    { to: '/dashboard/trips', label: 'سفرهای من' },
    { to: '/dashboard/wallet', label: 'کیف پول' },
    { to: '/dashboard/tickets', label: 'تیکت‌ها' },
    { to: '/dashboard/articles', label: 'دلنوشته‌ها' },
  ],
}

function Footer() {
  return (
    <footer dir="rtl">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="brand" style={{ marginBottom: 12 }}>
              <div className="brand-logo">
                <img
                  src={logo}
                  alt="هیئت انصار القائم"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <div className="brand-text">
                <h1>هیئت انصار القائم</h1>
                <span>(عج) · هیئت دانشجویی</span>
              </div>
            </Link>
            <p>
              هیئت انصارالقائم(عج) در سال ۱۳۹۷ توسط بچه‌های بسیج دانشجویی دانشگاه‌های
              تهران تأسیس شد؛ با هدف هموار کردن مسیر عاشقان برای رسیدن به کربلا.
            </p>
            <div className="footer-social" style={{ marginTop: 16 }}>
              <a href="#" title="اینستاگرام" aria-label="اینستاگرام">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" title="تلگرام" aria-label="تلگرام">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </a>
              <a href="#" title="بله" aria-label="بله">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>صفحات سایت</h4>
            <ul>
              {footerLinks.quick.map(item => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Panel Links */}
          <div className="footer-col">
            <h4>پنل کاربری</h4>
            <ul>
              {footerLinks.panel.map(item => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>ارتباط با ما</h4>
            <ul>
              <li style={{ color: 'var(--ink-dim)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--gold)' }}>📞</span>
                برادران: ۰۹۳۰۱۰۶۶۲۸۸
              </li>
              <li style={{ color: 'var(--ink-dim)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--gold)' }}>📞</span>
                خواهران: ۰۹۳۸۴۷۷۶۷۷۵
              </li>
            </ul>
            <div style={{
              marginTop: 16, padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
            }}>
              <p style={{
                fontFamily: 'Aref Ruqaa, serif',
                color: 'var(--gold-light)',
                fontSize: 14,
                lineHeight: 2,
                textAlign: 'center',
              }}>
                فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ
              </p>
              <p style={{ color: 'var(--ink-faint)', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
                امام حسین علیه السلام
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>Copyright 2026 — هیئت انصار القائم (عج)</span>
          <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>
            طراحی و توسعه با ❤️ برای زائرین حسینی
          </span>
          <img
            src={logo}
            alt="logo"
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', opacity: 0.4 }}
          />
        </div>
      </div>
    </footer>
  )
}

export default Footer