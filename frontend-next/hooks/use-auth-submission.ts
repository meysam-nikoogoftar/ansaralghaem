'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { z } from 'zod'
import { useSession } from '@/components/auth/session-provider'
import { ApiError, SessionStorageError, fieldErrors } from '@/lib/api/errors'
import { isNextPath, safeReturnTo } from '@/lib/navigation'
import type { FieldErrors } from '@/types'

export default function useAuthSubmission<T>({
  schema,
  submit,
  returnTo,
}: {
  schema: z.ZodType<T>
  submit: (values: T, signal: AbortSignal) => Promise<void>
  returnTo: string
}) {
  const { status, retry } = useSession()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const request = useRef<AbortController | null>(null)
  const submitted = useRef(false)
  const navigated = useRef(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const navigate = useCallback(() => {
    if (navigated.current) return
    navigated.current = true
    // The browser carries the fragment through a server redirect. The server only sees the path and query.
    const inheritedHash =
      !returnTo.includes('#') && new URLSearchParams(window.location.search).has('returnTo')
        ? window.location.hash
        : ''
    const destination = safeReturnTo(returnTo + inheritedHash)
    if (isNextPath(destination)) router.replace(destination)
    else window.location.replace(destination)
  }, [returnTo, router])
  useEffect(() => {
    if (status === 'authenticated') navigate()
  }, [status, navigate])
  useEffect(
    () => () => {
      request.current?.abort()
    },
    [],
  )

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitted.current || status === 'checking' || status === 'authenticated') return
    const result = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
    if (!result.success) {
      const fields: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] || 'form')
        fields[field] ||= issue.message
      }
      setErrors(fields)
      return
    }
    submitted.current = true
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setErrors({})
    try {
      await submit(result.data, controller.signal)
      if (controller.signal.aborted) return
      formRef.current
        ?.querySelectorAll<HTMLInputElement>('input[type="password"]')
        .forEach((input) => {
          input.value = ''
        })
      navigate()
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === 'AbortError')
      )
        return
      if (error instanceof SessionStorageError) {
        setErrors({ form: error.message })
        return
      }
      const fields = fieldErrors(error)
      setErrors(
        error instanceof ApiError && error.status === 429
          ? { form: 'تعداد تلاش‌ها زیاد است. کمی بعد دوباره تلاش کنید.' }
          : Object.keys(fields).length
            ? fields
            : { form: 'ارتباط برقرار نشد. اطلاعات را بررسی و دوباره تلاش کنید.' },
      )
    } finally {
      submitted.current = false
      if (!controller.signal.aborted) setPending(false)
    }
  }
  return {
    formRef,
    onSubmit,
    errors,
    pending,
    checking: status === 'checking',
    disabled: pending || status === 'checking' || status === 'authenticated',
    sessionError: status === 'error',
    retrySession: retry,
  }
}
