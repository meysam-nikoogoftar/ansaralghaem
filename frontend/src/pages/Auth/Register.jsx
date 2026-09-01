import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/logo.png'

function Register() {
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  })
  const { register, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.password2) {
      alert('رمز عبور و تکرار آن یکسان نیستند')
      return
    }
    const { password2, ...data } = formData
    const success = await register(data)
    if (success) navigate('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #134F4E 0%, #1B6B6A 50%, #2D8B8A 100%)' }}
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="logo" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-[#C9A84C]" />
          <h1 className="text-2xl font-bold text-[#1B6B6A]">ثبت‌نام</h1>
          <p className="text-gray-500 text-sm mt-2">هیئت انصار القائم (عج)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {typeof error === 'string' ? error : 'خطا در ثبت‌نام'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="نام"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B6A]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="نام خانوادگی"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B6A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="09120000000"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B6A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="حداقل ۶ کاراکتر"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B6A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز عبور</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="تکرار رمز عبور"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B6A]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ background: '#1B6B6A' }}
            onMouseEnter={e => e.target.style.background = '#134F4E'}
            onMouseLeave={e => e.target.style.background = '#1B6B6A'}
          >
            {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          حساب کاربری دارید؟{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#1B6B6A' }}>
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register