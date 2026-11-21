import { useContext, useId } from 'react'
import { ValidationContext } from '../utils/validationContext'

// Keep the existing native element and its styles; only share naming/error wiring.
export default function FormControl({ as: Control = 'input', label, labelClassName, hiddenLabel = false, error, id, children, ...props }) {
  const generatedId = useId()
  const errors = useContext(ValidationContext)
  error = error || errors[props.name]
  const controlId = id || `field-${generatedId}`
  const errorId = `${controlId}-error`
  return <>
    {label && <label htmlFor={controlId} className={hiddenLabel ? 'sr-only' : labelClassName}>{label}</label>}
    <Control {...props} id={controlId} aria-invalid={error ? true : props['aria-invalid']}
      aria-describedby={[props['aria-describedby'], error ? errorId : null].filter(Boolean).join(' ') || undefined}>{children}</Control>
    {error && <span id={errorId} className="field-error">{error}</span>}
  </>
}
