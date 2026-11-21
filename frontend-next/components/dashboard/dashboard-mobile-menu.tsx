'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/layout/icon'
import Dialog from '@/components/ui/dialog'
import useMediaQuery from '@/hooks/use-media-query'

export default function DashboardMobileMenu({
  title,
  children,
}: {
  title: string
  children: (close: () => void) => ReactNode
}) {
  const pathname = usePathname()
  const mobile = useMediaQuery('(max-width: 900px)')
  const [openForPath, setOpenForPath] = useState<string | null>(null)
  const open = mobile && pathname === openForPath
  const close = () => setOpenForPath(null)

  useEffect(() => {
    setOpenForPath(null)
  }, [mobile, pathname])

  return (
    <>
      <button
        type="button"
        className="dashboard-menu-toggle"
        aria-label={`باز کردن ${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpenForPath(pathname)}
      >
        <Icon name="menu" />
      </button>
      {open && (
        <Dialog className="dashboard-menu-dialog" label={title} onClose={close}>
          <div className="dashboard-menu-dialog-header">
            <h2>{title}</h2>
            <button
              type="button"
              autoFocus
              aria-label={`بستن ${title}`}
              className="dashboard-menu-close"
              onClick={close}
            >
              <Icon name="close" />
            </button>
          </div>
          {children(close)}
        </Dialog>
      )}
    </>
  )
}
