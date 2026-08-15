import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* معرفی */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              هیئت انصار القائم (عج)
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              هیئت انصارالقائم(عج) در سال ۱۳۹۷ توسط بچه‌های بسیج دانشجویی
              دانشگاه‌های تهران تأسیس شد.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                اینستاگرام
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                تلگرام
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                بله
              </a>
            </div>
          </div>

          {/* لینک‌های سریع */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">صفحات سایت</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">صفحه اصلی</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">اخبار و اطلاعیه‌ها</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">گالری تصاویر</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">فروشگاه</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">پیگیری ثبت‌نام</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">پنل کاربری</Link></li>
            </ul>
          </div>

          {/* تماس */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">ارتباط با ما</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>برادران: ۰۹۳۰۱۰۶۶۲۸۸</li>
              <li>خواهران: ۰۹۳۸۴۷۷۶۷۷۵</li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 italic leading-relaxed">
                «فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ»
              </p>
              <p className="text-xs text-gray-500 mt-1">امام حسین علیه السلام</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          Copyright © 2026. All Rights Reserved — هیئت انصار القائم (عج)
        </div>
      </div>
    </footer>
  )
}

export default Footer