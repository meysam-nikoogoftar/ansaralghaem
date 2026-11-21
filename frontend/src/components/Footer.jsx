import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const footerLinks = {
  quick: [
    { to: '/', label: 'صفحه اصلی' },
    { to: '/news', label: 'اخبار و اطلاعیه‌ها' },
    { to: '/articles', label: 'دلنوشته‌ها' },
    { to: '/gallery', label: 'گالری تصاویر' },
    { to: '/shop', label: 'فروشگاه' },
    { to: '/track', label: 'پیگیری ثبت‌نام' },
  ],
  panel: [
    { to: '/dashboard', label: 'پنل کاربری' },
    { to: '/dashboard/trips', label: 'سفرهای من' },
    { to: '/dashboard/wallet', label: 'کیف پول' },
    { to: '/dashboard/tickets', label: 'تیکت‌ها' },
    { to: '/dashboard/articles', label: 'دلنوشته‌های من' },
  ],
}

function Footer() {
  return (
    <footer className="site-footer" dir="rtl">
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
                <strong>هیئت انصار القائم</strong>
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
            <ul className="footer-contacts">
              <li><span>برادران</span><a href="tel:09301066288" dir="ltr">۰۹۳۰۱۰۶۶۲۸۸</a></li>
              <li><span>خواهران</span><a href="tel:09384776775" dir="ltr">۰۹۳۸۴۷۷۶۷۷۵</a></li>
            </ul>
            <blockquote className="footer-quote">
              <p lang="ar">فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ</p>
              <cite>امام حسین علیه السلام</cite>
            </blockquote>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>Copyright 2026 — هیئت انصار القائم (عج)</span>
          <span>
            طراحی و توسعه با ❤️ برای زائرین حسینی
          </span>

        </div>
      </div>
    </footer>
  )
}

export default Footer