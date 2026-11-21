import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import './AccountMenu.css'

const roles = { user: 'کاربر', admin: 'مدیر', superadmin: 'مدیر کل' }
const adminRoles = { financial: 'مسئول مالی', registration: 'مسئول ثبت‌نام', content: 'مسئول محتوا', full: 'مدیر' }

export default function AccountMenu({ mobileEnabled = false }) {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const trigger = useRef(null)
  const id = useId()
  const navigate = useNavigate()
  const role = user?.user_type === 'admin' ? adminRoles[user.admin_role] || roles.admin : roles[user?.user_type] || roles.user
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'کاربر'

  useEffect(() => {
    if (!open) return
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    const keydown = event => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keydown)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keydown)
    }
  }, [open])

  return (
    <div className={`account-menu${mobileEnabled ? ' account-menu-mobile-enabled' : ''}`} dir="rtl" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button type="button" ref={trigger} className="account-menu-trigger" aria-label="???? ??????" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2H5Z" /></svg>
        <span>حساب کاربری</span>
        <svg className="account-menu-chevron" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} /></svg>
      </button>
      {open && <div id={id} className="account-menu-panel" aria-label="حساب کاربری">
        <Link className="account-menu-profile" to={['admin', 'superadmin'].includes(user?.user_type) ? '/admin' : '/dashboard'} onClick={() => setOpen(false)}>
          <span className="account-menu-avatar">
            {user?.profile_image ? <img src={user.profile_image} alt="" /> : name[0]}
          </span>
          <span className="account-menu-details">
            <strong>{name}</strong>
            <span>{role}{user?.mobile && <> · <bdi dir="ltr">{user.mobile}</bdi></>}</span>
          </span>
        </Link>
        <button type="button" className="account-menu-logout" onClick={() => { setOpen(false); logout(); navigate('/') }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          خروج امن از حساب
        </button>
      </div>}
    </div>
  )
}
