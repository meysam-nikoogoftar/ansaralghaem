import { Link } from 'react-router-dom'

export default function NotFound() {
  return <main className="container" dir="rtl" style={{ paddingBlock: 80, textAlign: 'center' }}>
    <h1>صفحه پیدا نشد</h1>
    <p>نشانی این صفحه درست نیست یا صفحه جابه‌جا شده است.</p>
    <Link className="btn btn-gold" to="/">بازگشت به صفحه اصلی</Link>
  </main>
}
