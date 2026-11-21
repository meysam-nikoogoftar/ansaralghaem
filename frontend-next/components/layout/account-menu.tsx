'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { useSession } from '@/components/auth/session-provider'
import AppLink from '@/components/navigation/app-link'
import { Icon } from './icon'
import MediaImage from '@/components/content/media-image'

const roles = { user: 'کاربر', admin: 'مدیر', superadmin: 'مدیر کل' }
export default function AccountMenu() {
  const { user, logout } = useSession()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  if (!user) return null
  const name = `${user.first_name} ${user.last_name}`.trim() || 'کاربر'
  return (
    <div ref={root} className="account-menu">
      <button
        ref={trigger}
        className="account-menu-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <Icon name="user" />
        <span>حساب کاربری</span>
      </button>
      {open && (
        <div id={id} className="account-menu-panel" aria-label="حساب کاربری">
          <AppLink
            className="account-menu-profile"
            href={user.user_type === 'user' ? '/dashboard' : '/admin'}
          >
            <span className="account-menu-avatar">
              {user.profile_image ? (
                <MediaImage src={user.profile_image} alt="" sizes="36px" />
              ) : (
                name[0]
              )}
            </span>
            <span className="account-menu-details">
              <strong>{name}</strong>
              <span>
                {roles[user.user_type]} · <bdi>{user.mobile}</bdi>
              </span>
            </span>
          </AppLink>
          <button
            className="account-menu-logout"
            onClick={() => {
              logout()
              setOpen(false)
            }}
          >
            <Icon name="logout" />
            خروج امن از حساب
          </button>
        </div>
      )}
    </div>
  )
}
