'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react'
import type { FieldErrors } from '@/types'

const ValidationContext = createContext<FieldErrors>({})
type Common = { label?: ReactNode; labelClassName?: string; hiddenLabel?: boolean; error?: string }
type FieldProps = Common &
  (
    | ({ as?: 'input' } & ComponentPropsWithRef<'input'>)
    | ({ as: 'select' } & ComponentPropsWithRef<'select'>)
    | ({ as: 'textarea' } & ComponentPropsWithRef<'textarea'>)
  )

export function FormControl({ label, labelClassName, hiddenLabel, error, ...field }: FieldProps) {
  const id = useId()
  const errors = useContext(ValidationContext)
  const fieldId = field.id ?? id
  const message = error || (field.name ? errors[field.name] : undefined)
  const accessibility = {
    id: fieldId,
    'aria-invalid': message ? true : field['aria-invalid'],
    'aria-describedby':
      [field['aria-describedby'], message ? `${fieldId}-error` : null].filter(Boolean).join(' ') ||
      undefined,
  }
  let control
  if (field.as === 'select') {
    const { as: _as, ...props } = field
    control = <select {...props} {...accessibility} />
  } else if (field.as === 'textarea') {
    const { as: _as, ...props } = field
    control = <textarea {...props} {...accessibility} />
  } else {
    const { as: _as, ...props } = field
    control = <input {...props} {...accessibility} />
  }
  return (
    <>
      {label && (
        <label htmlFor={fieldId} className={hiddenLabel ? 'sr-only' : labelClassName}>
          {label}
        </label>
      )}
      {control}
      {message && (
        <span id={`${fieldId}-error`} className="field-error">
          {message}
        </span>
      )}
    </>
  )
}

export function ErrorSummary({ errors }: { errors: FieldErrors }) {
  const ref = useRef<HTMLDivElement>(null)
  const message = Object.values(errors).join('؛ ')
  useEffect(() => {
    if (message) ref.current?.focus()
  }, [message])
  if (!message) return null
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="request-feedback">
      <p>موارد زیر را بررسی کنید:</p>
      <ul>
        {Object.entries(errors).map(([name, text]) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => {
                const scope = ref.current?.closest('form') ?? ref.current?.parentElement
                const fields = scope?.querySelectorAll<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >('input,select,textarea')
                Array.from(fields ?? [])
                  .find((input) => input.name === name)
                  ?.focus()
              }}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FormValidation({ errors, children }: { errors: FieldErrors; children: ReactNode }) {
  return (
    <ValidationContext.Provider value={errors}>
      <ErrorSummary errors={errors} />
      {children}
    </ValidationContext.Provider>
  )
}
