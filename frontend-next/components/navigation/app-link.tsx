'use client'
import Link from 'next/link'
import { isNextPath, safeInternalHref } from '@/lib/navigation'
import type { AnchorHTMLAttributes } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string }
export default function AppLink({ href, children, ...props }: Props) {
  const destination = safeInternalHref(href)
  return isNextPath(destination) ? (
    <Link {...props} href={destination} prefetch={false}>
      {children}
    </Link>
  ) : (
    <a {...props} href={destination}>
      {children}
    </a>
  )
}
