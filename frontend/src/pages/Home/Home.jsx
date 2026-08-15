import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'

function Home() {
  const [sliders, setSliders] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [news, setNews] = useState([])
  const [contributions, setContributions] = useState([])
  const [trips, setTrips] = useState([])

  useEffect(() => {
    api.get('/content/sliders/').then(res => setSliders(res.data)).catch(() => {})
    api.get('/content/news/').then(res => setNews(res.data.slice(0, 3))).catch(() => {})
    api.get('/financial/contributions/').then(res => setContributions(res.data.slice(0, 3))).catch(() => {})
    api.get('/trips/').then(res => setTrips(res.data.filter(t => t.registration_open).slice(0, 3))).catch(() => {})
  }, [])

  useEffect(() => {
    if (sliders.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % sliders.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [sliders])

  return (
    <div dir="rtl">

      {/* Hero Slider */}
      {sliders.length > 0 && (
        <div className="relative h-[500px] overflow-hidden">
          {sliders.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                  >
                    {slide.title}
                  </motion.h1>
                  {slide.summary && (
                    <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
                      {slide.summary}
                    </p>
                  )}
                  {slide.link && (
                    <Link
                      to={slide.link}
                      className="bg-white text-green-800 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                      مشاهده جزئیات
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Slider Dots */}
          {sliders.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {sliders.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* اگه slider نداشت */}
      {sliders.length === 0 && (
        <div className="bg-gradient-to-br from-green-900 to-green-700 h-[400px] flex items-center justify-center">
          <div className="text-center text-white px-4">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              هیئت انصار القائم (عج)
            </motion.h1>
            <p className="text-xl text-green-100 mb-8">قافله حماسی اربعین حسینی</p>
            <Link
              to="/dashboard/trips/register"
              className="bg-white text-green-800 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              ثبت‌نام اربعین
            </Link>
          </div>
        </div>
      )}

      {/* کارت‌های سریع */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 relative z-10">
          {[
            { icon: '✈️', title: 'ثبت‌نام سفر', desc: 'در سفرهای هیئت شرکت کنید', link: '/dashboard/trips/register', color: 'bg-green-800' },
            { icon: '💰', title: 'قلک اربعین', desc: 'کیف پول سفر خود را شارژ کنید', link: '/dashboard/wallet', color: 'bg-amber-700' },
            { icon: '🤝', title: 'همپای قافله', desc: 'به زائرین کمک مالی کنید', link: '/dashboard', color: 'bg-blue-700' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={card.link}
                className={`${card.color} text-white rounded-2xl p-6 flex items-center gap-4 hover:opacity-90 transition-opacity shadow-lg block`}
              >
                <span className="text-4xl">{card.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="text-sm opacity-80">{card.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* سفرهای فعال */}
        {trips.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">سفرهای در حال ثبت‌نام</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{trip.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {trip.start_date} تا {trip.end_date}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-700">
                      {trip.cost?.toLocaleString()} تومان
                    </span>
                    <Link
                      to="/dashboard/trips/register"
                      className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      ثبت‌نام
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* آخرین اخبار */}
        {news.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">آخرین اخبار</h2>
              <Link to="/news" className="text-green-800 hover:underline text-sm">
                مشاهده همه
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* مشارکت مالی */}
        {contributions.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">مشارکت مالی</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contributions.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                  )}
                  <h3 className="font-bold text-gray-800 mb-3">{item.title}</h3>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.progress_percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{item.collected_amount?.toLocaleString()} تومان</span>
                    <span>{item.progress_percent}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    از {item.total_amount?.toLocaleString()} تومان
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home