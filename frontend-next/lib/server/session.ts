import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionSchema } from '@/lib/contracts'
import { backendOrigin, backendHeaders } from './config'
import { loginHref } from '@/lib/navigation'
import type { RequestDecoder } from '@/types'
import { ApiError } from '@/lib/api/errors'

export const getServerUser = cache(async () => {
  const cookie = (await headers()).get('cookie') || ''
  if (!/(?:^|;\s*)(?:__Host-ansar_session|ansar_session)=/.test(cookie)) return null
  const response = await fetch(`${backendOrigin}/api/accounts/session/`, { headers: backendHeaders(cookie), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) })
  if (response.status === 401) return null
  if (!response.ok) throw new ApiError(response.status)
  return sessionSchema.parse(await response.json()).user
})

export async function requireServerUser(returnTo: string, admin = false) {
  const user = await getServerUser()
  if (!user) redirect(loginHref(returnTo))
  if (admin && user.user_type !== 'admin' && user.user_type !== 'superadmin') redirect('/dashboard')
  return user
}

export async function privateRequest<T>(path: string, decode: RequestDecoder<T>): Promise<T> {
  if (!/^\/[a-z0-9/-]+\/$/i.test(path) || path.includes('..')) throw new Error('Invalid private API path')
  const cookie = (await headers()).get('cookie') || ''
  const response = await fetch(`${backendOrigin}/api${path}`, { headers: backendHeaders(cookie), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new ApiError(response.status)
  return decode(await response.json())
}
