'use client'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react'
import type { FieldErrors } from '@/types'

const ValidationContext = createContext<FieldErrors>({})
type BaseProps = { label: string; hiddenLabel?: boolean; error?: string; name: string }
type Props = BaseProps &
  (
    | ({ as?: 'input' } & InputHTMLAttributes<HTMLInputElement>)
    | ({ as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement>)
    | ({ as: 'select' } & SelectHTMLAttributes<HTMLSelectElement>)
  )
export function FormControl({ label, hiddenLabel, error, ...props }: Props) {
  const generated = useId()
  const errors = useContext(ValidationContext)
  const message = error || errors[props.name]
  const id = props.id || `field-${generated}`
  const accessibility = {
    id,
    'aria-invalid': message ? (true as const) : undefined,
    'aria-describedby':
      [props['aria-describedby'], message ? `${id}-error` : ''].filter(Boolean).join(' ') ||
      undefined,
  }
  let control: ReactNode
  if (props.as === 'textarea') {
    const { as: _, ...rest } = props
    control = <textarea {...rest} {...accessibility} />
  } else if (props.as === 'select') {
    const { as: _, ...rest } = props
    control = <select {...rest} {...accessibility} />
  } else {
    const { as: _, ...rest } = props
    control = <input {...rest} {...accessibility} />
  }
  return (
    <>
      <label htmlFor={id} className={hiddenLabel ? 'sr-only' : undefined}>
        {label}
      </label>
      {control}
      {message && (
        <span className="field-error" id={`${id}-error`}>
          {message}
        </span>
      )}
    </>
  )
}
export function ErrorSummary({ errors }: { errors: FieldErrors }) {
  const element = useRef<HTMLDivElement>(null)
  const message = Object.values(errors).join('؛ ')
  useEffect(() => {
    if (message) element.current?.focus()
  }, [message])
  return message ? (
    <div ref={element} tabIndex={-1} role="alert" className="request-feedback">
      <p>موارد زیر را بررسی کنید:</p>
      <ul>
        {Object.entries(errors).map(([key, value]) => (
          <li key={key}>{value}</li>
        ))}
      </ul>
    </div>
  ) : null
}
export function FormValidation({ children, errors }: { children: ReactNode; errors: FieldErrors }) {
  return (
    <ValidationContext.Provider value={errors}>
      <ErrorSummary errors={errors} />
      {children}
    </ValidationContext.Provider>
  )
}
