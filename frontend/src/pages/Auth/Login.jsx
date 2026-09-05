import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/logo.png'

function Login() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(mobile, password)
    if (success) navigate('/dashboard')
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
          <div className="auth-message error">
            {typeof error === 'string' ? error : 'موبایل یا رمز عبور اشتباه است'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-block">
          <div className="auth-field">
            <label>شماره موبایل</label>
            <input
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
            <label>رمز عبور</label>
            <input
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

        <div className="auth-footer-link">
          حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
        </div>

        <div className="auth-quote">
          فَإِنِّی لَا أَرَى الْمَوْتَ إِلَّا الشَّهَادَةَ
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          background: var(--bg);
        }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }
        .auth-orb-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, var(--teal-glow), transparent 70%);
          top: -80px; right: -100px; opacity: 0.25;
        }
        .auth-orb-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, var(--gold), transparent 70%);
          bottom: -100px; left: -100px; opacity: 0.18;
        }

        .auth-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          background: linear-gradient(160deg, var(--surface-2), var(--surface));
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 36px 32px 28px;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6);
        }

        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          margin-bottom: 28px;
        }
        .auth-logo {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 2px solid var(--gold);
          overflow: hidden;
          box-shadow: 0 0 24px rgba(216,181,104,0.25);
          margin-bottom: 10px;
        }
        .auth-logo img { width: 100%; height: 100%; object-fit: cover; }
        .auth-brand h1 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 19px;
        }
        .auth-brand span {
          color: var(--ink-dim);
          font-size: 12px;
        }

        .auth-message {
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 18px;
        }
        .auth-message.error {
          background: rgba(122,35,48,0.2);
          border: 1px solid rgba(122,35,48,0.4);
          color: #ff9aa8;
        }

        .auth-form-block { display: flex; flex-direction: column; gap: 16px; }
        .auth-field label {
          display: block;
          color: var(--ink-dim);
          font-size: 13px;
          margin-bottom: 6px;
        }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: all .25s ease;
        }
        .auth-input::placeholder { color: var(--ink-faint); }
        .auth-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(216,181,104,0.12);
          background: rgba(10,21,18,0.85);
        }

        .auth-submit {
          margin-top: 4px;
          width: 100%;
          padding: 13px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 20px -6px rgba(216,181,104,0.45);
          transition: transform .25s ease, box-shadow .25s ease, opacity .25s ease;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(216,181,104,0.6);
        }
        .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .auth-footer-link {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--ink-dim);
        }
        .auth-footer-link a {
          color: var(--gold);
          font-weight: 600;
        }
        .auth-footer-link a:hover { color: var(--gold-light); }

        .auth-quote {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          text-align: center;
          font-family: var(--font-display);
          color: var(--ink-faint);
          font-size: 13px;
          line-height: 2;
        }
      `}</style>
    </div>
  )
}

export default Login