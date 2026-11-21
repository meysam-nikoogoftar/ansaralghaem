import './auth.css'
import FormControl from '../../components/FormControl'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/logo.png'
import { safeReturnTo } from '../../utils/navigation'
import { fieldErrors } from '../../utils/validation'
import ErrorSummary from '../../components/ErrorSummary'

function Register() {
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  })
  const [localError, setLocalError] = useState('')
  const { register, isLoading, error } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = safeReturnTo(location.state?.returnTo)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (formData.password !== formData.password2) {
      setLocalError('رمز عبور و تکرار آن یکسان نیستند')
      return
    }
    const data = { mobile: formData.mobile, password: formData.password, first_name: formData.first_name, last_name: formData.last_name }
    const success = await register(data)
    if (success) navigate(returnTo, { replace: true, state: location.state?.resumeState })
  }

  // authStore.register can set `error` as a string or as the backend's
  // field-error object (e.g. { mobile: ['...'] }); normalize to one message.
  const serverErrorMessage = (() => {
    if (!error) return ''
    if (typeof error === 'string') return error
    const firstKey = Object.keys(error)[0]
    const firstVal = error[firstKey]
    return Array.isArray(firstVal) ? firstVal[0] : String(firstVal)
  })()

  const displayError = localError || serverErrorMessage

  return (
    <div className="auth-page auth-register" dir="rtl">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <div className="auth-logo">
            <img src={logo} alt="هیئت انصار القائم" />
          </div>
          <h1>هیئت انصار القائم (عج)</h1>
          <span>ایجاد حساب کاربری زائرین</span>
        </Link>

        {displayError && (
          <div role="status" aria-live="polite" aria-atomic="true" className="auth-message error">{displayError}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-block">
          <ErrorSummary errors={typeof error === 'object' ? fieldErrors(error) : {}} />
          <div className="auth-field-row">
            <div className="auth-field">

              <FormControl as="input" label={<>نام</>}
                type="text"
                name="first_name" autoComplete="given-name" error={typeof error === 'object' ? fieldErrors(error)?.['first_name'] : undefined}
                value={formData.first_name}
                onChange={handleChange}
                placeholder="نام"
                className="auth-input"
                required
              />
            </div>
            <div className="auth-field">

              <FormControl as="input" label={<>نام خانوادگی</>}
                type="text"
                name="last_name" autoComplete="family-name" error={typeof error === 'object' ? fieldErrors(error)?.['last_name'] : undefined}
                value={formData.last_name}
                onChange={handleChange}
                placeholder="نام خانوادگی"
                className="auth-input"
                required
              />
            </div>
          </div>

          <div className="auth-field auth-mobile">

            <FormControl as="input" label={<>شماره موبایل</>}
              type="tel"
              inputMode="numeric"
              name="mobile" autoComplete="username" error={typeof error === 'object' ? fieldErrors(error)?.['mobile'] : undefined}
              value={formData.mobile}
              onChange={handleChange}
              placeholder="09120000000"
              className="auth-input"
              required
            />
          </div>

          <div className="auth-field">

            <FormControl as="input" label={<>رمز عبور</>}
              type="password"
              name="password" autoComplete="new-password" error={typeof error === 'object' ? fieldErrors(error)?.['password'] : undefined}
              value={formData.password}
              onChange={handleChange}
              placeholder="حداقل ۶ کاراکتر"
              className="auth-input"
              required
            />
          </div>

          <div className="auth-field">

            <FormControl as="input" label={<>تکرار رمز عبور</>}
              type="password"
              name="password2" autoComplete="new-password" error={typeof error === 'object' ? fieldErrors(error)?.['password2'] : undefined}
              value={formData.password2}
              onChange={handleChange}
              placeholder="تکرار رمز عبور"
              className="auth-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="auth-submit">
            {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <div className="auth-footer-link">
          حساب کاربری دارید؟ <Link to="/login" state={{ returnTo, resumeState: location.state?.resumeState }}>وارد شوید</Link>
        </div>

        <div className="auth-quote">
          فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ
        </div>
      </div>


    </div>
  )
}

export default Register
