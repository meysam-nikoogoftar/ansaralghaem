'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { browserRequest } from '@/lib/api/browser'
import { authSchema, sessionSchema, userSchema } from '@/lib/contracts'
import { announceSessionChange, clearLegacyTokens, readSession, subscribeSessionChange } from '@migration/session-client'
import type { User, RegisterCredentials } from '@/types'

type SessionStatus = 'checking' | 'authenticated' | 'anonymous' | 'error'
interface Session {
  user: User | null
  status: SessionStatus
  retry: () => Promise<void>
  logout: () => Promise<void>
  login: (mobile: string, password: string, signal?: AbortSignal) => Promise<void>
  register: (values: RegisterCredentials, signal?: AbortSignal) => Promise<void>
  updateProfile: (values: FormData | Partial<Pick<User, 'first_name' | 'last_name'>>) => Promise<User>
}
const Context = createContext<Session | null>(null)
export function SessionProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [status, setStatus] = useState<SessionStatus>(initialUser === undefined ? 'checking' : initialUser ? 'authenticated' : 'anonymous')
  const generation = useRef(0)
  const queries = useQueryClient()
  const retry = useCallback(async () => {
    const current = ++generation.current
    try {
      const result = sessionSchema.parse(await readSession())
      if (current === generation.current) { setUser(result.user); setStatus(result.user ? 'authenticated' : 'anonymous') }
    } catch {
      if (current === generation.current) { setUser(null); setStatus('error') }
    }
  }, [])
  const logout = useCallback(async () => {
    ++generation.current
    try {
      await browserRequest('/accounts/logout/', sessionSchema.parse, { method: 'POST', body: {} })
      queries.clear(); setUser(null); setStatus('anonymous'); announceSessionChange()
    } catch { setStatus('error') }
  }, [queries])
  useEffect(() => {
    clearLegacyTokens()
    void retry()
    const sync = () => { queries.clear(); void retry() }
    const unsubscribe = subscribeSessionChange(sync)
    window.addEventListener('focus', sync)
    return () => { ++generation.current; unsubscribe(); window.removeEventListener('focus', sync) }
  }, [queries, retry])
  const authenticate = async (path: '/accounts/login/' | '/accounts/register/', body: RegisterCredentials | { mobile: string; password: string }, signal?: AbortSignal) => {
    const current = ++generation.current
    const result = await browserRequest(path, authSchema.parse, { method: 'POST', body, signal })
    if (signal?.aborted || current !== generation.current) throw new DOMException('Session changed while signing in', 'AbortError')
    queries.clear(); setUser(result.user); setStatus('authenticated'); announceSessionChange()
  }
  return <Context.Provider value={{ user, status, retry, logout,
    login: (mobile, password, signal) => authenticate('/accounts/login/', { mobile, password }, signal),
    register: (values, signal) => authenticate('/accounts/register/', values, signal),
    updateProfile: async values => {
      const profile = await browserRequest('/accounts/profile/', userSchema.parse, { method: 'PUT', body: values, authenticated: true })
      setUser(profile); return profile
    },
  }}>{children}</Context.Provider>
}
export function useSession(): Session {
  const session = useContext(Context)
  if (!session) throw new Error('useSession must be inside SessionProvider')
  return session
}
