import { useEffect, useRef } from 'react'

export default function ErrorSummary({ errors }) {
  const ref = useRef(null)
  const message = Object.values(errors || {}).join('؛ ')
  useEffect(() => { if (message) ref.current?.focus() }, [message])
  if (!message) return null
  return <div ref={ref} tabIndex={-1} role="alert" className="request-feedback">
    <p>ذخیره انجام نشد. موارد زیر را بررسی کنید:</p>
    <ul>{Object.entries(errors).map(([name, text]) => <li key={name}>
      <button type="button" onClick={() => {
        const scope = ref.current.closest('form') || ref.current.parentElement
        const field = [...scope.querySelectorAll('input,select,textarea')].find(input => input.name === name)
        field?.focus()
      }}>{text}</button>
    </li>)}</ul>
  </div>
}
