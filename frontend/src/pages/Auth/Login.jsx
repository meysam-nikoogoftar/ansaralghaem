import './auth.css'
import FormControl from '../../components/FormControl'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/logo.png'
import { safeReturnTo } from '../../utils/navigation'

function Login() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = safeReturnTo(location.state?.returnTo || new URLSearchParams(location.search).get('returnTo'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(mobile, password)
    if (success) navigate(returnTo, { replace: true, state: location.state?.resumeState })
  }

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <div className="auth-logo">
            <img src={logo} alt="هیئت انصار القائم" />
          </div>
          <h1>هیئت انصار القائم (عج)</h1>
          <span>ورود به پنل زائرین</span>
        </Link>

        {error && (
          <div role="status" aria-live="polite" aria-atomic="true" className="auth-message error">
            {typeof error === 'string' ? error : 'موبایل یا رمز عبور اشتباه است'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-block">
          <div className="auth-field">

            <FormControl as="input" label={<>شماره موبایل</>} name="mobile" autoComplete="username"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09120000000"
              className="auth-input"
              required
            />
          </div>

          <div className="auth-field">

            <FormControl as="input" label={<>رمز عبور</>} name="password" autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              className="auth-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="auth-submit">
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="field-hint">رمز عبور را فراموش کرده‌اید؟ برای راهنمایی با پشتیبانی هیئت تماس بگیرید: <a href="tel:09301066288">۰۹۳۰۱۰۶۶۲۸۸</a> / <a href="tel:09384776775">۰۹۳۸۴۷۷۶۷۷۵</a></p>
        <div className="auth-footer-link">
          حساب کاربری ندارید؟ <Link to="/register" state={{ returnTo, resumeState: location.state?.resumeState }}>ثبت‌نام کنید</Link>
        </div>

        <div className="auth-quote">
          فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ
        </div>
      </div>


    </div>
  )
}

export default Login