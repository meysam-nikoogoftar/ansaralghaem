'use client'
import type { InputHTMLAttributes } from 'react'
import { FormControl } from '@/components/ui/forms'
import type { AuthFieldName } from '@/types'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> & {
  name: AuthFieldName
  label: string
  mobile?: boolean
}
export default function AuthField({ label, mobile, ...props }: Props) {
  return (
    <div className={`auth-field${mobile ? ' auth-mobile' : ''}`}>
      <FormControl {...props} label={label} className="auth-input" required />
    </div>
  )
}
