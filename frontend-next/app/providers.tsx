'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/components/auth/session-provider'
import { ThemeProvider } from '@/components/theme/theme-provider'
import type { User } from '@/types'

export default function Providers({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
