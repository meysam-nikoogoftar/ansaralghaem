'use client'

import { useCallback, useRef, useState } from 'react'
import { ApiError } from '@/lib/api/errors'

type Operation = () => Promise<unknown>
type LoadState = { pending: number; errors: number[]; started: boolean }

export function useLoadFeedback(initialLoaded = false) {
  const failures = useRef(new Map<string, { operation: Operation; status: number }>())
  const pending = useRef(0)
  const [loadState, setLoadState] = useState<LoadState>({
    pending: 0,
    errors: [],
    started: initialLoaded,
  })
  const publish = useCallback(
    () =>
      setLoadState({
        pending: pending.current,
        errors: [...failures.current.values()].map((item) => item.status),
        started: true,
      }),
    [],
  )
  const observeLoad = useCallback(
    async (operation: Operation, key = 'page') => {
      pending.current += 1
      failures.current.delete(key)
      publish()
      try {
        await operation()
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        failures.current.set(key, {
          operation,
          status: error instanceof ApiError ? error.status : 0,
        })
      } finally {
        pending.current -= 1
        publish()
      }
    },
    [publish],
  )
  const retryLoad = useCallback(() => {
    for (const [key, { operation }] of [...failures.current]) void observeLoad(operation, key)
  }, [observeLoad])
  return { observeLoad, loadState, retryLoad }
}

export function LoadFeedback({ state, onRetry }: { state: LoadState; onRetry: () => void }) {
  if (!state.errors.length)
    return (
      <span className="sr-only" role="status">
        {state.pending ? 'در حال دریافت اطلاعات…' : ''}
      </span>
    )
  return (
    <div className="request-feedback" role="alert">
      <span>
        {state.errors.includes(403)
          ? 'دسترسی به این اطلاعات برای حساب شما مجاز نیست.'
          : 'دریافت بخشی از اطلاعات انجام نشد.'}
      </span>
      <button type="button" onClick={onRetry} disabled={state.pending > 0}>
        تلاش مجدد
      </button>
    </div>
  )
}
